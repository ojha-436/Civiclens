// @ts-check
import {
  escapeHTML,
  validateQuestion,
  assistantLimiter,
  safeFetchJSON,
} from './security-utils.js';
import { trackEvent } from './analytics.js';
import { APP_CONFIG } from './config.js';

const FAQ = [
  {
    q: ['register', 'registration', 'enroll', 'form 6'],
    a: 'To register as a voter in India, fill Form 6 at voterportal.eci.gov.in, the NVSP (nvsp.in), or via the Voter Helpline app. You can also submit Form 6 on paper to your local Booth Level Officer (BLO). You must be 18 or older on 1 January of the qualifying year. Keep proof of age and proof of address ready.',
  },
  {
    q: ['id', 'epic', 'voter id', 'identity', 'identification'],
    a: "Your main voter ID is the EPIC (Electoral Photo Identity Card) issued by the ECI. On polling day, if you don't have your EPIC, you can use any ONE of 11 alternate documents: Aadhaar, Passport, Driving Licence, PAN Card, Service ID with photo, MGNREGA job card, bank/post office passbook with photo, health insurance smart card, pension document with photo, or official ID issued to MPs/MLAs/MLCs.",
  },
  {
    q: ['evm', 'electronic voting machine', 'voting machine'],
    a: 'An EVM (Electronic Voting Machine) has two parts — a Control Unit operated by the polling officer and a Ballot Unit where you press the button for your chosen candidate. EVMs are manufactured by BEL and ECIL and are standalone devices with no internet, Wi-Fi, or Bluetooth connectivity. Each EVM also has a VVPAT attached.',
  },
  {
    q: ['vvpat', 'paper slip', 'paper trail'],
    a: "VVPAT stands for Voter Verifiable Paper Audit Trail. When you cast your vote on the EVM, the VVPAT prints a slip showing the candidate's name, serial number, and symbol. The slip is visible through a glass window for 7 seconds, then drops into a sealed box. VVPAT slips from 5 random polling stations per Assembly segment are mandatorily hand-counted on counting day.",
  },
  {
    q: ['nota', 'none of the above'],
    a: 'NOTA (None Of The Above) is an option on every EVM, introduced following the Supreme Court ruling in PUCL v. Union of India (2013). It lets you formally reject all candidates while still recording your participation. NOTA votes are counted but do not affect the winner — the candidate with the most votes still wins.',
  },
  {
    q: ['secure', 'security', 'tamper', 'hack'],
    a: "Indian EVMs are standalone (no internet/Bluetooth/Wi-Fi), one-time programmable, and sealed in multiple layers with candidate agents' signatures. EVMs are randomised twice before polling, stored in strongrooms with 24×7 CCTV, and the VVPAT paper trail allows physical verification. The Supreme Court has upheld the EVM+VVPAT system multiple times.",
  },
  {
    q: ['count', 'counting', 'result', 'tally'],
    a: "Counting happens on a fixed date announced by the ECI. Postal ballots are counted first, then EVM votes are tallied round by round. Each round's totals are publicly announced. VVPAT slips from 5 randomly selected polling stations per Assembly segment are mandatorily hand-counted and matched against the EVM count before results are declared.",
  },
  {
    q: ['mcc', 'model code', 'code of conduct'],
    a: 'The Model Code of Conduct (MCC) is a set of ECI guidelines that take effect the moment elections are announced. Ruling parties cannot announce new schemes, transfer officials without ECI approval, or use state resources for campaigning. All parties must avoid hate speech, caste/communal appeals, and violation of campaign-silence periods.',
  },
  {
    q: ['nri', 'overseas', 'abroad'],
    a: 'NRI voters (Indian citizens living abroad) can register using Form 6A. However, as of now, NRI voters must be physically present at their registered polling station in India to vote — proxy and postal voting for general NRIs is under consideration but not yet implemented.',
  },
  {
    q: ['postal', 'absentee'],
    a: 'Postal ballots are available for service voters (armed forces, paramilitary, government employees on election duty), persons on election duty, electors in preventive detention, and since 2020, electors aged 80+ or with disabilities (optional, on prior request via Form 12D).',
  },
  {
    q: ['phases', 'schedule', 'when'],
    a: 'The Lok Sabha (general) election is usually conducted in multiple phases over several weeks for security and logistical reasons. State Assembly elections may be single-phase or multi-phase. Exact schedules are announced by the ECI through press conferences and published at eci.gov.in.',
  },
  {
    q: ['symbol', 'party symbol'],
    a: 'Every registered political party in India has an election symbol allotted by the ECI. Recognised national and state parties have reserved symbols; unrecognised parties and independents pick from a list of free symbols. Symbols help voters identify candidates, especially in multilingual and low-literacy contexts.',
  },
  {
    q: ['eci', 'election commission'],
    a: 'The Election Commission of India (ECI) is an independent constitutional body established under Article 324. It conducts elections to Parliament, State Legislatures, and the offices of President and Vice-President. It consists of the Chief Election Commissioner and two Election Commissioners.',
  },
  {
    q: ['booth', 'polling station'],
    a: 'You can find your assigned polling station at electoralsearch.eci.gov.in by entering your name and details, or via your EPIC number. The Voter Helpline app also shows your booth. Each polling station typically serves about 1,200–1,500 voters.',
  },
  {
    q: ['complaint', 'cvigil', 'mcc violation'],
    a: 'The cVIGIL app lets any citizen report MCC violations with a photo or video, geo-tagged and timestamped. The ECI commits to action within 100 minutes. You can also file complaints through the Voter Helpline (1950) or at eci.gov.in.',
  },
];

