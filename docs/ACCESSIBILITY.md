# Accessibility Conformance Report — CivicLens

**Target:** WCAG 2.1 Level AA
**Last reviewed:** April 2026
**Testing tools:** axe DevTools, Lighthouse, NVDA screen reader, keyboard-only navigation

CivicLens is built accessibility-first because elections belong to everyone — including voters with disabilities, low-end devices, or limited bandwidth.

---

## Conformance Summary

| Principle | Status | Notes |
|---|---|---|
| **1. Perceivable** | ✅ Pass | Text alternatives, color contrast, responsive layout |
| **2. Operable** | ✅ Pass | Full keyboard support, skip links, no motion traps |
| **3. Understandable** | ✅ Pass | Plain language, predictable navigation, clear labels |
| **4. Robust** | ✅ Pass | Valid HTML5, semantic structure, ARIA where needed |

---

## Specific WCAG Criteria

### Perceivable

**1.1.1 Non-text Content (A)**
- All icons have `aria-hidden="true"` when decorative
- All interactive elements have text labels or `aria-label`

**1.3.1 Info and Relationships (A)**
- Semantic HTML: `<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, `<footer>`
- Proper heading hierarchy (single `<h1>`, logical `<h2>` → `<h3>` nesting)
- Form inputs associated with `<label>` elements

**1.4.3 Contrast (Minimum) (AA)**
- Body text `#1a1a1a` on `#f5f1e8`: contrast ratio **15.3:1** ✅
- Primary button white on `#0b3d91`: contrast ratio **9.8:1** ✅
- Accent `#d72638` on white: contrast ratio **5.1:1** ✅
- All text passes 4.5:1 minimum

**1.4.4 Resize Text (AA)**
- All sizing in `rem` units; scales to 200% without loss of content or functionality

**1.4.10 Reflow (AA)**
- Responsive layout reflows at 320px viewport width with no horizontal scrolling

### Operable

**2.1.1 Keyboard (A)**
- Every interactive element (buttons, links, inputs) reachable via Tab
- Quiz answers navigable with arrow keys (radiogroup pattern)
- Journey stage buttons activate on Enter/Space

**2.1.2 No Keyboard Trap (A)**
- No focus traps. Modals (if added later) must include Escape-to-close.

**2.4.1 Bypass Blocks (A)**
- Skip-to-main-content link (visible on focus) at the top of every page

**2.4.3 Focus Order (A)**
- Logical tab order matches visual flow

**2.4.7 Focus Visible (AA)**
- Custom 3px solid `#d72638` focus ring with 2px offset — exceeds default browser outlines

**2.3.3 Animation from Interactions (AAA, exceeded)**
- `@media (prefers-reduced-motion: reduce)` disables all transitions

### Understandable

**3.1.1 Language of Page (A)**
- `<html lang="en">` declared

**3.2.3 Consistent Navigation (AA)**
- Main nav in same position across all scroll states (sticky header)

**3.3.1 Error Identification (A)**
- Ballot simulator errors announced via `role="alert"`
- Quiz feedback via `aria-live="polite"` region
- Assistant responses via `aria-live="polite"`

**3.3.2 Labels or Instructions (A)**
- All inputs have associated labels
- Placeholder text is supplementary, never the only label

### Robust

**4.1.2 Name, Role, Value (A)**
- Custom button components use native `<button>` where possible
- Dynamic states (quiz selections, expanded menus) update `aria-expanded`, `aria-checked`

**4.1.3 Status Messages (AA)**
- Quiz score updates, assistant responses, and simulator feedback use `aria-live` regions so screen readers announce without focus changes

---

## Tested With

| Environment | Result |
|---|---|
| NVDA 2024 + Firefox | ✅ All content announced correctly |
| VoiceOver + Safari | ✅ All interactive elements labeled |
| Keyboard-only navigation | ✅ Full site usable without mouse |
| 200% browser zoom | ✅ No content loss or horizontal scroll |
| 320px viewport | ✅ Responsive reflow, no truncation |
| High Contrast Mode (Windows) | ✅ All controls remain visible |
| `prefers-reduced-motion: reduce` | ✅ Animations disabled |

---

## Known Limitations

- **Language:** English only at launch. Spanish/Mandarin translations planned (see ROADMAP).
- **Assistant:** Gemini-generated answers are not pre-translated; users should request specific languages in-query.

---

## Feedback

Accessibility issues are treated as critical bugs. File them at the GitHub issue tracker with the label `a11y`.
