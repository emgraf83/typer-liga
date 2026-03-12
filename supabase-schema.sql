-- ============================================================
--  TYPER LIGA – Supabase SQL Schema
--  Wklej całość do SQL Editor w Supabase i kliknij "Run"
-- ============================================================

-- 1. Profiles (extends auth.users)
create table public.profiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  nick      text not null unique,
  role      text not null default 'user' check (role in ('admin','user')),
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, nick, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nick', split_part(new.email,'@',1)),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Matches
create table public.matches (
  id          uuid primary key default gen_random_uuid(),
  home_team   text not null,
  away_team   text not null,
  kick_off    timestamptz,
  status      text not null default 'upcoming' check (status in ('upcoming','live','finished')),
  score_home  int,
  score_away  int,
  created_at  timestamptz default now()
);

-- 3. Predictions
create table public.predictions (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null references public.matches(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  pred_home  int not null,
  pred_away  int not null,
  created_at timestamptz default now(),
  unique (match_id, user_id)
);

-- ============================================================
--  Row Level Security
-- ============================================================

alter table public.profiles    enable row level security;
alter table public.matches     enable row level security;
alter table public.predictions enable row level security;

-- Profiles: everyone can read, user can update own
create policy "profiles_read"   on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Matches: everyone can read
create policy "matches_read" on public.matches for select using (true);
-- Only service role can write (API routes use service key) — no extra policy needed

-- Predictions: user can read all (for finished matches display), insert/update own
create policy "preds_read"   on public.predictions for select using (true);
create policy "preds_insert" on public.predictions for insert with check (auth.uid() = user_id);
create policy "preds_update" on public.predictions for update using (auth.uid() = user_id);

-- ============================================================
--  Create first admin account
--  WAŻNE: zmień email i hasło przed uruchomieniem!
-- ============================================================
-- Krok 1: Zarejestruj admina przez Supabase Dashboard
--   Authentication → Users → Add user
--   Email: admin@twojadomena.pl   Hasło: TwojeHaslo123!
--
-- Krok 2: Skopiuj UUID z listy użytkowników i wklej poniżej:
--
-- insert into public.profiles (id, nick, role) values
--   ('WKLEJ-UUID-ADMINA', 'Admin', 'admin')
-- on conflict (id) do update set role = 'admin', nick = 'Admin';
