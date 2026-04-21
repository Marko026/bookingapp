---
title: "feat: SEO & Metadata Hardening for Apartmani Todorović"
type: feat
status: active
date: 2026-04-21
deepened: 2026-04-21
---

# feat: SEO & Metadata Hardening for Apartmani Todorović

## Overview

The site currently has minimal SEO configuration. The root layout only sets `metadataBase` with no title, description, OpenGraph defaults, icons, or structured data. Multiple pages (listings, apartment/attraction details) have incomplete or missing metadata. The sitemap has hardcoded locale URLs. No analytics, favicon, or JSON-LD structured data exists. This plan addresses all SEO-critical gaps to improve Google ranking, social sharing, and discoverability.

## Problem Frame

Apartmani Todorović is a booking/tourism website targeting guests in eastern Serbia (Golubac/Danube region). The site supports Serbian (sr) and English (en) locales. Current SEO state:

- Root layout has no title, description, or OpenGraph defaults
- No JSON-LD structured data (LodgingBusiness, TouristAttraction, WebSite)
- No favicon or icons configured
- No analytics integration
- Sitemap uses hardcoded `/en/` locale instead of default `/sr/`
- No Twitter Card metadata anywhere
- No default OpenGraph fallback image

## Requirements Trace

- R1. Root layout provides default title, description, OpenGraph, Twitter Card, icons, and robots metadata
- R2. All pages (home, apartment detail, attraction detail) have complete metadata via `generateMetadata`
- R3. JSON-LD structured data on apartment pages (LodgingBusiness), attraction pages (TouristAttraction), and home page (WebSite)
- R4. Sitemap uses default locale (`sr`) as canonical base URL, not hardcoded `en`
- R5. Favicon and app icons configured and visible in browsers
- R6. Analytics integration (Vercel Analytics or Plausible) for tracking visitor behavior
- R7. robots.txt configured for search engine crawling

## Scope Boundaries

- Does NOT address security findings (CSP, secrets rotation, rate limiting) — separate plan
- Does NOT address performance ISR caching on detail pages — separate plan
- Does NOT address code quality (console.error, error handling patterns) — separate plan
- Does NOT implement missing features (contact form, guest cancellation) — separate plan

## Context & Research

### Relevant Code and Patterns

- Root layout: `src/app/[locale]/layout.tsx` — metadata export at line 23-25, currently bare
- Home page: `src/app/[locale]/page.tsx` — has `generateMetadata` using `next-intl` translations (good pattern to follow)
- Apartment detail: `src/app/[locale]/apartment/[id]/page.tsx` — has `generateMetadata` but no structured data
- Attraction detail: `src/app/[locale]/attraction/[id]/page.tsx` — has `generateMetadata` but returns `{ title: "Not Found" }` for missing items
- Sitemap: `src/app/sitemap.ts` — hardcoded `BASE_URL` and `/en/` locale in URLs
- i18n: `src/i18n/routing.ts` — default locale is `sr`, secondary is `en`
- Messages: `messages/sr.json` and `messages/en.json` — already have `Metadata` namespace with title/description
- Public assets: `public/logo.png` exists, no favicon.ico or icon.png
- Existing pattern: Home page uses `getTranslations` with locale for metadata (follow this pattern)

### Key Technical Decisions

- **JSON-LD**: Inject via `<script type="application/ld+json">` in page components. Next.js supports this natively.
- **Analytics**: Use `@vercel/analytics` — zero-config, privacy-friendly, integrates with Vercel dashboard already in use.
- **Favicon**: Use Next.js Metadata File Convention — place `favicon.ico`, `icon.png`, `apple-icon.png` in `src/app/` root directory.
- **robots.txt**: Use Next.js `robots.ts` convention in `src/app/robots.ts`.
- **Sitemap fix**: Use `routing.defaultLocale` instead of hardcoded `"en"`.

## Implementation Units

- [ ] **Unit 1: Root Layout Metadata Enrichment**

**Goal:** Add comprehensive default metadata to root layout so all pages inherit proper fallback values.

**Requirements:** R1, R5

**Dependencies:** None

**Files:**

