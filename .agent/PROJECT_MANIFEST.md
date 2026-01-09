# PROJECT MANIFEST: Sanctuary Booking App

## 1. Core Technology Stack (2026 Standards)
- **Framework:** Next.js 16.0.5 (App Router)
- **Frontend:** React 19.2.0
- **Styling:** Tailwind CSS 3.4 + shadcn/ui
- **Tooling:** Biome 2.3.8 (Linting & Formatting - zero ESLint/Prettier)
- **Language:** TypeScript 5.6+ (Strict mode)
- **Database:** Supabase (Postgres) + Drizzle ORM 0.44.7
- **i18n:** `next-intl` 4.6.1 (Localized routes: `/[locale]/...`)
- **Animation:** Framer Motion 12 + Lenis (Smooth Scroll)
- **Rich Text:** Tiptap 3.14 (Headless)

## 2. Architectural Patterns
- **Localized Routes:** All routes are wrapped in `[locale]` for English (en) and Serbian (sr) support.
- **DAL (Data Access Layer):** Direct database queries are isolated in `src/dal/`.
- **Server Actions:** All mutations (Create/Update/Delete) are handled via Server Actions in feature directories.
- **Shared Components:** Atomic UI elements reside in `src/components/shared/`.
- **Content Storage:** Rich text descriptions are stored as raw HTML strings in the database.

## 3. Implementation Rules (Non-Negotiable)
- **Design Fidelity:** Luxury aesthetic. Use `rounded-[2.5rem]` for main containers and `rounded-xl` for interactive elements.
- **Content Rendering:**
    - **Previews/Lists:** ALWAYS wrap descriptions in the `stripHtml()` utility from `@/lib/utils` to prevent raw HTML display.
    - **Detail Pages:** ALWAYS use `<div className="prose prose-stone ...">` with `dangerouslySetInnerHTML` to render formatted content.
- **Formatting:** ALWAYS use `npm run lint` (Biome) before finishing a task.

## 4. Key Entities
- **Apartments:** Main rental units. Fields include `name`, `description`, `price`, `images` (Cloudinary/Storage).
- **Attractions:** Points of interest. Fields include `title`, `description` (short), `longDescription` (rich text), `distance`.
- **Admin Users:** Access controlled via `admin_users` table with a Super Admin fallback via environment variables.
