/**
 * Local development server for Prince Math Academy.
 * Runs the same Express app used in the Netlify function on port 3001.
 * Start with: node server/index.js
 */

import 'dotenv/config';
import { setDefaultResultOrder } from 'dns';
setDefaultResultOrder('ipv4first');
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const PORT = process.env.PORT || 3001;

// ─── Validate env ─────────────────────────────────────────────────────────────
if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('your-project')) {
  console.error('\n❌  SUPABASE_URL is not set in .env — please add your real Supabase URL.\n');
  process.exit(1);
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY === 'your-service-role-key') {
  console.error('\n❌  SUPABASE_SERVICE_ROLE_KEY is not set in .env — please add your real key.\n');
  process.exit(1);
}

// ─── Supabase ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@princemath.co.za';

// ─── Express ──────────────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
      .from('users').select('*').eq('id', payload.sub).single();
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

function normalise(row) {
  if (!row) return row;
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

// ─── Auth routes ──────────────────────────────────────────────────────────────
app.get('/api/auth/me', requireAuth, (req, res) => res.json(req.user));

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
    .from('users').update(updates).eq('id', req.user.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, full_name } = req.body;
  if (!password || !full_name)
    return res.status(400).json({ error: 'password and full_name are required' });

  // Email is optional - if provided, check if it exists
  if (email) {
    const { data: existing } = await supabase
      .from('users').select('id').eq('email', email).single();
    if (existing) return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const hash = await bcrypt.hash(password, 10);
  const id = uuidv4();
  const role = email === ADMIN_EMAIL ? 'admin' : 'student';
  const { data, error } = await supabase
    .from('users').insert({ id, email: email || null, password_hash: hash, full_name, role }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  const token = signToken(data.id);
  res.json({ token, user: data });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, username } = req.body;
  if (!password)
    return res.status(400).json({ error: 'password required' });
  if (!email && !username)
    return res.status(400).json({ error: 'email or username required' });

  // Try email first, then username
  let user, error;
  if (email) {
    const result = await supabase.from('users').select('*').eq('email', email).single();
    user = result.data;
    error = result.error;
  } else {
    const result = await supabase.from('users').select('*').eq('full_name', username).single();
    user = result.data;
    error = result.error;
  }

  if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password_hash || '');
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken(user.id);
  res.json({ token, user });
});

// ─── Entity CRUD ──────────────────────────────────────────────────────────────
const ALLOWED_ENTITIES = ['Video', 'Favorite', 'Comment', 'XPEvent', 'Notification', 'Message', 'User'];
const TABLE = (name) => name.toLowerCase() + 's';

app.get('/api/entities/:entity', async (req, res) => {
  const { entity } = req.params;
  if (!ALLOWED_ENTITIES.includes(entity)) return res.status(404).json({ error: 'Unknown entity' });
  let query = supabase.from(TABLE(entity)).select('*');
  const filtersRaw = req.query.filters;
  if (filtersRaw) {
    try {
      const filters = JSON.parse(filtersRaw);
      for (const [key, value] of Object.entries(filters)) {
        if (key === '$or') continue;
        query = query.eq(key, value);
      }
    } catch { /* ignore */ }
  }
  const sort = req.query.sort;
  if (sort) {
    const desc = sort.startsWith('-');
    query = query.order(desc ? sort.slice(1) : sort, { ascending: !desc });
  } else {
    query = query.order('created_at', { ascending: false });
  }
  const limit = parseInt(req.query.limit);
  if (limit > 0) query = query.limit(limit);
  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json((data || []).map(normalise));
});

app.get('/api/entities/:entity/:id', async (req, res) => {
  const { entity, id } = req.params;
  if (!ALLOWED_ENTITIES.includes(entity)) return res.status(404).json({ error: 'Unknown entity' });
  const { data, error } = await supabase.from(TABLE(entity)).select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(normalise(data));
});

