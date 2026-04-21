# Secure Patterns Reference

Production-ready security patterns with code examples. Use during Phase 6 to provide concrete fixes for findings.

---

## Auth Patterns

### PATTERN: Layered auth check

Every protected operation checks auth at TWO levels:

1. **Middleware** — redirects unauthenticated users (UX layer)
2. **Server action** — independently verifies auth (security layer)

```typescript
// middleware.ts — UX layer
if (isAdminPath && !user) return redirect("/login");

// actions.ts — Security layer (independent of middleware)
export const deleteApartment = createSafeAction(deleteSchema, async (input, ctx) => {
  const user = await verifyAdmin(ctx.supabase);
  if (!user) throw new Error("Unauthorized");
  await db.delete(apartments).where(eq(apartments.id, input.id));
});
```

### PATTERN: Single source of truth for roles

```typescript
// auth-server.ts — ONE canonical check
export async function verifyAdmin(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  return adminRecord?.role === "admin" ? user : null;
}
```

### PATTERN: Rate limiting for auth endpoints

```typescript
// rate-limit.ts
const loginLimiter = createRateLimiter({ maxRequests: 5, windowMs: 5 * 60 * 1000 });

export async function loginAction(formData: FormData) {
  const rateLimitResult = checkRateLimit(loginLimiter, ip);
  if (!rateLimitResult.allowed) {
    return { error: "Too many attempts. Try again later." };
  }
  // ... auth logic
}
```

---

## Input Validation Patterns

### PATTERN: All server actions use createSafeAction

```typescript
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";

const createBookingSchema = z.object({
  apartmentId: z.string().uuid(),
  checkIn: z.string().date(),
  checkOut: z.string().date(),
  guestName: z.string().min(1).max(100),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(1).max(30),
});

export const createBooking = createSafeAction(createBookingSchema, async (input) => {
  // input is fully validated and typed
  // ... business logic
});
```

### PATTERN: Strict file upload validation

```typescript
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function validateFileUpload(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("File too large");
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return { ...file, safeName };
}
```

### PATTERN: Safe HTML rendering

```typescript
import { sanitizeHtml } from "@/lib/security";

function RichContent({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}
```

---

## Data Protection Patterns

### PATTERN: Server-only module guard

```typescript
// lib/supabase-admin.ts
import "server-only";

import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";

export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);
```

### PATTERN: Select only needed fields

```typescript
const bookings = await db.select({
  id: bookingsTable.id,
  apartmentName: apartmentsTable.name,
  checkIn: bookingsTable.checkIn,
  checkOut: bookingsTable.checkOut,
  status: bookingsTable.status,
}).from(bookingsTable)
  .innerJoin(apartmentsTable, eq(bookingsTable.apartmentId, apartmentsTable.id))
  .where(eq(bookingsTable.userId, userId));
```

### PATTERN: Environment validation with Zod

```typescript
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    CRON_SECRET: z.string().min(1),
    ADMIN_EMAIL_1: z.string().email(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    // ... all vars
  },
});
```

---

## HTTP Security Headers Pattern

### PATTERN: Complete security headers in next.config

```typescript
// next.config.ts
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-XSS-Protection", value: "0" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://*.supabase.co",
      "font-src 'self'",
      "frame-src 'none'",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

module.exports = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
};
```

---

## Cookie Security Pattern

### PATTERN: Secure cookie configuration

```typescript
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};
```

---

## Infrastructure Patterns

### PATTERN: Protected API route

```typescript
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... handler logic
}
```

### PATTERN: Safe redirect validation

```typescript
function safeRedirect(url: string): string {
  const ALLOWED_ORIGINS = ["/", "/admin/dashboard", "/bookings"];
  try {
    const parsed = new URL(url, "http://localhost");
    if (parsed.origin !== "http://localhost" && !ALLOWED_ORIGINS.includes(parsed.pathname)) {
      return "/";
    }
    return ALLOWED_ORIGINS.includes(parsed.pathname) ? url : "/";
  } catch {
    return "/";
  }
}
```

### PATTERN: Error handling without information leakage

```typescript
try {
  await riskyOperation();
} catch (error) {
  console.error("Operation failed:", error); // server-side log
  return { error: "An unexpected error occurred. Please try again." }; // client-safe
}
```
