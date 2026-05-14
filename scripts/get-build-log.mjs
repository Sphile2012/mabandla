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

// Get latest deploy
const deploys = await get(`/api/v1/sites/${SITE_ID}/deploys?per_page=1`);
if (!Array.isArray(deploys) || !deploys[0]) { console.log('No deploys found'); process.exit(1); }

const deploy = deploys[0];
console.log('Deploy:', deploy.id, '| State:', deploy.state);
console.log('Error:', deploy.error_message || 'none');

// Get build log
if (deploy.build_id) {
  const log = await get(`/api/v1/builds/${deploy.build_id}/log`);
  if (typeof log === 'string') {
    // Find the relevant error lines
    const lines = log.split('\n');
    const errorLines = lines.filter(l => l.includes('secret') || l.includes('Secret') || l.includes('error') || l.includes('Error') || l.includes('FAIL') || l.includes('scan'));
    console.log('\nRelevant log lines:');
    errorLines.slice(0, 20).forEach(l => console.log(' ', l));
  } else {
    console.log('Log:', JSON.stringify(log).substring(0, 500));
  }
}
