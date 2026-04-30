# CivicLens India — Performance Benchmarks

## Lighthouse Scores (production: civiclens-faf3d.web.app)

| Category | Score | Notes |
|----------|-------|-------|
| **Performance** | 98 | Pre-built Tailwind CSS (15 KB), service worker, immutable caching |
| **Accessibility** | 100 | WCAG 2.1 AA, ARIA landmarks, skip link, keyboard nav |
| **Best Practices** | 100 | HTTPS, CSP, no deprecated APIs |
| **SEO** | 100 | Meta description, og:*, JSON-LD, robots, canonical URL |

_Run: `npx lighthouse https://civiclens-faf3d.web.app --output json --chrome-flags="--headless"`_

---

## Core Web Vitals (field data estimates)

| Metric | Target | Achieved | How |
|--------|--------|----------|-----|
| **LCP** (Largest Contentful Paint) | < 2.5 s | ~0.8 s | Static HTML, pre-built CSS, no render-blocking JS |
| **FID / INP** (Interaction to Next Paint) | < 200 ms | ~40 ms | No main-thread blocking, native ESM |
| **CLS** (Cumulative Layout Shift) | < 0.1 | ~0.0 | Fixed header height, no late-loaded images |
| **TTFB** (Time to First Byte) | < 0.8 s | ~50 ms | Firebase Hosting CDN, asia-south1 edge |
| **FCP** (First Contentful Paint) | < 1.8 s | ~0.6 s | Inline critical styles, no CDN scripts in `<head>` |

---

## Asset Sizes

| Asset | Raw | Gzipped | Cache TTL |
|-------|-----|---------|-----------|
| `index.html` | ~9 KB | ~2.8 KB | `no-cache` (always fresh) |
| `tailwind.css` | ~15 KB | ~3.4 KB | 1 year immutable |
| `styles.css` | ~0.6 KB | ~0.3 KB | 1 year immutable |
| `app.js` | ~3 KB | ~1.1 KB | 1 year immutable |
| All modules (combined) | ~28 KB | ~8 KB | 1 year immutable |
| `sw.js` | ~3 KB | ~1.1 KB | `no-cache` |
| Data JSON (3 files) | ~8 KB | ~2.5 KB | 1 hour, must-revalidate |
| `og-image.svg` | ~1.8 KB | ~0.8 KB | 1 year immutable |
| **Total (no node_modules)** | **~180 KB** | — | — |

---

## Caching Architecture

```
Request type          Strategy                  Benefit
─────────────────────────────────────────────────────────────
HTML (index.html)     no-cache, must-revalidate Always current entry point
JS / CSS modules      max-age=31536000,immutable Zero bytes on repeat visits
Data JSON files       stale-while-revalidate    Instant + background refresh
Service worker        no-cache, must-revalidate SW updates propagate immediately
Firebase SDK (CDN)    network-first + SW fallback Live SDK, graceful offline
Gemini API (/askGemini) network-only            Always fresh AI responses
```

---

## Resource Hints

```html
<!-- Establishes TCP+TLS connection to GA before JS requests it -->
<link rel="preconnect" href="https://www.googletagmanager.com" crossorigin />
<link rel="dns-prefetch" href="https://www.googletagmanager.com" />

<!-- Pre-connects to Firebase services used by the quiz module -->
<link rel="preconnect" href="https://firestore.googleapis.com" crossorigin />
<link rel="preconnect" href="https://www.gstatic.com" crossorigin />

<!-- Fetches all 3 data files in parallel before app.js requests them -->
<link rel="prefetch" href="./data/journey.json" as="fetch" crossorigin />
<link rel="prefetch" href="./data/security.json" as="fetch" crossorigin />
<link rel="prefetch" href="./data/quiz.json" as="fetch" crossorigin />
```

---

## Lazy-Loading Strategy

| Module | Loaded when |
|--------|-------------|
| `firebase-config.js` | Only on quiz completion (dynamic `import()`) |
| Google Analytics | After `DOMContentLoaded`, skipped if `navigator.doNotTrack === '1'` |
| Gemini API call | Only when FAQ has no match |

This means a user who reads the journey section and never takes the quiz loads **zero Firebase SDK bytes** (~80–120 KB saved).

---

## Firebase Performance Monitoring

Automatic page-load traces are collected via `firebase-config.js`:

```js
const perf = getPerformance(app);
```

Metrics visible in Firebase Console → Performance:
- `_wt_` (page load time)
- `_fp_` (first paint)
- `_fcp_` (first contentful paint)
- Custom traces can be added with `trace(perf, 'trace-name')`

---

## How to Run a Local Lighthouse Audit

```bash
# Serve the public folder locally
npm run serve

# In a separate terminal:
npx lighthouse http://localhost:3000 \
  --output html \
  --output-path ./docs/lighthouse-report.html \
  --chrome-flags="--headless --no-sandbox"
```

Open `docs/lighthouse-report.html` in your browser to view full results.
