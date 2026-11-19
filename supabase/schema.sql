-- Prince Math Academy — Supabase Schema
-- Run this in your Supabase SQL editor to create all tables.

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── Users ─────────────────────────────────────────────────────────────────────
create table if not exists users (
  id                    text primary key default gen_random_uuid()::text,
  email                 text unique not null,
  password_hash         text,
  full_name             text,
  phone_number          text,
  grade                 text,
  role                  text default 'student',
  subscription_tier     text,
  subscription_active   boolean default false,
  subscription_end_date timestamptz,
  trial_end_date        timestamptz,
  bank_name             text,
  account_holder        text,
  account_number        text,
  account_type          text,
  xp                    integer default 0,
  level                 integer default 1,
  current_streak        integer default 0,
  longest_streak        integer default 0,
  last_activity_date    timestamptz,
  created_at            timestamptz default now(),
  created_date          timestamptz default now()
);

-- ── Videos ────────────────────────────────────────────────────────────────────
create table if not exists videos (
  id            text primary key default gen_random_uuid()::text,
  title         text not null,
  description   text,
  grade         text,
  tier          text default 'Standard',
  topic         text,
  duration      text,
  video_url     text,
  thumbnail_url text,
  notes_url     text,
  views         integer default 0,
  created_at    timestamptz default now(),
  created_date  timestamptz default now()
);

-- Existing databases: add the notes column introduced with downloadable lesson notes.
alter table videos add column if not exists notes_url text;

