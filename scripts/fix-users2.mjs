import https from 'https';

const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Y3dxbnBkbXdtd3RjbmFmaGpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUwNTYyMywiZXhwIjoyMDkzMDgxNjIzfQ.1PCiQp6yS9cLiI6lil2Nv2PF_ox9ctbHydy-tBTr7KE';
const HOST = 'kvcwqnpdmwmwtcnafhjq.supabase.co';

function call(method, path, body) {
  return new Promise((res, rej) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: HOST, path, method,
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' }
    };
    if (data) options.headers['Content-Length'] = Buffer.byteLength(data);
    const r = https.request(options, (resp) => {
      let d = ''; resp.on('data', c => d += c);
      resp.on('end', () => { try { res({ s: resp.statusCode, b: d ? JSON.parse(d) : null }); } catch { res({ s: resp.statusCode, b: d }); } });
    });
    r.on('error', rej);
    if (data) r.write(data);
    r.end();
  });
}

// Get all users
const { b: users } = await call('GET', '/rest/v1/users?select=id,email,role,full_name,password_hash&order=created_at.asc&limit=50');
console.log('Users found:', users?.length);
if (!Array.isArray(users)) { console.log('Error:', users); process.exit(1); }

users.forEach((u, i) => console.log(`${i+1}. [${u.role}] ${u.email} | pass:${u.password_hash ? 'YES' : 'NO'}`));

// Fix wrong admin
const wrongAdmin = users.find(u => u.email === 'phunyezwamjoli3@gmail.com' && u.role === 'admin');
if (wrongAdmin) {
  const r = await call('PATCH', `/rest/v1/users?id=eq.${wrongAdmin.id}`, { role: 'student' });
  console.log('\nFixed phunyezwamjoli3 role:', r.s);
}

// Delete test accounts
const junk = users.filter(u => u.email.endsWith('@prince.test') || u.email.endsWith('@test.com') || u.email === 'integrations@anything.com');
for (const u of junk) {
  const r = await call('DELETE', `/rest/v1/users?id=eq.${u.id}`);
  console.log('Deleted:', u.email, r.s);
}

console.log('\nDone!');
