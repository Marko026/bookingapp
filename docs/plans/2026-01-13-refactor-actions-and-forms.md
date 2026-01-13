# Refactor Actions & Forms Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Secure and modernize the `Attractions` and `Listings` features by migrating manual server actions to `createSafeAction`, enforcing auth checks, and updating forms to `react-hook-form` with Zod validation.

**Architecture:**
- **Server Actions:** All mutations must use `createSafeAction` from `@/lib/safe-action` for consistent auth, validation, and error handling.
- **Forms:** All forms must use `react-hook-form` + `@hookform/resolvers/zod`.
- **Validation:** Zod schemas shared between client (forms) and server (actions).

**Tech Stack:** Next.js 16, React 19, Server Actions, Zod, React Hook Form, Shadcn UI.

---

### Task 1: Listings - Standardize Update/Delete Actions

**Files:**
- Modify: `src/features/listings/schemas.ts`
- Modify: `src/features/listings/actions.ts`

**Step 1: Create Zod Schemas for Update/Delete**
Add `updateApartmentSchema` and `deleteApartmentSchema` to `src/features/listings/schemas.ts`.
- `updateApartmentSchema`: similar to create but includes `id` (or handles it separately).
- `deleteApartmentSchema`: `{ id: z.number() }`.

**Step 2: Refactor `updateApartment` to `createSafeAction`**
Rewrite `updateApartment` in `src/features/listings/actions.ts` to use `createSafeAction`.
- Ensure `getServerUser()` check is implicit via `createSafeAction` middleware (if configured) or explicit.
- Use `db.update`.

**Step 3: Refactor `deleteApartmentAction` to `createSafeAction`**
Rewrite `deleteApartmentAction` in `src/features/listings/actions.ts`.
- Use `db.delete`.

### Task 2: Attractions - Define Schemas

**Files:**
- Create: `src/features/attractions/schemas.ts`

**Step 1: Extract Schema**
Move the `attractionSchema` from `src/features/attractions/actions.ts` to `src/features/attractions/schemas.ts`.
- Export `attractionFormSchema` (for UI).
- Export `createAttractionActionSchema` (may match form).
- Export `updateAttractionActionSchema` (includes `id`).
- Export `deleteAttractionActionSchema` (`{ id: z.number() }`).

### Task 3: Attractions - Secure Actions

**Files:**
- Modify: `src/features/attractions/actions.ts`

**Step 1: Refactor `createAttraction`**
- Import `createSafeAction`.
- Check `getServerUser()` (CRITICAL: currently missing).
- Use `createAttractionActionSchema`.

**Step 2: Refactor `updateAttraction`**
- Use `createSafeAction`.
- Ensure auth check.

**Step 3: Refactor `deleteAttraction`**
- Use `createSafeAction`.
- Ensure auth check.

### Task 4: Attractions - Modernize Form Component

**Files:**
- Modify: `src/components/admin/AttractionForm.tsx`

**Step 1: Setup React Hook Form**
- Replace `useState` / `handleChange` with `useForm<AttractionFormValues>`.
- Use `zodResolver(attractionFormSchema)`.

**Step 2: Implement Form Fields**
- Replace manual `FormInput` props with `register` or `Controller`.
- Note: `RichTextEditor` and `ImageUpload` will likely need `Controller`.

**Step 3: Integrate with Server Action**
- Use `useAction` (from `next-safe-action/hooks`) or standard `startTransition`.
- Handle `onSuccess` / `onError` to show toasts.

### Task 5: Verify & Cleanup

**Files:**
- Verify: `src/features/attractions/actions.ts`
- Verify: `src/features/listings/actions.ts`

**Step 1: Audit for Raw Actions**
- Ensure no "raw" async functions exporting `FormData` handling remain in feature action files.

**Step 2: Run Biome**
- `npm run lint`
- `npm run format`
