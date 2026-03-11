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
  category text not null,
  industry text not null,
  type text not null,
  source text not null,
  post_date date not null,
  deadline date not null,
  summary text not null,
  description text not null,
  requirements text[] not null default '{}',
  apply_procedure text not null,
  apply_link text not null,
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

3. Copy `.env.example` to `.env` and set values:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ADMIN_PASSCODE=...
```

4. Restart dev server.

Now `/admin` (hidden from navbar) is your admin posting page. It requires `VITE_ADMIN_PASSCODE` to unlock posting.
Published jobs write to Supabase and all users can see new jobs.

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
