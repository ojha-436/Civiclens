# Contributing to CivicLens India

Thank you for helping make civic education better. CivicLens India is a non-partisan project — contributions from all perspectives are welcome, as long as they preserve factual accuracy and political neutrality.

## Quick start

```bash
git clone https://github.com/YOUR_USERNAME/civiclens.git
cd civiclens

# Serve locally (any static server works)
npx serve public
# or
python3 -m http.server 8000 --directory public
```

Open `http://localhost:3000` (or `:8000`) in your browser.

## What we welcome

✅ Accuracy corrections (with ECI, statute, or Supreme Court citation)
✅ Accessibility improvements
✅ Translations — **Hindi is highest priority**, followed by Bengali, Tamil, Telugu, Marathi, Gujarati
✅ Additional quiz questions (must include official source)
✅ Performance optimisations, especially for 3G / low-end Android
✅ Bug fixes

## What we decline

❌ Party, candidate, or leader endorsements or criticism
❌ Policy position advocacy
❌ Claims about specific past election outcomes
❌ Reproduction of the national flag, national emblem, or Ashoka Chakra
❌ Content sourced only from news media, social media, or advocacy organisations

## Pull request checklist

- [ ] Every factual claim has a citation in the PR description (ECI, statute, judgment, or Constitution)
- [ ] Runs locally without errors
- [ ] Passes axe DevTools accessibility scan
- [ ] No party names, candidate names, or leader references introduced
- [ ] No new dependencies added without discussion
- [ ] Keeps repo under 10 MB

## Code style

- 2-space indentation
- Semicolons required
- Single quotes for strings
- Template literals for HTML strings
- Comment non-obvious logic

## Translation contributions

If you're contributing a translation:
- Translate `public/data/*.json` files into `public/data/<lang-code>/` (e.g., `public/data/hi/`)
- Translate user-facing strings in `public/modules/*.js` — do **not** translate code identifiers
- Keep the ECI-specific terms (EVM, VVPAT, EPIC, NOTA) in English — these are the official terms even in regional contexts
- Submit PR with native-speaker review wherever possible

## Questions?

Open a GitHub Discussion before writing substantial code so we can align on scope.
