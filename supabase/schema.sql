-- Run in Supabase: SQL Editor > New query

create table if not exists catering_bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  event_type text,
  event_date date,
  venue text,
  guests integer,
  message text,
  status text not null default 'new' check (status in ('new','contacted','confirmed','closed'))
);

create table if not exists school_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  course text,
  intake text,
  message text,
  status text not null default 'new' check (status in ('new','contacted','enrolled','closed'))
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  duration text,
  fee_ugx integer,
  next_start date,
  active boolean not null default true
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text,
  photo_url text,
  active boolean not null default true
);

-- Who may use the admin dashboard (add Chef Godwin and his manager after they sign up)
create table if not exists admins (user_id uuid primary key references auth.users(id) on delete cascade);

alter table catering_bookings enable row level security;
alter table school_applications enable row level security;
alter table courses enable row level security;
alter table menu_items enable row level security;
alter table admins enable row level security;

-- Public forms insert through the Pages Function with the service key (bypasses RLS).
-- No public insert or read policy exists on the lead tables on purpose.

create policy "admins read bookings" on catering_bookings for select
  using (exists (select 1 from admins a where a.user_id = auth.uid()));
create policy "admins update bookings" on catering_bookings for update
  using (exists (select 1 from admins a where a.user_id = auth.uid()));

create policy "admins read applications" on school_applications for select
  using (exists (select 1 from admins a where a.user_id = auth.uid()));
create policy "admins update applications" on school_applications for update
  using (exists (select 1 from admins a where a.user_id = auth.uid()));

create policy "public read courses" on courses for select using (active);
create policy "admins manage courses" on courses for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()));

create policy "public read menu" on menu_items for select using (active);
create policy "admins manage menu" on menu_items for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()));

create policy "admins read admins" on admins for select using (user_id = auth.uid());
