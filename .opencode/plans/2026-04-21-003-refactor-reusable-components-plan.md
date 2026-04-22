---
title: Refactor repeated code into reusable components
type: refactor
status: active
date: 2026-04-21
---

# Refactor repeated code into reusable components

## Overview

12+ repeated UI patterns duplicated across landing pages, admin dashboard, and booking views. Raw `<button>` where shadcn `<Button>` should be used. Footer uses `next/link` `<Link>` for external URLs. Amber CTA style repeated 5+ times. This refactor extracts shared components, fixes inconsistent element usage, and consolidates dynamic imports.

## Problem Frame

Codebase has significant duplication:
- 6 raw `<button>` elements where shadcn `<Button>` should be used
- Footer uses `<Link>` for external URLs (should be `<a>`)
- `bg-amber-600 text-white hover:bg-amber-700` CTA style repeated 5+ times
- Section header (badge + title + subtitle) duplicated in Location.tsx and ApartmentList.tsx
- Floating info card nearly identical in Hero.tsx and BentoGrid.tsx
- Hoverable image pattern repeated 10+ times
- Status badge conditional logic duplicated 4x
- Dynamic imports for MapPicker/RichTextEditor copy-pasted 3x
- AdminPageHeader not used consistently

## Requirements Trace

- R1. All interactive buttons use shadcn `<Button>` or have documented justification for raw `<button>`
- R2. Internal navigation uses Next.js `<Link>` from `@/i18n/routing`; external links use `<a>`
- R3. Repeated UI patterns extracted into shared components under `src/components/shared/` or `src/components/ui/`
- R4. Amber CTA style available as a Button variant
- R5. Dynamic imports centralized in shared module
- R6. No visual regressions — every extraction produces identical rendered output

## Scope Boundaries

- **Non-goal:** Refactor admin CRUD manager pattern (state machines, useActionState hooks)
- **Non-goal:** Refactor motion/animation patterns into wrappers
- **Non-goal:** i18n key changes or new translation keys
- **Non-goal:** Database schema or server action changes

## Context & Research

### Relevant Code and Patterns

- `src/components/ui/button.tsx` — shadcn Button with CVA variants
- `src/components/shared/` — existing shared components (AdminPageHeader, ConfirmDeleteDialog, FormInput, FormTextarea, SearchInput, SortableImageItem, RichTextEditor)
- `src/components/ui/badge.tsx` — shadcn Badge exists
- Section headers: `src/features/landing/components/Location.tsx:23-46`, `src/features/listings/components/ApartmentList.tsx:31-56`
- Floating cards: `src/features/landing/components/Hero.tsx:323-374`, `src/features/landing/components/BentoGrid.tsx:108-145`
- Hoverable images: Hero.tsx, BentoGrid.tsx, Location.tsx, ApartmentList.tsx, AttractionDetailClient.tsx
- Status badges: `BookingsManager.tsx:153-163 + 235-245`, `UserTable.tsx:61-68 + 148-157`
- Admin actions: `ApartmentsManager.tsx:266-289`, `AttractionList.tsx:61-76`
- Dynamic imports: `ApartmentForm.tsx:39-50`, `ApartmentsManager.tsx:20-31`, `AttractionForm.tsx:29-40`
- Amber CTA: `BookingForm.tsx:134`, `not-found.tsx:31`, `AttractionDetailClient.tsx:192`, `Hero.tsx:164-188`
- Footer external links: `src/components/layout/Footer.tsx:23-38`

### Institutional Learnings

- `docs/solutions/ui-bugs/browser-back-blank-pages-nextjs16-2026-04-20.md` — Next.js 16 template/bfcache fix. Ensures Link usage stays compatible.

## Key Technical Decisions

- **Add "amber" variant to Button CVA** — follows shadcn convention, composes with size variants
- **Extract `<SectionHeader>` into `src/components/shared/`** — supports `centered` prop, wraps motion animations
- **Extract `<FloatingInfoCard>` into `src/components/shared/`** — dark-themed info card for Hero and BentoGrid
- **Extract `<StatusBadge>` into `src/components/shared/`** — maps status string to color classes using shadcn Badge
- **Extract `<EmptyState>` into `src/components/shared/`** — icon + title + description + actions
- **Keep raw `<button>` for icon-only actions** (close X, hamburger menu, image remove) — utility buttons with no consistent style
- **Consolidate dynamic imports** into `src/components/shared/dynamic-imports.ts`

## Open Questions

### Resolved During Planning

- Motion wrappers? → No, separate concern
- Admin CRUD unification? → No, out of scope
- Footer `<a>` fix? → Yes, external URLs must use `<a>`

