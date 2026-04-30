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
| **Server abuse** | IP rate limiting | 10 requests / minute per IP at the Cloud Function (Firestore-backed distributed counters) |
| **Server CORS** | Origin allowlist | `ALLOWED_ORIGIN` env var restricts to Firebase Hosting domain |
| **Gemini output** | Safety filters | `BLOCK_MEDIUM_AND_ABOVE` on all 4 HarmCategory categories |
| **Gemini prompt** | System guardrails | System prompt forbids leaking itself or endorsing parties |
| **Secrets** | Key management | Firebase Web API key is a public client identifier secured by Firestore Security Rules and App Check; Gemini API key set via env vars, never committed |
| **Firestore** | Security Rules | Strict schema validation, auth required, deny all reads, reject invalid fields |
| **Firestore** | App Check | `quiz_scores` write path protected by reCAPTCHA v3 App Check |
| **Dependencies** | Zero runtime deps | No supply-chain attack surface; Tailwind pre-compiled |

### Content Security Policy (CSP) details

```
default-src 'self'
script-src  'self' https://www.googletagmanager.com https://www.gstatic.com
style-src   'self'
img-src     'self' data: https:
connect-src 'self' https://*.cloudfunctions.net https://*.run.app ...
frame-ancestors 'none'
object-src  'none'
base-uri    'self'
form-action 'self'
upgrade-insecure-requests
```

The CSP contains **zero `unsafe-inline` directives**. Tailwind CSS is pre-built and served from `'self'` as a static file. No CDN dependencies in the critical rendering path.

### App Check Configuration

We have integrated Firebase App Check using the `ReCaptchaV3Provider` to protect the Firestore database from unverified clients. 
**Required console steps:**
1. Register your site in the Google reCAPTCHA Enterprise console (or v3).
2. Configure App Check in the Firebase Console with the generated site key and secret.
3. Replace the placeholder site key in `public/modules/firebase-config.js` with your actual reCAPTCHA site key.
4. Enforce App Check for Firestore in the Firebase Console.

### Known limitations

- **Anonymous analytics only**: We never collect PII. If you enable GA4, ensure your GA4 property has IP anonymisation on (it's enabled by default in `analytics.js`).

## Responsible Use

CivicLens India is an **educational tool**, not a substitute for official ECI guidance. Content may lag behind the latest ECI notifications. Voters must verify with eci.gov.in or Voter Helpline 1950 before acting.

## Acknowledgements

Security contributors will be acknowledged in release notes (with permission).
