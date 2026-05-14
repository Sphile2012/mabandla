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
const DEPLOY_ID = '6a0138f8513ca06016f35a5d';

function get(path) {
  return new Promise((resolve) => {
    const req = https.request({ hostname: 'api.netlify.com', path, headers: { Authorization: 'Bearer ' + token } }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ error: e.message }));
    req.end();
  });
}

// Try different log endpoints
const r1 = await get(`/api/v1/deploys/${DEPLOY_ID}`);
const deploy = JSON.parse(r1.body);
console.log('Deploy state:', deploy.state);
console.log('Build ID:', deploy.build_id);
console.log('Log access URL:', deploy.log_access_attributes?.url || 'none');

if (deploy.build_id) {
  const r2 = await get(`/api/v1/builds/${deploy.build_id}`);
  const build = JSON.parse(r2.body);
  console.log('\nBuild state:', build.state);
  console.log('Build error:', build.error || 'none');
  
  // Get log lines
  const r3 = await get(`/api/v1/builds/${deploy.build_id}/log`);
  if (r3.body && r3.body.length > 10) {
    const lines = r3.body.split('\n');
    console.log(`\nTotal log lines: ${lines.length}`);
    // Show lines around the error
    const errIdx = lines.findIndex(l => l.toLowerCase().includes('secret') || l.toLowerCase().includes('scan') || l.includes('exit code'));
    if (errIdx >= 0) {
      console.log('\nContext around error:');
      lines.slice(Math.max(0, errIdx - 5), errIdx + 15).forEach(l => console.log(l));
    } else {
      console.log('\nLast 30 lines:');
      lines.slice(-30).forEach(l => console.log(l));
    }
  }
}
