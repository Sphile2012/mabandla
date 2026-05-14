import https from 'https';
import { readdirSync, readFileSync } from 'fs';

// Read Netlify config
const configDir = 'C:/Users/Phumeh/AppData/Roaming/netlify/Config';
const files = readdirSync(configDir);
let token = null;

for (const f of files) {
  try {
    const content = readFileSync(`${configDir}/${f}`, 'utf8');
    const cfg = JSON.parse(content);
    if (cfg.userId && cfg.users) {
      token = cfg.users[cfg.userId]?.auth?.token;
      if (token) break;
    }
  } catch {}
}

if (!token) { console.error('No token found'); process.exit(1); }
console.log('Token found:', token.substring(0, 15) + '...');

const SITE_ID = '4865c8a1-71e8-4810-966a-45c6e9087905';

function apiCall(method, path, body) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.netlify.com',
      path,
      method,
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    if (data) req.write(data);
    req.end();
  });
}

// Trigger a new build
console.log('Triggering build...');
const build = await apiCall('POST', `/api/v1/sites/${SITE_ID}/builds`, {});
if (build.status === 201 || build.status === 200) {
  console.log('✅ Build triggered!');
  console.log('   Build ID:', build.body.id);
  console.log('   State:', build.body.state);
  console.log('   View at: https://app.netlify.com/projects/mabandla/deploys');
} else {
  console.log('❌ Build failed:', build.status, JSON.stringify(build.body).substring(0, 200));
}
