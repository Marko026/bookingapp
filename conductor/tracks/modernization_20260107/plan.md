# Plan: Project Modernization

## Phase 1: Foundation & DAL Consolidation
Goal: Ensure all database interactions are centralized in the DAL and properly typed.

- [ ] Task: Audit `src/app` and `src/features` for direct `db` usage.
- [ ] Task: Create unit tests for existing DAL methods in `src/dal/apartments.ts`.
- [ ] Task: Refactor apartment queries from components to `src/dal/apartments.ts`.
- [ ] Task: Create unit tests for existing DAL methods in `src/dal/bookings.ts`.
- [ ] Task: Refactor booking queries from components to `src/dal/bookings.ts`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Foundation & DAL Consolidation' (Protocol in workflow.md)

## Phase 2: Server Actions & Form Standardization
Goal: Standardize mutations and form handling across the application.

- [ ] Task: Audit existing Server Actions for `createSafeAction` usage.
- [ ] Task: Write tests for `createApartment` action.
- [ ] Task: Refactor `createApartment` to use `createSafeAction` and Zod.
- [ ] Task: Write tests for `createBooking` action.
- [ ] Task: Refactor `createBooking` to use `createSafeAction` and Zod.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Server Actions & Form Standardization' (Protocol in workflow.md)

## Phase 3: Final Quality Pass & Cleanup
Goal: Ensure project-wide consistency and toolchain alignment.

- [ ] Task: Verify all environment variable usage points to `src/env.ts`.
- [ ] Task: Run project-wide `npm run check` (Biome) and fix all issues.
- [ ] Task: Final verification of mobile responsiveness for key refactored components.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Final Quality Pass & Cleanup' (Protocol in workflow.md)
