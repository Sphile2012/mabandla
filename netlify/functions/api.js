/**
 * Prince Math Academy ΓÇö Netlify Serverless API
 * All backend logic lives here, deployed as a single Netlify Function.
 *
 * Routes:
 *   GET  /api/auth/me
 *   PATCH /api/auth/me
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   POST /api/auth/forgot-password
 *   POST /api/auth/verify-otp
 *   POST /api/auth/reset-password
 *   POST /api/auth/request-password-change
 *   POST /api/auth/change-password
 *   POST /api/auth/send-otp
 *   POST /api/auth/verify-email
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
 *   POST /api/functions/getApkDownload
 *   POST /api/payfast-webhook
 *   POST /api/upload
 */

import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// ─── Supabase client ──────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
);

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

// ─── Express app ──────────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    supabase: !!process.env.SUPABASE_URL,
    jwt: !!process.env.JWT_SECRET,
    ts: new Date().toISOString(),
  });
});

// ΓöÇΓöÇΓöÇ Auth helpers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '30d' });
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
    const payload = jwt.verify(token, JWT_SECRET);
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.sub)
      .maybeSingle();
    if (error || !user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

async function requireAdmin(req, res, next) {
  await requireAuth(req, res, async () => {
    if (req.user.role !== 'admin' && req.user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

// ΓöÇΓöÇΓöÇ Auth routes ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

// GET /api/auth/me
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json(req.user);
});

// PATCH /api/auth/me
app.patch('/api/auth/me', requireAuth, async (req, res) => {
  const allowed = [
    'full_name', 'phone_number', 'grade', 'bank_name',
    'account_holder', 'account_number', 'account_type',
    'subscription_tier', 'trial_end_date', 'subscription_active',
    'subscription_end_date', 'role',
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', req.user.id)
    .select()
    .maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// POST /api/auth/register  ΓÇö email + password sign-up
app.post('/api/auth/register', async (req, res) => {
  const { email, password, full_name } = req.body;
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'email, password and full_name are required' });
  }
  // Check for existing user
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();
  if (existing) return res.status(400).json({ error: 'An account with this email already exists.' });

  const hash = await bcrypt.hash(password, 10);
  const id = uuidv4();
  const role = email.toLowerCase().trim() === ADMIN_EMAIL ? 'admin' : 'student';
  const { data, error } = await supabase
    .from('users')
    .insert({ id, email: email.toLowerCase().trim(), password_hash: hash, full_name, role })
    .select()
    .maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  const token = signToken(data.id);
  res.json({ token, user: data });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();
  if (error || !user) return res.status(401).json({ error: 'Invalid email or password.' });
  const valid = await bcrypt.compare(password, user.password_hash || '');
  if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });
  const token = signToken(user.id);
  res.json({ token, user });
});

// ΓöÇΓöÇΓöÇ OTP helpers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function storeOtp(email, otp, purpose) {
  // Delete any existing OTPs for this email+purpose
  await supabase.from('otp_codes').delete().eq('email', email).eq('purpose', purpose);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min
  await supabase.from('otp_codes').insert({
    id: uuidv4(),
    email,
    otp_hash: await bcrypt.hash(otp, 8),
    purpose,
    expires_at: expiresAt,
    used: false,
  });
}

