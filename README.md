# TimeSheet — Turborepo Monorepo

A production-grade, full-stack time-tracking application built as a **pnpm Turborepo** with a **Vite + React 19 + TypeScript** frontend and an **Express + MongoDB** backend.

---

## Project Structure

```
timesheet/
├── apps/
│   ├── api/                   # Express REST API
│   │   └── src/
│   │       ├── config/        # env validation, MongoDB connection
│   │       ├── middleware/    # auth (JWT), error handler
│   │       ├── models/        # Mongoose: User, DaySheet
│   │       ├── routes/        # /api/auth, /api/timesheets
│   │       └── utils/         # JWT helpers, response helpers
│   └── web/                   # Vite + React frontend
│       └── src/
│           ├── components/
│           │   ├── auth/      # LoginPage, RegisterPage
│           │   ├── entries/   # ListPanel, EntryRow
│           │   ├── layout/    # AppHeader, TabBar
│           │   ├── modals/    # EntryModal, ConfirmModal
│           │   └── timeline/  # Timeline, EventBlock, NowLine, TimelinePanel
│           ├── contexts/      # AuthContext, ThemeContext, ToastContext
│           ├── hooks/         # useDaySheet, useTimesheetMutations, useNowLine…
│           └── pages/         # DashboardPage
├── packages/
│   ├── types/                 # Shared TypeScript interfaces (no runtime deps)
│   ├── utils/                 # Pure helpers: time, date, DOM (no React)
│   ├── api-client/            # Typed HTTP client (fetch wrapper + endpoints)
│   ├── query-config/          # TanStack Query keys + queryOptions factories
│   └── ui/                    # Shared React components + globals.css
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Quick Start

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9 (`npm i -g pnpm`)
- MongoDB (local or Atlas)

### 1. Install

```bash
pnpm install
```

### 2. Configure environment

```bash
# API
cp apps/api/.env.example apps/api/.env
# Edit: MONGODB_URI, JWT_SECRET

# Web
cp apps/web/.env.example apps/web/.env
# Edit: VITE_API_URL (default: http://localhost:4000)
```

### 3. Run in development

```bash
pnpm dev          # starts both api (port 4000) and web (port 5173) in parallel
```

### 4. Build for production

```bash
pnpm build        # type-checks + builds all apps
```

---

## Architecture Decisions

### Data Fetching Strategy — TanStack Query

The entire data-fetching layer is built on **TanStack Query v5** with deliberate cache tuning to avoid redundant network requests.

#### Cache key hierarchy (`packages/query-config/src/keys.ts`)

```
['auth', 'me']
['timesheets', 'days', '2025-01-15']   ← one key per calendar day
['timesheets', 'days', '2025-01-16']
```

Keys are defined in a single factory object so invalidations are always type-safe and co-located.

#### Per-day cache settings (`packages/query-config/src/options.ts`)

| Setting     | Value   | Effect |
|-------------|---------|--------|
| `staleTime` | 10 min  | Won't refetch if data was loaded < 10 min ago |
| `gcTime`    | 30 min  | Cached data survives component unmount for 30 min |

Navigating back to a day you already viewed renders **instantly** from cache, with zero network requests, for up to 10 minutes.

#### Optimistic updates (`apps/web/src/hooks/useTimesheetMutations.ts`)

Every write (add/edit/delete entry) uses TanStack Query's optimistic update pattern:

1. **`onMutate`** — cancel in-flight queries, snapshot current cache, write new data immediately
2. **`onError`** — roll back to snapshot, show error toast
3. **`onSuccess`** — settle cache with authoritative server response

This means the UI responds in **< 1ms** on save, with automatic rollback if the network request fails.

#### Prefetching adjacent days

When the user navigates to a day, the hook immediately prefetches the next/previous day in the background:

```ts
// apps/web/src/pages/DashboardPage.tsx
const navigate = useCallback((days: number) => {
  const next = offsetDate(currentDate, days);
  setCurrentDate(next);
  prefetchDay(toDateKey(offsetDate(next, days))); // ← warm the cache ahead
}, [...]);
```

---

### HTTP Client (`packages/api-client/src/http.ts`)

- Single `fetch` wrapper with typed request/response
- Injects `Authorization: Bearer <token>` automatically
- On **401**: calls a global `onUnauthorized` callback (configured in `App.tsx`) which triggers logout and clears the entire query cache
- Typed `ApiRequestError` class with `isUnauthorized`, `isNotFound` helpers

### Auth Flow

1. On registration/login the server returns `{ user, token }` (JWT)
2. Token is stored in **`localStorage`** (not a cookie, for simplicity)
3. On app boot, `AuthContext` reads the token and sets it on the HTTP client
4. `App.tsx` fires the `/api/auth/me` query to validate the token server-side
5. On 401 from any request: `onUnauthorized` clears localStorage, wipes query cache, shows login

### Package dependency graph

```
apps/web  →  packages/query-config  →  packages/api-client  →  packages/types
          →  packages/ui             →  packages/utils        →  packages/types
          →  packages/utils
          →  packages/types

apps/api  →  packages/utils
          →  packages/types
```

No circular dependencies. `packages/types` and `packages/utils` have zero React dependencies and can be used in both Node and browser.

---

## API Reference

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in, returns JWT |
| GET | `/api/auth/me` | ✓ | Validate token, refresh user |

### Timesheets

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/timesheets/:date` | ✓ | Get entries for YYYY-MM-DD |
| PUT | `/api/timesheets/:date` | ✓ | Replace all entries for date |
| POST | `/api/timesheets/:date/copy-next` | ✓ | Duplicate to next calendar day |

All endpoints return `{ message, code, statusCode }` on error.

---

## Adding a New Package

```bash
mkdir packages/my-package
cd packages/my-package
# Add package.json with name "@timesheet/my-package"
# Reference from other packages: "@timesheet/my-package": "*"
pnpm install
```

Turborepo auto-discovers it via `pnpm-workspace.yaml` — no other config needed.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Vite 6, React 19, TypeScript 5.7 |
| Data fetching | TanStack Query v5 |
| Backend | Express 4, TypeScript, tsx |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | Zod (API) |
| Styling | Plain CSS with CSS custom properties |
