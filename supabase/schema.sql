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
  views         integer default 0,
  created_at    timestamptz default now(),
  created_date  timestamptz default now()
);

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

-- ── OTP Codes ─────────────────────────────────────────────────────────────────
-- Used for password reset, email verification, and password change flows.
create table if not exists otp_codes (
  id          text primary key default gen_random_uuid()::text,
  email       text not null,
  otp_hash    text not null,
  purpose     text not null,  -- 'password_reset' | 'email_verify' | 'password_change'
  expires_at  timestamptz not null,
  used        boolean default false,
  created_at  timestamptz default now()
);

-- Index for fast lookup
create index if not exists otp_codes_email_purpose_idx on otp_codes (email, purpose);

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
  created_at      timestamptz default now(),
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

-- ── Row Level Security (optional but recommended) ─────────────────────────────
-- For now, disable RLS so the service role key can access everything.
alter table users disable row level security;
alter table videos disable row level security;
alter table favorites disable row level security;
alter table comments disable row level security;
alter table xpevents disable row level security;
alter table notifications disable row level security;
alter table messages disable row level security;
alter table announcements disable row level security;
alter table otp_codes disable row level security;
alter table badges disable row level security;
alter table user_badges disable row level security;
alter table video_progress disable row level security;
alter table daily_challenges disable row level security;
alter table daily_challenge_submissions disable row level security;
alter table study_groups disable row level security;
alter table study_group_members disable row level security;
alter table forum_posts disable row level security;
alter table forum_replies disable row level security;
alter table feedback disable row level security;
