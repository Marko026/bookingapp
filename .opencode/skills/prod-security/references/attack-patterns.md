# Attack Patterns Reference

Common attack patterns organized by category. Use this reference during Phases 2-5 to recognize vulnerability patterns in code.

---

## Authentication Attack Patterns

### PATTERN: getSession vs getUser

```typescript
// VULNERABLE — getSession() only reads client cookie, can be spoofed
const { data: { session } } = await supabase.auth.getSession();
if (session) { /* granted access */ }

// SECURE — getUser() verifies with Supabase server
const { data: { user } } = await supabase.auth.getUser();
if (user) { /* granted access */ }
```

**Impact:** Auth bypass — attacker can craft a fake JWT in cookie.
**Detection:** Grep for `getSession` used as auth gate.

### PATTERN: Middleware-only auth check

```typescript
// VULNERABLE — middleware checks auth, but server action doesn't
// middleware.ts
if (isAdminPath && !user) return redirect("/login");

// actions.ts — NO auth check!
export async function deleteApartment(id: string) {
  await db.delete(apartments).where(eq(apartments.id, id));
}
```

**Impact:** Server actions can be called directly via HTTP, bypassing middleware.
**Detection:** Server actions in admin features without own auth check.

### PATTERN: Double role source

```typescript
// VULNERABLE — two sources of truth for admin role
const isDbAdmin = adminRecord?.role === "admin";
const isEnvAdmin = allowedEmails.includes(user.email || "");
if (!isDbAdmin && !isEnvAdmin) { /* reject */ }
```

**Impact:** Env var fallback may grant admin to former employees, or DB role may diverge from env expectations.
**Detection:** Both DB lookup and env var check for same role.

### PATTERN: Missing rate limit on auth

```typescript
// VULNERABLE — no rate limiting on login
export async function loginAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
}
```

**Impact:** Brute force and credential stuffing attacks.
**Detection:** Auth endpoints without `checkRateLimit()` call.

### PATTERN: IDOR — Insecure Direct Object Reference

```typescript
// VULNERABLE — no ownership check
const booking = await db.select().from(bookings).where(eq(bookings.id, bookingId));

// SECURE — verify ownership
const booking = await db.select().from(bookings)
  .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)));
```

**Impact:** User A can read/modify user B's data by changing ID.
**Detection:** Database queries using user-provided IDs without user ID filter.

---

## Injection Attack Patterns

### PATTERN: Raw SQL with user input

```typescript
// VULNERABLE — SQL injection via string interpolation
const result = await db.execute(sql`SELECT * FROM apartments WHERE name LIKE '%${searchTerm}%'`);

// SECURE — parameterized via Drizzle
const result = await db.select().from(apartments)
  .where(ilike(apartments.name, `%${searchTerm}%`));
```

**Impact:** Full database compromise.
**Detection:** `sql` template tag with `${}` interpolation of user input.

### PATTERN: Missing Zod validation on server action

```typescript
// VULNERABLE — no input validation
export async function updateBooking(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  await db.update(bookings).set({ status }).where(eq(bookings.id, id));
}

// SECURE — Zod validated
const updateBookingSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "cancelled"]),
});
export const updateBooking = createSafeAction(updateBookingSchema, async (input) => {
  await db.update(bookings).set({ status: input.status }).where(eq(bookings.id, input.id));
});
```

**Impact:** Arbitrary data modification, injection.
**Detection:** `formData.get()` without Zod schema.

### PATTERN: Stored XSS via unsanitized content

```typescript
// VULNERABLE — user HTML rendered without sanitization
<div dangerouslySetInnerHTML={{ __html: apartment.description }} />

// SECURE — sanitize before rendering
import { sanitizeHtml } from "@/lib/security";
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(apartment.description) }} />
```

**Impact:** Cookie theft, session hijacking, worm propagation.
**Detection:** `dangerouslySetInnerHTML` with user content.

### PATTERN: Open redirect