### Deferred to Implementation

- Exact `<FloatingInfoCard>` prop interface — compare Hero vs BentoGrid cards side-by-side
- Whether `<HoverableImage>` extraction is worth it vs. keeping `group` + `group-hover:scale-110` inline

## Implementation Units

- [ ] **Unit 1: Add "amber" variant to shadcn Button**

**Goal:** Amber CTA style reusable as Button variant.

**Requirements:** R1, R4

**Dependencies:** None

**Files:**

- Modify: `src/components/ui/button.tsx`

**Approach:** Add `amber` variant: `bg-amber-600 text-white hover:bg-amber-700 shadow-xl shadow-amber-600/20`. Then replace all 5+ inline amber className usages with `variant="amber"`.

**Test scenarios:**

- Happy path: `variant="amber"` renders with correct amber background classes
- Happy path: `variant="amber" size="lg"` composes both variant and size
- Edge case: `variant="amber" asChild` passes classes to child element

**Verification:** All amber CTA buttons visually identical after migration

---

- [ ] **Unit 2: Replace raw `<button>` with `<Button>` where appropriate**

**Goal:** Convert CTA buttons to shadcn `<Button>`. Keep utility icon buttons (close X, hamburger) as raw `<button>`.

**Requirements:** R1

**Dependencies:** Unit 1

**Files:**

- Modify: `src/features/landing/components/Hero.tsx` — CTA scroll button (lines 164-188) → `<Button variant="amber" size="lg">`
- Modify: `src/features/landing/components/Hero.tsx` — floating card arrow button (lines 333-347) → `<Button variant="ghost" size="icon-sm">`
- Modify: `src/features/booking/components/BookingForm.tsx` — close button (lines 63-69) → `<Button variant="ghost" size="icon">`
- Modify: `src/components/shared/SortableImageItem.tsx` — remove button (lines 71-81) → `<Button variant="ghost" size="icon-sm">`
- Keep raw `<button>`: Navbar hamburger (lines 119-129), BentoGrid circular button (lines 99-104)

**Test scenarios:**

- Happy path: Hero CTA scrolls to `#apartments` section correctly
- Happy path: BookingForm close button dismisses the form
- Happy path: SortableImageItem remove button triggers removal
- No visual regression on any converted button

**Verification:** Click each converted button; all interactions work identically

---

- [ ] **Unit 3: Fix Footer external links**

**Goal:** Replace `next/link` `<Link>` with `<a>` for Instagram and Facebook.

**Requirements:** R2

**Dependencies:** None

**Files:**

- Modify: `src/components/layout/Footer.tsx`

**Approach:** Replace `import Link from "next/link"` with `<a>` for external URLs. Keep `target="_blank" rel="noopener noreferrer"`.

**Test scenarios:**

- Happy path: Instagram link opens in new tab
- Happy path: Facebook link opens in new tab
- `rel="noopener noreferrer"` present on both links

**Verification:** Footer social links open externally in new tabs

---

- [ ] **Unit 4: Extract `<SectionHeader>` component**

**Goal:** Shared component for badge + title + subtitle pattern with motion animations.

**Requirements:** R3, R6

**Dependencies:** None

**Files:**

- Create: `src/components/shared/SectionHeader.tsx`
- Modify: `src/features/landing/components/Location.tsx`
- Modify: `src/features/listings/components/ApartmentList.tsx`

**Approach:** `SectionHeader` accepts `badge`, `title`, `subtitle` strings, `centered` boolean (default `true`), `titleClassName` for size variation. Renders `motion.p`/`motion.h2`/`motion.p` with existing animation props.

**Test scenarios:**

- Happy path: SectionHeader renders badge, title, subtitle with animations
- Happy path: `centered={false}` aligns text left
- Custom `titleClassName` overrides default
- Visual: Identical rendering compared to inline version

**Verification:** Landing page and apartment list page look identical

---

- [ ] **Unit 5: Extract `<FloatingInfoCard>` component**

**Goal:** Shared dark-themed floating info card for Hero and BentoGrid.

**Requirements:** R3, R6

**Dependencies:** None

**Files:**

- Create: `src/components/shared/FloatingInfoCard.tsx`
- Modify: `src/features/landing/components/Hero.tsx`
- Modify: `src/features/landing/components/BentoGrid.tsx`

**Approach:** `FloatingInfoCard` accepts `headerLabel`, `headerAction`, `icon`, `title`, `subtitle`, `priceLabel`, `priceValue`, `badgeIcon`, `badgeLabel`, `badgeColor`. Both current usages share: header row + icon+title row + price row + status badge.

