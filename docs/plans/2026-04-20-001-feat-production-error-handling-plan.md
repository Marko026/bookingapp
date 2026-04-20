---
title: Produkcijski Error Handling Sistem
type: feat
status: active
date: 2026-04-20
---

# Produkcijski Error Handling Sistem

## Overview

Implementacija kompletnog error handling sistema koji osigurava da korisnici u produkciji nikada ne vide server-side greške (stack trace-ove, DB detalje, interne poruke). Umesto toga, prikazuju se user-friendly poruke dok se greške sigurno loguju za debugging.

## Problem Frame

Trenutno stanje:
- `safe-action.ts` vraća `error.message` direktno korisniku (linija 54-57)
- 47 `console.error` poziva širom codebase-a bez konteksta
- Nema razlikovanja između development i production režima
- API routes ponekad vraćaju interne detalje grešaka
- Nema centralizovanog error reporting mehanizma

Posledice:
- Potencijalni security rizik (exposure internih detalja)
- Loše UX (tehničke poruke umesto razumljivih objašnjenja)
- Težak debugging u produkciji (nedostatak konteksta uz greške)

## Requirements Trace

- **R1.** Server actions nikada ne smeju vratiti raw error message klijentu
- **R2.** User-friendly poruke na srpskom za sve common error scenarije
- **R3.** Detaljni logging sa kontekstom (userId, action, metadata) za debugging
- **R4.** API routes vraćaju generičke 500 poruke bez internih detalja
- **R5.** Error boundaries ostaju funkcionalni (već implementirani)
- **R6.** Environment-based ponašanje (više detalja u dev, manje u prod)

## Scope Boundaries

- **Uključeno:** Server actions, API routes, DAL layer, auth utilities
- **Uključeno:** Centralizovani logger sa kontekstom
- **Uključeno:** Error message mapping sistem
- **Isključeno:** Integracija eksternih servisa (Sentry, LogRocket) - samo priprema
- **Isključeno:** Client-side error handling (već pokriveno toasts)

## Context & Research

### Relevant Code and Patterns

- `src/lib/safe-action.ts` - Wrapper za server actions, **ključan za R1**
- `src/lib/toast.ts` - Postojeći toast sistem za prikaz grešaka
- `src/app/api/cron/keep-alive/route.ts` - Već ima dobar pattern (generička 500 poruka)
- `src/app/global-error.tsx` i `src/app/[locale]/error.tsx` - Već implementirani
- `src/env.ts` - Environment validation, proveriti NODE_ENV pristup

### Postojeći Error Handling Pattern

```typescript
// Trenutno - problematično (safe-action.ts:54-57)
message: error instanceof Error ? error.message : "An unexpected error occurred"

// Cilj
message: getUserFriendlyErrorMessage(error) // Mapira na srpsku poruku
```

## Key Technical Decisions

1. **Error Classification System**: Sve greške se klasifikuju u tipove (DB_ERROR, AUTH_ERROR, VALIDATION_ERROR, UNKNOWN_ERROR)

2. **Environment-aware Logging**: U developmentu loguje se sve, u produkciji samo esencijalno bez osetljivih podataka

3. **Centralizovana Error Utility**: `src/lib/error-handling.ts` sadrži sve error-related funkcije

4. **Safe-action Update**: Modifikacija wrappera da koristi novi sistem umesto direktnog vraćanja error.message

## Implementation Units

- [ ] **Unit 1: Error Types i Classification Utility**

**Goal:** Definisati TypeScript tipove i klasifikaciju za sve error scenarije

**Requirements:** R1, R6

**Dependencies:** None

**Files:**
- Create: `src/lib/error-types.ts`

**Approach:**
- Definisati `AppError` interface sa `type`, `message`, `userMessage`, `context`
- Kreirati error type enum (DATABASE_ERROR, AUTH_ERROR, VALIDATION_ERROR, EXTERNAL_API_ERROR, UNKNOWN_ERROR)
- Exportovati type guard funkcije (`isDatabaseError`, `isAuthError`)

