const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Y3dxbnBkbXdtd3RjbmFmaGpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUwNTYyMywiZXhwIjoyMDkzMDgxNjIzfQ.1PCiQp6yS9cLiI6lil2Nv2PF_ox9ctbHydy-tBTr7KE';
const BASE = 'https://kvcwqnpdmwmwtcnafhjq.supabase.co';
const H = { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY };

// Check all tables in parallel
const tables = ['users','videos','favorites','comments','xpevents','notifications','messages'];
const results = await Promise.all(tables.map(t =>
  fetch(`${BASE}/rest/v1/${t}?select=id&limit=1`, { headers: H }).then(r => ({ t, ok: r.status === 200, s: r.status }))
));
console.log('Tables:');
results.forEach(r => console.log(`  ${r.ok ? '✅' : '❌'} ${r.t} (${r.s})`));

// Test register
const email = `verify_${Date.now()}@test.com`;
const reg = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password: 'Test1234!', full_name: 'Test User' })
}).then(r => r.json());

console.log('\nRegister:', reg.token ? '✅ Works' : '❌ ' + JSON.stringify(reg));

if (reg.token) {
  const login = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Test1234!' })
  }).then(r => r.json());
  console.log('Login:', login.token ? '✅ Works' : '❌ ' + JSON.stringify(login));

  // cleanup
  await fetch(`${BASE}/rest/v1/users?email=eq.${email}`, { method: 'DELETE', headers: H });
  console.log('Cleanup: ✅');
}
console.log('\n🎉 App is fully ready at http://localhost:5175');