**Test scenarios:**

- Happy path: Card renders all sections
- Different `badgeColor` values produce correct classes
- Visual: Both cards render identically to before

**Verification:** Hero and BentoGrid floating cards render identically

---

- [ ] **Unit 6: Extract `<StatusBadge>` component**

**Goal:** Map status strings to semantic color classes, replacing 4x duplicated conditional logic.

**Requirements:** R3, R6

**Dependencies:** None

**Files:**

- Create: `src/components/shared/StatusBadge.tsx`
- Modify: `src/features/admin/components/dashboard/BookingsManager.tsx`
- Modify: `src/features/admin/components/UserTable.tsx`

**Approach:** `StatusBadge` accepts `status: string` and optional `type: "booking" | "role"`. Uses shadcn `<Badge>` as base. Booking: confirmed→green, cancelled→red, pending→yellow. Role: admin→green.

**Test scenarios:**

- Happy path: confirmed→green, cancelled→red, pending→yellow
- Edge case: Unknown status renders yellow/default styling

**Verification:** Admin bookings and users tables render badges identically

---

- [ ] **Unit 7: Extract `<EmptyState>` component**

**Goal:** Shared icon + title + description + CTA pattern for error/not-found pages.

**Requirements:** R3, R6

**Dependencies:** Unit 1 (amber Button variant)

**Files:**

- Create: `src/components/shared/EmptyState.tsx`
- Modify: `src/app/not-found.tsx`
- Modify: `src/app/[locale]/attraction/[id]/page.tsx`

**Approach:** `EmptyState` accepts `icon`, `title`, `description`, optional `actions` ReactNode. Centered layout with rounded icon container.

**Test scenarios:**

- Happy path: EmptyState renders all sections
- Works without actions prop
- Visual: 404 page and attraction not-found look identical

**Verification:** Navigate to non-existent pages; render identically

---

- [ ] **Unit 8: Consolidate dynamic imports**

**Goal:** Centralize `dynamic()` calls for MapPicker and RichTextEditor.

**Requirements:** R5

**Dependencies:** None

**Files:**

- Create: `src/components/shared/dynamic-imports.ts`
- Modify: `src/features/listings/components/ApartmentForm.tsx`
- Modify: `src/features/admin/components/dashboard/ApartmentsManager.tsx`
- Modify: `src/components/admin/AttractionForm.tsx`

**Approach:** `dynamic-imports.ts` exports `DynamicMapPicker` and `DynamicRichTextEditor` using `next/dynamic` with same loading skeletons. All three consumers import from shared module.

**Test scenarios:**

- Dynamic components load and render correctly
- Loading skeletons display while loading
- No regressions in admin forms

**Verification:** Admin apartment form, apartment manager, and attraction form render MapPicker and RichTextEditor correctly

---

- [ ] **Unit 9: Unify `AdminPageHeader` usage**

**Goal:** Replace inline admin headers with `<AdminPageHeader>` component.

**Requirements:** R3

**Dependencies:** None

**Files:**

- Modify: `src/features/admin/components/dashboard/ApartmentsManager.tsx`
- Possibly modify: `src/features/admin/components/dashboard/BookingsManager.tsx`

**Approach:** Replace `ApartmentsManager` inline header with `<AdminPageHeader title="..." action={<Button>...</Button>} />`. Check `BookingsManager` for similar pattern.

**Test scenarios:**

- Admin apartment page renders header correctly with action button
- Visual: Header identical to before

**Verification:** Admin dashboard apartment manager header renders correctly

## System-Wide Impact

- **Interaction graph:** Landing components (Hero, BentoGrid, Location, ApartmentList) and admin components (BookingsManager, UserTable, ApartmentsManager) affected. Changes are visual-only.
- **Error propagation:** No server actions or data mutations changed
- **State lifecycle risks:** None — all extractions are pure presentation components
- **API surface parity:** No API changes
- **Unchanged invariants:** Form submissions, navigation, booking flows remain identical

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Visual regressions from CSS class differences | Test each component visually in dev; use `cn()` for merging |
| Button variant conflicts with custom className | Use `cn()` in variant definition; verify overrides compose |
| Dynamic import path breaks | Test all three consumers after consolidation |
| Motion animation differences in SectionHeader | Preserve initial/whileInView props with same defaults |

## Sources & References

- shadcn Button CVA: `src/components/ui/button.tsx`
- shadcn Badge: `src/components/ui/badge.tsx`
- Existing shared components: `src/components/shared/`
- Admin CRUD patterns: `src/components/admin/`, `src/features/admin/`