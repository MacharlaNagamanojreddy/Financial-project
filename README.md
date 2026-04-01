# Northstar Finance

A production-style personal finance web app for young professionals. It uses real Supabase authentication and database flows rather than mock data.

## Features

- Email/password sign-up and sign-in with Supabase Auth
- Dashboard with balance, monthly spending, savings progress, charts, and quick actions
- Expense tracking with notes, category filters, and transaction history
- Savings goals with progress tracking and contribution updates
- Plain-language financial insights
- A financial wellness score based on spending consistency, savings ratio, and goal progress

## Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Supabase SSR + Supabase Auth
- Recharts
- Zod

## Routes

- `/`
- `/add-expense`
- `/transactions`
- `/goals`
- `/insights`
- `/profile`
- `/login`
- `/sign-up`

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Copy the example environment file.

```bash
cp .env.example .env.local
```

3. Add your Supabase URL and anon key to `.env.local`.

4. Open Supabase SQL Editor and run [`supabase/schema.sql`](./supabase/schema.sql).

5. Start the app.

```bash
npm run dev
```

6. Visit [http://localhost:3000](http://localhost:3000).

## Local Mode

If `.env.local` is missing, the app now falls back to a local machine-only mode:

- sign-up and sign-in still work
- finance data is stored in `.local-data/finance.json`
- Supabase remains the primary backend when credentials are configured

## Supabase Schema

The SQL file creates:

- `profiles`
- `expenses`
- `goals`

It also sets up:

- a new-user profile trigger
- row-level security policies
- an RPC to add expenses and update balance atomically
- an RPC to increment goal progress atomically

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Node Version

Node 20 or Node 22 is recommended. The current dependency set may emit engine warnings on Node 23 even though the app still installs.
