---
name: prod-security
description: "Production-ready security audit for full codebase. Scans auth, input validation, data protection, infrastructure, and dependencies. Use before deployment, after major changes, or on new projects. Triggers on 'security audit', 'security check', 'production ready', 'security review', 'hardening', 'security hardening', or 'pen test prep'."
argument-hint: "[quick|auth-only|fix|full]"
---

# Production Security Audit

Full-codebase security audit that finds vulnerabilities before they reach production. Unlike diff-based reviewers, this skill scans the entire project — every route, every auth check, every input path, every secret.

## Modes

Parse `$ARGUMENTS` for mode tokens:

| Mode | Token | Behavior |
|------|-------|----------|
| **Full** (default) | (no token) or `full` | All 6 phases, complete report |
| **Quick** | `quick` | Phase 1 + Phase 2 + Phase 3 only, P0/P1 findings only |
| **Auth-only** | `auth-only` | Phase 1 inventory + Phase 2 deep auth audit only |
| **Fix** | `fix` | Full audit + auto-apply all `safe_auto` fixes after report |

## Severity Scale

| Level | Meaning | Action |
|-------|---------|--------|
| **P0** | Exploitable vulnerability — auth bypass, injection, data breach | Must fix before any deployment |
| **P1** | High-risk weakness — likely exploited in normal usage | Must fix before production |
| **P2** | Moderate risk — exploitable in specific scenarios | Should fix, defense in depth |
| **P3** | Low risk / hardening improvement | Fix if straightforward |

## Action Routing

| `autofix_class` | Owner | Meaning |
|-----------------|-------|---------|
| `safe_auto` | `audit-fixer` | Deterministic fix, no behavior change (add validation, tighten CSP, remove exposed secret reference) |
| `gated_auto` | `human` | Concrete fix exists but changes behavior, permissions, or contracts |
| `manual` | `human` | Requires design decision or architecture change |
| `advisory` | `human` | Report-only — hardening recommendations, monitoring suggestions |

## Execution Flow

| Phase | Name | Purpose |
|-------|------|---------|
| 0 | Mode detection | Parse arguments, set scope |
| 1 | Inventory | Map entire attack surface — routes, auth, data, deps |
| 2 | Auth & Access Control | Deep audit of authentication, authorization, sessions |
| 3 | Input Validation & Injection | XSS, SQLi, CSRF, injection, open redirect, path traversal |
| 4 | Data Protection & Secrets | PII, secrets, cookies, headers, CORS, CSP |
| 5 | Infrastructure & Dependencies | npm audit, exposed keys, bucket access, cron/webhook security |
| 6 | Report & Fix | Synthesize findings, apply safe fixes, deliver report |

---

### Phase 0: Mode Detection

Parse `$ARGUMENTS`. Set mode and adjust which phases run. Default is `full`.

If mode is `quick`: run Phase 1, Phase 2, Phase 3 only. Report only P0/P1.
If mode is `auth-only`: run Phase 1, Phase 2 only. Report all severities.
If mode is `fix`: run all phases, then auto-apply `safe_auto` fixes after Phase 6.

---

### Phase 1: Inventory — Map the Attack Surface

**Goal:** Build a complete map of every entry point, auth mechanism, data flow, and dependency. This map drives all subsequent phases.

Execute these scans in parallel:

**1.1 Route map**
```
Glob src/app/**/route.ts, src/app/**/page.tsx, src/app/**/layout.tsx
Glob src/app/api/**/*.ts
```
For each route, note: HTTP method, auth requirement (public/protected/admin), input parameters.

**1.2 Auth map**
```
Glob src/middleware.ts, src/lib/auth*.ts, src/lib/supabase*.ts
Grep for: getUser, getSession, admin, role, permission, authorize
```
Map the auth flow: login -> session -> role check -> access decision.