**Patterns to follow:**
- Postojeći pattern u `src/lib/safe-action.ts` za ActionState

**Test scenarios:**
- Happy path: Kreiranje AppError sa svim poljima
- Edge case: Error bez optional context polja
- Error path: Pokušaj kreiranja sa nevalidnim type

**Verification:**
- TypeScript kompajlira bez grešaka
- Svi error tipovi su pokriveni

---

- [ ] **Unit 2: User-friendly Message Mapping**

**Goal:** Mapa error tipova na srpske user-friendly poruke

**Requirements:** R2

**Dependencies:** Unit 1

**Files:**
- Create: `src/lib/error-messages.ts`

**Approach:**
- Objekat mapiranja `errorType -> srpska poruka`
- Default fallback poruka za nepoznate greške
- Funkcija `getUserFriendlyMessage(errorType: ErrorType): string`
- Poruke kratke, jasne, akcija-orijentisane ("Došlo je do greške. Pokušajte ponovo." umesto "Database connection timeout")

**Technical design:**
```typescript
const errorMessages: Record<ErrorType, string> = {
  DATABASE_ERROR: "Došlo je do problema sa bazom podataka. Pokušajte ponovo za par trenutaka.",
  AUTH_ERROR: "Nemate dozvolu za ovu akciju. Prijavite se ponovo.",
  VALIDATION_ERROR: "Proverite unete podatke i pokušajte ponovo.",
  EXTERNAL_API_ERROR: "Spoljni servis trenutno nije dostupan. Pokušajte kasnije.",
  UNKNOWN_ERROR: "Došlo je do neočekivane greške. Molimo vas da osvežite stranicu."
};
```

**Test scenarios:**
- Happy path: Svaki ErrorType vraća odgovarajuću poruku
- Edge case: Nepoznat error type vraća fallback

**Verification:**
- Sve poruke su na srpskom
- Fallback postoji i testiran

---

- [ ] **Unit 3: Environment-aware Logger**

**Goal:** Centralizovani logger koji razlikuje dev/prod i dodaje kontekst

**Requirements:** R3, R6

**Dependencies:** Unit 1

**Files:**
- Create: `src/lib/logger.ts`

**Approach:**
- Interfejs `LogContext` sa opcionim poljima (userId, action, metadata)
- Funkcije: `logError`, `logWarn`, `logInfo`
- U developmentu: detaljan log sa stack trace-om
- U produkciji: strukturirani log bez osetljivih podataka (bez passworda, tokena)
- Dodati timestamp i request ID za praćenje

**Technical design:**
```typescript
interface LogContext {
  userId?: string;
  action?: string;
  path?: string;
  metadata?: Record<string, unknown>;
}

export function logError(
  error: unknown, 
  context?: LogContext
): void {
  const isDev = process.env.NODE_ENV === "development";
  // Dev: full details, Prod: sanitized
}
```

**Patterns to follow:**
- Postojeći `console.error` pozivi pokazuju potreban kontekst (user, action)

**Test scenarios:**
- Happy path: Logovanje greške sa kontekstom
- Edge case: Logovanje bez konteksta
- Integration: Provera da li se u prod ne loguju osetljivi podaci

**Verification:**
- Logger se koristi umesto console.error u najmanje 3 mesta kao proof-of-concept

---

- [ ] **Unit 4: Error Handling Utility Functions**

**Goal:** Centralizovane funkcije za obradu grešaka koje se koriste širom aplikacije

**Requirements:** R1, R2, R6

**Dependencies:** Unit 1, Unit 2, Unit 3

**Files:**
- Create: `src/lib/error-handling.ts`

**Approach:**
- `handleError(error: unknown, context?: LogContext): AppError` - glavna funkcija
- `classifyError(error: unknown): ErrorType` - prepoznaje tip greške iz Error objekta ili stringa
- `sanitizeErrorForProduction(error: unknown): string` - vraća samo user-friendly poruku

