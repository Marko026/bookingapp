# AGENTS.md

## Commands

### Development
```powershell
npm run dev           # Start Next.js dev server (localhost:3000)
npm run build         # Production build
npm run start         # Start production server
```

### Code Quality
```powershell
npm run lint          # Run Biome with auto-fix
npm run format        # Run Biome formatting with auto-fix
npm run check         # Biome checks only (no fixes)
```

### Testing
```powershell
npm run test                    # Run Vitest tests
CI=true npm test                # Run once (non-interactive, CI)
npx vitest src/dal/__tests__/apartments.test.ts  # Single test file
```

### Database
```powershell
npx drizzle-kit generate    # Generate migrations from schema
npx drizzle-kit migrate     # Apply migrations
npx drizzle-kit studio      # Open Drizzle Studio (DB GUI)
```

## Code Style Guidelines

### TypeScript
- Named exports only (NO default exports)
- Use `const` or `let` (NEVER `var`)
- Avoid `any` type (use `unknown` or specific types)
- Avoid type assertions (`as`, `!`) without justification
- Use `private` modifier, NOT `#private` fields (public is default)

### Formatting
- Single quotes for strings, template literals for interpolation
- Explicit semicolons (do NOT rely on ASI)
- Use `===` and `!==` (NEVER `==` or `!=`)
- `UpperCamelCase` for types/classes, `lowerCamelCase` for variables/functions

### Imports
- Use absolute imports from `src/` (configured in tsconfig.json)
- Group imports: external → internal → relative

### Database (CRITICAL)
- ALL database queries MUST be in `src/dal/`
- NEVER call Drizzle directly in components or Server Actions
- DAL functions: pure query logic, no business logic

### Server Actions
- ALL mutations use `createSafeAction` from `src/lib/safe-action.ts`
- Return type: `ActionState<T>` with `success`, `data`, `message`, `errors`
- Input validation via Zod schemas

### Forms & Validation
- Use React Hook Form + Zod for all forms
- Zod schemas define both validation AND types
- Use `@hookform/resolvers` for integration

### Internationalization
- ALL user-facing text MUST use `next-intl`
- Translation files: `messages/en.json`, `messages/sr.json`
- Add both English and Serbian translations for new features

### Environment Variables
- Access env vars ONLY via `src/env.ts` (Zod-validated)
- NEVER use `process.env` directly in code

### Testing
- Unit tests for ALL DAL functions in `src/dal/__tests__/`
- Target: >80% code coverage
- Use Vitest with `vitest-mock-extended` for mocking Drizzle

### Git Commit Format
```
<type>(<scope>): <description>
Types: feat, fix, docs, style, refactor, test, chore
```

## Tech Stack
- Next.js 16 + React 19 + TypeScript
- PostgreSQL via Supabase + Drizzle ORM
- Tailwind CSS + Shadcn UI + Framer Motion
- Biome (linting/formatting)
- next-intl (i18n)
- Supabase Auth (JWT-based)
