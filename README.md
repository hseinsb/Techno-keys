# Techno Keys — Invoicing

Private business invoicing app for **Techno Keys** (automotive key programming, diagnostics, ADAS calibration, ECU/module programming).

## Features

- Secure owner login (no public registration)
- Dashboard with invoice totals and outstanding balances
- Fast invoice builder with preset automotive services
- Sequential invoice numbers (`TK-0001`, `TK-0002`, …)
- US Letter PDF preview, download, and print
- Invoice history with search, multi-select, and bulk delete
- Company settings used on every invoice

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- PostgreSQL via Prisma (required for Vercel)
- Auth.js (credentials)
- `@react-pdf/renderer` for PDFs

## Vercel setup (required)

SQLite does **not** work on Vercel. Use a free Postgres database (Neon is easiest):

1. Create a free database at [https://neon.tech](https://neon.tech)
2. Copy the connection string (`postgresql://...`)
3. In Vercel → Project → **Settings → Environment Variables**, add:

| Name | Value |
|------|--------|
| `AUTH_SECRET` | long random string (see below) |
| `AUTH_URL` | `https://techno-keys.vercel.app` |
| `NEXTAUTH_URL` | `https://techno-keys.vercel.app` |
| `DATABASE_URL` | your Neon `postgresql://...` string |
| `OWNER_EMAIL` | `admin@technokeys.com` |
| `OWNER_PASSWORD` | choose a strong password |

4. Redeploy (Deployments → … → Redeploy)

Login with `OWNER_EMAIL` / `OWNER_PASSWORD` after deploy.

## Local setup

```bash
npm install
cp .env.example .env
# Put your Neon DATABASE_URL and AUTH_SECRET in .env
npm run db:setup
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

## Company defaults

- Techno Keys
- 313-574-7294
- 15978 Merriman Road, Livonia, MI 48154
- EIN: 41-3721740

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server on port 43123 |
| `npm run build` | Generate DB schema, seed owner, build app |
| `npm run db:setup` | Push schema + seed owner/settings |
| `npm run db:seed` | Re-seed owner/settings |

## Notes

- Invoices are stored in Postgres (persistent), not browser storage.
- Optional invoice fields can be left blank for a 30–60 second workflow.