**1.3 Data map**
```
Glob src/db/schema.ts, src/db/**/*.ts, src/dal/**/*.ts
Grep for: .insert, .update, .delete, .from, unsafeSQL
```
Map tables, relations, and mutation entry points.

**1.4 Input map**
```
Glob src/features/*/actions.ts, src/**/actions.ts
Grep for: z.object, z.string, z.number, coerce, transform
```
Map every server action input schema and validation.

**1.5 Environment & secrets map**
```
Read src/env.ts
Glob .env*, .env.local, .env.production
Grep for: SECRET, KEY, PASSWORD, TOKEN, CREDENTIAL, API_KEY (in source, not env files)
```

**1.6 Dependency inventory**
```
Read package.json
```
Note all direct dependencies and their versions.

**Output:** A structured inventory object:

```
## Attack Surface Inventory

### Routes (N public, M protected, K admin)
- [list each route with auth level]

### Auth Flow
- [login method, session strategy, role model, middleware checks]

### Data Mutations
- [tables with insert/update/delete paths]

### Input Validation
- [server actions with/without Zod schemas]

### Environment
- [required vars, secret handling approach]

### Dependencies
- [key deps with versions]
```

---

### Phase 2: Auth & Access Control

**Goal:** Find every way an unauthorized user could access protected resources.

Load `@./references/attack-patterns.md` sections on auth before starting.

**2.1 Authentication flow audit**

Read every auth-related file identified in Phase 1. For each, verify:

- **Session validation**: Does every protected route check session? Is `getUser()` used (secure) vs `getSession()` (can be spoofed)?
- **Session expiry**: Are tokens refreshed? Is there idle timeout?
- **Login security**: Rate limiting on login? Account lockout? Brute force protection?
- **OAuth security**: State parameter validation? PKCE? Redirect URL whitelist?

**2.2 Authorization model audit**

- **RBAC consistency**: Is the same role check applied in middleware AND server actions AND API routes? Find gaps where middleware checks but server action doesn't (or vice versa).
- **IDOR (Insecure Direct Object Reference)**: Can user A access user B's data by changing an ID? Check every database query that uses user-provided IDs.
- **Privilege escalation**: Can a non-admin user call admin server actions directly? Check if admin actions verify role server-side.
- **Role source of truth**: Is there one source for admin role, or multiple conflicting ones? (e.g., env var fallback + DB table)

**2.3 Middleware coverage audit**

- Are there routes that should be protected but aren't matched by middleware?
- Does middleware exclude API routes that should be protected?
- Can auth checks be bypassed by direct API calls (skipping middleware)?

**2.4 Session security**

- Cookie attributes: `httpOnly`, `secure`, `sameSite`, `domain`, `path`
- Token storage: Are tokens accessible to client JS? LocalStorage vs HttpOnly cookies?
- CSRF protection: SameSite cookies? CSRF tokens for state-changing requests?

**Findings format:** For each issue, specify exact file:line, the attack scenario, and a concrete fix.

---

### Phase 3: Input Validation & Injection

**Goal:** Find every path where untrusted input enters the system without proper validation or sanitization.

Load `@./references/attack-patterns.md` sections on injection before starting.

**3.1 Server action input validation**

For every server action found in Phase 1:

- Does it use `createSafeAction` / Zod validation?
- Are there raw `formData.get()` calls without Zod?
- Does the schema cover ALL fields that are used? Extra fields silently dropped?
- Are there `coerce` transforms that could bypass validation (e.g., `z.coerce.string()` on objects)?
- Are file uploads validated (type, size, name sanitization)?

**3.2 XSS (Cross-Site Scripting)**

- `dangerouslySetInnerHTML` usage — is input sanitized?
- URL parameters reflected in HTML without encoding?
- `innerHTML` assignments in client components?
- Stored XSS: is user-generated content (reviews, descriptions) sanitized before storage AND before rendering?
- DOM-based XSS: `document.write`, `eval`, `Function()` constructor?

**3.3 SQL Injection**

