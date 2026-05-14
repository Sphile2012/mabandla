import https from 'https';

const BASE = 'mabandla.netlify.app';

function req(method, path, body, token) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const r = https.request({
      hostname: BASE, path: '/api' + path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ s: res.statusCode, b: JSON.parse(d) }); } catch { resolve({ s: res.statusCode, b: d }); } });
    });
    req.on('error', e => resolve({ s: 0, b: e.message }));
    if (data) r.write(data);
    r.end();
  });
}

// Fix: use r not req for error handler
function call(method, path, body, token) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: BASE, path: '/api' + path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const r = https.request(options, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ s: res.statusCode, b: JSON.parse(d) }); } catch { resolve({ s: res.statusCode, b: d }); } });
    });
    r.on('error', e => resolve({ s: 0, b: e.message }));
    if (data) r.write(data);
    r.end();
  });
}

console.log('Verifying live site...\n');

// 1. Admin login
const login = await call('POST', '/auth/login', { email: 'lusindisomabandla72@gmail.com', password: 'Prince@2024!' });
console.log(`${login.s === 200 ? '✅' : '❌'} Admin login: ${login.s} | role: ${login.b?.user?.role}`);
const token = login.b?.token;

// 2. Auth/me
const me = await call('GET', '/auth/me', null, token);
console.log(`${me.s === 200 ? '✅' : '❌'} Auth/me: ${me.s} | ${me.b?.email}`);

// 3. Users list
const users = await call('GET', '/entities/User?limit=20', null, token);
console.log(`${users.s === 200 ? '✅' : '❌'} Users: ${users.s} | count: ${Array.isArray(users.b) ? users.b.length : 'error'}`);
if (Array.isArray(users.b)) {
  users.b.forEach(u => console.log(`   ${u.role === 'admin' ? '👑' : '👤'} ${u.email} [${u.role}]`));
}

// 4. Videos
const vids = await call('GET', '/entities/Video?limit=5');
console.log(`${vids.s === 200 ? '✅' : '❌'} Videos: ${vids.s} | count: ${Array.isArray(vids.b) ? vids.b.length : 'error'}`);

// 5. Register test
const testEmail = `verify${Date.now()}@test.com`;
const reg = await call('POST', '/auth/register', { email: testEmail, password: 'Test1234', full_name: 'Verify Test' });
console.log(`${reg.s === 200 ? '✅' : '❌'} Register: ${reg.s}`);

// 6. Duplicate email
const dup = await call('POST', '/auth/register', { email: testEmail, password: 'Test1234', full_name: 'Verify Test' });
console.log(`${dup.s === 400 ? '✅' : '❌'} Duplicate email blocked: ${dup.s} | ${dup.b?.error?.substring(0, 50)}`);

// 7. Wrong password
const bad = await call('POST', '/auth/login', { email: 'lusindisomabandla72@gmail.com', password: 'wrongpass' });
console.log(`${bad.s === 401 ? '✅' : '❌'} Wrong password rejected: ${bad.s} | ${bad.b?.error?.substring(0, 50)}`);

console.log('\n🚀 Live at: https://mabandla.netlify.app');
