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
const req = https.request({
  hostname: 'api.netlify.com',
  path: `/api/v1/sites/${SITE_ID}/deploys?per_page=3`,
  headers: { Authorization: 'Bearer ' + token }
}, (res) => {
  let d = ''; res.on('data', c => d += c);
  res.on('end', () => {
    const deploys = JSON.parse(d);
    if (Array.isArray(deploys)) {
      console.log('Latest deploys:');
      deploys.forEach(dep => {
        const icon = dep.state === 'ready' ? '✅' : dep.state === 'error' ? '❌' : '⏳';
        console.log(`  ${icon} ${dep.state} | ${dep.title || dep.branch} | ${dep.created_at?.substring(0,19)}`);
        if (dep.error_message) console.log(`     Error: ${dep.error_message}`);
      });
    }
  });
});
req.on('error', e => console.log('Error:', e.message));
req.end();