- Are all database queries using parameterized/ORM methods (Drizzle)?
- Any raw SQL (`sql` template tag with string interpolation)?
- Any dynamic query construction based on user input?

**3.4 CSRF (Cross-Site Request Forgery)**

- Are state-changing operations (POST/PUT/DELETE) protected?
- SameSite cookie attribute?
- Next.js server actions have built-in CSRF via cookie check — verify this isn't circumvented.

**3.5 Open Redirect**

- Any `redirect(userInput)` patterns?
- Are redirect URLs validated against a whitelist?
- Login redirect after authentication — can it redirect to external site?

**3.6 Path Traversal**

- File operations using user input for paths?
- Image upload paths constructed from user input?
- Are paths normalized and validated?

**3.7 Other injection**

- HTML injection in email templates?
- Command injection via shell commands with user input?
- LDAP injection, XML injection if applicable?

---

### Phase 4: Data Protection & Secrets

**Goal:** Ensure sensitive data is protected at rest and in transit, and secrets never leak.

Load `@./references/secure-patterns.md` sections on data protection before starting.

**4.1 PII and sensitive data exposure**

- Are user emails, phone numbers, addresses exposed in API responses that don't need them?
- Is `select()` used in Supabase queries to limit returned fields, or does it return `*`?
- Are error messages leaking internal data (stack traces, SQL queries, file paths)?
- Are admin-only fields (role, email) leaking to non-admin users?

**4.2 Secrets management**

- Are secrets hardcoded in source code? Grep for common patterns:
  ```
  Grep: password\s*=\s*['"], api_key\s*=\s*['"], secret\s*=\s*['"], token\s*=\s*['"]
  ```
- Are `.env` files in `.gitignore`?
- Is `SUPABASE_SERVICE_ROLE_KEY` only used in server-only modules (`import "server-only"`)?
- Are secrets logged or included in error reports?

**4.3 Cookie security**

- `httpOnly`: Are session cookies inaccessible to JavaScript?
- `secure`: Are cookies only sent over HTTPS?
- `sameSite`: Are cookies protected against CSRF?
- `domain`/`path`: Are cookies scoped appropriately?

**4.4 HTTP security headers**

Check for existence and correctness of:

| Header | Required Value | Purpose |
|--------|---------------|---------|
| `Content-Security-Policy` | Restrictive policy | XSS prevention |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing prevention |
| `X-Frame-Options` | `DENY` or `SAMEORIGIN` | Clickjacking prevention |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | HTTPS enforcement |
| `X-XSS-Protection` | `0` (disabled, CSP replaces it) | Legacy browser XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer info control |
| `Permissions-Policy` | Restrictive | Feature access control |

Check `next.config.ts` for `headers()` configuration.

**4.5 CORS configuration**

- Are API routes accepting requests from any origin (`*`)?
- Are credentials allowed with wildcard origins?
- Is CORS configured for specific allowed origins?

**4.6 Data encryption**

- Is data encrypted in transit (HTTPS enforced)?
- Are sensitive fields encrypted at rest in the database?
- Are password reset tokens time-limited and single-use?

---

### Phase 5: Infrastructure & Dependencies

**Goal:** Find infrastructure-level vulnerabilities and dependency risks.

**5.1 Dependency audit**

Run:
```bash
npm audit --json
```

Classify findings:
- **Critical/High**: P0-P1 depending on exploitability
- **Moderate**: P2
- **Low**: P3

Check for known vulnerable packages. Note if `package-lock.json` exists and is committed.

**5.2 Supabase security**

- **Row Level Security**: Are RLS policies enabled on all tables? Can anonymous users read/write?
- **Storage bucket access**: Are storage buckets public when they shouldn't be?
- **Service role key exposure**: Is `SUPABASE_SERVICE_ROLE_KEY` used only in admin operations?
- **API key rotation**: Are keys versioned or rotated?

