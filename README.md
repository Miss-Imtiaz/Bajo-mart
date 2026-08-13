# Bajo Mart Reporting App — Setup Guide

## What's included in this batch

- Full Next.js + TypeScript + Tailwind project setup
- Complete Prisma database schema, matching the client-CONFIRMED report
  (42 vendors, bank+cash split per expense, simple confirmed formulas)
- Login (email + password) with rate limiting, show/hide password toggle
- **Forgot Password** flow (emails a reset link via Resend; if RESEND_API_KEY
  isn't set yet, the link is printed to your terminal instead, so you can test
  it immediately without an email account)
- **Settings page** — change your own name, email, and password once logged in
  (requires your current password, so nobody else can change it for you)
- **Logout button** in the top navigation
- Route protection (can't view any page without logging in)
- Core UI components (Button, MoneyInput, Card) styled per the Frontend Spec
- Starter Dashboard home page

**Not included yet**: the full Daily Entry form, Vendor Manager UI, Monthly/Yearly Reports, Excel/PDF export, audit log UI. Say the word whenever you're ready for the next batch.

---

## Step 1 — Install Node.js

Download and install **Node.js 20 LTS** from nodejs.org if you don't have it. Confirm:
```
node -v
```

## Step 2 — Open this project

Unzip this folder anywhere on your computer, then open it in VS Code (or open a terminal inside it).

## Step 3 — Install dependencies

```
npm install
```

## Step 4 — Set up your environment file

```
copy .env.example .env.local
```
(Mac/Linux: `cp .env.example .env.local`)

Then also make a plain `.env` copy (Prisma's command-line tool reads this one, not `.env.local`):
```
copy .env.local .env
```

Open `.env.local` (and `.env`) and fill in:
- `DATABASE_URL` — your Neon connection string
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`, or on Windows:
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- `RESEND_API_KEY` — optional for now. Leave blank and the Forgot Password
  feature will print the reset link to your terminal instead of emailing it,
  so you can still test it. Get a real key free at resend.com → API Keys.

## Step 5 — Create the database tables

```
npm run db:migrate
```
Name the migration `init` when asked.

## Step 6 — Seed the initial data

```
npm run db:seed
```

This creates 2 accounts (`owner@bajomart.com` / `partner@bajomart.com`, temporary
passwords in `prisma/seed.ts`) and all 42 confirmed vendors.

**Change the placeholder emails/passwords immediately:**
- Log in with the temporary credentials, then go to **Settings** in the top nav
  to change your email to your real one and set a real password. This is the
  safest way since it happens while you're already logged in.
- Alternatively, from the terminal:
  ```
  npm run reset-password -- --email=owner@bajomart.com --password=YourRealPassword123!
  ```

## Step 7 — Run it

```
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Trying "Forgot Password" locally

1. On the login page, click **Forgot password?**
2. Enter your account email, submit.
3. If `RESEND_API_KEY` is not set, check your **terminal** — the reset link
   will be printed there. Copy it into your browser to set a new password.
4. Once you add a real `RESEND_API_KEY`, the same flow sends a real email instead.

## If someone gets locked out (no email set up)

```
npm run reset-password -- --email=their-email@example.com --password=NewPassword123!
```

## Deploying to Vercel (when ready)

1. Push this project to a GitHub repository.
2. Import it at vercel.com.
3. In **Settings → Environment Variables**, add `DATABASE_URL`, `NEXTAUTH_SECRET`,
   `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and set `NEXTAUTH_URL` to your real Vercel URL.
4. Deploy.

## What's next

Once login, Settings, and Forgot Password all work for you, let me know and
I'll build the next batch: the full Daily Entry form, Vendor Manager screen,
and Monthly/Yearly Reports wired to the confirmed calculation engine.