async function verifyOtp(email, otp, purpose) {
  const { data: record } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('purpose', purpose)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!record) return { valid: false, reason: 'No OTP found. Please request a new code.' };
  if (new Date(record.expires_at) < new Date()) {
    return { valid: false, reason: 'Code has expired. Please request a new one.' };
  }
  const match = await bcrypt.compare(otp, record.otp_hash);
  if (!match) return { valid: false, reason: 'Invalid code. Please try again.' };

  // Mark as used
  await supabase.from('otp_codes').update({ used: true }).eq('id', record.id);
  return { valid: true };
}
// Email sender — tries SMTP (nodemailer), then logs OTP to console
// To enable emails: set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in Netlify env vars
// Or set RESEND_API_KEY for Resend (https://resend.com)
async function sendEmail(to, subject, htmlBody) {
  // Option 1: SMTP via nodemailer (static import — works with esbuild)
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost, port: smtpPort, secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });
      const from = process.env.SMTP_FROM || smtpUser;
      await transporter.sendMail({ from, to, subject, html: htmlBody });
      console.log(`[EMAIL] Sent via SMTP to ${to}`);
      return;
    } catch (err) {
      console.error('[EMAIL] SMTP failed:', err.message);
    }
  }

  // Option 2: Dev fallback — log OTP to console so you can test without email
  console.log(`[EMAIL DEV] To: ${to} | Subject: ${subject}`);
  const otpMatch = htmlBody.match(/letter-spacing:12px[^>]*>(\d{6})</);
  if (otpMatch) console.log(`[EMAIL DEV] *** OTP CODE: ${otpMatch[1]} ***`);
}
function otpEmailHtml(otp, purpose) {
  const purposeText = purpose === 'password_reset' ? 'reset your password' : 'verify your email';
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0f2e;color:#fff;border-radius:16px;">
      <h2 style="color:#a78bfa;margin-bottom:8px;">Prince Math Academy</h2>
      <p style="color:#cbd5e1;margin-bottom:24px;">Use the code below to ${purposeText}:</p>
      <div style="background:#1e1b4b;border:2px solid #7c3aed;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#fff;">${otp}</span>
      </div>
      <p style="color:#94a3b8;font-size:13px;">This code expires in <strong>15 minutes</strong>. Do not share it with anyone.</p>
      <p style="color:#64748b;font-size:12px;margin-top:16px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
}

// POST /api/auth/forgot-password ΓÇö send OTP to email for password reset
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const normalised = email.toLowerCase().trim();
  const { data: user } = await supabase.from('users').select('id, email').eq('email', normalised).maybeSingle();

  // Always return success to prevent email enumeration
  if (user) {
    const otp = generateOtp();
    await storeOtp(normalised, otp, 'password_reset');
    await sendEmail(
      normalised,
      'Your Prince Math Academy Password Reset Code',
      otpEmailHtml(otp, 'password_reset')
    );
  }

  res.json({ success: true, message: 'If an account exists with that email, a reset code has been sent.' });
});

// POST /api/auth/verify-otp ΓÇö verify OTP code (for password reset)
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp, purpose = 'password_reset' } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required.' });

  const result = await verifyOtp(email.toLowerCase().trim(), otp, purpose);
  if (!result.valid) return res.status(400).json({ error: result.reason });

  res.json({ success: true });
});

