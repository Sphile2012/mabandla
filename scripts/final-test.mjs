import https from 'https';

function call(path, body, token) {
  return new Promise(r => {
    const d = JSON.stringify(body);
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(d) };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = https.request({ hostname: 'mabandla.netlify.app', path: '/api' + path, method: 'POST', headers }, (res) => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => r({ s: res.statusCode, b: b.substring(0, 200) }));
    });
    req.setTimeout(15000, () => { req.destroy(); r({ s: 0, b: 'TIMEOUT' }); });
    req.on('error', e => r({ s: 0, b: e.message }));
    req.write(d); req.end();
  });
}

console.log('🧪 Final live test...\n');

// 1. Login existing user
const login = await call('/auth/login', { email: 'poomeigh503@gmail.com', password: 'Phumeh@2024!' });
console.log(`${login.s === 200 ? '✅' : '❌'} Login: ${login.s} ${login.s !== 200 ? login.b : '(token received)'}`);

// 2. Login admin
const admin = await call('/auth/login', { email: 'lusindisomabandla72@gmail.com', password: 'Prince@2024!' });
console.log(`${admin.s === 200 ? '✅' : '❌'} Admin login: ${admin.s} ${admin.s !== 200 ? admin.b : '(token received)'}`);

// 3. Register new user
const email = 'finaltest' + Date.now() + '@test.com';
const reg = await call('/auth/register', { email, password: 'Test1234', full_name: 'Final Test' });
console.log(`${reg.s === 200 ? '✅' : '❌'} Register: ${reg.s} ${reg.s !== 200 ? reg.b : '(token received)'}`);

// 4. Duplicate email
const dup = await call('/auth/register', { email, password: 'Test1234', full_name: 'Dup' });
console.log(`${dup.s === 400 ? '✅' : '❌'} Duplicate blocked: ${dup.s} ${dup.b.substring(0, 60)}`);

// 5. Wrong password
const bad = await call('/auth/login', { email: 'poomeigh503@gmail.com', password: 'wrongpass' });
console.log(`${bad.s === 401 ? '✅' : '❌'} Wrong password: ${bad.s} ${bad.b.substring(0, 60)}`);

// 6. Unknown email
const nouser = await call('/auth/login', { email: 'nobody@nowhere.com', password: 'Test1234' });
console.log(`${nouser.s === 401 ? '✅' : '❌'} Unknown email: ${nouser.s} ${nouser.b.substring(0, 60)}`);

console.log('\n🚀 Live at: https://mabandla.netlify.app');