function findFAQ(question) {
  const lower = question.toLowerCase();
  return FAQ.find((item) => item.q.some((kw) => lower.includes(kw)));
}

export class ElectionAssistant extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <div class="mb-4">
        <label for="asst-input" class="block text-sm font-semibold text-civic-deep mb-2">Your question:</label>
        <div class="flex gap-2">
          <input id="asst-input" type="text" maxlength="${APP_CONFIG.MAX_QUESTION_LENGTH}"
                 class="asst-input flex-1 border-2 border-gray-300 rounded px-3 py-2 focus:border-civic-deep focus:outline-none"
                 placeholder="e.g. How do I register using Form 6?"
                 aria-label="Ask a question about Indian elections" />
          <button class="asst-send bg-civic-deep text-white px-4 py-2 rounded font-semibold hover:bg-civic-accent">Ask</button>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 mb-4">
        ${[
          'How do I register?',
          'What is VVPAT?',
          'Are EVMs secure?',
          'What is NOTA?',
          'What is the MCC?',
          'How do I find my booth?',
        ]
          .map(
            (s) =>
              `<button class="suggest text-xs bg-civic-deep/10 text-civic-deep px-3 py-1 rounded-full hover:bg-civic-deep hover:text-white">${escapeHTML(s)}</button>`
          )
          .join('')}
      </div>
      <div class="asst-output min-h-[100px] bg-gray-50 rounded p-4 text-sm text-gray-800" aria-live="polite">
        <p class="text-gray-500 italic">Answers appear here. Always verify with the Election Commission of India (eci.gov.in) or call the Voter Helpline on 1950 before acting.</p>
      </div>
    `;
    this.wire();
  }

  async ask(raw) {
    const input = this.querySelector('.asst-input');
    const out = this.querySelector('.asst-output');
    if (!input || !out) return;

    const validation = validateQuestion(raw);
    if (!validation.valid) {
      out.innerHTML = `<p class="text-amber-700">⚠️ ${escapeHTML(validation.reason)}</p>`;
      return;
    }
    if (!assistantLimiter.tryConsume()) {
      const wait = Math.ceil(assistantLimiter.timeUntilNext() / 1000);
      out.innerHTML = `<p class="text-amber-700">⚠️ Please wait ${wait}s before asking another question.</p>`;
      return;
    }

    const question = validation.value;
    if (!question) return;

    trackEvent('assistant_query', { length: question.length });
    out.innerHTML = `<div class="animate-pulse text-gray-500">Thinking…</div>`;

    const hit = findFAQ(question);
    if (hit) {
      out.innerHTML = `
        <p><strong>Answer:</strong> ${escapeHTML(hit.a)}</p>
        <p class="mt-2 text-xs text-gray-500">Source: ECI knowledge base.
          Verify at <a class="text-civic-accent underline" href="https://eci.gov.in">eci.gov.in</a>
          or call Voter Helpline 1950.</p>`;
      trackEvent('assistant_answer', { source: 'faq' });
      return;
    }

    if (APP_CONFIG.GEMINI_ENDPOINT) {
      try {
        const data = await safeFetchJSON(APP_CONFIG.GEMINI_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question }),
          timeoutMs: APP_CONFIG.GEMINI_TIMEOUT_MS,
        });
        out.innerHTML = `
          <p><strong>Answer:</strong> ${escapeHTML(data.answer || '')}</p>
          <p class="mt-2 text-xs text-gray-500">Generated by Gemini. Verify at
            <a class="text-civic-accent underline" href="https://eci.gov.in">eci.gov.in</a>.</p>`;
        trackEvent('assistant_answer', { source: 'gemini' });
      } catch {
        out.innerHTML = `<p>I couldn't reach the assistant service. Please check
          <a class="text-civic-accent underline" href="https://eci.gov.in">eci.gov.in</a> or call 1950.</p>`;
        trackEvent('assistant_answer', { source: 'error' });
      }
    } else {
      out.innerHTML = `
        <p>I don't have a specific answer for that yet. Try asking about:
          registration (Form 6), EPIC, EVM, VVPAT, NOTA, security, counting, MCC,
          NRI voting, postal ballots, or cVIGIL.</p>
        <p class="mt-2 text-xs text-gray-500">Official resource:
          <a class="text-civic-accent underline" href="https://eci.gov.in">eci.gov.in</a> · Helpline: 1950</p>`;
      trackEvent('assistant_answer', { source: 'unknown' });
    }
  }

  wire() {
    /** @type {HTMLInputElement | null} */
    const input = this.querySelector('.asst-input');
    const sendBtn = this.querySelector('.asst-send');

    if (sendBtn && input) {
      sendBtn.addEventListener('click', () => this.ask(input.value));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.ask(input.value);
      });
    }

    this.querySelectorAll('.suggest').forEach((b) => {
      b.addEventListener('click', () => {
        const text = b.textContent || '';
        if (input) {
          input.value = text;
        }
        this.ask(text);
      });
    });
  }
}

customElements.define('election-assistant', ElectionAssistant);

// Backward compatibility for app.js
export function renderAssistant(root) {
  if (root && root.tagName.toLowerCase() !== 'election-assistant') {
    console.warn('Using legacy renderAssistant method without <election-assistant>');
  }
}