- Modify: `src/app/[locale]/layout.tsx`
- Create: `src/app/favicon.ico`
- Create: `src/app/icon.png` (192x192)
- Create: `src/app/apple-icon.png` (180x180)

**Approach:**

- Expand `metadata` export in root layout to include:
  - `title.default` — "Apartmani Todorović | Luksuzni Smeštaj u Prirodi"
  - `title.template` — "%s | Apartmani Todorović"
  - `description` — from existing messages or hardcoded default
  - `openGraph` — type: website, locale, siteName, default images
  - `twitter` — card: summary_large_image, site, creator
  - `icons` — reference favicon.ico, icon.png, apple-icon.png
  - `robots` — index, follow
- Icons placed in `src/app/` root follow Next.js Metadata File Convention and auto-generate at build time.

**Patterns to follow:**

- Next.js 16 Metadata API
- Use `metadataBase` already set to `https://apartmani-todorovic.com`

**Test scenarios:**

- Happy path: Root layout metadata includes title template, description, openGraph, twitter, icons, robots
- Edge case: Page without its own generateMetadata inherits root defaults correctly
- Integration: OpenGraph preview shows correct image and title when sharing URL

**Verification:**

- `metadata` export in layout.tsx has all 6 fields populated
- Icons visible in browser tab
- Social sharing preview shows correct data

- [ ] **Unit 2: Delete Listings Page**

**Goal:** Remove unused listings page to simplify site structure. Users access apartments via home page sections.

**Requirements:** Scope simplification

**Dependencies:** None

**Files:**

- Delete: `src/app/[locale]/listings/page.tsx`
- Delete: `src/features/listings/components/ApartmentList.tsx`

**Approach:**

- Delete the listings page route completely
- Delete ApartmentList component (only used by listings page)
- Other listings components (ApartmentsSection, ApartmentForm) are used elsewhere and kept
- No navigation links to listings page exist (confirmed)

**Patterns to follow:**

- None needed

**Test scenarios:**

- Happy path: /listings route returns 404 or redirects to home

**Verification:**

- No /listings route exists
- No ApartmentList.tsx component exists

- [ ] **Unit 3: JSON-LD Structured Data**

**Goal:** Add JSON-LD structured data to apartment detail, attraction detail, and home pages for rich search results.

**Requirements:** R3

**Dependencies:** Unit 1

**Files:**

- Modify: `src/app/[locale]/apartment/[id]/page.tsx`
- Modify: `src/app/[locale]/attraction/[id]/page.tsx`
- Modify: `src/app/[locale]/page.tsx`
- Create: `src/lib/structured-data.ts`

**Approach:**

- Create `src/lib/structured-data.ts` with helper functions:
  - `buildLodgingBusinessJSONLD(apartment, locale)` — returns LodgingBusiness schema with name, description, image, address, geo (from lat/lng), priceRange, aggregateRating
  - `buildTouristAttractionJSONLD(attraction, locale)` — returns TouristAttraction schema with name, description, image, geo
  - `buildWebSiteJSONLD()` — returns WebSite schema with SearchAction
- Inject via `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />` in each page component
- Apartment detail: add LodgingBusiness JSONLD with apartment data
- Attraction detail: add TouristAttraction JSONLD with attraction data
- Home page: add WebSite JSONLD with SearchAction

**Test scenarios:**

- Happy path: Apartment detail page renders valid LodgingBusiness JSON-LD with all required fields
- Happy path: Attraction detail page renders valid TouristAttraction JSON-LD
- Happy path: Home page renders WebSite JSON-LD with SearchAction
- Edge case: Apartment with no images still renders valid JSON-LD (images array empty or omitted)
- Edge case: Attraction with no coordinates renders valid JSON-LD (geo omitted)
- Integration: Google Rich Results Test tool validates structured data without errors

**Verification:**

- `src/lib/structured-data.ts` exports 3 builder functions
- Each page includes `<script type="application/ld+json">` with correct schema type
- JSON-LD passes schema.org validation (no missing required fields)

- [ ] **Unit 4: Sitemap Locale Fix**

