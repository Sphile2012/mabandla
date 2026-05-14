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

function get(path) {
  return new Promise((resolve) => {
    const req = https.request({ hostname: 'api.netlify.com', path, headers: { Authorization: 'Bearer ' + token } }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(d); } });
    });
    req.on('error', e => resolve({ error: e.message }));
    req.end();
  });
}

const deploys = await get(`/api/v1/sites/${SITE_ID}/deploys?per_page=3`);
if (Array.isArray(deploys)) {
  console.log('Latest deploys:');
  deploys.forEach(d => {
    console.log(`  ${d.state} | ${d.title || 'no title'} | ${d.created_at?.substring(0,19)} | ${d.deploy_ssl_url || d.url || ''}`);
  });
} else {
  console.log('Response:', JSON.stringify(deploys).substring(0, 200));
}
