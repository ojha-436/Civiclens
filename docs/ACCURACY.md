# Accuracy & Source Policy — CivicLens India

CivicLens India is committed to non-partisan, factually accurate content sourced from the Election Commission of India and allied official material. This document lists every authoritative source used in the app.

## Primary Sources

| Topic | Source | Used In |
|---|---|---|
| Voter registration (Form 6) | [voters.eci.gov.in](https://voters.eci.gov.in) · [NVSP](https://nvsp.in) | Journey Stage 1, Assistant FAQ, Quiz Q1–Q2 |
| Polling station lookup | [electoralsearch.eci.gov.in](https://electoralsearch.eci.gov.in) | Journey Stage 3, Assistant FAQ |
| EVM + VVPAT design | ECI · *Manual on Electronic Voting Machine and VVPAT* | Journey Stage 3, Security cards, Simulator, Quiz Q3–Q5 |
| VVPAT 5-booth verification | Supreme Court: *N. Chandrababu Naidu v. Union of India* (2019) | Journey Stage 5, Security card, Quiz Q4 |
| NOTA option | Supreme Court: *PUCL v. Union of India* (2013) | Simulator, Assistant FAQ |
| Rule 49MA (mismatch complaint) | Conduct of Election Rules, 1961 — Rule 49MA | Simulator mismatch flow |
| Model Code of Conduct | ECI · *Compendium on MCC* | Journey Stage 2, Quiz Q6, Assistant FAQ |
| Candidate affidavit (Form 26) | Representation of the People Act, 1951 | Journey Stage 2 |
| Strongroom & CCTV procedures | ECI · *Compendium of Instructions on EVM and Strongroom Management* | Journey Stage 4, Security cards |
| Postal ballots (Form 12D) | Conduct of Election Rules, 1961 — Rule 27A | Assistant FAQ |
| NRI voting (Form 6A) | Representation of the People Act, 1950 (as amended) | Assistant FAQ |
| Alternate ID documents (11 options) | ECI Notification No. 23/2019 | Simulator Step 1, Assistant FAQ |
| cVIGIL app | [cvigil.eci.gov.in](https://cvigil.eci.gov.in) | Assistant FAQ |
| Article 324 (ECI powers) | Constitution of India | Quiz Q7, Assistant FAQ |
| 61st Constitutional Amendment | Constitution (Sixty-first Amendment) Act, 1988 | Quiz Q1 |

## Editorial Rules

1. **No party names, candidate names, or leader references.** The app describes process, not politics.
2. **No commentary on specific past election outcomes.** We describe how systems work, not who won.
3. **No display of the Indian national flag or national emblem** in any form (staying within the Flag Code of India and the Emblems and Names (Prevention of Improper Use) Act, 1950).
4. **Every claim has a source.** If we can't cite it to the ECI or a statute, we don't claim it.
5. **Always direct users to official channels.** Every assistant response ends with a pointer to **eci.gov.in** or **Voter Helpline 1950**.
6. **Fictional examples only.** The EVM simulator uses clearly labeled fictional candidates ("Candidate A", "Candidate B", "Candidate C") and generic symbols (🌿, 🟦, 🟧) so no user confuses it with a real election.

## Fact-Check Process

Before a claim is merged into `public/data/*.json`:
1. The claim is written with a source URL or citation in the PR description.
2. Source must be: the Election Commission of India, an Act of Parliament, a Supreme Court or High Court judgment, a Gazette notification, or the Constitution of India.
3. No claims sourced solely from news media, advocacy organisations, or social media.
4. Where ECI guidance has evolved over time, the most recent official version is used.

## Corrections Policy

Found an inaccuracy? Open a GitHub issue with:
- The exact quote from CivicLens India
- Your proposed correction
- An authoritative source (ECI notification, statute, or judgment)

We aim to merge correction PRs within 48 hours.

## Limitations & Disclaimers

- This app is an **educational tool**, not a substitute for official ECI guidance.
- Rules, forms, and procedures may change. Users are reminded to verify at eci.gov.in before acting.
- State-specific variations (e.g., in Panchayat or local body elections, which are run by State Election Commissions, not the ECI) are outside the current scope.
- The app currently covers Lok Sabha and State Legislative Assembly elections. Presidential, Vice-Presidential, and Rajya Sabha elections follow different procedures and are briefly noted in the assistant FAQ.
