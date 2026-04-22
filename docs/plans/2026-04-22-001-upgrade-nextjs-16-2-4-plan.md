---
title: Upgrade Next.js to 16.2.4
type: refactor
status: active
date: 2026-04-22
---

# Upgrade Next.js to 16.2.4

## Overview

Upgrade Next.js from 16.0.10 to 16.2.4 (latest stable). Package versions already updated by `npx @next/codemod@canary upgrade latest`. Remaining work is verification and commit.

## Requirements Trace

- R1. Next.js version must be 16.2.4 in package.json and node_modules
- R2. Production build must pass without errors
- R3. Test suite must pass
- R4. Lint check must pass
- R5. Changes committed to branch

## Scope Boundaries

- No application code changes unless required by breaking changes
- No feature additions
- No dependency updates beyond what the upgrade command performed

## Implementation Units

- [ ] **Unit 1: Verify build**
  - **Goal:** Confirm Next.js 16.2.4 builds successfully
  - **Files:** N/A (verification only)
  - **Verification:** `npm run build` completes with exit code 0

- [ ] **Unit 2: Verify tests**
  - **Goal:** Confirm test suite passes on new version
  - **Files:** N/A (verification only)
  - **Verification:** `npm test` passes

- [ ] **Unit 3: Verify lint/format**
  - **Goal:** Confirm code quality checks pass
  - **Files:** N/A (verification only)
  - **Verification:** `npm run check` passes

- [ ] **Unit 4: Commit upgrade**
  - **Goal:** Stage and commit package.json + package-lock.json changes
  - **Files:** package.json, package-lock.json
  - **Verification:** Clean commit on feat/upgrade-nextjs-16-2-4 branch

## Risks & Dependencies

| Risk | Mitigation |
|------|-----------|
| Build failure from breaking changes | Fix or revert if critical |
| Test failures from React 19.2.0 → 19.2.5 bump | Investigate and fix |

## Sources & References

- Next.js upgrade docs: https://nextjs.org/docs/app/getting-started/upgrading
- Origin: User request to upgrade to latest version
