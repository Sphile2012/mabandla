import 'dotenv/config';
import https from 'https';
import bcrypt from 'bcryptjs';

const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_HOST = process.env.SUPABASE_URL?.replace('https://', '');

// Reset poomeigh503 password to something known
const NEW_PASS = 'Phumeh2024';
const hash = await bcrypt.hash(NEW_PASS, 8);

function patch(path, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: SUPABASE_HOST, path, method: 'PATCH',
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), Prefer: 'return=minimal' }
    }, (res) => { resolve(res.statusCode); });
    req.on('error', e => resolve(0));
    req.write(data); req.end();
  });
}

const s1 = await patch('/rest/v1/users?email=eq.poomeigh503@gmail.com', { password_hash: hash });
console.log('poomeigh503 password reset:', s1 === 204 ? '✅' : '❌ ' + s1);
console.log('New password: ' + NEW_PASS);

const s2 = await patch('/rest/v1/users?email=eq.lusindisomabandla72@gmail.com', { password_hash: await bcrypt.hash('Prince2024', 8) });
console.log('Admin password reset:', s2 === 204 ? '✅' : '❌ ' + s2);
console.log('Admin new password: Prince2024');
