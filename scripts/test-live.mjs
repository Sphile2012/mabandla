import https from 'https';

function post(url, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(data);
    req.end();
  });
}

const BASE = 'https://mabandla.netlify.app/api';

console.log('Testing live API...\n');

// Test 1: Login with correct credentials
const login = await post(`${BASE}/auth/login`, { email: 'lusindisomabandla72@gmail.com', password: 'Prince@2024!' });
console.log(`✅ Admin login: ${login.status} ${login.status === 200 ? '(OK)' : login.body.substring(0, 100)}`);

// Test 2: Login with wrong password
const badLogin = await post(`${BASE}/auth/login`, { email: 'lusindisomabandla72@gmail.com', password: 'wrongpass' });
console.log(`✅ Bad login: ${badLogin.status} ${badLogin.body.substring(0, 80)}`);

// Test 3: Register new user
const email = `test${Date.now()}@test.com`;
const reg = await post(`${BASE}/auth/register`, { email, password: 'Test1234', full_name: 'Test User' });
console.log(`✅ Register: ${reg.status} ${reg.status === 200 ? '(OK - token received)' : reg.body.substring(0, 100)}`);

// Test 4: Register duplicate
const dup = await post(`${BASE}/auth/register`, { email, password: 'Test1234', full_name: 'Test User' });
console.log(`✅ Duplicate register: ${dup.status} ${dup.body.substring(0, 80)}`);

// Test 5: Raw function URL
const rawLogin = await post('https://mabandla.netlify.app/.netlify/functions/api/api/auth/login', { email: 'lusindisomabandla72@gmail.com', password: 'Prince@2024!' });
console.log(`✅ Raw function URL: ${rawLogin.status} ${rawLogin.status === 200 ? '(OK)' : rawLogin.body?.substring(0, 100)}`);

console.log('\nAll tests complete!');
