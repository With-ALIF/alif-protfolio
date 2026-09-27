# Alif Portfolio — Next.js + Supabase CMS

Personal portfolio of **Md Abdullah Al Khalid Alif** — a single-page Next.js 15
app (React 19) whose content is managed from a private **`/admin` CMS backed by
Supabase**. Live at [https://alif.mnr.bd](https://alif.mnr.bd).

## Sections (single scrolling page `/`)

| Section | Anchor | Content source |
|---|---|---|
| Hero + stats | `#home` | `site` + `hero` site-content, profile |
| About + Education | `#about` | `about` site-content, `alif_education` |
| Skills | `#skills` | `alif_skills` (+group) + `alif_tools`, icons from `alif_tag` |
| Experience summary + history | `#experience` | `hero.highlights`, `alif_experience` |
| Journey timeline | `#journey` | `journey` site-content |
| Projects + case studies | `#projects`, `/projects/[id]` | `alif_projects` + `alif_project_details` (FK cascade) |
| Services | `#services` | `alif_services` (lucide icon names) |
| Awards | `#achievements` | `awards` site-content |
| Contact form + socials | `#contact` | profile + EmailJS |

All Supabase reads go through `src/lib/cms.js`, which falls back to the local
files in `src/data/` when a table is empty or unreachable — the site never
renders blank.

## Tech stack

- Next.js 15 (App Router) + React 19
- Supabase (Postgres + Auth) via `@supabase/supabase-js`
- Contact mail via `@emailjs/browser`
- Styling: Tailwind CSS + daisyUI, framer-motion animations,
  lucide-react / react-icons
- Optional MongoDB archive for contact messages (`src/models`, `src/utils`)

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build    # production build (dev server must be stopped first)
npm start
```

> Dev and prod builds share `.next` — stop `npm run dev` before `npm run build`.

## Environment variables (`.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://cvmmpnpvstrwgfmhfplw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
# Optional (contact-message MongoDB archive)
MONGODB_URI=<connection string>
```

## Supabase CMS setup (one time)

1. Open the Supabase **SQL Editor** and run the whole `supabase/schema.sql`
   (drops old draft tables, creates the redesigned relational schema, enables
   RLS, reseeds current site content).
2. **Authentication → Users → Add user** — create the single admin account.
3. **Authentication → Providers → Email → turn OFF “Allow new users to sign up”**
   so nobody else can register.

### Schema notes (`supabase/schema.sql`)

- `alif_site_content` — JSONB page sections: `site`, `hero`, `about`,
  `journey`, `awards`
- `alif_projects` ↔ `alif_project_details.project_id`
  `REFERENCES alif_projects(id) ON DELETE CASCADE` (deleting a project deletes
  its case study)
- `alif_skills` (+`group`), `alif_tools`, `alif_tag` (tech icons),
  `alif_education`, `alif_experience` (absorbs the old `alif_workflow`),
  `alif_services` (icon = lucide name), `alif_reviews`
- RLS: **public read** on all tables; **write only when
  `auth.jwt().email = 'alifbrur16@gmail.com'`** — enforced in the database,
  so even a logged-in non-admin account cannot write
- `updated_at` auto-touch trigger on every table

### Regenerating the SQL from current code

```bash
node scripts/export-seeds.mjs   # rewrites supabase/schema.sql from src/data
```

## Admin panel (`/admin`)

- Reachable **only by direct URL** — there is no login link, button, or route
  reference anywhere in the public site, sitemap, or nav (plus `noindex`).
- Login is locked to the single admin email in both the app and RLS.
- Tabbed CRUD for all 10 tables: text / textarea / number / checkbox /
  dropdown / project-picker / validated JSON editors, with cascade-delete
  warning on projects.

## Contact form

Sends mail from the browser via EmailJS (`src/lib/emailjs.js`), with inline
validation, sending state, and success/error messages. A best-effort copy is
archived with `POST /api/contact` (MongoDB when `MONGODB_URI` is set — a DB
failure never fails the email).

## Project structure

```text
src/
  app/
    page.js                 # fetches CMS bundle (force-dynamic) → <Landing/>
    layout.js               # fetches site profile/nav → Navbar + Footer
    admin/                  # login gate + CMS dashboard (unlinked, noindex)
    projects/[id]/          # case-study pages (server, CMS + fallback)
    api/contact/            # best-effort message archive
  lib/
    cms.js                  # server CMS bundle + Supabase→component mappers
    supabase.js             # browser client + single-admin sign-in
    emailjs.js              # EmailJS config + browser send
  data/                     # local fallbacks (also the seed source of truth)
  component/  app/components/  # sections, cards, Navbar, Footer
supabase/schema.sql         # full relational schema + RLS + seeds
scripts/export-seeds.mjs    # regenerates schema.sql from src/data
```

## Deployment (Vercel)

1. Import the repo, set the `.env.local` variables in project settings.
2. `npm run build` must pass locally first.
3. After deploy, content edits in `/admin` go live within ~60s (ISR revalidate).
