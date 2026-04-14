# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development commands

Run from the repository root:

- Install deps: `npm install`
- Start dev server (Turbopack): `npm run dev`
- Production build: `npm run build`
- Start production server: `npm run start`

Code quality:

- Lint + auto-fix (Biome): `npm run lint`
- Format (Biome): `npm run format`
- Check without writing changes: `npm run check`

Tests (Vitest + jsdom):

- Run all tests: `npm test`
- Run in watch mode: `npm test -- --watch`
- Run a single test file: `npm test -- src/features/landing/components/__tests__/Hero.test.tsx`
- Run one named test: `npm test -- -t "Hero"`

Database/migrations (Drizzle):

- Generate SQL migrations from `src/db/schema.ts`: `npx drizzle-kit generate --config drizzle.config.ts`
- Apply migrations to `DATABASE_URL`: `npx drizzle-kit migrate --config drizzle.config.ts`

## Environment and runtime dependencies

Environment validation is centralized in `src/env.ts`. Required variables include:

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_ADMIN_EMAIL_1` (and optional `_2`)
- `CRON_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY` (required for admin-level operations)

If these are missing, server startup/actions can fail early due to Zod validation.

## High-level architecture

### 1) App shell and routing

- The app uses Next.js App Router with locale-prefixed routes under `src/app/[locale]`.
- `src/app/[locale]/layout.tsx` composes the global shell (`Navbar`, `Footer`, `Toaster`) and wraps the app in `NextIntlClientProvider`.
- Public pages (e.g. home and listings) use ISR (`revalidate = 3600`); admin routes are dynamic/no-cache.

### 2) i18n pipeline

- Locale config lives in `src/i18n/routing.ts` (`sr` default, `en` secondary).
- Message loading/fallback behavior is implemented in `src/i18n/request.ts` and reads from `messages/*.json`.
- Middleware (`src/middleware.ts`) runs next-intl routing before auth checks.

### 3) Auth and authorization model

- Supabase auth is used for session/user identity:
  - Browser client: `src/lib/supabase.ts`
  - Server client (cookie-aware): `src/lib/supabase-server.ts`
  - Service-role admin client: `src/lib/supabase-admin.ts`
- Admin access is enforced in multiple layers:
  - Middleware route protection for `/admin/*` in `src/middleware.ts`
  - Server-side checks in `src/lib/auth-server.ts`
- Admin role source of truth is `admin_users` table, with env-based fallback for legacy admins.

### 4) Data access layers

- Schema and relations are in `src/db/schema.ts` (apartments, apartment_images, bookings, attractions, attraction_images, inquiries, admin_users).
- Database client is `src/db/index.ts` (Drizzle + postgres).
- Read/query logic is in `src/dal/*` (server-only modules).
- Mutations are primarily in feature-level server actions (`src/features/*/actions.ts`), often wrapped by `createSafeAction` (`src/lib/safe-action.ts`) for Zod validation and structured action responses.

### 5) Feature organization

- `src/features/listings`: apartment CRUD and listing UI.
- `src/features/booking`: booking creation/update flows and overlap checks.
- `src/features/attractions`: attraction CRUD and gallery handling.
- `src/features/admin`: user/admin management actions and admin dashboard client logic.
- Shared UI primitives live in `src/components/ui` (shadcn-style components), with feature/shared components in adjacent folders.

### 6) Side effects and integrations

- Booking flows send emails via `src/lib/email.ts` and templates under `src/lib/emails/*` (Resend).
- Image handling/upload logic is in `src/lib/image-*.ts` and Supabase storage usage appears in listing actions.
- A cron keep-alive endpoint exists at `src/app/api/cron/keep-alive/route.ts` and expects `CRON_SECRET`.

## Existing guidance files and improvements

- An `AGENTS.md` already existed and has been rewritten to be repository-operational (commands, architecture, and concrete module map) rather than persona-style instructions.
- No `WARP.md`, `CLAUDE.md`, `.cursorrules`, `.cursor/rules/*`, or `.github/copilot-instructions.md` were found at the repository root paths relevant to agent behavior.
