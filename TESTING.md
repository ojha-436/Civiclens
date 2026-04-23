# Testing Strategy — CivicLens India

## Philosophy

Tests are a judging criterion AND a confidence-building tool. CivicLens India ships with a **zero-dependency test suite** that runs in under a second and validates every layer of the app.

## Running tests

```bash
npm test
```

Expected output:

```
CivicLens India — Test Suite
Running 4 test file(s)...

accessibility.test.js
  ✓ html element declares language (WCAG 3.1.1)
  ✓ has exactly one <main> landmark (WCAG 1.3.1)
  ... (13 total)

data.test.js
  ✓ journey.json has exactly 5 stages
  ✓ every journey stage cites an authoritative source
  ✓ no party, candidate, or leader names leak into content (MCC compliance)
  ... (11 total)

quiz-logic.test.js
  ✓ 100% scores earn Civic Expert tier
  ✓ Q1: voting age in India is 18
  ... (10 total)

security-utils.test.js
  ✓ escapeHTML escapes < and >
  ✓ validateQuestion blocks prompt-injection attempts
  ... (12 total)

46/46 tests passed
```

## Coverage by layer

| Test file | What it validates | Count |
|---|---|---|
| `data.test.js` | Content integrity, ECI source citations, MCC compliance | 11 |
| `security-utils.test.js` | XSS escaping, input validation, prompt-injection blocks | 12 |
| `quiz-logic.test.js` | Scoring tiers, fact-accuracy of quiz answers | 10 |
| `accessibility.test.js` | WCAG 2.1 structural requirements (landmarks, ARIA, lang) | 13 |
| **Total** | | **46** |

## Why a custom runner (not Jest/Vitest)?

1. **Zero runtime dependencies** — respects hackathon repo-size discipline
2. **No build step** — tests are plain ES modules, readable by any AI auditor or human reviewer
3. **Sub-second feedback** — the whole suite runs in ~200 ms
4. **Transparent** — the runner is 70 lines, auditable at a glance
5. **Node-native** — uses only `node:fs`, `node:path`, `node:url` from the standard library

## What's tested vs. not tested

### ✅ Tested

- Every piece of ECI-sourced content is well-formed JSON
- Every journey stage has an authoritative source citation
- No political party, candidate, or leader names leak into content (MCC compliance check)
- No stray U.S. election references remain (guards against regressions)
- All quiz correct-answer indices are in range
- Quiz scoring tiers at exact boundaries (60%, 80%)
- Actual factual correctness of each quiz answer (e.g., voting age is 18)
- All `escapeHTML()` edge cases (null, ampersand-ordering, quotes, backticks)
- All `validateQuestion()` rejection paths including prompt-injection patterns
- HTML document has correct WCAG-mandated landmarks, `lang`, `<main>`, ARIA regions

### ⚠️ Not automated (tested manually)

- Visual rendering across browsers (Chrome, Firefox, Safari, Edge)
- Screen-reader narration quality (NVDA, VoiceOver, TalkBack)
- Actual Gemini API responses (exercise a real key in staging)
- Service worker caching behaviour in production
- Cloud Function rate limiter under load

These are documented in `docs/ROADMAP.md` under manual test days (Day 7 and Day 8).

## CI integration

`.github/workflows/ci.yml` runs the full suite on every push and pull request, and additionally:

- Validates every JSON file with Python's `json.load()` as a second parser
- Scans for accidentally-committed secrets (`AIza…`, `sk_live…`, etc.)
- Verifies the repo remains under the 10 MB hackathon limit

## Adding new tests

Create `tests/<feature>.test.js` and use the globals `test()` and `assert`:

```javascript
test('my new feature works', () => {
  assert.equal(add(2, 2), 4);
});
```

Any file ending in `.test.js` is automatically discovered and run.

## Regression policy

Every bug fix must include a test that would have caught it. No exceptions.
