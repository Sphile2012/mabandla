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
