# PROJECT HISTORY: Sanctuary Booking App

## Phase 1: Foundation & i18n
- [x] Initialized Next.js 16 project with React 19 and Biome.
- [x] Implemented `next-intl` for multi-language support (English & Serbian).
- [x] Set up localized routing structure `/[locale]/`.

## Phase 2: Database & Core Features
- [x] Configured Supabase and Drizzle ORM.
- [x] Created `apartments` and `attractions` schemas.
- [x] Implemented public detail pages for Apartments and Attractions.

## Phase 3: Admin Panel & Security
- [x] Built Admin Dashboard (`/admin/dashboard`).
- [x] Implemented Admin User Management with role-based access.
- [x] Added "Super Admin" mechanism to prevent lockout.
- [x] Developed CRUD forms for Apartments and Attractions.

## Phase 4: Rich Text & UX (Latest)
- [x] **Tiptap Integration:** Replaced all description `textarea` fields with a custom `RichTextEditor` component.
- [x] **Luxury UI:** Added custom glassmorphism toolbar, tooltips, and smooth transitions to the editor.
- [x] **HTML Logic Fix:** Implemented `stripHtml` utility to clean up preview cards on the landing page and dashboard.
- [x] **Typography Plugin:** Integrated `@tailwindcss/typography` (`prose` classes) for public rendering.

## Current focus:
- Stability, polishing transitions, and preparing for deployment.
