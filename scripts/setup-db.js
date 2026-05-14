// Uses Supabase Management API v1 to run SQL
const PROJECT_REF = 'kvcwqnpdmwmwtcnafhjq';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Y3dxbnBkbXdtd3RjbmFmaGpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUwNTYyMywiZXhwIjoyMDkzMDgxNjIzfQ.1PCiQp6yS9cLiI6lil2Nv2PF_ox9ctbHydy-tBTr7KE';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;

async function runSQL(query) {
  // Try Management API
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  return { status: res.status, body: await res.text() };
}

async function checkTable(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
  });
  return res.status;
}

const statements = [
  [`pgcrypto extension`, `create extension if not exists "pgcrypto"`],
  [`users`, `create table if not exists users (id text primary key default gen_random_uuid()::text, email text unique not null, password_hash text, full_name text, phone_number text, grade text, role text default 'student', subscription_tier text, subscription_active boolean default false, subscription_end_date timestamptz, trial_end_date timestamptz, bank_name text, account_holder text, account_number text, account_type text, created_at timestamptz default now(), created_date timestamptz default now())`],
  [`videos`, `create table if not exists videos (id text primary key default gen_random_uuid()::text, title text not null, description text, grade text, tier text default 'Standard', topic text, duration text, video_url text, thumbnail_url text, views integer default 0, created_at timestamptz default now(), created_date timestamptz default now())`],
  [`favorites`, `create table if not exists favorites (id text primary key default gen_random_uuid()::text, user_email text not null, video_id text not null, created_at timestamptz default now(), created_date timestamptz default now())`],
  [`comments`, `create table if not exists comments (id text primary key default gen_random_uuid()::text, video_id text not null, author_name text, author_email text, content text, is_question boolean default false, reply_to text, created_at timestamptz default now(), created_date timestamptz default now())`],
  [`xpevents`, `create table if not exists xpevents (id text primary key default gen_random_uuid()::text, user_email text not null, user_name text, xp_amount integer default 0, action_type text, reference_id text, created_at timestamptz default now(), created_date timestamptz default now())`],
  [`notifications`, `create table if not exists notifications (id text primary key default gen_random_uuid()::text, user_email text not null, video_id text, message text, is_read boolean default false, created_at timestamptz default now(), created_date timestamptz default now())`],
  [`messages`, `create table if not exists messages (id text primary key default gen_random_uuid()::text, thread_id text, sender_email text, sender_name text, recipient_email text, recipient_name text, content text, is_read boolean default false, created_at timestamptz default now(), created_date timestamptz default now())`],
  [`RLS users`, `alter table users disable row level security`],
  [`RLS videos`, `alter table videos disable row level security`],
  [`RLS favorites`, `alter table favorites disable row level security`],
  [`RLS comments`, `alter table comments disable row level security`],
  [`RLS xpevents`, `alter table xpevents disable row level security`],
  [`RLS notifications`, `alter table notifications disable row level security`],
  [`RLS messages`, `alter table messages disable row level security`],
  [`storage bucket`, `insert into storage.buckets (id, name, public) values ('prince-math', 'prince-math', true) on conflict (id) do nothing`],
];

console.log('🚀 Setting up Prince Math Academy database...\n');

for (const [label, sql] of statements) {
  const r = await runSQL(sql);
  const body = r.body || '';
  const ok = r.status < 300 || body.includes('already exists') || body.includes('42P07') || body.includes('42710');
  console.log(`${ok ? '✅' : '❌'} ${label}${ok ? '' : ` (${r.status}): ${body.substring(0, 100)}`}`);
}

console.log('\n📋 Verifying tables...');
const tables = ['users', 'videos', 'favorites', 'comments', 'xpevents', 'notifications', 'messages'];
let allGood = true;
for (const table of tables) {
  const status = await checkTable(table);
  const ok = status === 200;
  if (!ok) allGood = false;
  console.log(`  ${table}: ${ok ? '✅' : '❌ ' + status}`);
}

console.log(allGood
  ? '\n✅ All done! Run: node server/index.js'
  : '\n❌ Tables missing — run supabase/schema.sql manually at:\n   https://supabase.com/dashboard/project/kvcwqnpdmwmwtcnafhjq/sql/new'
);
