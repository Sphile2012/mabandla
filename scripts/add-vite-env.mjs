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

function apiCall(method, path, body) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.netlify.com', path, method,
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) }
    }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ s: res.statusCode, b: JSON.parse(d) }); } catch { resolve({ s: res.statusCode, b: d }); } });
    });
    req.on('error', e => resolve({ error: e.message }));
    if (data) req.write(data);
    req.end();
  });
}

// Add VITE_API_BASE_URL env var
const r = await apiCall('POST', `/api/v1/accounts/zaio/env?site_id=${SITE_ID}`, [{
  key: 'VITE_API_BASE_URL',
  values: [{ value: '/api', context: 'all' }]
}]);
console.log('Set VITE_API_BASE_URL=/api:', r.s, JSON.stringify(r.b).substring(0, 100));
