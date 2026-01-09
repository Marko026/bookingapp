# Sanctuary Booking App - Project Context

## Project Overview
Sanctuary Booking App is a luxury-grade rental and booking platform built with **Next.js 16** and **React 19**. It features a modern, high-performance architecture utilizing **Supabase** for the database, **Drizzle ORM** for type-safe queries, and **Biome** for unified tooling. The application supports internationalization (English/Serbian) and focuses on a premium user experience with smooth animations and polished UI.

## Technology Stack

### Core
- **Framework:** Next.js 16.0.5 (App Router)
- **Runtime:** Node.js (Latest LTS recommended)
- **Language:** TypeScript 5.6+
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Drizzle ORM 0.44.7
- **Auth:** Supabase Auth + Custom Admin Logic
- **i18n:** `next-intl` 4.6.1

### Frontend & UI
- **Library:** React 19.2.0
- **Styling:** Tailwind CSS 3.4 + `shadcn/ui` components
- **Animations:** Framer Motion 12 + Lenis (Smooth Scroll)
- **Rich Text:** Tiptap (Headless)
- **Icons:** Lucide React
- **Maps:** React Leaflet

### Tooling
- **Linting & Formatting:** Biome 2.3.8 (Replaces ESLint/Prettier)
- **Testing:** Vitest
- **Validation:** Zod + React Hook Form

## Architecture & Patterns

### 1. Internationalized Routing
All pages are wrapped in a `[locale]` dynamic route segment (e.g., `src/app/[locale]/...`).
- **Middleware:** `src/middleware.ts` handles locale detection and redirection.
- **Routing:** `src/i18n/routing.ts` defines supported locales (`en`, `sr`).

### 2. Data Access Layer (DAL)
Direct database access is isolated in `src/dal/`.
- **Purpose:** Read-only operations, data fetching for Server Components.
- **Convention:** Functions return Drizzle queries directly.
- **Location:** `src/dal/apartments.ts`, `src/dal/bookings.ts`, etc.

### 3. Feature-Based Mutations
Write operations (Server Actions) are organized by feature in `src/features/`.
- **Location:** `src/features/<feature>/actions.ts`.
- **Safe Actions:** All actions use `src/lib/safe-action.ts` to ensure type safety, validation (Zod), and error handling.
- **Components:** Feature-specific components reside in `src/features/<feature>/components/`.

### 4. Admin System
- **Authentication:** Custom implementation using `admin_users` table and Supabase sessions.
- **Fallback:** Environment variable-based Super Admin access.
- **Emails:** Uses `Resend` for notifications (Guest confirmation, Admin alerts).

## Development Workflow

### Key Commands
| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the development server at `http://localhost:3000`. |
| `npm run build` | Build the application for production. |
| `npm run start` | Start the production server. |
| `npm run lint` | Run Biome check and fix linting/formatting issues. |
| `npm run format` | Run Biome format. |
| `npm run test` | Run Vitest unit tests. |

### Database Management
- **Schema:** `src/db/schema.ts`
- **Config:** `drizzle.config.ts`
- **Migrations:** Managed via Drizzle Kit (Check `package.json` for specific scripts, or use `npx drizzle-kit`).

## Conventions & Rules

### Code Style (Biome)
- **Strict Adherence:** The project uses Biome. Always run `npm run lint` before committing.
- **Imports:** Organized automatically by Biome.

### UI/UX Guidelines
- **Luxury Aesthetic:** Use rounded corners (`rounded-[2.5rem]` for containers, `rounded-xl` for elements).
- **Rich Text:**
  - **Input:** Use the `RichTextEditor` component (Tiptap).
  - **Output (List/Preview):** Strip HTML tags using `stripHtml` from `@/lib/utils`.
  - **Output (Detail):** Render using standard HTML parsing with Tailwind typography (`prose prose-stone`).

### Type Safety
- **Strict Mode:** TypeScript strict mode is enabled.
- **Zod:** Use Zod for all form validation and API input schemas.
- **Drizzle:** Use Drizzle's type inference for database models.

## Key Directories
- `src/app`: App Router pages and layouts.
- `src/components/ui`: Shadcn UI primitives.
- `src/components/shared`: Reusable app-specific components.
- `src/dal`: Data Access Layer (Reads).
- `src/db`: Database schema and connection.
- `src/features`: Business logic and Server Actions (Writes).
- `src/lib`: Utilities, configuration, and shared helpers.
- `messages`: Translation files (`en.json`, `sr.json`).
