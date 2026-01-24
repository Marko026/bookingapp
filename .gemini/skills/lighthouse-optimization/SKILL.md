---
name: lighthouse-optimization
description: Use when aiming for perfect Lighthouse scores (100/100/100/100) or fixing hydration mismatches, performance bottlenecks, and SEO/accessibility gaps in Next.js projects.
---

# Lighthouse Optimization

## Overview
Lighthouse 100/100/100/100 is not just about speed; it's about deterministic rendering and platform compliance. This skill focuses on image optimization, accessibility, and resolving the common hydration errors that often result from ad-hoc performance tweaks.

## When to Use
Use this skill when you encounter:
- **Low Performance Scores**: LCP > 2.5s, large image payloads (> 500KB), or JS bundle bloat.
- **Hydration Mismatches**: "Warning: Prop `sizes` did not match" console errors.
- **Accessibility Warnings**: Missing aria-labels, poor heading hierarchy, or insufficient color contrast.
- **SEO Gaps**: Missing robots.txt, sitemap, or essential social/mobile metadata.

## Core Pattern: Deterministic Image Optimization
The key to avoiding hydration errors while optimizing images is ensuring the `sizes` string is identical between server and client.

```tsx
// ✅ GOOD: Standardized sizes string
<Image
  src="/hero.png"
  fill
  priority
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>

// ❌ BAD: Dynamic logic inside a Client Component during hydration
const dynamicSize = typeof window !== 'undefined' ? (window.innerWidth < 768 ? '100vw' : '50vw') : '100vw';
<Image sizes={dynamicSize} ... /> // TRiggers hydration mismatch
```

## Quick Reference
| Optimization Area | Key Action |
|-------------------|------------|
| **LCP** | Add `priority` to above-the-fold images. |
| **Asset Size** | Convert PNG/JPG to WebP/AVIF; use specific `sizes`. |
| **Hydration** | Standardize strings; avoid `window` in rendering logic. |
| **SEO** | Add `robots.txt`, `sitemap.xml`, and metadataBase. |
| **Accessibility** | Semantic tags (`<main>`, `<header>`), `aria-label` for icons. |

## Implementation
1. **Metadata**: Define in root `layout.tsx` using `metadataBase` to avoid absolute URL issues.
2. **Viewport**: Use `Viewport` export instead of global meta tags for Next.js 14+.
3. **Fonts**: Use `next/font` with `display: 'swap'` and `subsets: ['latin']`.

## Common Mistakes
- **Greedy Priority**: Adding `priority` to every image kills performance by competing for bandwidth. Only use it for the absolute LCP element.
- **Spaces in Attribute Strings**: Next.js is sensitive to spaces/tabs in the `sizes` string. Always use clean, trimmed strings.
- **Missing robots.txt**: Not having a robots.txt file is an automatic penalty in the SEO category.
