import https from 'https';
import bcrypt from 'bcryptjs';

const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Y3dxbnBkbXdtd3RjbmFmaGpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUwNTYyMywiZXhwIjoyMDkzMDgxNjIzfQ.1PCiQp6yS9cLiI6lil2Nv2PF_ox9ctbHydy-tBTr7KE';
const HOST = 'kvcwqnpdmwmwtcnafhjq.supabase.co';

function patch(path, body) {
  return new Promise((res) => {
    const data = JSON.stringify(body);
    const req = https.request({ hostname: HOST, path, method: 'PATCH', headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), Prefer: 'return=minimal' } }, (r) => {
      res(r.statusCode);
    });
    req.on('error', e => res(0));
    req.write(data); req.end();
  });
}

const hash = await bcrypt.hash('Phumeh@2024!', 10);
const status = await patch('/rest/v1/users?email=eq.poomeigh503@gmail.com', { password_hash: hash });
console.log('poomeigh503@gmail.com password reset status:', status);
console.log('Password set to: Phumeh@2024!');
