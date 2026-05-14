import https from 'https';
import bcrypt from 'bcryptjs';

const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Y3dxbnBkbXdtd3RjbmFmaGpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUwNTYyMywiZXhwIjoyMDkzMDgxNjIzfQ.1PCiQp6yS9cLiI6lil2Nv2PF_ox9ctbHydy-tBTr7KE';
const HOST = 'kvcwqnpdmwmwtcnafhjq.supabase.co';

function get(path) {
  return new Promise((res) => {
    const req = https.get({ hostname: HOST, path, headers: { apikey: KEY, Authorization: 'Bearer ' + KEY } }, (r) => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
    });
    req.on('error', e => res({ error: e.message }));
  });
}

function post(path, body) {
  return new Promise((res) => {
    const data = JSON.stringify(body);
    const req = https.request({ hostname: HOST, path, method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), Prefer: 'return=representation' } }, (r) => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res({ status: r.statusCode, body: JSON.parse(d) }));
    });
    req.on('error', e => res({ error: e.message }));
    req.write(data); req.end();
  });
}

function patch(path, body) {
  return new Promise((res) => {
    const data = JSON.stringify(body);
    const req = https.request({ hostname: HOST, path, method: 'PATCH', headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), Prefer: 'return=representation' } }, (r) => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res({ status: r.statusCode, body: d }));
    });
    req.on('error', e => res({ error: e.message }));
    req.write(data); req.end();
  });
}

// Check existing users
const users = await get('/rest/v1/users?select=id,email,role,full_name&limit=20');
console.log('\n📋 Users in DB:');
if (Array.isArray(users)) {
  users.forEach(u => console.log(`  ${u.email} | role: ${u.role} | name: ${u.full_name}`));
  console.log(`  Total: ${users.length}`);
} else {
  console.log('  Error:', users);
}

// Create/reset admin account
const ADMIN_EMAIL = 'lusindisomabandla72@gmail.com';
const ADMIN_PASS = 'Prince@2024!';
const hash = await bcrypt.hash(ADMIN_PASS, 10);

const existing = Array.isArray(users) ? users.find(u => u.email === ADMIN_EMAIL) : null;

if (existing) {
  console.log('\n🔄 Resetting admin password...');
  const r = await patch(`/rest/v1/users?email=eq.${ADMIN_EMAIL}`, { password_hash: hash, role: 'admin' });
  console.log('  Status:', r.status);
} else {
  console.log('\n➕ Creating admin account...');
  const { v4: uuidv4 } = await import('uuid');
  const r = await post('/rest/v1/users', { id: uuidv4(), email: ADMIN_EMAIL, password_hash: hash, full_name: 'Prince Mabandla', role: 'admin' });
  console.log('  Status:', r.status);
}

console.log(`\n✅ Admin credentials:`);
console.log(`   Email:    ${ADMIN_EMAIL}`);
console.log(`   Password: ${ADMIN_PASS}`);
