# Specification: Project Modernization & Architectural Refinement

## Overview
Refactor the existing codebase to align with modern "Context7" patterns, focusing on strict type safety, consistent Data Access Layer (DAL) usage, and robust Server Actions using `next-safe-action`.

## Goals
- **Consistency:** Ensure all database queries are moved to `src/dal`.
- **Type Safety:** Eliminate `any` types and ensure Zod schemas drive both validation and types.
- **Safety:** Wrap all mutations in `createSafeAction`.
- **Maintainability:** Simplify complex components and improve architectural clarity.

## Key Areas of Focus
1. **Data Access Layer (DAL):** Centralize all Drizzle queries.
2. **Server Actions:** Standardize the use of `createSafeAction` and error handling.
3. **Form Handling:** Consistent use of `react-hook-form` + `zod` + `safe-action`.
4. **Environment Variables:** Ensure all env vars are accessed via the type-safe `src/env.ts`.

## Acceptance Criteria
- No direct database calls in UI components.
- All forms use the standardized `react-hook-form` + `zod` pattern.
- Test coverage for refactored DAL methods exceeds 80%.
- Biome check passes with zero errors.
