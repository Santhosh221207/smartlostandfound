# Smart Lost & Found

A campus lost-and-found platform that connects lost items with found items using
lightweight, explainable matching. Every record lives in the database — nothing is
kept in frontend-only state.

## Stack

- React 19 + TypeScript
- TanStack Start / TanStack Router (file-based routes) + Vite
- Tailwind CSS v4 design tokens
- Lovable Cloud (Supabase: Postgres, Storage, RLS)
- Recharts for the dashboard charts

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Landing page, live database stats, recent reports |
| `/report/lost` | Report a lost item (validated, saved to DB, returns a report ID) |
| `/report/found` | Report a found item |
| `/search` | Search all reports with filters (keyword, type, category, location, date, status) |
| `/matches` | Explainable matches between lost and found reports |
| `/item/$id` | Item detail page + claim/contact form |
| `/dashboard` | Database-driven stats and charts |

## Data model

- `reports` — every lost/found report. Contact email and phone are **never** readable
  by the public API (column-level grants), only the reporter name is shown.
- `claims` — claim/contact requests (name, email, message) linked to a report.
- `item-photos` — private storage bucket; images are served through short-lived signed URLs.

Row Level Security is enabled on both tables: anyone can read public report columns,
anyone can create a report or a claim, and only the `status` column can be updated.

## Matching (explainable, not ML)

Each lost report is scored against each found report:

| Factor | Weight |
| --- | --- |
| Item name similarity | 40 |
| Same category | 20 |
| Same location | 20 |
| Date closeness | 10 |
| Description overlap | 10 |

Levels: **80–100 strong**, **60–79 possible**, below 60 is not shown.
Every match card lists the factor-by-factor breakdown.

## Running locally

```bash
bun install      # or: npm install
bun run dev      # dev server on http://localhost:8080
bun run build    # production build
bun run preview  # serve the production build
```

### Environment variables

The Supabase/Lovable Cloud connection is already provisioned and written to `.env`:

```
VITE_SUPABASE_URL=...            # project API URL
VITE_SUPABASE_PUBLISHABLE_KEY=... # public anon key (safe in the browser)
VITE_SUPABASE_PROJECT_ID=...
```

Only the publishable key is used in the browser; all privileged access is blocked by RLS.
If you clone the project elsewhere, copy these three values into a local `.env`.

### Database setup

Schema, grants, RLS policies and the demo dataset are in `supabase/migrations/`.
For a fresh Supabase project, apply those migrations in order, then create a private
storage bucket named `item-photos`.

## Deploying

Publish from Lovable (Publish button) — the same database serves the published app.
For any other host, run `bun run build` and deploy the generated output with the three
`VITE_SUPABASE_*` variables set.

## Demo flow

1. Open `/report/lost` and file: **Black Wallet**, category *Wallet / Money*,
   location *Central Library*, date *22 September 2026*. Note the report ID.
2. Open `/report/found` and file the same item with the same location and date.
3. Go to `/matches` — the pair appears with a score of ~96% (strong) and a factor breakdown.
4. Click **Contact** and send a claim (name, email, message). The finder's contact
   details are never revealed; the request is stored in `claims`.
5. Click **Mark as Resolved** — both reports flip to resolved in the database.
6. Refresh any page or reopen `/search` and `/dashboard`: everything persists.

A seeded demo pair (Black Wallet, Central Library, 22 September 2026) already exists
so the match is visible immediately.
