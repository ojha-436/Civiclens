# Security Policy — CivicLens India

This document describes the security posture of CivicLens India and how to report vulnerabilities.

## Supported Versions

The `main` branch is actively maintained. Tagged releases receive security fixes for 12 months.

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Email the maintainers with:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix

We aim to acknowledge reports within 48 hours and resolve critical issues within 7 days.

## Security Architecture

### Defence-in-depth at every layer

| Layer | Control | Implementation |
|---|---|---|
| **Transport** | HTTPS enforced | Firebase Hosting forces HTTPS; HSTS with `preload` |
| **Headers** | Strict CSP | No eval, no inline scripts from untrusted origins, `frame-ancestors 'none'` |
| **Headers** | Anti-clickjacking | `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'` |
| **Headers** | MIME sniffing | `X-Content-Type-Options: nosniff` |
| **Headers** | Referrer leakage | `Referrer-Policy: strict-origin-when-cross-origin` |
| **Headers** | Feature exposure | `Permissions-Policy` denies camera, mic, geolocation, etc. |
| **Client XSS** | Template sanitisation | All dynamic content passes through `escapeHTML()` before DOM insertion |
| **Client input** | Validation | `validateQuestion()` enforces length, type, and pattern checks |
| **Client abuse** | Rate limiting | Token-bucket: 5 requests / 30 seconds per session |
| **Prompt injection** | Pattern blocking | Common injection strings blocked client-side AND server-side |
| **Server input** | Validation | Cloud Function re-validates every request (never trusts client) |
| **Server abuse** | IP rate limiting | 10 requests / minute per IP at the Cloud Function |
| **Server CORS** | Origin allowlist | `ALLOWED_ORIGIN` env var restricts to Firebase Hosting domain |
| **Gemini output** | Safety filters | `BLOCK_MEDIUM_AND_ABOVE` on all 4 HarmCategory categories |
| **Gemini prompt** | System guardrails | System prompt forbids leaking itself or endorsing parties |
| **Secrets** | Key management | Firebase Web API key is a public client identifier secured by Firestore Security Rules; Gemini API key set via env vars, never committed |
| **Firestore** | Security Rules | Strict schema validation, auth required, deny all reads, reject invalid fields |
| **Dependencies** | Zero runtime deps | No supply-chain attack surface; Tailwind from CDN with SRI potential |

### Content Security Policy (CSP) details

```
default-src 'self'
script-src  'self' https://cdn.tailwindcss.com https://www.googletagmanager.com
style-src   'self' 'unsafe-inline' https://cdn.tailwindcss.com
img-src     'self' data: https:
connect-src 'self' https://*.cloudfunctions.net https://*.run.app ...
frame-ancestors 'none'
object-src  'none'
base-uri    'self'
form-action 'self'
upgrade-insecure-requests
```

`unsafe-inline` is present only in `style-src` because the Tailwind CDN injects `<style>` tags at runtime. `script-src` has no `unsafe-inline` — the Tailwind config is loaded as an external script file. Moving to a pre-built Tailwind CSS file would eliminate `unsafe-inline` entirely (see ROADMAP.md).

### Known limitations

- **CDN dependency**: Tailwind is loaded from `cdn.tailwindcss.com`. If compromised, our site could be affected. Mitigation: Subresource Integrity (SRI) hashes planned for next release.
- **In-memory rate limiter**: The Cloud Function uses `maxInstances: 1` to ensure the in-memory rate limiter is effective across all traffic. For horizontal scaling, migrate to Firestore-backed distributed counters.
- **Anonymous analytics only**: We never collect PII. If you enable GA4, ensure your GA4 property has IP anonymisation on (it's enabled by default in `analytics.js`).

## Responsible Use

CivicLens India is an **educational tool**, not a substitute for official ECI guidance. Content may lag behind the latest ECI notifications. Voters must verify with eci.gov.in or Voter Helpline 1950 before acting.

## Acknowledgements

Security contributors will be acknowledged in release notes (with permission).
