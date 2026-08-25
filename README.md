# Bajo Mart Reporting App

## What's in this build

- Full authentication (login, forgot password, settings, logout) with eye-icon
  password fields throughout
- Vendor Manager (42 confirmed vendors, add/rename/deactivate/delete)
- Daily Entry form matching the confirmed real report (see daily-report-formulas.md),
  with a date picker so past days are easy to reach and edit
- Monthly Report and Yearly Report, both with Excel and PDF export
- Dashboard with this month's totals and a category breakdown chart
- Full audit history — every save records who changed what and when
- **Mobile responsive** — hamburger menu on phones, active-tab highlighting,
  sticky nav/summary bars, and forms that stack cleanly on small screens

## Full setup from scratch

### Step 1 — Install dependencies
```
npm install
```

### Step 2 — Environment files
```
copy .env.example .env.local
copy .env.local .env
```
Fill in both files with:
- `DATABASE_URL` — Neon **pooled** connection string
- `DIRECT_DATABASE_URL` — Neon **direct** (non-pooled) connection string (used only for migrations)
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `RESEND_API_KEY` — optional; leave blank and reset links print to your terminal instead

### Step 3 — Database
```
npm run db:migrate
```
If asked to reset a fresh/empty database, `y` is safe. If a reset ever fails
partway, use the non-destructive alternative instead:
```
npx prisma db push
```

### Step 4 — Seed data
```
npm run db:seed
```
Creates 2 accounts (`owner@bajomart.com` / `partner@bajomart.com`, temporary
passwords in `prisma/seed.ts`) and all 42 confirmed vendors. Change both
placeholder passwords from the Settings page immediately after logging in.

### Step 5 — Run
```
npm run dev
```
Open **http://localhost:3000**.

## If someone gets locked out
```
npm run reset-password -- --email=their-email@example.com --password=NewPassword123!
```

## Neon free-tier note
The database auto-suspends after ~5 minutes idle. If you get a "can't reach
database server" error, open your Neon dashboard once to wake it, then retry.
Before real daily business use, upgrade to a paid "Always On" Neon plan so
this never happens for the store staff.

## Deploying to Vercel
1. Push to GitHub (already done).
2. Import the repo at vercel.com.
3. Add the same environment variables from `.env.local` in Vercel's
   Environment Variables settings, and set `NEXTAUTH_URL` to your real
   Vercel URL once you have it.
4. Deploy.
