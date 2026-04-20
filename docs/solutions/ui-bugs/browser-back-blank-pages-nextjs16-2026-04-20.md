---
title: "Browser back button causes blank pages in Next.js 16 + next-intl v4"
date: 2026-04-20
track: bug
category: ui-bugs
component: next-intl-app-router-layout
module: i18n
tags:
  - browser-back
  - bfcache
  - template-tsx
  - async-layout
  - nextjs16
---

# Browser Back Button Causes Blank Pages in Next.js 16 + next-intl v4

## Problem

User navigates page1 → page2 → page3, then clicks browser back button. Instead of showing page2, the page renders blank/empty.

Reproducible in Next.js 16 + next-intl v4 + React 19 with async `layout.tsx` that uses `await params` and `setRequestLocale(locale)`.

## Root Cause

The async `layout.tsx` pattern:

```ts
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <NextIntlClientProvider>{children}</NextIntlClientProvider>
}
```

creates a race condition with the browser's bfcache (back/forward cache) restoration. When the browser restores a page from bfcache on back navigation, the async layout re-executes but the `setRequestLocale` call and `NextIntlClientProvider` initialization don't synchronize properly with the restored DOM, resulting in a blank render.

## Solution

Created `src/app/[locale]/template.tsx` — a simple wrapper that forces page re-mount on navigation instead of bfcache restoration:

```tsx
export default function Template({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
```

Next.js `template.tsx` creates a new instance of its children on every navigation (unlike `layout.tsx` which persists across route changes). This bypasses the bfcache race condition by ensuring the page tree is always freshly mounted.

## Files Changed

| File | Change |
|------|--------|
| `src/app/[locale]/template.tsx` | **Created** — simple `{children}` wrapper to force re-mount |
| `src/app/[locale]/layout.tsx` | No changes needed — remains async with `setRequestLocale` |
| `src/middleware.ts` | **Removed** — was conflicting with existing `src/proxy.ts` (Next.js 16 prefers `proxy.ts`) |
| `src/proxy.ts` | No changes — already contained full i18n + Supabase auth logic |

## Why This Works

- `layout.tsx` persists state across navigations (good for shared UI, bad for bfcache race conditions)
- `template.tsx` re-instantiates on every navigation, forcing fresh React tree mount
- The combination: layout handles locale setup via `setRequestLocale`, template ensures clean page mount on back/forward navigation

## References

- [Next.js template.tsx docs](https://nextjs.org/docs/app/api-reference/file-conventions/template)
- [next-intl async layout guidance](https://next-intl.dev/docs/routing/metadata#async-layouts)
- [React 19 bfcache considerations](https://react.dev/learn/react-19#support-for-bfcache)
