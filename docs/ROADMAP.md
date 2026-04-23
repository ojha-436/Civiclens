# 12-Day Build Roadmap — CivicLens India

A realistic day-by-day plan for a solo or two-person team to ship a hackathon-winning submission.

**Philosophy:** Ship the MVP on Day 7. Spend the last 5 days on polish, accuracy, and demo prep. Judges reward finished over ambitious.

---

## 🏃 Sprint 1 — Foundation (Days 1–3)

### Day 1 — Setup & Skeleton
- [x] Initialize repo with MIT license, README skeleton
- [x] Set up Firebase project on GCP in `asia-south1` (Mumbai region — lowest latency for Indian users)
- [x] Create `public/index.html` with semantic structure + Tailwind CDN + Indian tricolour palette
- [x] Verify `firebase deploy` works end-to-end with a placeholder page
- **Outcome:** Live URL confirmed. Deployment pipeline proven.

### Day 2 — Content Research
- [ ] Collect all procedures directly from eci.gov.in (no intermediaries)
- [ ] Cross-check against Representation of the People Act, 1951 and Conduct of Election Rules, 1961
- [ ] Verify 5-booth VVPAT rule citation in Supreme Court judgment
- [ ] Draft `journey.json`, `security.json`, `quiz.json`
- [ ] Run drafts past 1–2 non-technical readers for clarity
- **Outcome:** All fact-checked content ready for JSON format.

### Day 3 — Journey Module
- [x] Build `journey.js` gamified flow for 5 Indian election stages
- [x] Style with Tailwind utility classes
- [x] Keyboard + screen reader testing
- **Outcome:** First feature fully working on live site.

---

## 🏃 Sprint 2 — Core Features (Days 4–7)

### Day 4 — EVM + VVPAT Simulator ⭐
- [x] Build `simulator.js` with 4-step booth flow: ID → ink → EVM → VVPAT
- [x] Include Rule 49MA mismatch-complaint flow (unique differentiator)
- [x] Use clearly labeled fictional candidates to avoid MCC concerns
- [x] Test all paths including the mismatch branch
- **Outcome:** The headline differentiator is working.

### Day 5 — Security + Quiz
- [x] Build `security.js` with expandable EVM safeguard cards
- [x] Build `quiz.js` with 7 gamified questions + share API
- [x] Verify share-to-clipboard fallback for WhatsApp sharing on Indian mobiles
- **Outcome:** Four of five features complete.

### Day 6 — AI Assistant
- [x] Build `assistant.js` with 15-topic offline-first FAQ
- [x] Deploy `gemini-function.js` to Cloud Functions in `asia-south1`
- [x] Wire endpoint; verify rate limiting and CORS
- [x] Test with 20+ real voter questions (registration, EPIC, NRI, postal, NOTA)
- **Outcome:** Full feature set live.

### Day 7 — MVP LOCK 🔒
- [ ] Feature freeze. No new additions after today.
- [ ] Run Lighthouse audit (target: 95+ on all four axes)
- [ ] Run axe DevTools scan (target: zero violations)
- [ ] Cross-browser test: Chrome, Firefox, Safari, Edge
- [ ] Mobile test: low-end Android (Jio phones are the largest user base)
- **Outcome:** Submittable if deadline were tomorrow.

---

## 🎨 Sprint 3 — Polish (Days 8–10)

### Day 8 — Accessibility Deep-Dive
- [ ] NVDA screen-reader walkthrough (every section)
- [ ] Keyboard-only navigation pass (disconnect mouse)
- [ ] High-contrast mode test
- [ ] Reduced-motion test
- [ ] Test on 3G connection simulation (Indian rural bandwidth)
- [ ] Fix any issues found; update `ACCESSIBILITY.md`
- **Outcome:** Genuine WCAG 2.1 AA conformance + low-bandwidth resilience.

### Day 9 — Accuracy Audit
- [ ] Verify every sourced claim still matches the ECI source wording
- [ ] Run content past a civic education expert or lawyer (if available) for MCC-compliance review
- [ ] Confirm no flag, emblem, party, candidate, or leader references anywhere
- [ ] Update `ACCURACY.md` with final source list
- **Outcome:** Neutrality defensible to any judge.

### Day 10 — Performance & Security
- [ ] Verify security headers via securityheaders.com (target: A+)
- [ ] Lighthouse performance: 95+
- [ ] First Contentful Paint < 1.5s on 3G
- [ ] Add service worker for offline support (optional stretch)
- **Outcome:** Production-grade polish.

---

## 🎬 Sprint 4 — Demo Prep (Days 11–12)

### Day 11 — Documentation & Demo
- [ ] Final README polish with screenshots/GIFs
- [ ] Record 60-second demo video in English (Hindi version if time permits)
- [ ] Show the EVM simulator prominently — it's the differentiator
- [ ] Write 200-word elevator pitch for submission form
- [ ] Prepare answers to likely judge questions (EVM security, MCC compliance, scale to panchayat elections)
- **Outcome:** Submission materials complete.

### Day 12 — Submit & Celebrate
- [ ] Final deploy
- [ ] Submit to PromptWars portal well before deadline
- [ ] Share the live URL on WhatsApp/Twitter for early user feedback
- [ ] Open-source announcement
- **Outcome:** Winning submission filed. 🏆

---

## Contingency: If You Fall Behind

**Behind by Day 7? Drop these in order:**
1. First cut: Gemini fallback (keep offline FAQ only) — saves ~4 hours
2. Second cut: Quiz sharing — saves ~1 hour
3. Third cut: Security card "how it works" expansions — saves ~2 hours

**Never cut:**
- EVM + VVPAT simulator (headline differentiator, unique to India)
- Accessibility (judging criterion)
- ECI source citations (judging criterion + MCC compliance)

---

## Stretch Goals (Post-Hackathon)

- Hindi translation (highest priority — covers ~45% of India)
- Regional language support (Bengali, Tamil, Telugu, Marathi, Gujarati)
- Service worker + PWA install (critical for 3G/low-data users)
- State-specific polling booth lookup integration
- WhatsApp share card with prefilled Hindi/English messages
- Printable "polling day checklist" (PDF, A4)
- Integration with Voter Helpline app deep links
- Expansion to Panchayat & Municipal elections (State Election Commissions)
