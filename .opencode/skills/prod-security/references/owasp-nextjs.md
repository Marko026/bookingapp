# OWASP Top 10 + Next.js + Supabase Security Checklist

Reference guide for the prod-security skill. Maps OWASP Top 10 (2025) to concrete checks for Next.js App Router + Supabase + Drizzle stacks.

---

## A01:2021 — Broken Access Control

### Next.js specific

- [ ] Every admin route has middleware auth check
- [ ] Admin server actions verify role independently (not just relying on middleware)
- [ ] API routes (`src/app/api/**/route.ts`) check auth — middleware may skip them
- [ ] No IDOR: database queries filter by authenticated user ID, not just request parameter ID
- [ ] `export const dynamic = "force-dynamic"` on routes that need fresh auth state
- [ ] No `revalidate` cache serving authenticated content to unauthenticated users

### Supabase specific

- [ ] RLS policies enabled on all tables
- [ ] No anonymous access to protected tables
- [ ] Service role key only used in admin/server-only contexts
- [ ] `anon` key cannot bypass RLS

### Drizzle specific

- [ ] Queries use `.where(eq(table.userId, authUserId))` pattern
- [ ] No raw SQL with user-provided values
- [ ] No queries that select by ID without ownership check

---

## A02:2021 — Cryptographic Failures

- [ ] HTTPS enforced (HSTS header set)
- [ ] No sensitive data in URL parameters
- [ ] Session tokens use HttpOnly + Secure + SameSite cookies
- [ ] Password reset tokens are single-use and time-limited
- [ ] No plaintext storage of sensitive data
- [ ] Supabase JWTs have appropriate expiry

---

## A03:2021 — Injection

### Server actions

- [ ] All server actions use Zod validation (`createSafeAction`)
- [ ] No raw `formData.get()` without schema validation
- [ ] File uploads validate type, size, and sanitize filename
- [ ] No `eval()`, `Function()`, or `document.write()` with user input

### SQL injection (Drizzle)

- [ ] All queries use Drizzle query builder (parameterized)
- [ ] No `sql` template tag with string interpolation of user input
- [ ] No raw query methods with unsanitized input

### XSS

- [ ] No `dangerouslySetInnerHTML` with unsanitized user content
- [ ] No `innerHTML` assignments with user content
- [ ] Content Security Policy header set
- [ ] User-generated HTML sanitized server-side before storage/rendering

### HTML injection

- [ ] Email templates escape user-provided values
- [ ] No user input in `<meta>`, `<title>`, or `<script>` tags without encoding

---

## A04:2021 — Insecure Design

- [ ] Rate limiting on authentication endpoints
- [ ] Rate limiting on form submissions
- [ ] Account lockout after failed login attempts
- [ ] File upload size limits enforced
- [ ] Pagination limits on data retrieval endpoints
- [ ] No mass assignment vulnerabilities (Zod strips extra fields)

---

## A05:2021 — Security Misconfiguration

### Headers

- [ ] `Content-Security-Policy` set
- [ ] `X-Content-Type-Options: nosniff` set
- [ ] `X-Frame-Options: DENY` or `SAMEORIGIN` set
- [ ] `Strict-Transport-Security` set
- [ ] `Referrer-Policy` set
- [ ] `Permissions-Policy` set
- [ ] `X-Powered-By: Next.js` header removed

### Environment

- [ ] `.env` files in `.gitignore`
- [ ] No secrets in source code
- [ ] Debug mode disabled in production
- [ ] Source maps not exposed in production
- [ ] Default credentials changed
- [ ] Unnecessary features disabled (directory listing, etc.)

### Supabase

- [ ] Service role key not exposed to client
- [ ] Storage buckets have appropriate access policies
- [ ] No public access to private buckets

---

## A06:2021 — Vulnerable and Outdated Components

- [ ] `npm audit` passes with no critical/high vulnerabilities
- [ ] Dependencies regularly updated
- [ ] `package-lock.json` committed to repo
- [ ] No deprecated packages in use
- [ ] Next.js version is current and patched

---

## A07:2021 — Identification and Authentication Failures

- [ ] Supabase auth used (not custom auth implementation)
- [ ] `getUser()` used instead of `getSession()` for server-side auth (session can be spoofed)
- [ ] No credential stuffing vulnerability (rate limiting, MFA for admin)
- [ ] Password policy enforced (via Supabase config)
- [ ] Session management handled by Supabase (refresh tokens, expiry)
- [ ] Admin access has additional verification layer

---

## A08:2021 — Software and Data Integrity Failures

- [ ] CI/CD pipeline validates build integrity
- [ ] No unverified CDN resources (subresource integrity)
- [ ] Webhook endpoints validate signatures
- [ ] Cron endpoints validate `CRON_SECRET`
- [ ] No `unsafe-eval` or `unsafe-inline` in CSP (or only with nonce/hash)

---

## A09:2021 — Security Logging and Monitoring Failures

- [ ] Failed login attempts logged
- [ ] Admin actions logged
- [ ] Error monitoring configured (Sentry, Datadog, etc.)
- [ ] No sensitive data in logs (passwords, tokens, PII)
- [ ] Alert on suspicious activity patterns
- [ ] Audit trail for data modifications

---

## A10:2021 — Server-Side Request Forgery (SSRF)

- [ ] No user-controlled URL fetching on server
- [ ] No user-controlled redirect to internal URLs
- [ ] No image processing from user-provided URLs without validation
- [ ] Fetch/Axios calls on server don't use user-provided URLs
- [ ] Private IP ranges blocked if URL fetching is needed

---

## Next.js App Router Specific Checks

### Middleware

- [ ] Middleware covers all protected routes (check matcher config)
- [ ] API routes not accidentally excluded from middleware
- [ ] Middleware does not block static assets
- [ ] Locale handling doesn't bypass auth checks

### Server Components vs Client Components

- [ ] Sensitive data only in Server Components
- [ ] No secrets passed as props to Client Components
- [ ] `"use server"` actions don't expose sensitive data
- [ ] Server-only modules use `import "server-only"`

### Data Fetching

- [ ] ISR pages don't cache personalized content
- [ ] No authenticated data in cached responses
- [ ] `revalidate` time appropriate for data sensitivity
- [ ] `no-store` for dynamic authenticated content

### Caching

- [ ] No auth tokens in cached pages
- [ ] Cache headers set appropriately per route
- [ ] Private data not cached at CDN level

---

## Supabase-Specific Deep Checks

### Row Level Security

- [ ] All tables have RLS enabled
- [ ] RLS policies exist for all access patterns
- [ ] No `WITH CHECK` clause that allows any insert
- [ ] Service role key bypasses RLS — used only for admin operations
- [ ] Anon key is properly restricted by RLS

### Auth

- [ ] JWT expiry configured appropriately
- [ ] Refresh token rotation enabled
- [ ] Email confirmation required
- [ ] No unverified email access to protected resources

### Storage

- [ ] Upload size limits configured
- [ ] Allowed MIME types restricted
- [ ] No public buckets for private content
- [ ] Image transformations don't expose metadata

### Database

- [ ] No direct SQL execution with user input
- [ ] Connection pooling configured (via Supabase or PgBouncer)
- [ ] Database backups configured
- [ ] No sensitive data in public schemas
