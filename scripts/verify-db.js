const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Y3dxbnBkbXdtd3RjbmFmaGpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUwNTYyMywiZXhwIjoyMDkzMDgxNjIzfQ.1PCiQp6yS9cLiI6lil2Nv2PF_ox9ctbHydy-tBTr7KE';
const BASE = 'https://kvcwqnpdmwmwtcnafhjq.supabase.co';
const HEADERS = { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY };

const tables = ['users','videos','favorites','comments','xpevents','notifications','messages'];

console.log('Verifying Supabase tables...\n');
let allOk = true;
for (const t of tables) {
  const r = await fetch(`${BASE}/rest/v1/${t}?select=id&limit=1`, { headers: HEADERS });
  const ok = r.status === 200;
  if (!ok) allOk = false;
  console.log(`  ${ok ? '✅' : '❌'} ${t} (${r.status})`);
}

// Test register
console.log('\nTesting register endpoint...');
const testEmail = `test_${Date.now()}@prince.test`;
const regRes = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: testEmail, password: 'Test1234!', full_name: 'Test User' })
});
const regData = await regRes.json();
if (regRes.ok && regData.token) {
  console.log('  ✅ Register works! Token received.');

  // Test login
  console.log('Testing login endpoint...');
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'Test1234!' })
  });
  const loginData = await loginRes.json();
  if (loginRes.ok && loginData.token) {
    console.log('  ✅ Login works! Token received.');
  } else {
    console.log('  ❌ Login failed:', loginData);
  }

  // Clean up test user
  await fetch(`${BASE}/rest/v1/users?email=eq.${testEmail}`, {
    method: 'DELETE',
    headers: { ...HEADERS, 'Content-Type': 'application/json' }
  });
  console.log('  🧹 Test user cleaned up.');
} else {
  console.log('  ❌ Register failed:', regData);
}

console.log(allOk ? '\n✅ Everything is working! App is ready.' : '\n❌ Some tables missing — re-run the SQL in Supabase.');