**Goal:** Fix sitemap.ts to use default locale (`sr`) instead of hardcoded `en` for canonical URLs.

**Requirements:** R4

**Dependencies:** None (independent of other units)

**Files:**

- Modify: `src/app/sitemap.ts`

**Approach:**

- Import `routing` from `@/i18n/routing` (already imported)
- Replace hardcoded `/en/` with `/${routing.defaultLocale}/` in apartment and attraction URL generation (lines 37, 53)
- Keep alternates for all locales (existing behavior is correct)

**Test scenarios:**

- Happy path: Apartment URLs in sitemap use `/sr/apartment/{id}` as canonical URL
- Happy path: Attraction URLs in sitemap use `/sr/attraction/{id}` as canonical URL
- Edge case: All locale alternates still present for each entry

**Verification:**

- No hardcoded `"en"` strings remain in sitemap.ts URL construction
- Sitemap output shows `/sr/` as base locale for all detail pages

- [ ] **Unit 5: robots.txt**

**Goal:** Add robots.txt for search engine crawl control.

**Requirements:** R7

**Dependencies:** None

**Files:**

- Create: `src/app/robots.ts`

**Approach:**

- Use Next.js `robots.ts` convention (dynamic route handler)
- Export default function returning `MetadataRoute.Robots`
- Allow all crawlers, reference sitemap URL
- Disallow `/admin/*` paths

**Test scenarios:**

- Happy path: `/robots.txt` returns valid robots.txt with User-agent, Allow, Sitemap directives
- Edge case: Admin paths are disallowed

**Verification:**

- `src/app/robots.ts` exists and exports default function
- Visiting `/robots.txt` shows correct directives
- Sitemap URL points to `https://apartmani-todorovic.com/sitemap.xml`

- [ ] **Unit 6: Vercel Analytics Integration**

**Goal:** Add Vercel Analytics for visitor tracking and conversion monitoring.

**Requirements:** R6

**Dependencies:** Unit 1 (root layout modification)

**Files:**

- Modify: `src/app/[locale]/layout.tsx`
- Modify: `package.json` (add `@vercel/analytics` dependency)

**Approach:**

- Install `@vercel/analytics`
- Import `Analytics` from `@vercel/analytics/react`
- Add `<Analytics />` component to root layout body (after `<Toaster />`)
- No additional configuration needed — auto-detects Vercel environment

**Test scenarios:**

- Happy path: Analytics component renders in production on Vercel
- Edge case: Analytics does not cause errors in local development (dev mode behavior)

**Verification:**

- `@vercel/analytics` in package.json dependencies
- `<Analytics />` present in root layout
- Vercel dashboard shows analytics data after deployment

## System-Wide Impact

- **Interaction graph:** Root layout change affects all pages (metadata inheritance)
- **API surface parity:** No API changes — purely metadata/SEO
- **Unchanged invariants:** Existing page-level `generateMetadata` functions continue to work (they override root defaults as expected)
- **Integration coverage:** JSON-LD structured data is consumed by Google/Bing crawlers — no runtime integration needed

## Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| JSON-LD schema validation errors | Low | Medium | Test with Google Rich Results Tool before deployment |
| Icon files not found at build time | Low | Low | Use Next.js Metadata File Convention with fallback paths |
| Analytics adds bundle size | Low | Low | `@vercel/analytics` is ~2kb gzipped, negligible |
| Sitemap change affects existing Google index | Low | Medium | Canonical URL change from `/en/` to `/sr/` may cause temporary re-indexing; search consoles will self-correct |

## Documentation / Operational Notes

- After deployment, submit updated sitemap to Google Search Console
- Verify structured data with Google Rich Results Test
- Monitor Vercel Analytics dashboard for first 7 days post-deployment
- Consider adding `NEXT_PUBLIC_SITE_URL` env var for centralized URL management (deferred — not blocking this plan)

## Sources & References

- Next.js Metadata API: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
- Next.js robots.txt: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
- JSON-LD schema.org: https://schema.org/LodgingBusiness
- Vercel Analytics: https://vercel.com/docs/analytics
- Origin: Codebase research (no brainstorm document exists for this work)
