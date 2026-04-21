---
title: Fix code review bugs — booking status mutation, footer email link, structured data, formatting
type: fix
status: active
date: 2026-04-21
---

# Fix code review bugs — booking status mutation, footer email link, structured data, formatting

## Overview

Address five issues surfaced by a recent code review:

1. **High severity:** `updateBookingStatusAction` commits a booking status change to the database before sending the notification email. If the email provider (Resend) fails, the action reports failure to the admin even though the DB has already been mutated. Additionally, `revalidatePath("/admin")` is skipped on error, leaving the admin cache stale.
2. **Medium severity:** The contact email in the footer is wrapped in a `SmoothScrollLink` with `href="/#apartments"`, causing it to scroll to the apartments section instead of behaving as an email link.
3. **Low severity:** `buildWebSiteJSONLD()` emits a `SearchAction` pointing to a non-existent `/search` route, producing invalid structured data for crawlers.
4. **Low severity:** `ApartmentsSection.tsx` was reformatted from tabs + double quotes to spaces + single quotes, breaking project-wide consistency and adding diff noise.
5. **Low severity:** `SmoothScrollLink` unconditionally calls `e.preventDefault()` for hash links, even when the target element does not exist on the current page (e.g. on `/apartment/[id]`). The click is swallowed and nothing happens.

## Problem Frame

The code review identified a combination of a data-integrity bug in an admin-facing server action, a UI bug in the footer, invalid SEO metadata, and formatting regressions. The highest-risk issue is the booking status action, where a downstream email failure can mislead the admin about whether the status change succeeded.

## Requirements Trace

- R1. `updateBookingStatusAction` must persist the status change and revalidate the admin cache even if the notification email fails.
- R2. The footer email must be rendered as a `mailto:` link (or plain text) rather than a smooth-scroll anchor.
- R3. `buildWebSiteJSONLD()` must not emit a `SearchAction` for a route that does not exist.
- R4. `ApartmentsSection.tsx` must use tabs and double quotes to match the rest of the codebase.
- R5. `SmoothScrollLink` must fall back to standard browser navigation when the target hash element is missing on the current page.

## Scope Boundaries

- No changes to email templates, Resend configuration, or database schema.
- No changes to the booking creation flow (`createBooking`), which already wraps DB + email in a transaction and is out of scope.
- No addition of a `/search` page or route.

## Context & Research

### Relevant Code and Patterns

- **Booking status action:** `src/features/booking/actions.ts` — `updateBookingStatusAction` (lines 259–314). Uses Drizzle ORM, `revalidatePath` from `next/cache`, and `sendApprovalEmail` / `sendCancellationEmail` from `src/lib/email.ts`.
- **Footer:** `src/components/layout/Footer.tsx` — `SmoothScrollLink` component (lines 8–23) and email rendering (lines 37–39).
- **Structured data:** `src/lib/structured-data.ts` — `buildWebSiteJSONLD` (lines 143–158).
- **Formatting:** `src/features/listings/components/ApartmentsSection.tsx` — currently uses 2-space indentation and single quotes.
- **Project conventions:** The repository uses tab indentation and double quotes (enforced by Biome). Run `npm run format` after changes.
- **Testing:** The project uses Vitest + jsdom. No existing tests cover `src/features/booking/actions.ts`. Existing test patterns live in `src/lib/__tests__/*` and `src/dal/__tests__/*`.

### Institutional Learnings

- `docs/solutions/` may contain past guidance on Drizzle transactions or safe-action patterns, but none were directly referenced in the review.

## Key Technical Decisions

- **Email failure handling (R1):** Treat the DB update and cache revalidation as the primary operation. Perform the email send *after* revalidation, and catch email errors separately so they do not roll back the success of the status change. Log the failure for observability. Unlike `createBooking`, where atomic creation plus notification is desired, admin status updates should persist even if notification fails. Therefore we intentionally decouple the email send rather than wrapping it in a transaction.
- **Smooth-scroll fallback (R5):** Move the `e.preventDefault()` call inside the element-existence check so that missing targets trigger normal browser navigation (which may route back to the home page if the hash is present there).

## Implementation Units

- [ ] **Unit 1: Harden `updateBookingStatusAction` against email failures**

**Goal:** Ensure the booking status update and admin cache revalidation succeed independently of the notification email.

**Requirements:** R1

**Dependencies:** None

**Files:**

- Modify: `src/features/booking/actions.ts`

**Approach:**

- Reorder the logic so the DB update happens first, then `revalidatePath("/admin")`, then the email send.
- Wrap the email send in its own `try/catch`. On email failure, log the error and still return `{ success: true, message: "Status updated, but notification email could not be sent." }`. Never pass the raw error object or Resend response to the client.
- Ensure `revalidatePath` is called before the email attempt so cache is always invalidated regardless of email outcome.

**Patterns to follow:**

- Existing `createBooking` in the same file shows the pattern of returning structured `{ success, message }` objects.
- Error logging uses `console.error` elsewhere in the file.

**Test scenarios:**