-- A view must be recorded by the authenticated, access-checked API before it
-- can be used as evidence for a watch_video XP award.
create table if not exists verified_video_views (
  user_id   text not null references users(id) on delete cascade,
  video_id  text not null references videos(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create or replace function public.record_verified_video_view(p_user_id text, p_video_id text)
returns table (views integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_inserted integer;
  v_views integer;
begin
  insert into verified_video_views (user_id, video_id)
  values (p_user_id, p_video_id)
  on conflict (user_id, video_id) do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted > 0 then
    update videos as v
    set views = coalesce(v.views, 0) + 1
    where v.id = p_video_id
    returning v.views into v_views;
  else
    select v.views into v_views
    from videos as v
    where v.id = p_video_id;
  end if;

  if not found then
    raise exception 'Video not found';
  end if;

  return query select coalesce(v_views, 0);
end;
$$;

revoke all on function public.record_verified_video_view(text, text) from public, anon, authenticated;
grant execute on function public.record_verified_video_view(text, text) to service_role;

-- ── Favorites ─────────────────────────────────────────────────────────────────
create table if not exists favorites (
  id          text primary key default gen_random_uuid()::text,
  user_email  text not null,
  video_id    text not null,
  created_at  timestamptz default now(),
  created_date timestamptz default now()
);

-- ── Comments ──────────────────────────────────────────────────────────────────
create table if not exists comments (
  id           text primary key default gen_random_uuid()::text,
  video_id     text not null,
  author_name  text,
  author_email text,
  content      text,
  is_question  boolean default false,
  reply_to     text,
  created_at   timestamptz default now(),
  created_date timestamptz default now()
);

-- ── XP Events ─────────────────────────────────────────────────────────────────
create table if not exists xpevents (
  id           text primary key default gen_random_uuid()::text,
  user_email   text not null,
  user_name    text,
  xp_amount    integer default 0,
  action_type  text,
  reference_id text,
  created_at   timestamptz default now(),
  created_date timestamptz default now()
);

create index if not exists xpevents_user_action_reference_idx
  on xpevents (user_email, action_type, reference_id);

create or replace function public.award_user_xp(
  p_user_id text,
  p_action_type text,
  p_xp_amount integer,
  p_reference_id text
)
returns table (xp integer, level integer, previous_level integer, awarded boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user users%rowtype;
  v_total integer;
  v_level integer := 1;
  v_previous_level integer;
  v_threshold integer;
begin
  if p_xp_amount <= 0 or p_reference_id is null or p_reference_id = '' then
    raise exception 'Invalid XP award';
  end if;

  select * into v_user from users where id = p_user_id for update;
  if not found then
    raise exception 'User not found';
  end if;

  v_previous_level := coalesce(v_user.level, 1);
  if exists (
    select 1 from xpevents
    where user_email = v_user.email
      and action_type = p_action_type
      and reference_id = p_reference_id
  ) then
    return query select coalesce(v_user.xp, 0), v_previous_level, v_previous_level, false;
    return;
  end if;

  v_total := coalesce(v_user.xp, 0) + p_xp_amount;
  foreach v_threshold in array array[100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 6600, 7800, 9100, 10500, 12000, 13600, 15300, 17100, 19000]
  loop
    if v_total >= v_threshold then
      v_level := v_level + 1;
    end if;
  end loop;

  insert into xpevents (user_email, user_name, xp_amount, action_type, reference_id)
  values (v_user.email, v_user.full_name, p_xp_amount, p_action_type, p_reference_id);

  update users set xp = v_total, level = v_level where id = p_user_id;
  return query select v_total, v_level, v_previous_level, true;
end;
$$;

revoke all on function public.award_user_xp(text, text, integer, text) from public, anon, authenticated;
grant execute on function public.award_user_xp(text, text, integer, text) to service_role;

create or replace function public.record_user_activity_streak(p_user_id text, p_activity_date date)
returns table (current_streak integer, longest_streak integer, bonus_awarded boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user users%rowtype;
  v_streak integer;
  v_longest integer;
  v_bonus boolean := false;
begin
  select * into v_user from users where id = p_user_id for update;
  if not found then
    raise exception 'User not found';
  end if;

  if v_user.last_activity_date is not null
    and (v_user.last_activity_date at time zone 'UTC')::date = p_activity_date then
    return query select coalesce(v_user.current_streak, 0), coalesce(v_user.longest_streak, 0), false;
    return;
  end if;

  if v_user.last_activity_date is not null
    and (v_user.last_activity_date at time zone 'UTC')::date = p_activity_date - 1 then
    v_streak := coalesce(v_user.current_streak, 0) + 1;
  else
    v_streak := 1;
  end if;
  v_longest := greatest(coalesce(v_user.longest_streak, 0), v_streak);

  update users
  set current_streak = v_streak,
      longest_streak = v_longest,
      last_activity_date = p_activity_date::timestamp at time zone 'UTC'
  where id = p_user_id;

  if v_streak > coalesce(v_user.current_streak, 0) and v_streak % 7 = 0 then
    select award.awarded into v_bonus
    from public.award_user_xp(p_user_id, 'streak_bonus', 30, p_activity_date::text) as award;
  end if;

  return query select v_streak, v_longest, v_bonus;
end;
$$;

revoke all on function public.record_user_activity_streak(text, date) from public, anon, authenticated;
grant execute on function public.record_user_activity_streak(text, date) to service_role;

-- ── Notifications ─────────────────────────────────────────────────────────────
create table if not exists notifications (
  id           text primary key default gen_random_uuid()::text,
  user_email   text not null,
  video_id     text,
  message      text,
  is_read      boolean default false,
  created_at   timestamptz default now(),
  created_date timestamptz default now()
);

-- ── Messages ──────────────────────────────────────────────────────────────────
create table if not exists messages (
  id             text primary key default gen_random_uuid()::text,
  thread_id      text,
  sender_email   text,
  sender_name    text,
  recipient_email text,
  recipient_name  text,
  content        text,
  is_read        boolean default false,
  created_at     timestamptz default now(),
  created_date   timestamptz default now()
);

-- ── Announcements ─────────────────────────────────────────────────────────────
create table if not exists announcements (
  id             text primary key default gen_random_uuid()::text,
  title          text not null,
  content        text not null,
  priority       text default 'normal', -- normal, important, urgent
  is_active      boolean default true,
  is_deleted     boolean default false,
  deleted_at     timestamptz,
  created_by     text,
  created_at     timestamptz default now(),
  created_date   timestamptz default now()
);

-- ── Badges ─────────────────────────────────────────────────────────────────────
create table if not exists badges (
  id          text primary key default gen_random_uuid()::text,
  name        text not null unique,
  description text,
  icon        text,
  category    text, -- achievement, streak, milestone, special
  xp_reward   integer default 0,
  requirement text, -- description of how to earn
  created_at  timestamptz default now(),
  created_date timestamptz default now()
);

-- ── User Badges ───────────────────────────────────────────────────────────────
create table if not exists user_badges (
  id          text primary key default gen_random_uuid()::text,
  user_email  text not null,
  badge_id    text not null,
  earned_at   timestamptz default now(),
  created_date timestamptz default now()
);

-- ── Video Progress ─────────────────────────────────────────────────────────────
create table if not exists video_progress (
  id              text primary key default gen_random_uuid()::text,
  user_email      text not null,
  video_id        text not null,
  progress        integer default 0, -- percentage 0-100
  last_position   integer default 0, -- seconds
  completed       boolean default false,
  completed_at    timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  created_date    timestamptz default now()
);

-- ── Daily Challenges ───────────────────────────────────────────────────────────
create table if not exists daily_challenges (
  id              text primary key default gen_random_uuid()::text,
  title           text not null,
  description     text,
  xp_reward       integer default 10,
  question_text   text,
  answer_text     text,
  date            date unique not null,
  is_active       boolean default true,
  created_at       timestamptz default now(),
  created_date    timestamptz default now()
);

-- ── Daily Challenge Submissions ─────────────────────────────────────────────────
create table if not exists daily_challenge_submissions (
  id              text primary key default gen_random_uuid()::text,
  user_email      text not null,
  challenge_id    text not null,
  answer          text,
  is_correct      boolean,
  xp_earned       integer default 0,
  submitted_at    timestamptz default now(),
  created_date    timestamptz default now()
);

create unique index if not exists daily_challenge_submissions_user_challenge_idx
  on daily_challenge_submissions (user_email, challenge_id);

-- ── Study Groups ───────────────────────────────────────────────────────────────
create table if not exists study_groups (
  id              text primary key default gen_random_uuid()::text,
  name            text not null,
  description     text,
  creator_email   text not null,
  max_members     integer default 10,
  created_at      timestamptz default now(),
  created_date    timestamptz default now()
);

-- ── Study Group Members ─────────────────────────────────────────────────────────
create table if not exists study_group_members (
  id              text primary key default gen_random_uuid()::text,
  group_id        text not null,
  user_email      text not null,
  joined_at       timestamptz default now(),
  created_date    timestamptz default now()
);

-- ── Forum Posts ────────────────────────────────────────────────────────────────
create table if not exists forum_posts (
  id              text primary key default gen_random_uuid()::text,
  topic           text not null,
  user_email      text not null,
  user_name       text,
  title           text not null,
  content         text,
  upvotes         integer default 0,
  is_pinned       boolean default false,
  created_at      timestamptz default now(),
  created_date    timestamptz default now()
);

-- ── Forum Replies ─────────────────────────────────────────────────────────────
create table if not exists forum_replies (
  id              text primary key default gen_random_uuid()::text,
  post_id         text not null,
  user_email      text not null,
  user_name       text,
  content         text,
  upvotes         integer default 0,
  created_at      timestamptz default now(),
  created_date    timestamptz default now()
);

create table if not exists forum_votes (
  user_id     text not null references users(id) on delete cascade,
  target_type text not null check (target_type in ('ForumPost', 'ForumReply')),
  target_id   text not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, target_type, target_id)
);

create or replace function public.cast_forum_vote(p_user_id text, p_target_type text, p_target_id text)
returns table (upvotes integer, voted boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_inserted integer;
  v_upvotes integer;
begin
  if p_target_type not in ('ForumPost', 'ForumReply') or p_target_id is null or p_target_id = '' then
    raise exception 'Invalid forum vote target';
  end if;

  insert into forum_votes (user_id, target_type, target_id)
  values (p_user_id, p_target_type, p_target_id)
  on conflict (user_id, target_type, target_id) do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted = 0 then
    if p_target_type = 'ForumPost' then
      select coalesce(p.upvotes, 0) into v_upvotes
      from forum_posts as p where p.id = p_target_id;
    else
      select coalesce(r.upvotes, 0) into v_upvotes
      from forum_replies as r where r.id = p_target_id;
    end if;
    if not found then
      raise exception 'Forum entry not found';
    end if;
    return query select v_upvotes, false;
    return;
  end if;

  if p_target_type = 'ForumPost' then
    update forum_posts as p
    set upvotes = coalesce(p.upvotes, 0) + 1
    where p.id = p_target_id
    returning p.upvotes into v_upvotes;
  else
    update forum_replies as r
    set upvotes = coalesce(r.upvotes, 0) + 1
    where r.id = p_target_id
    returning r.upvotes into v_upvotes;
  end if;

  if not found then
    raise exception 'Forum entry not found';
  end if;

  return query select v_upvotes, true;
end;
$$;

revoke all on function public.cast_forum_vote(text, text, text) from public, anon, authenticated;
grant execute on function public.cast_forum_vote(text, text, text) to service_role;

-- ── Feedback ────────────────────────────────────────────────────────────────────
create table if not exists feedback (
  id              text primary key default gen_random_uuid()::text,
  user_email      text,
  type            text, -- bug, feature, general
  subject         text,
  message         text not null,
  status          text default 'open', -- open, in_progress, resolved
  created_at      timestamptz default now(),
  created_date    timestamptz default now()
);

-- ── Storage bucket ────────────────────────────────────────────────────────────
-- Create a public bucket called "prince-math" in Supabase Storage dashboard,
-- or run:
-- insert into storage.buckets (id, name, public) values ('prince-math', 'prince-math', true);

-- ── Password-reset codes (stored hashed) and download limits ─────────────────
alter table users add column if not exists otp_hash text;
alter table users add column if not exists otp_expires timestamptz;
alter table users add column if not exists otp_attempts int default 0;
alter table users add column if not exists otp_verified boolean default false;
alter table users add column if not exists subscription_grade text;
alter table users add column if not exists password_changed_at timestamptz;
alter table users add column if not exists xp integer default 0;
alter table users add column if not exists level integer default 1;
alter table users add column if not exists current_streak integer default 0;
alter table users add column if not exists longest_streak integer default 0;
alter table users add column if not exists last_activity_date timestamptz;
alter table user_badges add column if not exists created_at timestamptz default now();
alter table study_group_members add column if not exists created_at timestamptz default now();
notify pgrst, 'reload schema';

create table if not exists download_log (
  id          uuid primary key default gen_random_uuid(),
  user_email  text not null,
  video_id    uuid,
  created_at  timestamptz default now()
);
create index if not exists download_log_user_time_idx on download_log (user_email, created_at desc);

-- One row per PayFast payment (pf_payment_id is unique) so a replayed notification
-- can never grant a subscription twice.
create table if not exists payments (
  id            uuid primary key default gen_random_uuid(),
  pf_payment_id text unique not null,
  m_payment_id  text,
  user_id       text,
  grade         text,
  tier          text,
  amount        numeric(10,2),
  status        text,
  created_at    timestamptz default now()
);
create index if not exists payments_user_idx on payments (user_id, created_at desc);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Browsers never talk to Supabase directly: every request goes through the API,
-- which uses the service-role key (bypasses RLS). Enabling RLS with NO policies
-- means the public anon key cannot read or write anything (e.g. password hashes).
alter table users enable row level security;
alter table videos enable row level security;
alter table verified_video_views enable row level security;
alter table favorites enable row level security;
alter table comments enable row level security;
alter table xpevents enable row level security;
alter table notifications enable row level security;
alter table messages enable row level security;
alter table announcements enable row level security;
alter table badges enable row level security;
alter table user_badges enable row level security;
alter table video_progress enable row level security;
alter table daily_challenges enable row level security;
alter table daily_challenge_submissions enable row level security;
alter table study_groups enable row level security;
alter table study_group_members enable row level security;
alter table forum_posts enable row level security;
alter table forum_replies enable row level security;
alter table forum_votes enable row level security;
alter table feedback enable row level security;
alter table download_log enable row level security;
alter table payments enable row level security;
