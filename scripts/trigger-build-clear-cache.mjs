import https from 'https';
import { readdirSync, readFileSync } from 'fs';

const configDir = 'C:/Users/Phumeh/AppData/Roaming/netlify/Config';
let token = null;
for (const f of readdirSync(configDir)) {
  try {
    const cfg = JSON.parse(readFileSync(`${configDir}/${f}`, 'utf8'));
    if (cfg.userId && cfg.users) { token = cfg.users[cfg.userId]?.auth?.token; if (token) break; }
  } catch {}
}

const SITE_ID = '4865c8a1-71e8-4810-966a-45c6e9087905';

// Trigger build with clear_cache=true
const data = JSON.stringify({ clear_cache: true });
const req = https.request({
  hostname: 'api.netlify.com',
  path: `/api/v1/sites/${SITE_ID}/builds`,
  method: 'POST',
  headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
}, (res) => {
  let d = ''; res.on('data', c => d += c);
  res.on('end', () => {
    const b = JSON.parse(d);
    if (res.statusCode === 201 || res.statusCode === 200) {
      console.log('✅ Build triggered with cache cleared! ID:', b.id);
    } else {
      console.log('❌ Failed:', res.statusCode, JSON.stringify(b).substring(0, 200));
    }
  });
});
req.on('error', e => console.log('Error:', e.message));
req.write(data);
req.end();
