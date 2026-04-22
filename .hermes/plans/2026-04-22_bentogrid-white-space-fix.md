# BentoGrid & White Space Fix — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Re-enable the BentoGrid visual component on the landing page and eliminate the white space gap between Hero and Features sections.

**Architecture:** BentoGrid is a "use client" framer-motion component that renders a bento-box style image grid. It was previously built but never imported into the page layout. We will import it into `src/app/[locale]/page.tsx` and place it between `<Hero />` and `<Features />`.

**Tech Stack:** Next.js 16.2.4, React 19.2.5, TypeScript, Tailwind CSS, Framer Motion, next-intl

---

## Current State

- `BentoGrid` component exists at `src/features/landing/components/BentoGrid.tsx` ✅
- It is **NOT imported** in `src/app/[locale]/page.tsx` ❌
- `page.tsx` renders: Hero → Features → ApartmentsSection → AttractionsSection
- Missing BentoGrid creates ~600px white gap on production

## Expected State

- `page.tsx` renders: Hero → **BentoGrid** → Features → ApartmentsSection → AttractionsSection
- White space eliminated
- No build errors, no hydration mismatches

---

## Task 1: Import and Place BentoGrid in page.tsx

**Objective:** Add BentoGrid between Hero and Features sections.

**Files:**
- Modify: `src/app/[locale]/page.tsx`

**Step 1: Add import**

```tsx
import { BentoGrid } from "@/features/landing/components/BentoGrid";
```

**Step 2: Insert component between Hero and Features**

In the JSX, change:
```tsx
<Hero />
<Features />
```

To:
```tsx
<Hero />
<BentoGrid />
<Features />
```

**Step 3: Verify import path resolves**

Run: `npx tsc --noEmit`
Expected: No errors related to BentoGrid import.

**Step 4: Check build**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 5: Commit**

```bash
git add src/app/[locale]/page.tsx
git commit -m "feat: re-enable BentoGrid on landing page"
```

---

## Task 2: Verify Visual Layout in Browser

**Objective:** Confirm BentoGrid renders correctly and white space is gone.

**Step 1: Start dev server (if watcher issue is fixed) or check production preview**

If dev server works:
```bash
npm run dev
```
Navigate to `http://localhost:3000/en`

If dev server still broken, verify via build output inspection.

**Step 2: Visual checks**
- [ ] BentoGrid images load (`/main-img.png`, `/main-img1.png`, Unsplash)
- [ ] No 600px white gap between Hero and Features
- [ ] Responsive layout works on mobile and desktop
- [ ] Framer-motion animations play (images fade in)

**Step 3: Console check**

Open browser console. Verify:
- No hydration mismatch errors
- No 404s for BentoGrid images
- No React key warnings

**Step 4: Commit**

```bash
git add -A
git commit -m "verify: BentoGrid layout confirmed"
```

---

## Task 3: Run Tests and Lint

**Objective:** Ensure no regressions.

**Step 1: Run tests**

```bash
npm test -- --run
```
Expected: All existing tests pass.

**Step 2: Run lint**

```bash
npm run check
```
Expected: No new lint errors.

**Step 3: Commit (if any auto-fixes applied)**

```bash
git add -A && git commit -m "chore: lint fixes" || echo "No lint fixes needed"
```

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Hydration mismatch (BentoGrid is "use client") | Ensure it's not inside server component boundary. `page.tsx` is async server component — client components CAN be children, but verify no mismatch. |
| Image 404s | Check `/main-img.png` and `/main-img1.png` exist in `public/`. Already confirmed ✅. |
| CLS (Cumulative Layout Shift) | BentoGrid has fixed height `min-h-[600px]` — should be stable. |
| Mobile layout broken | BentoGrid uses responsive grid classes — verify on mobile viewport. |

---

## Open Questions

1. Was BentoGrid intentionally removed? If yes, confirm with user before merging.
2. Should BentoGrid content (Swiss Alps, Kyoto) be updated to Serbia/Danube content?
3. Is the floating Trip Summary card with "$3,420.00" placeholder acceptable?