- Happy path: Admin confirms a pending booking → DB status becomes `confirmed`, admin cache revalidates, approval email is sent, action returns `{ success: true }`.
- Happy path (cancellation): Admin cancels a booking → DB status becomes `cancelled`, admin cache revalidates, cancellation email is sent, action returns `{ success: true }`.
- Error path (email failure): Resend API throws during approval email → DB status is still `confirmed`, admin cache is still revalidated, action returns `{ success: true }` (with optional warning message), error is logged.
- Edge case: Booking or apartment not found → returns `{ success: false, message: "Booking not found" }` before any DB mutation.

**Verification:**

- Unit tests mock `sendApprovalEmail` and `sendCancellationEmail` to throw; assert that `db.update` and `revalidatePath` are still called and the action returns success.
- Manual verification: Trigger a status change in the admin dashboard; confirm the UI updates even if the email provider is unavailable.

---

- [ ] **Unit 2: Fix footer email link and smooth-scroll fallback**

**Goal:** Render the contact email correctly and prevent `SmoothScrollLink` from swallowing clicks when the target element is absent.

**Requirements:** R2, R5

**Dependencies:** None

**Files:**

- Modify: `src/components/layout/Footer.tsx`

**Approach:**

- Replace the `SmoothScrollLink` wrapping the email with a standard `<a href="mailto:jtodorovic059@gmail.com">`. A `mailto:` link is preferable because it opens the user's email client.
- In `SmoothScrollLink`, move `e.preventDefault()` so it only runs when `document.getElementById(hash)` returns a truthy element. If the element is missing, allow the browser to handle the click normally.
- Remove the unused `currentPath` variable from `SmoothScrollLink` while editing the component.

**Patterns to follow:**

- Other external links in the same file already use Next.js `<Link>` with `target="_blank"`.

**Test scenarios:**

- Happy path: Clicking the email link opens the default email client with the address pre-filled.
- Edge case: Clicking a hash link on the home page where the element exists → smooth-scrolls to the element.
- Edge case: Clicking a hash link on `/apartment/[id]` where the element does not exist → browser navigates to `/#hash` instead of swallowing the click.

**Verification:**

- In the browser, click the footer email and confirm a mailto prompt opens.
- On an apartment detail page, click a footer hash link and confirm the browser navigates to the home page anchor.

---

- [ ] **Unit 3: Remove invalid search action from structured data**

**Goal:** Eliminate the `SearchAction` in `buildWebSiteJSONLD()` that points to a non-existent route.

**Requirements:** R3

**Dependencies:** None

**Files:**

- Modify: `src/lib/structured-data.ts`

**Approach:**

- Remove the `potentialAction` property from the object returned by `buildWebSiteJSONLD()`.
- Keep the `WebSiteSchema` interface as-is (the optional `potentialAction` field can remain in the type for future use).

**Patterns to follow:**

- Keep changes minimal; do not alter `buildLodgingBusinessJSONLD` or `buildTouristAttractionJSONLD`.

**Test scenarios:**

- Happy path: `buildWebSiteJSONLD()` returns an object with `@context`, `@type`, `name`, and `url`, but no `potentialAction`.

**Verification:**

- Inspect the JSON-LD output in the page source (`<script type="application/ld+json">`) and confirm the search action is absent.

---

- [ ] **Unit 4: Fix formatting regression in `ApartmentsSection.tsx`**

**Goal:** Restore tab indentation and double quotes to match the rest of the codebase.

**Requirements:** R4

**Dependencies:** None

**Files:**

- Modify: `src/features/listings/components/ApartmentsSection.tsx`

**Approach:**

- Run `npm run format` (Biome) on the file. Biome will auto-fix indentation and quotes per project config.

**Test scenarios:**

- Test expectation: none — purely formatting change with no behavioral impact.

**Verification:**

- Run `npm run check` and confirm no formatting violations are reported for this file.
- Confirm the file diff shows only whitespace/quote changes.

## System-Wide Impact

- **Interaction graph:** `updateBookingStatusAction` is called from the admin booking management UI. Changing its return behavior on email failure means the UI must be prepared to receive `{ success: true }` even when the email did not send. The current UI likely treats any response as success when `success === true`, so this is backward-compatible.
- **Error propagation:** Email failures are now logged but not propagated to the caller. Monitoring should rely on server logs or a future alerting rule on `"Failed to send approval/cancellation email"` patterns.
- **Unchanged invariants:** `createBooking`, `deleteBooking`, and `updateBooking` are not modified. The `WebSiteSchema` type interface is preserved. Footer social-media links remain unchanged.

## Risks & Dependencies

| Risk | Mitigation |
| ---- | ---------- |
| Admin UI shows success but guest receives no email | Log the failure clearly; consider a follow-up task to surface email failures in the admin UI or queue retries. |
| `revalidatePath` throws unexpectedly | `revalidatePath` is synchronous and rarely throws; if it does, the existing outer `try/catch` will still catch it. |
| Formatting fix causes unrelated diff noise | Run `npm run format` only on the changed file, or let Biome handle it automatically. |

## Deferred to Separate Tasks

- Add a retry mechanism or queue for failed booking notification emails: out of scope for this bug-fix batch.
- Add a real search page and restore `SearchAction` in structured data: out of scope; deferred until search functionality is implemented.

## Sources & References

- **Code review output:** Generated by `review` sub-agent on 2026-04-21.
- Related code: `src/features/booking/actions.ts`, `src/components/layout/Footer.tsx`, `src/lib/structured-data.ts`, `src/features/listings/components/ApartmentsSection.tsx`
