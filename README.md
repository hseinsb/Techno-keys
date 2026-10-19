# Techno Keys — Invoicing

Private business invoicing app for **Techno Keys** (automotive key programming, diagnostics, ADAS calibration, ECU/module programming).

## Features

- Secure owner login (no public registration)
- Dashboard with invoice totals and outstanding balances
- Fast invoice builder with preset automotive services
- Sequential invoice numbers (`TK-0001`, `TK-0002`, …)
- US Letter PDF preview, download, and print
- Invoice history with search, edit, duplicate, and delete
- Company settings used on every invoice

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- SQLite via Prisma
- Auth.js (credentials)
- `@react-pdf/renderer` for PDFs

## Setup

```bash
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

### Default owner login

Set in `.env` (seeded by `npm run db:setup`):

- **Email:** `admin@technokeys.com`
- **Password:** `TechnoKeys2026!`

Change `OWNER_EMAIL` / `OWNER_PASSWORD` before seeding in production, and set a strong `AUTH_SECRET`.

## Company defaults

Prefilled in settings / invoices:

- Techno Keys
- 313-574-7294
- 15978 Merriman Road, Livonia, MI 48154
- EIN: 41-3721740

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server on port 43123 |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run db:setup` | Create SQLite DB + seed owner/settings |
| `npm run db:seed` | Re-seed owner/settings |

## Notes

- Invoice data is stored in SQLite (`prisma/dev.db`), not browser storage.
- Optional invoice fields can be left blank for a 30–60 second workflow.