```typescript
// VULNERABLE — redirect to user-provided URL
const redirectTo = searchParams.get("redirect") || "/";
redirect(redirectTo);

// SECURE — validate against whitelist
const ALLOWED_REDIRECTS = ["/", "/admin/dashboard", "/bookings"];
const redirectTo = searchParams.get("redirect") || "/";
if (!ALLOWED_REDIRECTS.includes(redirectTo)) redirect("/");
redirect(redirectTo);
```

**Impact:** Phishing, token theft via referrer.
**Detection:** `redirect()` with user-controlled input.

### PATTERN: Path traversal in file operations

```typescript
// VULNERABLE — user input in file path
const imagePath = `uploads/${userId}/${filename}`;
await fs.writeFile(imagePath, buffer);

// SECURE — validate and sanitize path
const safeFilename = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "");
const imagePath = path.join("uploads", userId, safeFilename);
if (!imagePath.startsWith(path.resolve("uploads"))) throw new Error("Invalid path");
```

**Impact:** Read/write arbitrary files on server.
**Detection:** File path construction with user input.

### PATTERN: CSRF via missing SameSite

```typescript
// VULNERABLE — cookies without SameSite
res.cookies.set("token", token, { httpOnly: true });

// SECURE — cookies with SameSite
res.cookies.set("token", token, { httpOnly: true, secure: true, sameSite: "lax" });
```

**Impact:** Cross-site request forgery.
**Detection:** Cookie setting without `sameSite` attribute.

---

## Data Exposure Attack Patterns

### PATTERN: Over-selecting from database

```typescript
// VULNERABLE — returns all columns including sensitive
const users = await db.select().from(usersTable);

// SECURE — select only needed columns
const users = await db.select({
  id: usersTable.id,
  name: usersTable.name,
}).from(usersTable);
```

**Impact:** PII exposure, data leaks.
**Detection:** `.select().from()` without column specification (returns all).

### PATTERN: Service role key in client code

```typescript
// VULNERABLE — service role key imported in client component
import { supabaseAdmin } from "@/lib/supabase-admin";

// SECURE — server-only import
import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";
```

**Impact:** Full database bypass of RLS, admin access from browser.
**Detection:** `supabaseAdmin` / `serviceRoleKey` used without `import "server-only"`.

### PATTERN: Error leaking internal details

```typescript
// VULNERABLE — stack trace exposed to user
return { error: err.message, stack: err.stack };

// SECURE — generic error message
return { error: "An unexpected error occurred" };
// Log details server-side only
console.error("Booking creation failed:", err);
```

**Impact:** Information disclosure aids further attacks.
**Detection:** `err.message`, `err.stack`, or SQL errors returned to client.

### PATTERN: Hardcoded secrets

```typescript
// VULNERABLE — secret in source code
const RESEND_KEY = "re_xxxxxxxxxxxx";
const WEBHOOK_SECRET = "whsec_abc123";

// SECURE — from environment
const RESEND_KEY = process.env.RESEND_API_KEY;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
```

**Impact:** Secret exposure via code repository.
**Detection:** String literals containing API keys, tokens, passwords.

---

## Infrastructure Attack Patterns

### PATTERN: Unprotected cron endpoint

```typescript
// VULNERABLE — no auth on cron
export async function GET() {
  await runScheduledTask();
  return Response.json({ ok: true });
}

// SECURE — validate cron secret
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  await runScheduledTask();
  return Response.json({ ok: true });
}
```

**Impact:** DoS, unauthorized task execution, cost abuse.
**Detection:** API route handlers without auth check.

### PATTERN: Missing security headers

```typescript
// VULNERABLE — no security headers in next.config
// (default Next.js has minimal headers)

// SECURE — add security headers
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Content-Security-Policy", value: "default-src 'self'; ..." },
];
```

**Impact:** XSS, clickjacking, MITM, information disclosure.
**Detection:** `next.config.ts` without `headers()` function.

### PATTERN: Source maps in production

```typescript
// VULNERABLE — source maps exposed
// next.config.ts
module.exports = { productionBrowserSourceMaps: true };

// SECURE — disable in production
module.exports = { productionBrowserSourceMaps: false };
```

**Impact:** Full source code exposure to attackers.
**Detection:** `productionBrowserSourceMaps: true` or missing (check default).
