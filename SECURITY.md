# Security overview

This file documents the security model of the NEDC platform and the
operational steps required to deploy it safely. It is intended for
maintainers and operators, not end users.

## What changed in the security pass

### Authentication
- Bcrypt cost is **12** (was 10) and the failure path runs bcrypt against a
  decoy hash so login latency is constant whether or not the email exists
  (prevents user enumeration via timing).
- **Per-account lockout**: 5 consecutive failed logins lock the account for
  15 minutes. The lockout state is per-user (not per-IP), so distributed
  brute force is also throttled.
- **Email verification is required before login** unless
  `REQUIRE_EMAIL_VERIFICATION=false`. Tokens are 32 random bytes, stored as
  SHA-256 hashes, and expire after 24 hours.
- **Password reset** is single-use, stored hashed, and expires after 1 hour.
  All tokens are invalidated by the reset itself.
- Session cookie is `httpOnly`, `secure` (in production), `sameSite=strict`.
  The session is the JWT; rotate `JWT_SECRET` to revoke all sessions.
- `JWT_SECRET` is validated at startup: it must exist, be ≥ 32 chars, and
  must not match a placeholder (`dev`, `local`, `example`, `secret`,
  `changeme`) when `NODE_ENV=production`.
- Password policy: min 10 chars, at least one upper / lower / digit.
- All auth events are written to the `AuthLog` table with IP, user-agent,
  reason, timestamp.

### Access control
- `progress.markLessonComplete` and `progress.getCourseProgress` now verify
  the user is enrolled in the course containing the lesson.
- `certificates.issueCertificate` requires enrollment AND 100 % progress.
- `subscriptions.subscribe` rejects paid plan upgrades — paid plans must
  flow through Razorpay and be activated by the verified-payment handler.
- The public `GET /api/courses/:id` endpoint no longer leaks lesson
  `content` or `videoUrl`; the authenticated `GET /api/courses/:id/learn`
  endpoint returns full data only to enrolled users (or admins).
- Admin user endpoints prevent self-demotion and self-deletion.
- All admin write paths use class-validator DTOs (no more `Body() data: any`).

### Razorpay
- Webhook HMAC is now computed over the **raw request body** captured by an
  Express middleware mounted at `/api/payments/webhook`. The previous
  `JSON.stringify(body)` approach was bypassable.
- Both webhook and `verify-payment` signature comparisons use
  `crypto.timingSafeEqual` against a fixed-length hex buffer.

### Input validation
- Global `ValidationPipe` is `whitelist: true` + `forbidNonWhitelisted: true`,
  so unexpected fields are rejected.
- Image / video / thumbnail inputs are validated as HTTPS URLs.
- The `Setting` table is allowlisted (`ALLOWED_KEYS` in
  `settings.service.ts`); unknown keys are rejected. Secrets must never be
  stored there.
- Body size capped at 256 KB for JSON, 1 MB for the webhook raw body.

### Deployment hardening
- `app.set('trust proxy', 1)` — required for accurate `req.ip` (used by
  rate limiting and audit logs) and for `secure` cookies behind a load
  balancer.
- `helmet` HSTS (2 years, `includeSubDomains`, `preload`) is enabled when
  `NODE_ENV=production`.
- The Postgres pool requires TLS for non-localhost DSNs by default.
  `PGSSL_DISABLE=true` opt-out exists for local development only.
- A request-logging interceptor writes one line per request with method,
  path, status, latency, IP, and user id; auth-prefixed routes are tagged.

### Rate limiting (current limits)
| Endpoint                              | Limit         |
| ------------------------------------- | ------------- |
| Global default                        | 100 / minute  |
| `POST /auth/register`                 | 5 / minute    |
| `POST /auth/login`                    | 10 / minute   |
| `POST /auth/forgot-password`          | 3 / minute    |
| `POST /auth/resend-verification`      | 3 / minute    |
| `POST /auth/reset-password`           | 5 / minute    |
| `GET /auth/verify-email`              | 20 / minute   |
| `POST /payments/create-order`         | 10 / minute   |
| `POST /payments/verify`               | 10 / minute   |
| `POST /payments/apply-coupon`         | 20 / minute   |
| `POST /enrollments`                   | 10 / minute   |
| `POST /progress/lesson/:id/complete`  | 60 / minute   |
| `POST /certificates/:courseId`        | 5 / minute    |
| `POST /inquiries`                     | 3 / minute    |

