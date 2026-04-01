# Northstar Finance

Production-style personal finance web app for young professionals, built with Next.js 16, React 19, and Tailwind CSS 4. It supports both real Supabase-backed flows and a local machine-only mode for easy demos.

![Personal Finance](https://img.shields.io/badge/Domain-Personal%20Finance-14b8a6?style=for-the-badge)
![Dashboard](https://img.shields.io/badge/Product-Finance%20Dashboard-0f172a?style=for-the-badge)
![App Router](https://img.shields.io/badge/Next.js-App%20Router-111827?style=for-the-badge&logo=next.js&logoColor=white)
![Responsive UI](https://img.shields.io/badge/UI-Responsive%20Design-38bdf8?style=for-the-badge)

![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Database-3ecf8e?logo=supabase&logoColor=white)
![Recharts](https://img.shields.io/badge/Charts-Recharts-22c55e)

## Project Snapshot

![Northstar Finance dashboard](docs/assets/dashboard-overview.png)

## Features

- Email/password sign-up and sign-in
- Dashboard with balance, monthly spending, savings room, and wellness score
- Expense tracking with notes, category filters, and transaction history
- Savings goals with contribution updates and progress tracking
- Plain-language financial insights and visual charts
- Dual backend support: Supabase mode or local JSON storage mode

## Architecture

```mermaid
flowchart TD
    U[User Browser] --> N[Next.js 16 App Router]

    N --> L[Layouts and Pages]
    N --> SA[Server Actions]
    N --> PX[Proxy Layer]
    N --> UI[Client UI Components]

    L --> AU[Auth Layer]
    SA --> AU
    SA --> DATA[Finance Data Layer]
    PX --> AU

    AU --> MODE{Backend Mode}
    DATA --> MODE

    MODE -->|Supabase configured| SUPA[Supabase Auth + Postgres]
    MODE -->|Local mode| LOCAL[Local JSON Store]

    SUPA --> TABLES[profiles / expenses / goals]
    LOCAL --> FILE[.local-data/finance.json]
```

## Workflow

```mermaid
sequenceDiagram
    actor User
    participant UI as Browser UI
    participant App as Next.js App
    participant Auth as Auth + Validation
    participant Store as Supabase / Local Store

    User->>UI: Open app
    UI->>App: Request route
    App->>Auth: Resolve session
    Auth->>Store: Read user + finance state
    Store-->>App: User/profile/data
    App-->>UI: Render login or dashboard

    User->>UI: Sign up / Sign in
    UI->>App: Submit form
    App->>Auth: Validate credentials
    Auth->>Store: Create session
    Store-->>App: Session + profile
    App-->>UI: Redirect to dashboard

    User->>UI: Add expense / create goal / update profile
    UI->>App: Trigger server action
    App->>Store: Persist change
    Store-->>App: Updated records
    App-->>UI: Revalidate and refresh dashboard
```

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase SSR + Supabase Auth
- Recharts
- Zod

## App Routes

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

If `.env.local` is missing, the app falls back to local machine-only mode:

- sign-up and sign-in still work
- finance data is stored in `.local-data/finance.json`
- Supabase remains the primary backend when credentials are configured

## Database Schema

The SQL setup creates:

- `profiles`
- `expenses`
- `goals`

It also includes:

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

## Profiles

- GitHub: [MacharlaNagamanojreddy](https://github.com/MacharlaNagamanojreddy)
- LinkedIn: [Manoj Reddy Macharla](https://www.linkedin.com/in/manoj-reddy-macharla-8a9888258/)
