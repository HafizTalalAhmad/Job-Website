# Pakistan Jobs Hub (React)

A modern, mobile-friendly React job-posting portal inspired by the practical structure of Pakistan Jobs Bank.

## Features

- Home page with latest jobs grouped by posting date and source
- Search + multi-filter system (location, profession, industry, organization, type, posting date)
- Sorting (latest, deadline, alphabetical)
- Routes for:
  - Home
  - Jobs by Date
  - Jobs by Location
  - Jobs by Profession
  - Jobs by Industry
  - Jobs by Organization
  - Archives
  - About
- Job detail page with requirements, apply procedure, related jobs
- Archives grouped by month/year
- Sidebar quick links + Today/Government widgets
- Featured jobs panel + latest jobs ticker
- Load More behavior and empty states
- Modular component structure for easy API integration later

## Tech Stack

- React
- React Router
- Functional components with hooks
- Plain CSS
- Supabase REST (for public shared job posts)

## Setup

```bash
npm install
npm run dev
```

## Windows Notes (if `npm` or Vite fails)

If PowerShell blocks `npm`/`npx` scripts, use:

```bash
npm.cmd install
npm.cmd run dev
```

If you see `spawn EPERM` from Vite/esbuild, run terminal as Administrator once and retry:

```bash
npm.cmd run build
npm.cmd run dev
```

Also allow `node.exe` and `node_modules\\esbuild\\esbuild.exe` in antivirus/Controlled Folder Access if enabled.

Build for production:

```bash
npm run build
npm run preview
```

## Public Daily Posting Setup (Required)

To make posted jobs visible to all public users, configure Supabase:

1. Create a Supabase project.
2. Create table `jobs_public` with this SQL:

```sql
create extension if not exists pgcrypto;

create table if not exists public.jobs_public (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text not null,
  location text not null,
  city text not null,
  province text,
  country text default 'In Pakistan',
  category text not null,
  industry text not null,
  type text not null,
  employment_type text,
  source text not null,
  post_date date not null,
  deadline date not null,
  summary text not null,
  description text not null,
  requirements text[] not null default '{}',
  job_positions text[] not null default '{}',
  apply_procedure text not null,
  apply_link text not null,
  keywords text[] not null default '{}',
  poster_image text,
  poster_path text,
  is_archived boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.jobs_public enable row level security;

create policy "public read jobs"
on public.jobs_public
for select
to anon
using (true);

create policy "public insert jobs"
on public.jobs_public
for insert
to anon
with check (true);

create policy "public update jobs"
on public.jobs_public
for update
to anon
using (true)
with check (true);

create policy "public delete jobs"
on public.jobs_public
for delete
to anon
using (true);
```

Create a public storage bucket for job posters:

```sql
insert into storage.buckets (id, name, public)
values ('job-posters', 'job-posters', true)
on conflict (id) do nothing;

create policy "public upload posters"
on storage.objects
for insert
to anon
with check (bucket_id = 'job-posters');

create policy "public read posters"
on storage.objects
for select
to anon
using (bucket_id = 'job-posters');

create policy "public delete posters"
on storage.objects
for delete
to anon
using (bucket_id = 'job-posters');
```

Also create table `contact_messages` for Contact Us submissions:

```sql
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  subject text not null,
  message text not null,
  is_read boolean not null default false,
  reply_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.contact_messages enable row level security;

create policy "public insert contact messages"
on public.contact_messages
for insert
to anon
with check (true);

create policy "public read contact messages"
on public.contact_messages
for select
to anon
using (true);

create policy "public update contact messages"
on public.contact_messages
for update
to anon
using (true)
with check (true);
```

Also create table `subscribers` for email alerts:

```sql
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  is_active boolean not null default true,
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.subscribers enable row level security;

create policy "public insert subscribers"
on public.subscribers
for insert
to anon
with check (true);

create policy "public read subscribers"
on public.subscribers
for select
to anon
using (true);

create policy "public update subscribers"
on public.subscribers
for update
to anon
using (true)
with check (true);

create policy "public delete subscribers"
on public.subscribers
for delete
to anon
using (true);
```

