---
title: "fix: Remove custom Cache-Control on /_next/static and migrate middleware to proxy"
type: fix
status: active
date: 2026-04-20
---

# Fix: Remove Custom Cache-Control on /_next/static and Migrate Middleware to Proxy

## Overview

Two Next.js warnings to resolve:
1. Custom Cache-Control header on `/_next/static/(.*)` breaks dev HMR behavior
2. `middleware` file convention deprecated in Next.js 16 → rename to `proxy`

## Problem Frame

Dev server warns:
- `Warning: Custom Cache-Control headers detected for the following routes: /_next/static/(.*)` — Next.js manages static asset caching internally; custom header overrides dev-mode behavior
- `The "middleware" file convention is deprecated. Please use "proxy" instead.` — Next.js 16 renamed `middleware.ts` to `proxy.ts` to clarify its role as a network proxy, not Express-style middleware

## Requirements Trace

- R1. Remove custom Cache-Control header on `/_next/static/(.*)` to restore correct dev behavior
- R2. Rename `src/middleware.ts` → `src/proxy.ts` and export function `middleware` → `proxy` per Next.js 16 convention

## Scope Boundaries

- Only remove the `/_next/static/(.*)` Cache-Control entry — keep `/images/(.*)` entry (valid use case for public static assets)
- Only rename file + export — no logic changes to auth/i18n behavior
- No changes to matcher config, Supabase client, or admin checks

## Context & Research

### Relevant Code and Patterns

- `next.config.ts:60-66` — Cache-Control header on `/_next/static/(.*)` to remove
- `src/middleware.ts` — file to rename, contains i18n + Supabase auth + admin role checks
- `src/middleware.ts:9` — `export async function middleware(request: NextRequest)` to rename to `proxy`
- `src/middleware.ts:95-111` — `config.matcher` stays unchanged, moves with file

### External References

- Next.js 16 proxy migration: `npx @next/codemod@canary middleware-to-proxy .` (auto-renames file + function)
- https://nextjs.org/docs/messages/middleware-to-proxy

## Key Technical Decisions

- **Manual rename over codemod**: Single file, trivial change. Codemod adds dependency overhead for one rename. Manual is faster and easier to review.
- **Keep /images Cache-Control**: `/images/(.*)` is a custom public directory, not managed by Next.js. No warning, no reason to remove.

## Implementation Units

- [ ] **Unit 1: Remove custom Cache-Control on /_next/static**

**Goal:** Delete the `/_next/static/(.*)` Cache-Control header entry from `next.config.ts`

**Requirements:** R1

**Dependencies:** None

**Files:**
- Modify: `next.config.ts`

**Approach:**
- Remove lines 59-67 (the entire `{ source: "/_next/static/(.*)", headers: [...] }` object from the `headers()` return array)
- Keep the `/images/(.*)` entry (lines 50-57)
- Ensure trailing comma / array syntax remains valid

**Test scenarios:**
- Happy path: Run `npm run dev` — no Cache-Control warning for `/_next/static/(.*)` in console output
- Regression: `/images/(.*)` still serves with `public, max-age=31536000, immutable` Cache-Control header

**Verification:**
- `npm run dev` starts without the Cache-Control warning
- `npm run build` succeeds without warnings

- [ ] **Unit 2: Rename middleware.ts to proxy.ts with function rename**

**Goal:** Rename `src/middleware.ts` → `src/proxy.ts` and export `middleware` → `proxy` per Next.js 16 convention

**Requirements:** R2

**Dependencies:** None (can run in parallel with Unit 1)

**Files:**
- Rename: `src/middleware.ts` → `src/proxy.ts`
- Modify: `src/proxy.ts` (line 9: rename function export)

**Approach:**
- Rename file `src/middleware.ts` to `src/proxy.ts`
- Change `export async function middleware(request: NextRequest)` to `export async function proxy(request: NextRequest)` (line 9)
- Keep all internal logic unchanged: i18n routing, Supabase auth, admin role checks, cookie handling, matcher config
- No other files reference this export directly — Next.js discovers it by file convention

**Test scenarios:**
- Happy path: `npm run dev` starts without "middleware is deprecated" warning
- Happy path: Auth redirects still work — unauthenticated user hitting `/admin` redirects to `/admin/login`
- Happy path: Logged-in admin hitting `/admin/login` redirects to `/admin/dashboard`
- Happy path: Non-admin authenticated user is signed out and redirected to home
- Happy path: i18n locale routing still works (`/` → redirect to `/sr` or `/en`)
- Regression: `npm run build` succeeds without deprecation warnings

**Verification:**
- `npm run dev` starts without the middleware deprecation warning
- `npm run build` succeeds
- Auth flows work correctly (manual smoke test or existing tests pass)
- `npm test` passes (if tests exist for auth/middleware behavior)

## System-Wide Impact

- **Unchanged invariants:** All auth logic, i18n routing, admin role checks, cookie handling remain identical. Only file name and export name change.
- **API surface parity:** No external APIs affected. This is an internal Next.js file convention change.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Next.js version mismatch — proxy convention may require specific 16.x version | Already on Next.js 16.2.4, proxy is supported |
| Import paths referencing middleware file externally | Grep confirms no other file imports from `src/middleware` |
| Dev server cache holding old config | Restart dev server after changes |

## Sources & References

- `next.config.ts:60-66` — Cache-Control header to remove
- `src/middleware.ts` — file to rename to `proxy.ts`
- https://nextjs.org/docs/messages/middleware-to-proxy — migration guidance