// POST /api/auth/reset-password ΓÇö reset password using verified OTP
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, otp, new_password } = req.body;
  if (!email || !otp || !new_password) {
    return res.status(400).json({ error: 'Email, OTP and new_password are required.' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const normalised = email.toLowerCase().trim();

  // Verify OTP (this also marks it used)
  const result = await verifyOtp(normalised, otp, 'password_reset');
  if (!result.valid) return res.status(400).json({ error: result.reason });

  const hash = await bcrypt.hash(new_password, 10);
  const { error } = await supabase.from('users').update({ password_hash: hash }).eq('email', normalised);
  if (error) return res.status(500).json({ error: 'Failed to update password.' });

  res.json({ success: true, message: 'Password reset successfully.' });
});

// POST /api/auth/request-password-change ΓÇö authenticated user requests OTP to change password
app.post('/api/auth/request-password-change', requireAuth, async (req, res) => {
  const email = req.user.email;
  const otp = generateOtp();
  await storeOtp(email, otp, 'password_change');
  await sendEmail(
    email,
    'Your Prince Math Academy Password Change Code',
    otpEmailHtml(otp, 'password_change')
  );
  res.json({ success: true, message: 'A verification code has been sent to your email.' });
});

// POST /api/auth/change-password ΓÇö authenticated user changes password with OTP
app.post('/api/auth/change-password', requireAuth, async (req, res) => {
  const { otp, new_password, current_password } = req.body;
  if (!new_password) return res.status(400).json({ error: 'new_password is required.' });
  if (new_password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  // Verify current password if provided
  if (current_password) {
    const valid = await bcrypt.compare(current_password, req.user.password_hash || '');
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  // If OTP provided, verify it
  if (otp) {
    const result = await verifyOtp(req.user.email, otp, 'password_change');
    if (!result.valid) return res.status(400).json({ error: result.reason });
  }

  const hash = await bcrypt.hash(new_password, 10);
  const { error } = await supabase.from('users').update({ password_hash: hash }).eq('id', req.user.id);
  if (error) return res.status(500).json({ error: 'Failed to update password.' });

  res.json({ success: true, message: 'Password changed successfully.' });
});

// POST /api/auth/send-otp ΓÇö send OTP for email verification after registration
app.post('/api/auth/send-otp', requireAuth, async (req, res) => {
  const email = req.user.email;
  const otp = generateOtp();
  await storeOtp(email, otp, 'email_verify');
  await sendEmail(
    email,
    'Verify your Prince Math Academy email',
    otpEmailHtml(otp, 'email_verify')
  );
  res.json({ success: true, message: 'Verification code sent.' });
});

// POST /api/auth/verify-email ΓÇö verify email OTP after registration
app.post('/api/auth/verify-email', requireAuth, async (req, res) => {
  const { otp } = req.body;
  if (!otp) return res.status(400).json({ error: 'OTP is required.' });

  const result = await verifyOtp(req.user.email, otp, 'email_verify');
  if (!result.valid) return res.status(400).json({ error: result.reason });

  res.json({ success: true, message: 'Email verified.' });
});

// ΓöÇΓöÇΓöÇ Entity CRUD ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const ALLOWED_ENTITIES = ['Video', 'Favorite', 'Comment', 'XPEvent', 'Notification', 'Message', 'User', 'Announcement'];
const TABLE = (name) => name.toLowerCase() + 's'; // Video ΓåÆ videos

// GET /api/entities/:entity
app.get('/api/entities/:entity', async (req, res) => {
  const { entity } = req.params;
  if (!ALLOWED_ENTITIES.includes(entity)) return res.status(404).json({ error: 'Unknown entity' });

  let query = supabase.from(TABLE(entity)).select('*');

  // Filters
  const filtersRaw = req.query.filters;
  if (filtersRaw) {
    try {
      const filters = JSON.parse(filtersRaw);
      for (const [key, value] of Object.entries(filters)) {
        if (key === '$or') continue; // handled separately if needed
        query = query.eq(key, value);
      }
    } catch { /* ignore bad filter */ }
  }

  // Sort
  const sort = req.query.sort;
  if (sort) {
    const desc = sort.startsWith('-');
    const col = desc ? sort.slice(1) : sort;
    query = query.order(col, { ascending: !desc });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  // Limit
  const limit = parseInt(req.query.limit);
  if (limit > 0) query = query.limit(limit);

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });

  // Normalise: expose created_at as created_date for frontend compatibility
  const rows = (data || []).map(normalise);
  res.json(rows);
});

// GET /api/entities/:entity/:id
app.get('/api/entities/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;
  if (!ALLOWED_ENTITIES.includes(entity)) return res.status(404).json({ error: 'Unknown entity' });
  const { data, error } = await supabase.from(TABLE(entity)).select('*').eq('id', id).maybeSingle();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(normalise(data));
});

// POST /api/entities/:entity
app.post('/api/entities/:entity', requireAuth, async (req, res) => {
  const { entity } = req.params;
  if (!ALLOWED_ENTITIES.includes(entity)) return res.status(404).json({ error: 'Unknown entity' });
  const payload = { ...req.body, id: uuidv4() };
  const { data, error } = await supabase.from(TABLE(entity)).insert(payload).select().maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(normalise(data));
});

// PATCH /api/entities/:entity/:id ΓÇö users can only edit their own records
app.patch('/api/entities/:entity/:id', requireAuth, async (req, res) => {
  const { entity, id } = req.params;
  if (!ALLOWED_ENTITIES.includes(entity)) return res.status(404).json({ error: 'Unknown entity' });

  // Data protection: non-admins can only edit records they own
  if (req.user.role !== 'admin' && req.user.email !== ADMIN_EMAIL) {
    const { data: existing } = await supabase.from(TABLE(entity)).select('*').eq('id', id).maybeSingle();
    if (existing) {
      const ownerField = existing.user_email || existing.author_email || existing.sender_email;
      if (ownerField && ownerField !== req.user.email) {
        return res.status(403).json({ error: 'You can only edit your own records' });
      }
    }
  }

  const { data, error } = await supabase.from(TABLE(entity)).update(req.body).eq('id', id).select().maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  res.json(normalise(data));
});

// DELETE /api/entities/:entity/:id ΓÇö users can only delete their own records
app.delete('/api/entities/:entity/:id', requireAuth, async (req, res) => {
  const { entity, id } = req.params;
  if (!ALLOWED_ENTITIES.includes(entity)) return res.status(404).json({ error: 'Unknown entity' });

  // Data protection: non-admins can only delete records they own
  if (req.user.role !== 'admin' && req.user.email !== ADMIN_EMAIL) {
    const { data: existing } = await supabase.from(TABLE(entity)).select('*').eq('id', id).maybeSingle();
    if (existing) {
      const ownerField = existing.user_email || existing.author_email || existing.sender_email;
      if (ownerField && ownerField !== req.user.email) {
        return res.status(403).json({ error: 'You can only delete your own records' });
      }
    }
  }

  const { error } = await supabase.from(TABLE(entity)).delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).end();
});