**Technical design:**
```typescript
export function handleError(
  error: unknown, 
  context?: LogContext
): { success: false; message: string } {
  const errorType = classifyError(error);
  const userMessage = getUserFriendlyMessage(errorType);
  
  // Log the full error internally
  logError(error, context);
  
  return { success: false, message: userMessage };
}
```

**Test scenarios:**
- Happy path: Database error → DATABASE_ERROR type → user-friendly message
- Happy path: Auth error → AUTH_ERROR type → auth message
- Edge case: Unknown error → UNKNOWN_ERROR → fallback message
- Integration: Logger pozvan sa ispravnim kontekstom

**Verification:**
- Funkcija pokrivena testovima za sve error tipove
- Nijedan test ne proverava error.message direktno

---

- [ ] **Unit 5: Update safe-action.ts Wrapper**

**Goal:** Modifikacija da koristi novi error handling umesto direktnog vraćanja error.message

**Requirements:** R1, R2, R6

**Dependencies:** Unit 4

**Files:**
- Modify: `src/lib/safe-action.ts`

**Approach:**
- Import `handleError` iz `error-handling.ts`
- U catch bloku: zameniti `error.message` sa `handleError(error, { action: "createSafeAction" }).message`
- Sačuvati backward compatibility za `errors` field (validation errors)

**Current code to replace (lines 50-58):**
```typescript
} catch (error) {
  console.error("Action Error:", error);
  return {
    success: false,
    message: error instanceof Error ? error.message : "An unexpected error occurred",
  };
}
```

**Patterns to follow:**
- Sačuvati isti return type `ActionState<T>`
- Zadržati postojeći handling za Zod validation errors (lines 32-41)

**Test scenarios:**
- Happy path: Validacija prođe, action uspešan
- Error path: Action baci grešku → vraća user-friendly message (ne raw error.message)
- Edge case: Zod validation error → vraća field errors kao i do sada
- Integration: Logger je pozvan kada dođe do greške

**Verification:**
- Postojeći testovi za actions prolaze
- Rucno testiranje: throw new Error("Internal DB details") → user vidi srpsku poruku

---

- [ ] **Unit 6: Update API Routes Error Handling**

**Goal:** Osigurati da API routes vraćaju generičke poruke bez internih detalja

**Requirements:** R4

**Dependencies:** Unit 4

**Files:**
- Modify: `src/app/api/cron/keep-alive/route.ts` (već dobro, samo proveriti)
- Create: `src/lib/api-error-handler.ts` (utility za API routes)

**Approach:**
- Kreirati `handleApiError(error, context)` koji vraća `NextResponse.json` sa generičkom porukom
- Proveriti postojeće API routes i primeniti isti pattern
- Status codes: 500 za server errors, 400 za validation

**Technical design:**
```typescript
export function handleApiError(
  error: unknown, 
  context?: LogContext
): NextResponse {
  const result = handleError(error, context);
  return NextResponse.json(
    { success: false, error: result.message },
    { status: 500 }
  );
}
```

**Test scenarios:**
- Happy path: API uspešno vraca podatke
- Error path: API baci grešku → vraća 500 sa user-friendly porukom
- Integration: Logger pozvan sa API path kontekstom

**Verification:**
- Svi API routes vraćaju generičke poruke u error slučaju
- Nijedan API route ne vraća stack trace ili interne detalje

---

- [ ] **Unit 7: Migrate Existing console.error Calls (Phase 1)**

**Goal:** Početna migracija kritičnih console.error poziva na novi logger

**Requirements:** R3

**Dependencies:** Unit 3

**Files:**
- Modify: `src/lib/auth.ts` (4 console.error poziva)
- Modify: `src/lib/auth-server.ts` (1 console.error)
- Modify: `src/lib/email.ts` (3 console.error)

