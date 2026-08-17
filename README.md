# Bajo Mart Reporting App — Setup Guide

## Batch 2 additions (this update)

- **Vendor Manager** (`/vendors`) — add, rename, deactivate/reactivate vendors in
  all 3 groups. Deactivating never deletes history.
- **Daily Entry Form** (`/daily-entry/[date]`, or click "Today's Entry" in the nav)
  — the full Gas/Lotto/Payment/Store/Expenses form, with live totals calculated
  the same way they'll be saved. Each of the 42 vendors has a Bank and a Cash
  amount field. Saving an existing date's entry updates it (safe to re-open and edit).
- **Monthly Report** (`/reports/monthly`) — auto-aggregates all daily entries in
  a month: section totals, a per-vendor Bank/Cash breakdown table, and expense
  summary. Use the Previous/Next buttons to browse other months.

**Not included yet:** Yearly Report, Excel/PDF export, audit log/edit history view.

---

## Full setup from scratch

### Step 1 — Install Node.js
Node 20 LTS from nodejs.org. Confirm: `node -v`

### Step 2 — Install dependencies
```
npm install
```

### Step 3 — Environment files
```
copy .env.example .env.local
copy .env.local .env
```
Fill in both `.env.local` and `.env` with:
- `DATABASE_URL` — your Neon **pooled** connection string
- `DIRECT_DATABASE_URL` — your Neon **direct** (non-pooled) connection string.
  In the Neon dashboard, uncheck/toggle off "pooled connection" to get this one —
  it's used only for migrations and is far less likely to drop mid-operation.
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`, or on Windows:
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- `RESEND_API_KEY` — optional. Leave blank and Forgot Password will print the
  reset link to your terminal instead of emailing it.

### Step 4 — Create database tables
```
npm run db:migrate
```
Name it `init` if asked. If you see a "drift detected" prompt asking to reset,
and this is a fresh database with no real data yet, it's safe to answer `y`.

If a reset ever fails partway with a connection error, run this instead — it's
non-destructive and just brings the database in line with the schema:
```
npx prisma db push
```

### Step 5 — Seed initial data
```
npm run db:seed
```
Creates 2 accounts (`owner@bajomart.com` / `partner@bajomart.com`, temporary
passwords in `prisma/seed.ts`) and all 42 confirmed vendors.

**Change your placeholder email/password from the Settings page** after logging in
— that's the safest way since it happens while you're already authenticated.

### Step 6 — Run it
```
npm run dev
```
Open **http://localhost:3000**.

---

## Using the app

1. **Log in**, then click **Settings** to set your real email and password.
2. **Vendors** — review the 42 seeded vendors; add/rename/deactivate as needed.
3. **Today's Entry** — fill in the day's numbers. Totals update live as you type.
   Click **Save Entry**. Re-opening the same date later loads what you saved,
   so you can correct a mistake any time.
4. **Reports → Monthly** — see the auto-calculated totals for any month, browse
   with Previous/Next.

## If someone gets locked out (no email set up)
```
npm run reset-password -- --email=their-email@example.com --password=NewPassword123!
```

## What's next
Yearly Report with month-by-month trend, Excel/PDF export, and the audit
history view. Say the word when you're ready for that batch.