app.post('/api/entities/:entity', requireAuth, async (req, res) => {
  const { entity } = req.params;
  if (!ALLOWED_ENTITIES.includes(entity)) return res.status(404).json({ error: 'Unknown entity' });
  const { data, error } = await supabase
    .from(TABLE(entity)).insert({ ...req.body, id: uuidv4() }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(normalise(data));
});

app.patch('/api/entities/:entity/:id', requireAuth, async (req, res) => {
  const { entity, id } = req.params;
  if (!ALLOWED_ENTITIES.includes(entity)) return res.status(404).json({ error: 'Unknown entity' });

  // Data protection: non-admins can only edit their own records
  if (req.user.role !== 'admin' && req.user.email !== ADMIN_EMAIL) {
    const { data: existing } = await supabase.from(TABLE(entity)).select('*').eq('id', id).single();
    if (existing) {
      const ownerField = existing.user_email || existing.author_email || existing.sender_email;
      if (ownerField && ownerField !== req.user.email) {
        return res.status(403).json({ error: 'You can only edit your own records' });
      }
    }
  }

  const { data, error } = await supabase.from(TABLE(entity)).update(req.body).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(normalise(data));
});

app.delete('/api/entities/:entity/:id', requireAuth, async (req, res) => {
  const { entity, id } = req.params;
  if (!ALLOWED_ENTITIES.includes(entity)) return res.status(404).json({ error: 'Unknown entity' });

  // Data protection: non-admins can only delete their own records
  if (req.user.role !== 'admin' && req.user.email !== ADMIN_EMAIL) {
    const { data: existing } = await supabase.from(TABLE(entity)).select('*').eq('id', id).single();
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

// ─── Functions ────────────────────────────────────────────────────────────────
app.post('/api/functions/createPayFastPayment', requireAuth, async (req, res) => {
  const { grade, tier, amount } = req.body;
  if (!grade || !tier || !amount)
    return res.status(400).json({ error: 'Missing required fields' });
  const merchantId = process.env.PAYFAST_MERCHANT_ID || '33954157';
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY || 'f5dfdtf71uqh2';
  const passphrase = process.env.PAYFAST_PASSPHRASE || 'Lusindiso.1974';
  const isSandbox = process.env.PAYFAST_SANDBOX === 'true';
  const paymentUrl = isSandbox
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';
  const appOrigin = process.env.APP_ORIGIN || 'http://localhost:5173';
  const user = req.user;
  const nameParts = (user.full_name || 'Student User').trim().split(' ');
  const amountNum = parseFloat(String(amount).replace(/[^0-9.]/g, ''));
  if (isNaN(amountNum) || amountNum <= 0)
    return res.status(400).json({ error: 'Invalid amount' });
  const paymentData = {
    merchant_id: merchantId, merchant_key: merchantKey,
    return_url: `${appOrigin}/PaymentSuccess`,
    cancel_url: `${appOrigin}/Pricing`,
    notify_url: `${appOrigin}/.netlify/functions/api/api/payfast-webhook`,
    name_first: nameParts[0] || 'Student',
    name_last: nameParts.slice(1).join(' ') || 'User',
    email_address: user.email,
    m_payment_id: `${user.id}_${Date.now()}`,
    amount: amountNum.toFixed(2),
    item_name: `${grade} ${tier} Subscription`,
    custom_str1: String(user.id), custom_str2: grade, custom_str3: tier,
    subscription_type: '1', frequency: '3', cycles: '3',
  };
  res.json({ paymentUrl, paymentData: { ...paymentData, signature: generatePayfastSignature(paymentData, passphrase) } });
});

app.post('/api/functions/trackVideoView', requireAuth, async (req, res) => {
  const { video_id } = req.body;
  if (!video_id) return res.status(400).json({ error: 'video_id is required' });
  const { data: video } = await supabase.from('videos').select('views').eq('id', video_id).single();
  if (!video) return res.status(404).json({ error: 'Video not found' });
  const newViews = (video.views || 0) + 1;
  await supabase.from('videos').update({ views: newViews }).eq('id', video_id);
  res.json({ success: true, views: newViews });
});

app.post('/api/functions/getAdminStats', requireAdmin, async (req, res) => {
  const [{ data: videos }, { data: users }] = await Promise.all([
    supabase.from('videos').select('*'),
    supabase.from('users').select('*'),
  ]);
  const now = new Date();
  const totalVideos = videos?.length || 0;
  const totalStudents = (users || []).filter(u => u.role !== 'admin').length;
  const totalViews = (videos || []).reduce((s, v) => s + (v.views || 0), 0);
  const activeSubscriptions = (users || []).filter(u => {
    if (u.role === 'admin') return false;
    return (u.trial_end_date && new Date(u.trial_end_date) > now) ||
      (u.subscription_active && u.subscription_end_date && new Date(u.subscription_end_date) > now);
  }).length;
  const topVideos = [...(videos || [])].sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5).map(v => ({ id: v.id, title: v.title, views: v.views || 0, grade: v.grade }));
  res.json({ success: true, stats: { totalVideos, totalStudents, totalViews, activeSubscriptions, topVideos } });
});

app.post('/api/functions/sendNewVideoNotifications', requireAdmin, async (req, res) => {
  const { video_id, video_title, grade } = req.body;
  if (!video_id || !video_title || !grade)
    return res.status(400).json({ error: 'video_id, video_title and grade are required' });
  const { data: allUsers } = await supabase.from('users').select('id, email');
  let count = 0;
  for (const u of (allUsers || []).filter(u => u.email && u.email !== req.user.email)) {
    const { error } = await supabase.from('notifications').insert({
      id: uuidv4(), user_email: u.email, video_id,
      message: `📚 New ${grade} lesson: "${video_title}"`, is_read: false,
    });
    if (!error) count++;
  }
  res.json({ success: true, notifications_sent: count });
});

app.post('/api/functions/validateVideoUpload', requireAdmin, (req, res) => {
  const { title, grade, tier } = req.body;
  if (!title || !grade || !tier)
    return res.status(400).json({ error: 'title, grade and tier are required' });
  if (!['Grade 10', 'Grade 11', 'Grade 12'].includes(grade))
    return res.status(400).json({ error: 'Invalid grade' });
  if (!['Standard', 'Premium'].includes(tier))
    return res.status(400).json({ error: 'Invalid tier' });
  res.json({ success: true, message: 'Validation passed' });
});

app.post('/api/functions/getApkDownload', (req, res) => {
  res.json({
    success: true,
    appInfo: {
      appName: 'Prince Math Academy',
      version: '1.0.0',
      downloadUrl: process.env.APK_DOWNLOAD_URL || 'https://github.com/Sphile2012/math-mastery-hub-copy/releases/latest/download/MathTutor.apk',
      available: true,
      size: '25 MB',
      minAndroidVersion: '5.0',
    },
  });
});

// ─── PayFast Webhook ──────────────────────────────────────────────────────────
app.post('/api/payfast-webhook', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const raw = req.body;
    const passphrase = process.env.PAYFAST_PASSPHRASE || 'Lusindiso.1974';
    const sigParams = new URLSearchParams();
    for (const key of Object.keys(raw).filter(k => k !== 'signature').sort()) {
      sigParams.append(key, String(raw[key]).trim());
    }
    if (passphrase) sigParams.append('passphrase', passphrase.trim());
    const expected = crypto.createHash('md5').update(sigParams.toString()).digest('hex');
    if (raw['signature'] !== expected) return res.status(400).send('Invalid signature');
    if (raw['payment_status'] === 'COMPLETE') {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      await supabase.from('users').update({
        subscription_tier: raw['custom_str3'],
        grade: raw['custom_str2'],
        subscription_end_date: endDate.toISOString(),
        subscription_active: true,
      }).eq('id', raw['custom_str1']);
      await supabase.from('notifications').insert({
        id: uuidv4(), user_email: raw['email_address'] || '',
        message: `Your ${raw['custom_str2']} ${raw['custom_str3']} subscription is now active!`,
        is_read: false,
      });
    }
    res.send('OK');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── File Upload ──────────────────────────────────────────────────────────────
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });

app.post('/api/upload', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  const ext = req.file.originalname.split('.').pop();
  const fileName = `uploads/${uuidv4()}.${ext}`;
  const { error } = await supabase.storage
    .from('prince-math').upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
  if (error) return res.status(500).json({ error: error.message });
  const { data: { publicUrl } } = supabase.storage.from('prince-math').getPublicUrl(fileName);
  res.json({ file_url: publicUrl });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  Prince Math Academy API running at http://localhost:${PORT}`);
  console.log(`   Supabase: ${process.env.SUPABASE_URL}`);
  console.log(`   Environment: development\n`);
});