// ΓöÇΓöÇΓöÇ Functions ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

// POST /api/functions/createPayFastPayment
app.post('/api/functions/createPayFastPayment', requireAuth, async (req, res) => {
  const { grade, tier, amount } = req.body;
  if (!grade || !tier || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passphrase = process.env.PAYFAST_PASSPHRASE || '';
  const isSandbox = process.env.PAYFAST_SANDBOX === 'true';
  const paymentUrl = isSandbox
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';
  const appOrigin = process.env.APP_ORIGIN || '';

  const user = req.user;
  const nameParts = (user.full_name || 'Student User').trim().split(' ');
  const nameFirst = nameParts[0] || 'Student';
  const nameLast = nameParts.slice(1).join(' ') || 'User';

  const amountNum = parseFloat(String(amount).replace(/[^0-9.]/g, ''));
  if (isNaN(amountNum) || amountNum <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const paymentData = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${appOrigin}/PaymentSuccess`,
    cancel_url: `${appOrigin}/Pricing`,
    notify_url: `${appOrigin}/.netlify/functions/api/api/payfast-webhook`,
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
    cycles: '3',
  };

  const signature = generatePayfastSignature(paymentData, passphrase);
  res.json({ paymentUrl, paymentData: { ...paymentData, signature } });
});

// POST /api/functions/trackVideoView
app.post('/api/functions/trackVideoView', requireAuth, async (req, res) => {
  const { video_id } = req.body;
  if (!video_id) return res.status(400).json({ error: 'video_id is required' });

  const { data: video, error } = await supabase.from('videos').select('*').eq('id', video_id).maybeSingle();
  if (error || !video) return res.status(404).json({ error: 'Video not found' });

  const newViews = (video.views || 0) + 1;
  await supabase.from('videos').update({ views: newViews }).eq('id', video_id);
  res.json({ success: true, views: newViews });
});

// POST /api/functions/getAdminStats
app.post('/api/functions/getAdminStats', requireAdmin, async (req, res) => {
  const [{ data: videos }, { data: users }] = await Promise.all([
    supabase.from('videos').select('*'),
    supabase.from('users').select('*'),
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
      message: `≡ƒôÜ New ${grade} lesson: "${video_title}"`,
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

// POST /api/functions/getApkDownload
app.post('/api/functions/getApkDownload', (req, res) => {
  const apkUrl = process.env.APK_DOWNLOAD_URL || '';
  res.json({
    success: true,
    appInfo: {
      appName: 'Prince Math Academy ΓÇö Grade 10-12 Mathematics',
      version: '1.0.0',
      downloadUrl: apkUrl,
      available: true,
      features: ['Video Lessons for Grade 10-12', 'Interactive Q&A', 'Save Favourites', 'Track Progress', '3-Day Free Trial'],
      size: '25 MB',
      minAndroidVersion: '5.0',
    },
  });
});

// ΓöÇΓöÇΓöÇ PayFast Webhook ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const PAYFAST_VALID_IPS = [
  '41.74.179.194', '41.74.179.195', '41.74.179.196', '41.74.179.197',
  '41.74.179.198', '41.74.179.199', '41.74.179.200', '41.74.179.201',
  '41.74.179.202', '41.74.179.203', '127.0.0.1',
];

app.post('/api/payfast-webhook', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const isSandbox = process.env.PAYFAST_SANDBOX === 'true';
    if (!isSandbox) {
      const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
        req.headers['cf-connecting-ip'] || req.socket.remoteAddress || '0.0.0.0';
      if (!PAYFAST_VALID_IPS.includes(clientIp)) {
        console.warn(`Rejected ITN from invalid IP: ${clientIp}`);
        return res.status(403).send('Forbidden');
      }
    }

    const raw = req.body;
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';
    const receivedSignature = raw['signature'] || '';

    // Build signature string
    const sigParams = new URLSearchParams();
    for (const key of Object.keys(raw).filter(k => k !== 'signature').sort()) {
      sigParams.append(key, String(raw[key]).trim());
    }
    if (passphrase) sigParams.append('passphrase', passphrase.trim());
    const expectedSignature = crypto.createHash('md5').update(sigParams.toString()).digest('hex');

    if (receivedSignature !== expectedSignature) {
      console.error('PayFast ITN: Invalid signature');
      return res.status(400).send('Invalid signature');
    }

    if (raw['payment_status'] === 'COMPLETE') {
      const userId = raw['custom_str1'];
      const grade = raw['custom_str2'];
      const tier = raw['custom_str3'];
      const userEmail = raw['email_address'] || '';

      if (!userId) return res.send('OK');

      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

      await supabase.from('users').update({
        subscription_tier: tier,
        grade,
        subscription_end_date: subscriptionEndDate.toISOString(),
        subscription_active: true,
      }).eq('id', userId);

      await supabase.from('notifications').insert({
        id: uuidv4(),
        user_email: userEmail,
        message: `Your ${grade} ${tier} subscription is now active!`,
        is_read: false,
      });

      console.log(`Subscription activated for user ${userId}: ${grade} ${tier}`);
    }

    res.send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ΓöÇΓöÇΓöÇ File Upload ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });

app.post('/api/upload', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  const ext = req.file.originalname.split('.').pop();
  const fileName = `uploads/${uuidv4()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('prince-math')
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });

  if (error) return res.status(500).json({ error: error.message });

  const { data: { publicUrl } } = supabase.storage.from('prince-math').getPublicUrl(fileName);
  res.json({ file_url: publicUrl });
});

// ΓöÇΓöÇΓöÇ Helpers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
    .map(key => `${key}=${encodeURIComponent(String(filtered[key]).trim()).replace(/%20/g, '+')}`)
    .join('&');
  const finalString = passphrase
    ? `${queryString}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`
    : queryString;
  return crypto.createHash('md5').update(finalString).digest('hex');
}

// ΓöÇΓöÇΓöÇ Export ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export const handler = serverless(app);

