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

// ─── Supabase client ──────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const ADMIN_EMAIL = 'lusindisomabandla72@gmail.com';

// ─── Express app ──────────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Auth helpers ─────────────────────────────────────────────────────────────
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
      .single();
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

// ─── Auth routes ──────────────────────────────────────────────────────────────

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
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// POST /api/auth/register  — email + password sign-up
app.post('/api/auth/register', async (req, res) => {
  const { email, password, full_name } = req.body;
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'email, password and full_name are required' });
  }
  const hash = await bcrypt.hash(password, 10);
  const id = uuidv4();
  const role = email === ADMIN_EMAIL ? 'admin' : 'student';
  const { data, error } = await supabase
    .from('users')
    .insert({ id, email, password_hash: hash, full_name, role })
    .select()
    .single();
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
    .eq('email', email)
    .single();
  if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password_hash || '');
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken(user.id);
  res.json({ token, user });
});

// ─── Entity CRUD ──────────────────────────────────────────────────────────────
const ALLOWED_ENTITIES = ['Video', 'Favorite', 'Comment', 'XPEvent', 'Notification', 'Message', 'User'];
const TABLE = (name) => name.toLowerCase() + 's'; // Video → videos

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
  const { data, error } = await supabase.from(TABLE(entity)).select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(normalise(data));
});

// POST /api/entities/:entity
app.post('/api/entities/:entity', requireAuth, async (req, res) => {
  const { entity } = req.params;
  if (!ALLOWED_ENTITIES.includes(entity)) return res.status(404).json({ error: 'Unknown entity' });
  const payload = { ...req.body, id: uuidv4() };
  const { data, error } = await supabase.from(TABLE(entity)).insert(payload).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(normalise(data));
});

// PATCH /api/entities/:entity/:id — users can only edit their own records
app.patch('/api/entities/:entity/:id', requireAuth, async (req, res) => {
  const { entity, id } = req.params;
  if (!ALLOWED_ENTITIES.includes(entity)) return res.status(404).json({ error: 'Unknown entity' });

  // Data protection: non-admins can only edit records they own
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

// DELETE /api/entities/:entity/:id — users can only delete their own records
app.delete('/api/entities/:entity/:id', requireAuth, async (req, res) => {
  const { entity, id } = req.params;
  if (!ALLOWED_ENTITIES.includes(entity)) return res.status(404).json({ error: 'Unknown entity' });

  // Data protection: non-admins can only delete records they own
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

// POST /api/functions/createPayFastPayment
app.post('/api/functions/createPayFastPayment', requireAuth, async (req, res) => {
  const { grade, tier, amount } = req.body;
  if (!grade || !tier || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const merchantId = process.env.PAYFAST_MERCHANT_ID || '33954157';
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY || 'f5dfdtf71uqh2';
  const passphrase = process.env.PAYFAST_PASSPHRASE || 'Lusindiso.1974';
  const isSandbox = process.env.PAYFAST_SANDBOX === 'true';
  const paymentUrl = isSandbox
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';
  const appOrigin = process.env.APP_ORIGIN || 'https://princemath.co.za';

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

  const { data: video, error } = await supabase.from('videos').select('*').eq('id', video_id).single();
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

// POST /api/functions/getApkDownload
app.post('/api/functions/getApkDownload', (req, res) => {
  const apkUrl = process.env.APK_DOWNLOAD_URL ||
    'https://github.com/Sphile2012/math-mastery-hub-copy/releases/latest/download/MathTutor.apk';
  res.json({
    success: true,
    appInfo: {
      appName: 'Prince Math Academy — Grade 10-12 Mathematics',
      version: '1.0.0',
      downloadUrl: apkUrl,
      available: true,
      features: ['Video Lessons for Grade 10-12', 'Interactive Q&A', 'Save Favourites', 'Track Progress', '3-Day Free Trial'],
      size: '25 MB',
      minAndroidVersion: '5.0',
    },
  });
});

// ─── PayFast Webhook ──────────────────────────────────────────────────────────
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
    const passphrase = process.env.PAYFAST_PASSPHRASE || 'Lusindiso.1974';
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

// ─── File Upload ──────────────────────────────────────────────────────────────
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
    .map(key => `${key}=${encodeURIComponent(String(filtered[key]).trim()).replace(/%20/g, '+')}`)
    .join('&');
  const finalString = passphrase
    ? `${queryString}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`
    : queryString;
  return crypto.createHash('md5').update(finalString).digest('hex');
}

// ─── Export ───────────────────────────────────────────────────────────────────
export const handler = serverless(app);