**5.3 Cron and webhook security**

- Is `CRON_SECRET` validated on cron endpoints?
- Are webhook endpoints validating signatures?
- Are background jobs idempotent and authenticated?

**5.4 Build and deployment**

- Is source map exposure in production? (`productionBrowserSourceMaps: false` in next.config)
- Are debug endpoints disabled in production?
- Is error reporting configured (Sentry, etc.)?
- Are development-only features gated by environment?

**5.5 Rate limiting and DoS**

- Are public endpoints rate-limited?
- Are file upload endpoints size-limited?
- Are there query endpoints that could be abused for data extraction?

---

### Phase 6: Report & Fix

**Goal:** Deliver an actionable report and apply safe fixes.

**6.1 Synthesize findings**

Collect all findings from Phases 2-5. For each finding:

- Verify the issue actually exists (re-read the code, don't rely on memory)
- Verify the line number is accurate
- Assign final severity (calibrate — style nits are never P0, SQL injection is never P3)
- Assign `autofix_class`:
  - `safe_auto`: Adding a validation, tightening a header, removing an exposed reference
  - `gated_auto`: Changing auth behavior, adding RLS, modifying cookie settings
  - `manual`: Architecture changes, design decisions
  - `advisory`: Recommendations without concrete code fix

**6.2 Quality gates**

Before delivering the report:

1. **Every finding is actionable.** "Consider X" is not a finding — rewrite with specific action.
2. **No false positives.** Verify the surrounding code was actually read. The "missing null check" might be handled by the caller.
3. **Severity is calibrated.** A missing rate limit on a public form is P1, not P0. An auth bypass is P0.
4. **Line numbers are accurate.** A finding pointing to the wrong line is worse than no finding.
5. **No duplicate findings.** Merge findings that point to the same root cause.
6. **Cross-reference findings.** If Phase 2 found an auth gap and Phase 3 found injection on the same endpoint, combine them into one finding with higher severity.

**6.3 Report format**

```markdown
# Production Security Audit Report

**Project:** [project name]
**Mode:** [full/quick/auth-only]
**Date:** [date]
**Scope:** [files scanned, routes analyzed, deps checked]

## Summary

| Severity | Count |
|----------|-------|
| P0 — Critical | N |
| P1 — High | M |
| P2 — Moderate | K |
| P3 — Low | J |

**Verdict:** [PRODUCTION READY / READY WITH FIXES / NOT READY]

---

### P0 — Critical

| # | File | Issue | Attack Scenario | Fix |
|---|------|-------|----------------|-----|
| 1 | `src/...` | [title] | [how exploited] | [concrete fix] |

### P1 — High

| # | File | Issue | Attack Scenario | Fix |
|---|------|-------|----------------|-----|
| 1 | `src/...` | [title] | [how exploited] | [concrete fix] |

### P2 — Moderate

[same table format]

### P3 — Low / Hardening

[same table format]

---

## Hardening Recommendations

- [advisory items]

## Dependency Audit Summary

- [npm audit results summary]

## Coverage

- Routes scanned: N
- Server actions scanned: M
- Auth flows verified: K
- Dependencies audited: J
```

**6.4 Fix phase (mode:fix only)**

If mode is `fix`, after presenting the report:

1. Collect all `safe_auto` findings
2. Apply each fix in order of severity (P0 first)
3. Re-verify each fix didn't break anything by reading the modified code
4. Present applied fixes summary
5. Ask user what to do with `gated_auto` findings:
   ```
   Safe fixes applied. What should I do with remaining findings?
   1. Review and approve specific gated fixes (Recommended)
   2. Leave as manual work items
   3. Report only — no further action
   ```

---

## Included References

### Attack Patterns

@./references/attack-patterns.md

### Secure Patterns

@./references/secure-patterns.md

### OWASP Next.js Checklist

@./references/owasp-nextjs.md

### Findings Schema

@./references/findings-schema.json
