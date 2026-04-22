---
title: Merge All Active Branches into Main
type: refactor
status: active
date: 2026-04-22
---

# Merge All Active Branches into Main

## Overview

Audit and merge all feature/fix branches into `main`. Clean up stale branches. Ensure `main` is the single source of truth with all active work integrated.

## Problem Frame

Repository has 20+ local branches and 10+ remote branches. Many are stale (already merged or abandoned). Two branches have active unmerged work:
1. `feat/upgrade-nextjs-16-2-4` — Next.js upgrade, committed and ready
2. `fix/code-review-bugs` — 3 commits ahead of main but 12 commits behind
3. `refactor/reusable-components` — uncommitted working changes on branch

## Requirements Trace

- R1. All valuable branch work must land in `main`
- R2. Build, tests, and lint must pass after each merge
- R3. Stale branches must be cleaned up (local + remote)
- R4. No working changes lost during cleanup

## Scope Boundaries

- Do NOT rewrite history on `main`
- Do NOT merge branches with failing tests
- Do NOT delete branches with uncommitted work without explicit user confirmation

## Context & Research

### Branch Inventory

**Ready to merge (ahead of main):**

| Branch | Ahead | Behind | Files Changed | Status |
|--------|-------|--------|---------------|--------|
| `feat/upgrade-nextjs-16-2-4` | +1 | 0 | `package.json`, `package-lock.json` | Build pass, tests pass, committed |
| `fix/code-review-bugs` | +3 | -12 | `src/components/layout/Footer.tsx`, `src/features/booking/actions.ts`, `src/lib/structured-data.ts` | Needs rebase on main first |

**Working changes (no commits ahead of main):**

| Branch | Working Changes | Files |
|--------|-----------------|-------|
| `refactor/reusable-components` | Modified + Untracked | `src/app/[locale]/apartment/[id]/ApartmentDetailClient.tsx`, `src/components/shared/SectionHeader.tsx`, `src/components/shared/StatusBadge.tsx`, `src/components/shared/dynamic-imports.tsx`, plus plan doc |

**Stale branches (0 ahead, only behind — safe to delete):**

Local: `feat/dual-language-booking-emails`, `feat/production-error-handling`, `feat/dashboard-updates`, `fix/apartment-detail-responsive`, `fix/hardcoded-reviews`, `fix/hydration-and-errors-final`, `fix/nextjs-security-upgrade`, `fix/sql-crash-resolution`, `performance-optimization`, `Hero-section-redesign-for-mobile-views`, `Translation-issues`, `attraction`, `feature/simplified-attraction-form`, `orch/marke-20260413T230038`, `orch/marke-20260413T232829`, `saved/marke-EXAMPLE-001-20260413T230038`, `saved/task/marke-lane-1-20260413T230038`, `task/marke-lane-1-20260413T232829`

Remote: `feat/dashboard-updates`, `fix/apartment-detail-responsive`, `fix/hardcoded-reviews`, `fix/hydration-and-errors-final`, `fix/nextjs-security-upgrade`, `fix/sql-crash-resolution`, `Hero-section-redesign-for-mobile-views`, `Translation-issues`, `attraction`, `performance-optimization`, `vercel/react-server-components-cve-vu-z13h9i`

**Stashes:**
- `stash@{0}`: WIP on `feat/dashboard-updates` (stale branch)
- `stash@{1}`: WIP on `main` — inspect before dropping

### File Collision Analysis

- `feat/upgrade-nextjs-16-2-4` touches: `package.json`, `package-lock.json`
- `fix/code-review-bugs` touches: `src/components/layout/Footer.tsx`, `src/features/booking/actions.ts`, `src/lib/structured-data.ts`
- `refactor/reusable-components` touches: `src/app/[locale]/apartment/[id]/ApartmentDetailClient.tsx`, `src/components/shared/*`

**No direct file overlap** between the three active branches. Can merge in any order after upgrade lands.

## Key Technical Decisions

- **Merge strategy:** `merge --no-ff` for feature branches to preserve branch history
- **Rebase required:** `fix/code-review-bugs` must rebase on latest `main` before merge (12 commits behind)
- **Commit first:** `refactor/reusable-components` working changes must be committed before merge
- **Delete order:** Delete stale branches first to reduce noise, then merge active branches

## Implementation Units

- [ ] **Unit 1: Push upgrade branch**
  - **Goal:** Push `feat/upgrade-nextjs-16-2-4` to remote
  - **Files:** N/A
  - **Verification:** Branch visible on remote

- [ ] **Unit 2: Commit reusable-components work**
  - **Goal:** Commit working changes on `refactor/reusable-components`
  - **Files:** `src/app/[locale]/apartment/[id]/ApartmentDetailClient.tsx`, `src/components/shared/SectionHeader.tsx`, `src/components/shared/StatusBadge.tsx`, `src/components/shared/dynamic-imports.tsx`
  - **Verification:** `git status` clean on branch

- [ ] **Unit 3: Rebase code-review-bugs on main**
  - **Goal:** Bring `fix/code-review-bugs` up to date with main
  - **Files:** `src/components/layout/Footer.tsx`, `src/features/booking/actions.ts`, `src/lib/structured-data.ts`
  - **Verification:** `git log main..fix/code-review-bugs` shows 0 behind

- [ ] **Unit 4: Merge upgrade branch into main**
  - **Goal:** Land Next.js upgrade on main
  - **Files:** `package.json`, `package-lock.json`
  - **Verification:** `main` contains `829c499`, build passes

- [ ] **Unit 5: Merge code-review-bugs into main**
  - **Goal:** Land code review fixes
  - **Dependencies:** Unit 4
  - **Files:** `src/components/layout/Footer.tsx`, `src/features/booking/actions.ts`, `src/lib/structured-data.ts`
  - **Verification:** Build and tests pass

- [ ] **Unit 6: Merge reusable-components into main**
  - **Goal:** Land reusable components refactor
  - **Dependencies:** Unit 4
  - **Files:** `src/app/[locale]/apartment/[id]/ApartmentDetailClient.tsx`, `src/components/shared/*`
  - **Verification:** Build and tests pass

- [ ] **Unit 7: Verify main health**
  - **Goal:** Ensure main is stable after all merges
  - **Verification:** `npm run build` pass, `npm test` pass, `npm run check` pass

- [ ] **Unit 8: Clean up stale branches**
  - **Goal:** Delete all stale local and remote branches
  - **Verification:** `git branch -a` shows only `main`, active feature branches, and `remotes/origin/main`

- [ ] **Unit 9: Clean up stashes**
  - **Goal:** Drop or apply stale stashes
  - **Verification:** `git stash list` empty or only intentional stashes remain

## System-Wide Impact

- **Main branch integrity:** All merges must preserve build/test stability
- **Remote cleanup:** Deleting remote branches affects any open PRs (none detected)
- **Stash safety:** `stash@{1}` on main must be inspected before dropping

## Risks & Dependencies

| Risk | Mitigation |
|------|-----------|
| `fix/code-review-bugs` rebase conflicts | Resolve manually; only 3 files touched |
| `refactor/reusable-components` uncommitted work is incomplete | Ask user before committing |
| Merge breaks build | Run build/test after each merge unit |
| Accidentally delete wrong branch | Use explicit branch list, confirm before delete |

## Sources & References

- Branch audit performed 2026-04-22
- `git branch -a`, `git rev-list --count` used for divergence analysis
