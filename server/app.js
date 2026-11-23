/**
 * Prince Math Academy — Netlify Serverless API
 * All backend logic lives here, deployed as a single Netlify Function.
 *
 * Routes:
 *   GET  /api/auth/me
 *   PATCH /api/auth/me
 *   GET  /api/entities/:entity
 *   GET  /api/entities/:entity/:id
 *   POST /api/entities/:entity
 *   PATCH /api/entities/:entity/:id
 *   DELETE /api/entities/:entity/:id
 *   POST /api/functions/createPayFastPayment
 *   POST /api/functions/trackVideoView
 *   POST /api/functions/getAdminStats
 *   POST /api/functions/sendNewVideoNotifications
 *   POST /api/functions/validateVideoUpload
 *   POST /api/payfast-webhook
 *   POST /api/upload
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import { createDailyChallenge, isCorrectDailyAnswer } from './dailyChallenge.js';

// ─── Supabase client ──────────────────────────────────────────────────────────
const requiredConfigErrors = [];
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
let supabase = null;

if (!supabaseUrl || !supabaseServiceKey) {
  requiredConfigErrors.push('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.');
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  } catch {
    requiredConfigErrors.push('Supabase configuration is invalid.');
  }
}

if (!JWT_SECRET || JWT_SECRET.length < 32 || JWT_SECRET.startsWith('change-me')) {
  requiredConfigErrors.push('JWT_SECRET must be set to a private value of at least 32 characters.');
}

// ─── Express app ──────────────────────────────────────────────────────────────
const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const defaultOrigins = [
  'https://princemath.co.za',
  'https://www.princemath.co.za',
];
const allowedOrigins = new Set([
  ...defaultOrigins,
  process.env.APP_ORIGIN,
  process.env.URL,
  process.env.DEPLOY_PRIME_URL,
  process.env.DEPLOY_URL,
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:8888',
].filter(Boolean).map((o) => o.replace(/\/$/, '')));

function isAllowedOrigin(origin) {
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, '');
  if (allowedOrigins.has(normalized)) return true;
  try {
    const { hostname, protocol } = new URL(normalized);
    if (protocol === 'https:' && hostname.endsWith('.netlify.app')) return true;
  } catch {
    return false;
  }
  return false;
}

app.use(cors({
  origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
  credentials: true,
}));

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

const limiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: message },
});
app.use('/api', limiter(60_000, 300, 'Too many requests. Please slow down.'));
app.use('/api/auth/login', limiter(15 * 60_000, 10, 'Too many login attempts. Try again in 15 minutes.'));
app.use('/api/auth/register', limiter(60 * 60_000, 10, 'Too many sign-ups from this network. Try again later.'));
app.use(['/api/auth/forgot-password', '/api/auth/verify-otp', '/api/auth/reset-password'],
  limiter(15 * 60_000, 10, 'Too many reset attempts. Try again in 15 minutes.'));
app.use('/api/functions/downloadNotes', limiter(60_000, 10, 'Too many download requests. Please wait.'));
app.use('/api/functions/trackVideoView', limiter(60_000, 30, 'Too many video view requests. Please wait.'));

app.get('/api/health', async (_req, res) => {
  const paymentConfiguration = process.env.PAYFAST_MERCHANT_ID
    && process.env.PAYFAST_MERCHANT_KEY
    && process.env.PAYFAST_PASSPHRASE
    ? 'configured'
    : 'not_configured';
  const emailConfiguration = process.env.SMTP_USER && process.env.SMTP_PASS
    ? 'configured'
    : 'not_configured';

  if (requiredConfigErrors.length) {
    return res.status(503).json({
      status: 'not_ready',
      database: 'not_configured',
      payments: paymentConfiguration,
      email: emailConfiguration,
      errors: requiredConfigErrors,
    });
  }

  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      console.error('Database health check failed:', error.message);
      return res.status(503).json({
        status: 'not_ready',
        database: 'unavailable',
        payments: paymentConfiguration,
        email: emailConfiguration,
        errors: ['The database connection could not be verified.'],
      });
    }

    return res.json({
      status: 'ok',
      database: 'connected',
      payments: paymentConfiguration,
      email: emailConfiguration,
    });
  } catch (error) {
    console.error('Database health check failed:', error.message);
    return res.status(503).json({
      status: 'not_ready',
      database: 'unavailable',
      payments: paymentConfiguration,
      email: emailConfiguration,
      errors: ['The database connection could not be verified.'],
    });
  }
});

app.use('/api', (_req, res, next) => {
  const publicDailyQuestion = _req.method === 'GET' && _req.path === '/functions/dailyChallenge';
  if (requiredConfigErrors.length && !publicDailyQuestion) {
    return res.status(503).json({
      error: 'Backend not configured',
      message: requiredConfigErrors.join(' '),
    });
  }
  next();
});

// ─── Auth helpers ─────────────────────────────────────────────────────────────
async function authenticatePrivateEntityRead(req, res, next) {
  if (['User', 'UserBadge', 'Favorite', 'XPEvent', 'Notification', 'Message', 'VideoProgress', 'Feedback',
    'ForumPost', 'ForumReply', 'StudyGroup', 'StudyGroupMember'].includes(req.params.entity)) {
    return requireAuth(req, res, next);
  }
  return optionalAuth(req, res, next);
}

function ownsRecord(record, user) {
  return ['user_email', 'author_email', 'sender_email', 'recipient_email', 'creator_email']
    .some((field) => record[field] && record[field] === user.email);
}

const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '7d' });
}

function getTokenFromReq(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

async function requireAuth(req, res, next) {
  const token = getTokenFromReq(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.sub)
      .single();
    if (error || !user) return res.status(401).json({ error: 'User not found' });
    // Sessions issued before the last password reset are no longer valid.
    if (user.password_changed_at && payload.iat * 1000 < new Date(user.password_changed_at).getTime() - 1000) {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

async function optionalAuth(req, res, next) {
  if (!getTokenFromReq(req) || requiredConfigErrors.length) return next();
  return requireAuth(req, res, next);
}

async function requireAdmin(req, res, next) {
  await requireAuth(req, res, async () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

function safeUser(user) {
  if (!user) return user;
  const safe = { ...user };
  for (const field of ['password_hash', 'otp_hash', 'otp_expires', 'otp_attempts', 'otp_verified']) delete safe[field];
  return safe;
}

// Only these profile fields can be edited by the learner, and only with sane values.
const PROFILE_FIELDS = ['full_name', 'phone_number', 'grade', 'bank_name', 'account_holder', 'account_number', 'account_type'];
function sanitiseProfile(body) {
  const updates = {};
  for (const key of PROFILE_FIELDS) {
    const value = body?.[key];
    if (value === undefined) continue;
    if (value === null || value === '') { updates[key] = key === 'full_name' ? undefined : null; continue; }
    if (typeof value !== 'string' || value.length > 100) return { error: `Invalid value for ${key}.` };
    if (key === 'grade' && !['Grade 10', 'Grade 11', 'Grade 12'].includes(value)) return { error: 'Invalid grade.' };
    if (key === 'phone_number' && !/^[0-9+()\s-]{7,20}$/.test(value)) return { error: 'Invalid phone number.' };
    updates[key] = value.trim();
  }
  for (const key of Object.keys(updates)) if (updates[key] === undefined) delete updates[key];
  return { updates };
}

// Columns that must never be used to filter or sort (they would act as an oracle on private data).
const HIDDEN_COLUMNS = new Set(['password_hash', 'otp_hash', 'otp_expires', 'otp_attempts', 'otp_verified', 'notes_url', 'password_changed_at']);
function columnAllowed(entity, column, user) {
  if (typeof column !== 'string' || !/^[a-z_][a-z0-9_]*$/.test(column)) return false;
  if (user?.role === 'admin') return !HIDDEN_COLUMNS.has(column) || column === 'notes_url';
  if (HIDDEN_COLUMNS.has(column) || (entity === 'Video' && column === 'video_url')) return false;
  return entity !== 'User' || PUBLIC_USER_FIELDS.split(',').includes(column);
}

// ─── Auth routes ──────────────────────────────────────────────────────────────

// GET /api/auth/me
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json(safeUser(req.user));
});

// PATCH /api/auth/me
app.patch('/api/auth/me', requireAuth, async (req, res) => {
  const { updates, error: invalid } = sanitiseProfile(req.body);
  if (invalid) return res.status(400).json({ error: invalid });
  if (!Object.keys(updates).length) return res.json(safeUser(req.user));
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', req.user.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: 'Could not update your profile.' });
  res.json(safeUser(data));
});

app.post('/api/auth/start-trial', requireAuth, async (req, res) => {
  const { grade, phone_number, bank_name, account_holder, account_number, account_type } = req.body;
  if (!['Grade 10', 'Grade 11', 'Grade 12'].includes(grade)) {
    return res.status(400).json({ error: 'Select a valid grade to start your trial.' });
  }
  if (req.user.trial_end_date) {
    return res.status(409).json({ error: 'A trial has already been used for this account.' });
  }

  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 3);
  const updates = {
    grade,
    phone_number: phone_number || null,
    subscription_tier: 'Trial',
    trial_end_date: trialEndDate.toISOString(),
  };
  for (const [key, value] of Object.entries({ bank_name, account_holder, account_number, account_type })) {
    if (value) updates[key] = value;
  }

  const { data, error } = await supabase.from('users')
    .update(updates).eq('id', req.user.id).is('trial_end_date', null).select().maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(409).json({ error: 'A trial has already been used for this account.' });
  res.json(safeUser(data));
});

// POST /api/auth/register  — email + password sign-up
app.post('/api/auth/register', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const full_name = String(req.body.full_name || '').trim();
  const { password } = req.body;
  if (!/^[A-Za-z0-9._%+'-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email) || typeof password !== 'string' || password.length < 8 || password.length > 128 || !full_name || full_name.length > 100) {
    return res.status(400).json({ error: 'A valid email, a name, and a password of at least 8 characters are required.' });
  }
  const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
  if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

  const hash = await bcrypt.hash(password, 12);
  const id = uuidv4();
  const { data, error } = await supabase
    .from('users')
    .insert({ id, email, password_hash: hash, full_name, role: 'student' })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  const token = signToken(data.id);
  res.json({ token, user: safeUser(data) });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { password } = req.body;
  const identifier = String(req.body.email || req.body.username || '').trim().toLowerCase();
  if (typeof password !== 'string' || !password) return res.status(400).json({ error: 'password required' });
  if (!identifier) return res.status(400).json({ error: 'email required' });

  const { data: user, error } = await supabase.from('users').select('*').eq('email', identifier).maybeSingle();
  // Always run a hash comparison so response time doesn't reveal whether the account exists
  const valid = await bcrypt.compare(password, user?.password_hash || DUMMY_HASH);
  if (error || !user || !valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken(user.id);
  res.json({ token, user: safeUser(user) });
});

// ─── Password Reset with OTP ──────────────────────────────────────────────
// Codes are stored hashed in the users table (otp_hash/otp_expires/otp_attempts/otp_verified)
// so they work across serverless instances.
const hashOtp = (email, otp) => crypto.createHmac('sha256', JWT_SECRET || 'x').update(`${email}:${otp}`).digest('hex');
let mailer;
function getMailer() {
  if (mailer !== undefined) return mailer;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (!SMTP_USER || !SMTP_PASS) {
    mailer = null;
    return mailer;
  }
  const port = Number(SMTP_PORT || 465);
  const secure = typeof SMTP_SECURE === 'string' && SMTP_SECURE !== ''
    ? SMTP_SECURE === 'true'
    : port === 465;
  mailer = nodemailer.createTransport({
    host: SMTP_HOST || 'smtp.gmail.com',
    port,
    secure,
    requireTLS: !secure,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return mailer;
}
const normaliseEmail = (e) => String(e || '').trim().toLowerCase();

app.post('/api/auth/forgot-password', async (req, res) => {
  const email = normaliseEmail(req.body.email);
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const generic = { message: 'If an account exists with this email, a reset code has been sent.' };
  const mailer = getMailer();
  if (!mailer) {
    return res.status(503).json({ error: 'Password reset email is not configured on this server.' });
  }

  const { data: user, error: lookupError } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
  if (lookupError) {
    console.error('Password reset account lookup failed:', lookupError.message);
    return res.status(503).json({ error: 'Could not start password reset. Please try again later.' });
  }
  if (!user) return res.json(generic);

  const otp = String(crypto.randomInt(100000, 1000000));
  const { error: saveOtpError } = await supabase.from('users').update({
    otp_hash: hashOtp(email, otp),
    otp_expires: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    otp_attempts: 0,
    otp_verified: false,
  }).eq('id', user.id);
  if (saveOtpError) {
    console.error('Password reset code could not be saved:', saveOtpError.message);
    return res.status(503).json({ error: 'Could not start password reset. Please try again later.' });
  }

  try {
    const delivery = await mailer.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Your Prince Math Academy reset code',
      text: `Your password reset code is ${otp}. It expires in 10 minutes. If you did not ask for it, ignore this email.`,
      html: `<div style="font-family:sans-serif"><h2>Prince Math Academy</h2><p>Your password reset code is</p><p style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#6d28d9">${otp}</p><p>It expires in 10 minutes. If you did not ask for it, ignore this email.</p></div>`,
    });
    const accepted = delivery.accepted?.some((recipient) => (
      (typeof recipient === 'string' ? recipient : recipient.address).toLowerCase() === email
    ));
    if (!accepted) throw new Error('SMTP server did not accept the reset email.');
  } catch (err) {
    console.error('Reset email failed:', err.message);
    const { error: clearOtpError } = await supabase.from('users').update({
      otp_hash: null,
      otp_expires: null,
      otp_attempts: 0,
      otp_verified: false,
    }).eq('id', user.id);
    if (clearOtpError) console.error('Failed to clear undelivered reset code:', clearOtpError.message);
    return res.status(503).json({ error: 'Reset email could not be sent. Please try again later.' });
  }
  res.json(generic);
});

async function checkOtp(email, otp) {
  const { data: u } = await supabase.from('users')
    .select('id,otp_hash,otp_expires,otp_attempts,otp_verified').eq('email', email).maybeSingle();
  if (!u || !u.otp_hash) return { error: 'Invalid or expired code' };
  if (new Date(u.otp_expires) < new Date()) return { error: 'Code has expired' };
  if ((u.otp_attempts || 0) >= 5) return { error: 'Too many attempts. Request a new code.' };
  const expected = Buffer.from(u.otp_hash);
  const given = Buffer.from(hashOtp(email, String(otp)));
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
    await supabase.from('users').update({ otp_attempts: (u.otp_attempts || 0) + 1 }).eq('id', u.id);
    return { error: 'Invalid code' };
  }
  return { user: u };
}

app.post('/api/auth/verify-otp', async (req, res) => {
  const email = normaliseEmail(req.body.email);
  const { otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });
  const result = await checkOtp(email, otp);
  if (result.error) return res.status(400).json({ error: result.error });
  await supabase.from('users').update({ otp_verified: true }).eq('id', result.user.id);
  res.json({ message: 'Code verified successfully.' });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const email = normaliseEmail(req.body.email);
  const { otp, new_password } = req.body;
  if (!email || !otp || typeof new_password !== 'string') {
    return res.status(400).json({ error: 'Email, OTP, and new password are required' });
  }
  if (new_password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

  const result = await checkOtp(email, otp);
  if (result.error) return res.status(400).json({ error: result.error });
  if (!result.user.otp_verified) return res.status(400).json({ error: 'Please verify your code first' });

  const hash = await bcrypt.hash(new_password, 12);
  const { error } = await supabase.from('users').update({
    password_hash: hash, password_changed_at: new Date().toISOString(), otp_hash: null, otp_expires: null, otp_attempts: 0, otp_verified: false,
  }).eq('id', result.user.id);
  if (error) return res.status(400).json({ error: 'Could not reset the password.' });
  res.json({ message: 'Password reset successfully.' });
});

// ─── Access control ──────────────────────────────────────────────────────────
function userHasVideoAccess(user, video) {
  if (!user || !video) return false;
  if (user.role === 'admin') return true;
  const now = new Date();
  if (user.trial_end_date && new Date(user.trial_end_date) > now) return true;
  if (user.subscription_active && user.subscription_tier && user.subscription_tier !== 'Trial') {
    const notExpired = !user.subscription_end_date || new Date(user.subscription_end_date) > now;
    // The purchased grade is fixed at payment time; never fall back to the editable profile grade.
    const paidGrade = user.subscription_grade;
    const sameGrade = !video.grade || (paidGrade && video.grade === paidGrade);
    if (notExpired && sameGrade) {
      if (user.subscription_tier === 'Premium') return true;
      if (user.subscription_tier === 'Standard' && (video.tier === 'Standard' || !video.tier)) return true;
    }
  }
  return false;
}

// Hide protected URLs from anyone who has not unlocked the lesson; private files get short-lived signed links
async function signPrivate(url, ttl = 4 * 60 * 60) {
  if (typeof url !== 'string' || !url.startsWith('private:')) return url;
  const { data, error } = await supabase.storage.from(PRIVATE_BUCKET).createSignedUrl(url.slice('private:'.length), ttl);
  return error ? null : data.signedUrl;
}

// Turn an expiring signed link back into its stored private path before saving
function unsignPrivate(url) {
  const m = typeof url === 'string' && url.match(/\/object\/sign\/prince-math-private\/([^?]+)/);
  return m ? `private:${decodeURIComponent(m[1])}` : url;
}

async function redactVideo(video, user) {
  if (!video) return video;
  const out = { ...video, has_notes: Boolean(video.notes_url) };
  delete out.notes_url;
  if (!userHasVideoAccess(user, video)) delete out.video_url;
  else {
    out.video_url = await signPrivate(video.video_url);
    if (user?.role === 'admin') out.notes_url = video.notes_url;
  }
  return out;
}

// ─── Entity CRUD ──────────────────────────────────────────────────────────────
const ENTITY_TABLES = {
  Video: 'videos',
  Favorite: 'favorites',
  Comment: 'comments',
  XPEvent: 'xpevents',
  Notification: 'notifications',
  Message: 'messages',
  User: 'users',
  Announcement: 'announcements',
  Badge: 'badges',
  UserBadge: 'user_badges',
  VideoProgress: 'video_progress',
  ForumPost: 'forum_posts',
  ForumReply: 'forum_replies',
  StudyGroup: 'study_groups',
  StudyGroupMember: 'study_group_members',
  Feedback: 'feedback',
};
const COMMUNITY_ENTITIES = ['ForumPost', 'ForumReply', 'StudyGroup', 'StudyGroupMember'];
const hasLongText = (obj) => Object.values(obj || {}).some((v) => typeof v === 'string' && v.length > 5000);
const ALLOWED_ENTITIES = Object.keys(ENTITY_TABLES);
const TABLE = (name) => ENTITY_TABLES[name];
const PUBLIC_USER_FIELDS = 'id,email,full_name,grade,role,xp,level,current_streak,longest_streak,created_at,created_date';

// GET /api/entities/:entity
app.get('/api/entities/:entity', authenticatePrivateEntityRead, async (req, res) => {
  const { entity } = req.params;
  if (!ALLOWED_ENTITIES.includes(entity)) return res.status(404).json({ error: 'Unknown entity' });
  if (['User', 'UserBadge'].includes(entity) && !getTokenFromReq(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let query = supabase.from(TABLE(entity)).select(entity === 'User' ? PUBLIC_USER_FIELDS : '*');
  if (req.user && req.user.role !== 'admin') {
    if (['Favorite', 'XPEvent', 'Notification', 'VideoProgress', 'Feedback'].includes(entity)) {
      query = query.eq('user_email', req.user.email);
    } else if (entity === 'Message') {
      query = query.or(`sender_email.eq.${req.user.email},recipient_email.eq.${req.user.email}`);
    } else if (entity === 'Announcement') {
      query = query.eq('is_deleted', false).eq('is_active', true);
    }
  } else if (!req.user && entity === 'Announcement') {
    query = query.eq('is_deleted', false).eq('is_active', true);
  }

  // Filters
  const filtersRaw = req.query.filters;
  if (filtersRaw) {
    let filters;
    try { filters = JSON.parse(filtersRaw); } catch { return res.status(400).json({ error: 'Invalid filters.' }); }
    for (const [key, value] of Object.entries(filters || {})) {
      if (!columnAllowed(entity, key, req.user)) return res.status(400).json({ error: `Cannot filter by ${key}.` });
      if (value !== null && typeof value === 'object') return res.status(400).json({ error: 'Invalid filter value.' });
      query = query.eq(key, value);
    }
  }

  // Sort
  const sort = typeof req.query.sort === 'string' ? req.query.sort : '';
  if (sort) {
    const desc = sort.startsWith('-');
    const col = desc ? sort.slice(1) : sort;
    if (!columnAllowed(entity, col, req.user)) return res.status(400).json({ error: `Cannot sort by ${col}.` });
    query = query.order(col, { ascending: !desc });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  // Limit (never return an unbounded table)
  const limit = parseInt(req.query.limit, 10);
  query = query.limit(limit > 0 ? Math.min(limit, 1000) : 1000);

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });

  let result = data || [];
  if (entity === 'Announcement' && (!req.user || req.user.role !== 'admin')) {
    const now = Date.now();
    result = result.filter((a) => !a.expires_at || new Date(a.expires_at).getTime() > now);
  }

  // Normalise: expose created_at as created_date for frontend compatibility
  const rows = await Promise.all(result.map(async (r) => normalise(entity === 'Video' ? await redactVideo(r, req.user) : r)));
  res.json(rows);
});

// GET /api/entities/:entity/:id
app.get('/api/entities/:entity/:id', authenticatePrivateEntityRead, async (req, res) => {
  const { entity, id } = req.params;
  if (!ALLOWED_ENTITIES.includes(entity)) return res.status(404).json({ error: 'Unknown entity' });
  if (entity === 'XPEvent' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'XP events cannot be edited directly.' });
  }
  if (['User', 'UserBadge'].includes(entity) && !getTokenFromReq(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { data, error } = await supabase.from(TABLE(entity))
    .select(entity === 'User' ? PUBLIC_USER_FIELDS : '*').eq('id', id).single();
  if (error) return res.status(404).json({ error: 'Not found' });
  if (entity === 'Announcement' && (!req.user || req.user.role !== 'admin')) {
    if (data.is_deleted || data.is_active === false || (data.expires_at && new Date(data.expires_at).getTime() <= Date.now())) {
      return res.status(404).json({ error: 'Not found' });
    }
  }
  if (req.user && req.user.role !== 'admin' && ['Favorite', 'XPEvent', 'Notification', 'Message', 'VideoProgress', 'Feedback'].includes(entity) && !ownsRecord(data, req.user)) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(normalise(entity === 'Video' ? await redactVideo(data, req.user) : data));
});

// POST /api/entities/:entity
app.post('/api/entities/:entity', requireAuth, async (req, res) => {
  const { entity } = req.params;
  if (!ALLOWED_ENTITIES.includes(entity)) return res.status(404).json({ error: 'Unknown entity' });
  if (entity === 'User') return res.status(405).json({ error: 'Use the registration endpoint to create an account.' });
  if (entity === 'XPEvent' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'XP events are recorded by the award service.' });
  }
  if (['Video', 'Announcement', 'Badge', 'UserBadge'].includes(entity) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }
  const payload = { ...req.body };
  if (entity === 'Video') payload.video_url = unsignPrivate(payload.video_url);
  if (hasLongText(payload)) return res.status(400).json({ error: 'Text is too long.' });
  for (const field of ['created_at', 'created_date', 'updated_at', 'has_notes']) delete payload[field];
  payload.id = uuidv4();
  if (['ForumPost', 'ForumReply', 'StudyGroupMember', 'Feedback'].includes(entity)) {
    payload.user_email = req.user.email;
  }
  if (['ForumPost', 'ForumReply'].includes(entity)) {
    payload.user_name = req.user.full_name;
    payload.upvotes = 0;
    if (entity === 'ForumPost' && req.user.role !== 'admin') payload.is_pinned = false;
  }
  if (entity === 'StudyGroup') payload.creator_email = req.user.email;
  if (entity === 'Feedback') { payload.status = 'open'; }
  if (['Favorite', 'XPEvent', 'Notification', 'UserBadge', 'VideoProgress'].includes(entity) && req.user.role !== 'admin') {
    payload.user_email = req.user.email;
  }
  if (entity === 'Comment') {
    payload.author_email = req.user.email;
    payload.author_name = req.user.full_name;
  }
  if (entity === 'Message') {
    payload.sender_email = req.user.email;
    payload.sender_name = req.user.full_name;
  }
  const { data, error } = await supabase.from(TABLE(entity)).insert(payload).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(normalise(data));
});

// PATCH /api/entities/:entity/:id — users can only edit their own records
app.patch('/api/entities/:entity/:id', requireAuth, async (req, res) => {
  const { entity, id } = req.params;
  if (!ALLOWED_ENTITIES.includes(entity)) return res.status(404).json({ error: 'Unknown entity' });
  if (entity === 'Video' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }

  if (entity === 'User') {
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'You can only edit your own profile.' });
    }
    const { updates, error: invalid } = sanitiseProfile(req.body);
    if (invalid) return res.status(400).json({ error: invalid });
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'Nothing to update.' });
    const { data, error } = await supabase.from(TABLE(entity)).update(updates).eq('id', id).select(PUBLIC_USER_FIELDS).single();
    if (error) return res.status(400).json({ error: 'Could not update the profile.' });
    return res.json(normalise(data));
  }

  // Data protection: non-admins can only edit records they own
  if (hasLongText(req.body)) return res.status(400).json({ error: 'Text is too long.' });
  if (req.user.role !== 'admin') {
    const { data: existing } = await supabase.from(TABLE(entity)).select('*').eq('id', id).single();
    if (existing) {
      const isForumEntry = ['ForumPost', 'ForumReply'].includes(entity);
      if (isForumEntry && Object.hasOwn(req.body || {}, 'upvotes')) {
        const isVote = Object.keys(req.body || {}).length === 1
          && Number.isInteger(req.body.upvotes);
        if (!isVote) return res.status(403).json({ error: 'Vote counts can only be changed by casting a vote.' });
        const { data: vote, error } = await supabase.rpc('cast_forum_vote', {
          p_user_id: req.user.id,
          p_target_type: entity,
          p_target_id: id,
        }).single();
        if (error) {
          console.error('Forum vote failed:', error.message);
          return res.status(503).json({ error: 'Could not save your vote. Please try again later.' });
        }
        if (!vote.voted) return res.status(409).json({ error: 'You have already voted for this post.' });
        return res.json({ ...normalise(existing), upvotes: vote.upvotes });
      }
      if (!ownsRecord(existing, req.user)) {
        return res.status(403).json({ error: 'You can only edit your own records' });
      }
    }
  }

  const updates = { ...req.body };
  if (entity === 'Video' && updates.video_url) updates.video_url = unsignPrivate(updates.video_url);
  for (const field of ['id', 'created_at', 'created_date', 'updated_at', 'has_notes']) delete updates[field];
  if (['Announcement', 'Badge', 'UserBadge'].includes(entity) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }
  if (req.user.role !== 'admin') {
    for (const field of ['user_email', 'author_email', 'sender_email', 'recipient_email', 'creator_email',
      'user_name', 'upvotes', 'is_pinned', 'status']) {
      delete updates[field];
    }
  }
  const { data, error } = await supabase.from(TABLE(entity)).update(updates).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(normalise(data));
});

// DELETE /api/entities/:entity/:id — users can only delete their own records
app.delete('/api/entities/:entity/:id', requireAuth, async (req, res) => {
  const { entity, id } = req.params;
  if (!ALLOWED_ENTITIES.includes(entity)) return res.status(404).json({ error: 'Unknown entity' });
  if (entity === 'User') return res.status(405).json({ error: 'Account deletion is not available through this endpoint.' });
  if (['Video', 'Announcement', 'Badge', 'UserBadge'].includes(entity) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }
  if (entity === 'XPEvent' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'XP events cannot be deleted directly.' });
  }

  // Data protection: non-admins can only delete records they own
  if (req.user.role !== 'admin') {
    const { data: existing } = await supabase.from(TABLE(entity)).select('*').eq('id', id).single();
    if (existing) {
      if (!ownsRecord(existing, req.user)) {
        return res.status(403).json({ error: 'You can only delete your own records' });
      }
    }
  }

  const { error } = await supabase.from(TABLE(entity)).delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).end();
});

// ─── Functions ────────────────────────────────────────────────────────────────

app.get('/api/functions/dailyChallenge', optionalAuth, async (req, res) => {
  const challenge = createDailyChallenge();
  let submission = null;
  if (req.user) {
    const { data, error } = await supabase.from('daily_challenge_submissions')
      .select('is_correct,xp_earned')
      .eq('user_email', req.user.email)
      .eq('challenge_id', challenge.id)
      .maybeSingle();
    if (error) {
      console.error('Daily challenge lookup failed:', error.message);
      return res.status(503).json({ error: 'Daily challenge progress is unavailable.' });
    }
    submission = data;
  }
  const { answer, explanation, ...publicChallenge } = challenge;
  res.json({ challenge: publicChallenge, submission });
});

app.post('/api/functions/dailyChallenge/submit', requireAuth, async (req, res) => {
  const challenge = createDailyChallenge();
  if (!isCorrectDailyAnswer(req.body.answer, challenge.answer)) {
    return res.status(200).json({ correct: false, message: 'Not quite. Check your working and try again.' });
  }

  const { data: submission, error: submissionError } = await supabase.from('daily_challenge_submissions')
    .upsert({
      id: uuidv4(),
      user_email: req.user.email,
      challenge_id: challenge.id,
      answer: String(req.body.answer).trim(),
      is_correct: true,
      xp_earned: challenge.xp_reward,
      submitted_at: new Date().toISOString(),
    }, { onConflict: 'user_email,challenge_id' })
    .select('is_correct,xp_earned')
    .single();
  if (submissionError) {
    console.error('Daily challenge submission failed:', submissionError.message);
    return res.status(503).json({ error: 'Your answer could not be saved. Please try again.' });
  }

  const { error: awardError } = await supabase.rpc('award_user_xp', {
    p_user_id: req.user.id,
    p_action_type: 'daily_challenge',
    p_xp_amount: challenge.xp_reward,
    p_reference_id: challenge.id,
  });
  if (awardError) {
    console.error('Daily challenge XP award failed:', awardError.message);
    return res.status(503).json({ error: 'Your answer was saved, but XP is temporarily unavailable.' });
  }

  res.json({
    correct: true,
    xp_earned: submission.xp_earned,
    explanation: challenge.explanation,
  });
});

const XP_REWARDS = {
  watch_video: 10,
  complete_video: 50,
  daily_challenge: 20,
  forum_post: 15,
  forum_reply: 5,
  study_group_join: 25,
  streak_bonus: 30,
};

app.post('/api/functions/awardXP', requireAuth, async (req, res) => {
  const { action_type } = req.body;
  const xpAmount = XP_REWARDS[action_type];
  if (!xpAmount) return res.status(400).json({ error: 'Unsupported XP action.' });

  const referenceId = action_type === 'streak_bonus'
    ? new Date().toISOString().slice(0, 10)
    : String(req.body.reference_id || '');
  if (!referenceId || referenceId.length > 200) {
    return res.status(400).json({ error: 'A valid activity reference is required.' });
  }

  const activityLookup = {
    watch_video: ['verified_video_views', 'video_id', referenceId],
    complete_video: ['video_progress', 'video_id', referenceId],
    daily_challenge: ['daily_challenge_submissions', 'challenge_id', referenceId],
    forum_post: ['forum_posts', 'id', referenceId],
    forum_reply: ['forum_replies', 'id', referenceId],
    study_group_join: ['study_group_members', 'group_id', referenceId],
  }[action_type];
  if (activityLookup) {
    let activityQuery = supabase.from(activityLookup[0]).select('*').eq(activityLookup[1], activityLookup[2]);
    if (action_type === 'watch_video') activityQuery = activityQuery.eq('user_id', req.user.id);
    if (['complete_video', 'daily_challenge', 'study_group_join', 'forum_post', 'forum_reply'].includes(action_type)) {
      activityQuery = activityQuery.eq('user_email', req.user.email);
    }
    if (action_type === 'complete_video') activityQuery = activityQuery.eq('completed', true);
    if (action_type === 'daily_challenge') activityQuery = activityQuery.eq('is_correct', true);
    const { data: activity, error: activityError } = await activityQuery.limit(1).maybeSingle();
    if (activityError) {
      console.error('XP activity verification failed:', activityError.message);
      return res.status(503).json({ error: 'Could not verify this activity. Please try again later.' });
    }
    if (!activity) return res.status(403).json({ error: 'The activity could not be verified.' });
  }

  const { data, error } = await supabase.rpc('award_user_xp', {
    p_user_id: req.user.id,
    p_action_type: action_type,
    p_xp_amount: xpAmount,
    p_reference_id: referenceId,
  }).single();
  if (error) return res.status(503).json({ error: 'XP service unavailable. Apply the latest Supabase schema migration.' });
  res.json(data);
});

app.post('/api/functions/updateStreak', requireAuth, async (req, res) => {
  const activityDate = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase.rpc('record_user_activity_streak', {
    p_user_id: req.user.id,
    p_activity_date: activityDate,
  }).single();
  if (error) return res.status(503).json({ error: 'Streak service unavailable. Apply the latest Supabase schema migration.' });
  res.json(data);
});

// POST /api/functions/createPayFastPayment
app.post('/api/functions/createPayFastPayment', requireAuth, async (req, res) => {
  const { grade, tier } = req.body;
  const PRICES = { Standard: 100, Premium: 150 };
  if (!['Grade 10', 'Grade 11', 'Grade 12'].includes(grade) || !PRICES[tier]) {
    return res.status(400).json({ error: 'Missing or invalid grade/tier' });
  }

  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passphrase = process.env.PAYFAST_PASSPHRASE || '';
  // PayFast requires a passphrase for recurring subscriptions.
  if (!merchantId || !merchantKey || !passphrase) return res.status(503).json({ error: 'Payments are not configured yet.' });
  const paymentUrl = `${payfastHost()}/eng/process`;
  const appOrigin = (process.env.APP_ORIGIN || 'https://princemath.co.za').replace(/\/$/, '');

  const user = req.user;
  const nameParts = (user.full_name || 'Student User').trim().split(' ');
  const nameFirst = nameParts[0] || 'Student';
  const nameLast = nameParts.slice(1).join(' ') || 'User';

  const amountNum = PRICES[tier];
  const paymentData = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${appOrigin}/PaymentSuccess`,
    cancel_url: `${appOrigin}/Pricing`,
    notify_url: `${appOrigin}/api/payfast-webhook`,
    name_first: nameFirst,
    name_last: nameLast,
    email_address: user.email,
    m_payment_id: `${user.id}_${Date.now()}`,
    amount: amountNum.toFixed(2),
    item_name: `${grade} ${tier} Subscription`,
    custom_str1: String(user.id),
    custom_str2: grade,
    custom_str3: tier,
    subscription_type: '1',
    frequency: '3',
    cycles: '0',
  };

  const signature = generatePayfastSignature(paymentData, passphrase);
  res.json({ paymentUrl, paymentData: { ...paymentData, signature } });
});

// POST /api/functions/trackVideoView
app.post('/api/functions/trackVideoView', requireAuth, async (req, res) => {
  const { video_id } = req.body;
  if (!video_id) return res.status(400).json({ error: 'video_id is required' });

  const { data: video, error } = await supabase.from('videos').select('*').eq('id', video_id).single();
  if (error || !video) return res.status(404).json({ error: 'Video not found' });
  if (!userHasVideoAccess(req.user, video)) return res.status(403).json({ error: 'Subscription required' });

  const { data: view, error: viewError } = await supabase.rpc('record_verified_video_view', {
    p_user_id: req.user.id,
    p_video_id: video_id,
  }).single();
  if (viewError) {
    console.error('Video view could not be recorded:', viewError.message);
    return res.status(503).json({ error: 'Could not record this video view. Please try again.' });
  }
  res.json({ success: true, views: view.views });
});

// POST /api/functions/getAdminStats
app.post('/api/functions/getAdminStats', requireAdmin, async (req, res) => {
  const [{ data: videos }, { data: users }] = await Promise.all([
    supabase.from('videos').select('id,title,views,grade,tier'),
    supabase.from('users').select('role,trial_end_date,subscription_active,subscription_end_date'),
  ]);

  const totalVideos = videos?.length || 0;
  const totalStudents = (users || []).filter(u => u.role !== 'admin').length;
  const totalViews = (videos || []).reduce((s, v) => s + (v.views || 0), 0);
  const avgViewsPerVideo = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0;

  const now = new Date();
  const activeSubscriptions = (users || []).filter(u => {
    if (u.role === 'admin') return false;
    const hasTrial = u.trial_end_date && new Date(u.trial_end_date) > now;
    const hasSub = u.subscription_active && u.subscription_end_date && new Date(u.subscription_end_date) > now;
    return hasTrial || hasSub;
  }).length;

  const gradeDistribution = (videos || []).reduce((acc, v) => {
    acc[v.grade] = (acc[v.grade] || 0) + 1;
    return acc;
  }, {});

  const tierDistribution = (videos || []).reduce((acc, v) => {
    acc[v.tier] = (acc[v.tier] || 0) + 1;
    return acc;
  }, {});

  const topVideos = [...(videos || [])]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
    .map(v => ({ id: v.id, title: v.title, views: v.views || 0, grade: v.grade }));

  res.json({
    success: true,
    stats: { totalVideos, totalStudents, totalViews, avgViewsPerVideo, activeSubscriptions, gradeDistribution, tierDistribution, topVideos },
  });
});

// POST /api/functions/sendNewVideoNotifications
app.post('/api/functions/sendNewVideoNotifications', requireAdmin, async (req, res) => {
  const { video_id, video_title, grade } = req.body;
  if (!video_id || !video_title || !grade) {
    return res.status(400).json({ error: 'video_id, video_title and grade are required' });
  }

  const { data: allUsers } = await supabase.from('users').select('id, email');
  const targets = (allUsers || []).filter(u => u.email && u.email !== req.user.email);

  let count = 0;
  for (const u of targets) {
    const { error } = await supabase.from('notifications').insert({
      id: uuidv4(),
      user_email: u.email,
      video_id,
      message: `📚 New ${grade} lesson: "${video_title}"`,
      is_read: false,
    });
    if (!error) count++;
  }

  res.json({ success: true, notifications_sent: count });
});

// POST /api/functions/validateVideoUpload
app.post('/api/functions/validateVideoUpload', requireAdmin, (req, res) => {
  const { title, grade, tier } = req.body;
  if (!title || !grade || !tier) {
    return res.status(400).json({ error: 'title, grade and tier are required' });
  }
  const validGrades = ['Grade 10', 'Grade 11', 'Grade 12'];
  if (!validGrades.includes(grade)) return res.status(400).json({ error: 'Invalid grade' });
  const validTiers = ['Standard', 'Premium'];
  if (!validTiers.includes(tier)) return res.status(400).json({ error: 'Invalid tier' });
  res.json({ success: true, message: 'Validation passed', uploader: req.user.full_name });
});

// ─── PayFast Webhook ──────────────────────────────────────────────────────────
const PAYFAST_PLANS = { Standard: 100, Premium: 150 };
const PAYFAST_GRADES = ['Grade 10', 'Grade 11', 'Grade 12'];
const payfastHost = () => (process.env.PAYFAST_SANDBOX === 'true' ? 'https://sandbox.payfast.co.za' : 'https://www.payfast.co.za');

// PayFast encodes like PHP urlencode: uppercase hex, spaces as "+", and !'()*~ escaped.
const pfEncode = (v) => encodeURIComponent(String(v).trim())
  .replace(/[!'()*~]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
  .replace(/%20/g, '+');

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

app.post('/api/payfast-webhook', limiter(60_000, 120, 'Too many requests.'), express.urlencoded({ extended: true, limit: '20kb' }), async (req, res) => {
  try {
    const raw = req.body || {};
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    const merchantId = process.env.PAYFAST_MERCHANT_ID;
    if (!merchantId || !passphrase) return res.status(503).send('Payments not configured');

    // 1. Signature: every posted field, in the order PayFast sent them.
    const pairs = Object.keys(raw).filter((k) => k !== 'signature').map((k) => `${k}=${pfEncode(raw[k] ?? '')}`);
    const paramString = pairs.join('&');
    const expectedSignature = crypto.createHash('md5').update(`${paramString}&passphrase=${pfEncode(passphrase)}`).digest('hex');
    if (!safeEqual(String(raw.signature || '').toLowerCase(), expectedSignature)) {
      console.error('PayFast ITN: invalid signature');
      return res.status(400).send('Invalid signature');
    }

    // 2. The notification must be for our merchant account.
    if (String(raw.merchant_id) !== String(merchantId)) {
      console.error('PayFast ITN: merchant mismatch');
      return res.status(400).send('Invalid merchant');
    }

    // 3. Ask PayFast to confirm it really sent this notification (replaces fragile IP allow-lists).
    const confirm = await fetch(`${payfastHost()}/eng/query/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: paramString,
      signal: AbortSignal.timeout(10_000),
    });
    if ((await confirm.text()).trim() !== 'VALID') {
      console.error('PayFast ITN: server confirmation failed');
      return res.status(400).send('Not confirmed');
    }

    const pfPaymentId = String(raw.pf_payment_id || '');
    if (!pfPaymentId) return res.status(400).send('Missing payment id');

    const userId = String(raw.custom_str1 || '');
    const grade = raw.custom_str2;
    const tier = raw.custom_str3;
    const amount = parseFloat(raw.amount_gross);
    const planOk = PAYFAST_GRADES.includes(grade) && PAYFAST_PLANS[tier] !== undefined;

    // 4. Record the payment once. A replayed notification hits the unique key.
    let payment = null;
    const paymentRow = {
      id: uuidv4(),
      pf_payment_id: pfPaymentId,
      m_payment_id: raw.m_payment_id || null,
      user_id: userId || null,
      grade: grade || null,
      tier: tier || null,
      amount: Number.isFinite(amount) ? amount : null,
      status: raw.payment_status || null,
    };
    const { data: insertedPayment, error: insertError } = await supabase.from('payments').insert(paymentRow).select().maybeSingle();
    if (insertError) {
      if (insertError.code === '23505') {
        const { data: existingPayment, error: existingError } = await supabase.from('payments')
          .select('*').eq('pf_payment_id', pfPaymentId).maybeSingle();
        if (existingError || !existingPayment) throw existingError || new Error('Payment record unavailable');
        payment = existingPayment;
      } else {
        throw insertError;
      }
    } else {
      payment = insertedPayment || paymentRow;
    }

    if ((payment.status || raw.payment_status) !== 'COMPLETE') return res.send('OK');
    if (payment.applied_at) return res.send('OK');

    if (!userId || !planOk || Math.abs(amount - PAYFAST_PLANS[tier]) > 0.01) {
      console.error('PayFast ITN: amount/plan mismatch');
      return res.status(400).send('Invalid payment details');
    }

    const { data: user, error: userError } = await supabase.from('users')
      .select('id,email,subscription_active,subscription_end_date').eq('id', userId).maybeSingle();
    if (userError) throw userError;
    if (!user) {
      console.error('PayFast ITN: unknown user');
      return res.status(400).send('Unknown user');
    }

    // Renewals extend from the current end date instead of wasting paid time.
    const now = new Date();
    const currentEnd = user.subscription_active && user.subscription_end_date ? new Date(user.subscription_end_date) : now;
    const subscriptionEndDate = new Date(Math.max(now.getTime(), currentEnd.getTime()));
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    const { error: activationError } = await supabase.from('users').update({
      subscription_tier: tier,
      grade,
      subscription_grade: grade,
      subscription_end_date: subscriptionEndDate.toISOString(),
      subscription_active: true,
    }).eq('id', user.id);
    if (activationError) {
      console.error('PayFast ITN: subscription activation failed:', activationError.message);
      return res.status(500).send('Subscription activation failed');
    }

    const { error: appliedError } = await supabase.from('payments')
      .update({ applied_at: new Date().toISOString() }).eq('pf_payment_id', pfPaymentId);
    if (appliedError) {
      console.error('PayFast ITN: could not mark payment applied:', appliedError.message);
    }

    const { error: notificationError } = await supabase.from('notifications').insert({
      id: uuidv4(),
      user_email: user.email,
      message: `Your ${grade} ${tier} subscription is now active!`,
      is_read: false,
    });
    if (notificationError) {
      console.error('PayFast ITN: could not create activation notification:', notificationError.message);
    }

    res.send('OK');
  } catch (error) {
    console.error('Webhook error:', error?.message || error);
    res.status(500).send('Webhook processing failed');
  }
});

// ─── File Upload ──────────────────────────────────────────────────────────────
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024, files: 1 } });
const PUBLIC_BUCKET = 'prince-math';
const PRIVATE_BUCKET = 'prince-math-private';
const UPLOAD_RULES = {
  video: { mimes: ['video/mp4', 'video/webm', 'video/quicktime'], exts: ['mp4', 'webm', 'mov'], max: 500 * 1024 * 1024 },
  image: { mimes: ['image/jpeg', 'image/png', 'image/webp'], exts: ['jpg', 'jpeg', 'png', 'webp'], max: 5 * 1024 * 1024 },
  notes: { mimes: ['application/pdf'], exts: ['pdf'], max: 20 * 1024 * 1024 },
};

let bucketReady = null;
function ensurePrivateBucket() {
  bucketReady ||= supabase.storage.createBucket(PRIVATE_BUCKET, { public: false })
    .then(({ error }) => {
      if (error && !/already exists|duplicate/i.test(error.message)) {
        bucketReady = null;
        throw error;
      }
    });
  return bucketReady;
}

app.post('/api/upload', requireAdmin, limiter(60_000, 30, 'Too many uploads. Please wait.'), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  const kind = req.query.kind === 'notes' ? 'notes' : req.file.mimetype.startsWith('image/') ? 'image' : 'video';
  const rules = UPLOAD_RULES[kind];
  const ext = (req.file.originalname.split('.').pop() || '').toLowerCase();
  if (!rules.mimes.includes(req.file.mimetype) || !rules.exts.includes(ext)) {
    return res.status(415).json({ error: `Unsupported file type. Allowed: ${rules.exts.join(', ')}` });
  }
  if (req.file.size > rules.max) {
    return res.status(413).json({ error: `File too large (max ${Math.round(rules.max / 1024 / 1024)}MB).` });
  }

  const fileName = `${kind}/${uuidv4()}.${ext}`;
  try {
    const isPrivate = kind !== 'image';
    if (isPrivate) await ensurePrivateBucket();
    const bucket = isPrivate ? PRIVATE_BUCKET : PUBLIC_BUCKET;
    const { error } = await supabase.storage.from(bucket).upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });
    if (error) return res.status(500).json({ error: 'Upload failed. Please try again.' });
    if (isPrivate) return res.json({ file_url: `private:${fileName}` });
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
    res.json({ file_url: publicUrl });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: 'Upload failed. Please try again.' });
  }
});

// ─── Limited notes downloads ─────────────────────────────────────────────────
const DOWNLOAD_LIMIT_PER_DAY = Number(process.env.DOWNLOAD_LIMIT_PER_DAY) || 5;
const DOWNLOAD_LIMIT_PER_LESSON = Number(process.env.DOWNLOAD_LIMIT_PER_LESSON) || 3;

app.post('/api/functions/downloadNotes', requireAuth, async (req, res) => {
  const { video_id } = req.body;
  if (!video_id) return res.status(400).json({ error: 'video_id is required' });

  const { data: video } = await supabase.from('videos').select('*').eq('id', video_id).maybeSingle();
  if (!video || !video.notes_url) return res.status(404).json({ error: 'No notes available for this lesson.' });
  if (!userHasVideoAccess(req.user, video)) {
    return res.status(403).json({ error: 'Subscribe to unlock this lesson’s notes.' });
  }

  const isAdmin = req.user.role === 'admin';
  let remaining = null;
  if (!isAdmin) {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: logs, error: logError } = await supabase.from('download_log')
      .select('video_id').eq('user_email', req.user.email).gte('created_at', dayAgo);
    if (logError) return res.status(500).json({ error: 'Could not check your download allowance.' });
    const today = logs?.length || 0;
    const forLesson = (logs || []).filter((l) => l.video_id === video_id).length;
    if (today >= DOWNLOAD_LIMIT_PER_DAY) {
      return res.status(429).json({ error: `Daily limit reached (${DOWNLOAD_LIMIT_PER_DAY} downloads per 24 hours). Try again tomorrow.`, remaining: 0 });
    }
    if (forLesson >= DOWNLOAD_LIMIT_PER_LESSON) {
      return res.status(429).json({ error: `You have downloaded these notes ${DOWNLOAD_LIMIT_PER_LESSON} times already today.`, remaining: 0 });
    }
    await supabase.from('download_log').insert({ id: uuidv4(), user_email: req.user.email, video_id });
    remaining = DOWNLOAD_LIMIT_PER_DAY - today - 1;
  }

  let url = video.notes_url;
  if (url.startsWith('private:')) {
    const { data, error } = await supabase.storage.from(PRIVATE_BUCKET)
      .createSignedUrl(url.slice('private:'.length), 60, { download: `${(video.title || 'notes').replace(/[^\w -]/g, '')}.pdf` });
    if (error) return res.status(500).json({ error: 'Could not prepare the download.' });
    url = data.signedUrl;
  }
  res.json({ url, remaining: remaining ?? null, limit: DOWNLOAD_LIMIT_PER_DAY });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normalise(row) {
  if (!row) return row;
  // Expose created_at as created_date for frontend compatibility
  return { ...row, created_date: row.created_date || row.created_at };
}

function generatePayfastSignature(data, passphrase) {
  const filtered = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  const queryString = Object.keys(filtered)
    .map(key => `${key}=${pfEncode(filtered[key])}`)
    .join('&');
  const finalString = passphrase
    ? `${queryString}&passphrase=${pfEncode(passphrase)}`
    : queryString;
  return crypto.createHash('md5').update(finalString).digest('hex');
}

// ─── Error handler ────────────────────────────────────────────────────────────
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large.' });
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body.' });
  if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Request too large.' });
  console.error('Unhandled error:', err?.message);
  res.status(500).json({ error: 'Something went wrong.' });
});

// ─── Export ───────────────────────────────────────────────────────────────────
export default app;