In addition, account lockout (5 failures → 15 min) provides an account-level
backstop against distributed brute force.

## Required migration steps

The schema has new fields on `User` and a new `AuthLog` table. Apply them:

```bash
cd Backend

# 1. Regenerate the Prisma client (requires Node ≥ 20 — the project's
#    current pinned Prisma 7 CLI does not run on Node 18).
nvm install 20 && nvm use 20

# 2. Reinstall to pick up the new Node ABI for native modules.
npm ci

# 3. Generate the client.
npx prisma generate

# 4. Apply the migration to your dev database.
npx prisma migrate dev --name security_hardening

# 5. Apply in production (read-only check first):
npx prisma migrate deploy
```

If you already have users in production, their `emailVerified` defaults to
`false`. You have three options:

1. Run a one-off SQL: `UPDATE "User" SET "emailVerified" = true;` to grandfather
   existing accounts.
2. Send each existing user a fresh verification email via `/auth/resend-verification`.
3. Run the platform with `REQUIRE_EMAIL_VERIFICATION=false` until you migrate.

## Required environment variables

See `Backend/.env.example`. The backend refuses to start if `JWT_SECRET` or
`DATABASE_URL` is missing or `JWT_SECRET` is too short. Generate a strong
JWT secret with:

```bash
openssl rand -base64 48
```

Razorpay variables are validated at startup; payment endpoints will refuse
requests if any are missing. Webhook secret is set in the Razorpay dashboard
and is **separate** from the API key secret.

## Operational guidance

### Secrets storage
- All secrets are read from environment variables, never from the DB,
  `Setting` table, or admin UI.
- Use your hosting provider's secret manager (AWS Secrets Manager, GCP
  Secret Manager, Vercel env vars, Doppler, etc.) — not shell history or
  `.env` files in production.
- Rotate `JWT_SECRET` to invalidate all sessions immediately.

### Database access
- Production DB must not be reachable from the public internet. Bind to
  the application VPC / private network only. Add the application server's
  egress IP to a security group / authorized networks list.
- Force TLS at the DB level (`hostssl ... cert` in `pg_hba.conf` or your
  managed provider's "require SSL" setting).
- Use a dedicated DB user for the application with only the privileges it
  needs (CONNECT, USAGE, SELECT/INSERT/UPDATE/DELETE on the schema).
  Separate users for migrations vs runtime.

### TLS termination
- The app listens on plain HTTP and trusts `X-Forwarded-Proto` from a single
  upstream proxy (`trust proxy = 1`). Terminate TLS at the load balancer or
  ingress and refuse plain HTTP at that layer.
- Put a redirect from HTTP to HTTPS at the proxy.
- Helmet emits HSTS in production; verify the response header in staging
  before announcing the domain to the HSTS preload list.

### Logs
- Each HTTP request logs method, path, status, latency, IP and user id.
- All authentication events (success, failure, lockout, register, password
  reset, email verify) are written to the `AuthLog` table — fan it out to
  your SIEM / log pipeline. Useful queries:

  ```sql
  -- 5xx burst by route in the last 5 minutes
  SELECT ...

  -- Repeated login failures by IP in last hour
  SELECT ip, count(*) FROM "AuthLog"
  WHERE event = 'LOGIN_FAILURE' AND "createdAt" > now() - interval '1 hour'
  GROUP BY ip ORDER BY 2 DESC LIMIT 20;
  ```

### Email pipeline
- Tokens are generated server-side; a real mailer integration is **not yet
  wired**. In dev, set `EMAIL_TOKEN_DEBUG=true` to print verification and
  reset tokens to the server log.
- For production: replace the `logger.log(...)` call sites in
  `auth.service.ts` (`makeToken` consumers) with a transactional email
  provider (Postmark, SES, Resend). The token must NEVER be returned in
  the HTTP response in production.

## Known limitations / next steps
- Email delivery is not wired; tokens currently land in the server log.
  Wire a mailer before enabling `REQUIRE_EMAIL_VERIFICATION=true` for real
  users.
- File uploads are not yet implemented in the backend; once they are,
  enforce MIME sniffing, content-type allowlist, max size, and storage
  outside the web root (or on a separate S3 bucket served via signed URLs).
- A captcha (e.g. Cloudflare Turnstile) on `/auth/register`,
  `/auth/forgot-password`, and `/inquiries` would defend against
  CSRF-friendly automated abuse beyond what the rate limiter catches.
- 2FA / TOTP is not implemented; consider adding it for admin accounts.