**Approach:**
- Zameniti `console.error` sa `logError`
- Dodati kontekst gde je moguće (userId, action)
- Fokus na auth i email jer su kritični za security

**Example migration:**
```typescript
// Before
console.error("Login error:", error);

// After
logError(error, { action: "login", path: "/admin/login" });
```

**Test scenarios:**
- Happy path: Error se loguje sa kontekstom
- Edge case: Error bez konteksta (fallback na basic log)
- Integration: Log se pojavljuje u konzoli kao i ranije (ali strukturiraniji)

**Verification:**
- Nema više `console.error` u modifikovanim fajlovima
- Logger pozivi sadrže relevantan kontekst

---

- [ ] **Unit 8: Testiranje i Verifikacija**

**Goal:** Kompletno testiranje error handling sistema

**Requirements:** R1, R2, R3, R4, R5, R6

**Dependencies:** Sve prethodne jedinice

**Files:**
- Create: `src/lib/__tests__/error-handling.test.ts`
- Create: `src/lib/__tests__/logger.test.ts`

**Approach:**
- Unit testovi za `classifyError`, `getUserFriendlyMessage`, `handleError`
- Testovi za logger (provera da li u prod ne loguje osetljive podatke)
- Integration test: Simulacija greške u server action → provera da li klijent dobija user-friendly poruku

**Test scenarios:**
- Unit: classifyError prepoznaje različite error tipove
- Unit: getUserFriendlyMessage vraća srpske poruke
- Unit: Logger u prod režimu ne loguje osetljive podatke
- Integration: Server action greška → user-friendly message (ne raw)
- Integration: API route greška → generička 500 poruka
- E2E: Error boundary prikazuje srpsku poruku

**Verification:**
- Svi testovi prolaze
- Manual test: throw error u action → toast prikazuje srpsku poruku

---

## System-Wide Impact

### Interaction Graph

- **Server Actions** → `safe-action.ts` (modifikovan) → `error-handling.ts` → `logger.ts`
- **API Routes** → `api-error-handler.ts` → `error-handling.ts` → `logger.ts`
- **Auth utilities** → `logger.ts` (za security audit trail)
- **Error Boundaries** → Ostaju nepromenjeni (već implementirani)

### Error Propagation

```
Error occurs
    ↓
handleError() klasifikuje tip
    ↓
logError() loguje sa kontekstom (interno)
    ↓
getUserFriendlyMessage() vraća srpsku poruku (klijentu)
```

### Unchanged Invariants

- `error.tsx` i `global-error.tsx` boundary komponente se **ne modifikuju** (već su dobre)
- Toast sistem (`sonner`) ostaje nepromenjen - samo se user-friendly message prosleđuje njemu
- Zod validation errors i dalje vraćaju field-level errors kao i do sada

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Breaking change u action response format | Sačuvati isti `ActionState` interface; samo message se menja |
| Logger može prouzrokovati performance issue | Logger je async-free, samo console u dev; u prod može se dodati debounce |
| Nedostatak test coverage | Obavezno Unit 8 sa testovima pre merge-a |
| Environment detection ne radi | Eksplicitno testirati `process.env.NODE_ENV` ponašanje |

## Documentation / Operational Notes

### Za Developerke

- Uvek koristiti `handleError()` umesto direktnog `error.message`
- Dodavati kontekst u logger za lakše debugovanje: `logError(err, { userId, action })`
- User-friendly poruke su na srpskom - ne dodavati nove engleske poruke

### Monitoring

- Logger output treba pregledati u produkciji (Vercel logs)
- Čest `DATABASE_ERROR` može ukazivati na problem sa konekcijom
- Čest `AUTH_ERROR` može ukazivati na brute force pokušaje

### Future Considerations (van scope-a)

- Integracija sa Sentry-jem ili sličnim servisom
- Error rate alerting (npr. webhook na Slack)
- User feedback forma na error page-ovima