3. Copy `.env.example` to `.env` and set values:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ADMIN_PASSCODE=...
VITE_SUPABASE_POSTER_BUCKET=job-posters
```

4. Restart dev server.

Now `/admin` (hidden from navbar) is your admin page. It requires `VITE_ADMIN_PASSCODE` to unlock posting.
Published jobs write to Supabase and all users can see new jobs.
Contact messages and subscriber emails also write to Supabase. If Supabase is not configured, jobs, contact messages, and subscribers fall back to browser local storage on that device.

Admin page capabilities now include:
- post, edit, and delete jobs
- archive and unarchive jobs
- view, filter, update, export, and delete contact messages
- view, filter, export, activate/deactivate, and delete subscribers
- dashboard stats for jobs, unread messages, and active subscribers

Poster images now use Supabase Storage when configured. In local mode they fall back to browser data URLs.

## Production-Safe Supabase Setup

For production, do not keep admin protected by frontend passcode only. Use Supabase Auth plus RLS tied to an admin table.

### 1. Create an admin user in Supabase Auth

- Go to `Authentication -> Users`
- Create a user manually, or sign up once and then keep that account as admin

### 2. Create admin mapping table

Run this SQL and replace the inserted UUID with the real Supabase Auth user id of your admin:

```sql
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "admins can read admin_users" on public.admin_users;

create policy "admins can read admin_users"
on public.admin_users
for select
to authenticated
using (auth.uid() = user_id);

-- Example only: replace with your actual auth user id
-- insert into public.admin_users (user_id) values ('YOUR-AUTH-USER-ID');
```

### 3. Production-safe table/storage policies

Use this policy model:

```sql
drop policy if exists "public insert jobs" on public.jobs_public;
drop policy if exists "public update jobs" on public.jobs_public;
drop policy if exists "public delete jobs" on public.jobs_public;
drop policy if exists "public read contact messages" on public.contact_messages;
drop policy if exists "public update contact messages" on public.contact_messages;
drop policy if exists "public delete contact messages" on public.contact_messages;
drop policy if exists "public read subscribers" on public.subscribers;
drop policy if exists "public update subscribers" on public.subscribers;
drop policy if exists "public delete subscribers" on public.subscribers;

create policy "admins manage jobs"
on public.jobs_public
for all
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "public read jobs"
on public.jobs_public
for select
to anon, authenticated
using (true);

create policy "public insert contact messages"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

create policy "admins read contact messages"
on public.contact_messages
for select
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "admins update contact messages"
on public.contact_messages
for update
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "admins delete contact messages"
on public.contact_messages
for delete
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "public insert subscribers"
on public.subscribers
for insert
to anon, authenticated
with check (true);

create policy "admins read subscribers"
on public.subscribers
for select
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "admins update subscribers"
on public.subscribers
for update
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "admins delete subscribers"
on public.subscribers
for delete
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "public upload posters" on storage.objects;
drop policy if exists "public delete posters" on storage.objects;

create policy "admins upload posters"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'job-posters' and
  exists (select 1 from public.admin_users where user_id = auth.uid())
);

create policy "public read posters"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'job-posters');

create policy "admins delete posters"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'job-posters' and
  exists (select 1 from public.admin_users where user_id = auth.uid())
);
```

### 4. Admin login behavior

When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured, `/admin` now uses Supabase Auth email/password login.
The old passcode is only used as a local fallback when Supabase Auth is not configured.

### 5. Deploy the Edge Function for subscriber email alerts

Function source:

- `supabase/functions/send-job-alert/index.ts`

Required function secrets:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=alerts@yourdomain.com
```

Deploy commands:

```bash
supabase functions deploy send-job-alert
supabase secrets set SUPABASE_URL=...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
supabase secrets set RESEND_API_KEY=...
supabase secrets set RESEND_FROM_EMAIL=...
```

## Folder Structure

```text
src/
  components/
  pages/
  data/
  utils/
  App.jsx
  main.jsx
  styles.css
```

## Notes for Backend Integration

- Replace `src/data/jobs.js` with API calls.
- Keep filter and grouping utilities in `src/utils/jobs.js` and map API response fields to the same shape.
- Add loading and error states in pages/components when connecting real endpoints.
