import https from 'https';

const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Y3dxbnBkbXdtd3RjbmFmaGpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUwNTYyMywiZXhwIjoyMDkzMDgxNjIzfQ.1PCiQp6yS9cLiI6lil2Nv2PF_ox9ctbHydy-tBTr7KE';
const HOST = 'kvcwqnpdmwmwtcnafhjq.supabase.co';

function req(method, path, body) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const r = https.request({
      hostname: HOST, path, method,
      headers: {
        apikey: KEY, Authorization: 'Bearer ' + KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d ? JSON.parse(d) : null }));
    });
    r.on('error', e => resolve({ status: 0, error: e.message }));
    if (data) r.write(data);
    r.end();
  });
}

// 1. List all users
const { body: users } = await req('GET', '/rest/v1/users?select=id,email,role,full_name,password_hash&order=created_at.asc');
console.log('\n📋 Current users:\n');
users.forEach((u, i) => {
  const hasPass = !!u.password_hash;
  console.log(`  ${i+1}. ${u.full_name || '(no name)'} | ${u.email} | role:${u.role} | pass:${hasPass ? '✅' : '❌'}`);
});

// 2. Fix phunyezwamjoli3 — demote from admin to student
const wrongAdmin = users.find(u => u.email === 'phunyezwamjoli3@gmail.com');
if (wrongAdmin && wrongAdmin.role === 'admin') {
  const r = await req('PATCH', `/rest/v1/users?id=eq.${wrongAdmin.id}`, { role: 'student' });
  console.log(`\n✅ Demoted phunyezwamjoli3@gmail.com from admin → student (${r.status})`);
}

// 3. Delete test/junk accounts
const junkEmails = [
  'integrations@anything.com',
  'livetest_083402@prince.test',
  'livetest67907025@prince.test',
  'freshtest123@test.com',
];
// Also delete any @prince.test or @test.com accounts
const toDelete = users.filter(u =>
  junkEmails.includes(u.email) ||
  u.email.endsWith('@prince.test') ||
  (u.email.endsWith('@test.com') && !u.email.includes('real'))
);

for (const u of toDelete) {
  const r = await req('DELETE', `/rest/v1/users?id=eq.${u.id}`);
  console.log(`🗑️  Deleted test account: ${u.email} (${r.status})`);
}

// 4. Show duplicate emails
const emailCounts = {};
users.forEach(u => { emailCounts[u.email] = (emailCounts[u.email] || 0) + 1; });
const dupes = Object.entries(emailCounts).filter(([, c]) => c > 1);
if (dupes.length) {
  console.log('\n⚠️  Duplicate emails found:');
  dupes.forEach(([email]) => console.log('  -', email));
}

// 5. Final user list
const { body: final } = await req('GET', '/rest/v1/users?select=id,email,role,full_name,password_hash&order=created_at.asc');
console.log('\n✅ Final user list:\n');
final.forEach((u, i) => {
  const hasPass = !!u.password_hash;
  console.log(`  ${i+1}. ${u.full_name || '(no name)'} | ${u.email} | role:${u.role} | pass:${hasPass ? '✅' : '❌'}`);
});
console.log(`\nTotal: ${final.length} users`);
