/**
 * Full end-to-end backend test for Prince Math Academy
 */
const BASE = 'http://localhost:3001/api';
const email = `test_${Date.now()}@prince.test`;
const password = 'Test1234!';
let token = '';
let userId = '';
let videoId = '';

async function req(method, path, body, auth) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers['Authorization'] = `Bearer ${auth}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function pass(label) { console.log(`  ✅ ${label}`); }
function fail(label, detail) { console.log(`  ❌ ${label}: ${detail}`); process.exitCode = 1; }
function section(title) { console.log(`\n── ${title} ──`); }

section('AUTH');

// Register
let r = await req('POST', '/auth/register', { email, password, full_name: 'Test User' });
if (r.status === 200 && r.data.token) {
  token = r.data.token;
  userId = r.data.user.id;
  pass(`Register (${email})`);
} else {
  fail('Register', JSON.stringify(r.data));
}

// Duplicate register
r = await req('POST', '/auth/register', { email, password, full_name: 'Test User' });
if (r.status === 400) pass('Duplicate register blocked');
else fail('Duplicate register', `Expected 400, got ${r.status}`);

// Login
r = await req('POST', '/auth/login', { email, password });
if (r.status === 200 && r.data.token) pass('Login');
else fail('Login', JSON.stringify(r.data));

// Wrong password
r = await req('POST', '/auth/login', { email, password: 'wrongpass' });
if (r.status === 401) pass('Wrong password blocked');
else fail('Wrong password', `Expected 401, got ${r.status}`);

// Get me
r = await req('GET', '/auth/me', null, token);
if (r.status === 200 && r.data.email === email) pass('GET /auth/me');
else fail('GET /auth/me', JSON.stringify(r.data));

// Unauthenticated me
r = await req('GET', '/auth/me');
if (r.status === 401) pass('Unauthenticated blocked');
else fail('Unauthenticated', `Expected 401, got ${r.status}`);

section('ENTITIES');

// List videos (public)
r = await req('GET', '/entities/Video');
if (r.status === 200 && Array.isArray(r.data)) pass(`List videos (${r.data.length} found)`);
else fail('List videos', JSON.stringify(r.data));

// Create favorite
r = await req('POST', '/entities/Favorite', { user_email: email, video_id: 'test-video-id' }, token);
const favId = r.data.id;
if (r.status === 201 && favId) pass('Create favorite');
else fail('Create favorite', JSON.stringify(r.data));

// Filter favorites
r = await req('GET', `/entities/Favorite?filters=${encodeURIComponent(JSON.stringify({ user_email: email }))}`);
if (r.status === 200 && Array.isArray(r.data)) pass(`Filter favorites (${r.data.length} found)`);
else fail('Filter favorites', JSON.stringify(r.data));

// Data protection — try to delete another user's record
// First create a second user
const email2 = `test2_${Date.now()}@prince.test`;
r = await req('POST', '/auth/register', { email: email2, password, full_name: 'Test User 2' });
const token2 = r.data.token;

// User2 tries to delete user1's favorite
if (favId && token2) {
  r = await req('DELETE', `/entities/Favorite/${favId}`, null, token2);
  if (r.status === 403) pass('Data protection: cannot delete others records');
  else fail('Data protection', `Expected 403, got ${r.status}: ${JSON.stringify(r.data)}`);
}

// Delete own favorite
r = await req('DELETE', `/entities/Favorite/${favId}`, null, token);
if (r.status === 204) pass('Delete own favorite');
else fail('Delete own favorite', `Status ${r.status}: ${JSON.stringify(r.data)}`);

section('FUNCTIONS');

// getApkDownload (public)
r = await req('POST', '/functions/getApkDownload', {});
if (r.status === 200 && r.data.appInfo) pass('getApkDownload');
else fail('getApkDownload', JSON.stringify(r.data));

// trackVideoView (requires auth)
r = await req('POST', '/functions/trackVideoView', { video_id: 'nonexistent' }, token);
if (r.status === 404) pass('trackVideoView: nonexistent video returns 404');
else fail('trackVideoView', `Expected 404, got ${r.status}`);

// Admin-only endpoint blocked for regular user
r = await req('POST', '/functions/getAdminStats', {}, token);
if (r.status === 403) pass('Admin endpoint blocked for regular user');
else fail('Admin endpoint', `Expected 403, got ${r.status}`);

section('CLEANUP');

// Delete test users from Supabase
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Y3dxbnBkbXdtd3RjbmFmaGpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUwNTYyMywiZXhwIjoyMDkzMDgxNjIzfQ.1PCiQp6yS9cLiI6lil2Nv2PF_ox9ctbHydy-tBTr7KE';
for (const e of [email, email2]) {
  await fetch(`https://kvcwqnpdmwmwtcnafhjq.supabase.co/rest/v1/users?email=eq.${encodeURIComponent(e)}`, {
    method: 'DELETE',
    headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` },
  });
}
pass('Test users cleaned up');

console.log('\n' + (process.exitCode ? '❌ Some tests failed' : '✅ All tests passed!'));
