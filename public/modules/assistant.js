// @ts-check
import {
  escapeHTML,
  validateQuestion,
  assistantLimiter,
  safeFetchJSON,
} from './security-utils.js';
import { trackEvent } from './analytics.js';
import { APP_CONFIG } from './config.js';
import { queryFAQ, renderAnswer } from './assistant-utils.js';

export { queryFAQ, renderAnswer };

/**
 * Call the Gemini Cloud Function backend and return the answer text.
 * @param {string} question - Already-validated, trimmed question string.
 * @returns {Promise<string>}
 */
export async function queryGemini(question) {
  const data = await safeFetchJSON(APP_CONFIG.GEMINI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
    timeoutMs: APP_CONFIG.GEMINI_TIMEOUT_MS,
  });
  return data.answer || '';
}

/** @extends {HTMLElement} */
export class ElectionAssistant extends HTMLElement {
  connectedCallback() {
    this.#render();
  }

  #render() {
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
              `<button class="suggest text-xs bg-civic-deep/10 text-civic-deep px-3 py-1 rounded-full hover:bg-civic-deep hover:text-white" aria-label="Ask: ${escapeHTML(s)}">${escapeHTML(s)}</button>`
          )
          .join('')}
      </div>
      <div class="asst-output min-h-[100px] bg-gray-50 rounded p-4 text-sm text-gray-800" aria-live="polite">
        <p class="text-gray-500 italic">Answers appear here. Always verify with the Election Commission of India (eci.gov.in) or call the Voter Helpline on 1950 before acting.</p>
      </div>
    `;
    this.#wire();
  }

  /**
   * Resolve a raw user input through validation → rate limit → FAQ → Gemini.
   * @param {string} raw
   * @returns {Promise<void>}
   */
  async #ask(raw) {
    const out = this.querySelector('.asst-output');
    if (!out) return;

    const validation = validateQuestion(raw);
    if (!validation.valid) {
      out.innerHTML = `<p class="text-amber-700">⚠️ ${escapeHTML(validation.reason ?? '')}</p>`;
      return;
    }
    if (!assistantLimiter.tryConsume()) {
      const wait = Math.ceil(assistantLimiter.timeUntilNext() / 1000);
      out.innerHTML = `<p class="text-amber-700">⚠️ Please wait ${wait}s before asking another question.</p>`;
      return;
    }

    const question = validation.value ?? '';
    trackEvent('assistant_query', { length: question.length });
    out.innerHTML = `<div class="animate-pulse text-gray-500">Thinking…</div>`;

    const faqHit = queryFAQ(question);
    if (faqHit) {
      out.innerHTML = renderAnswer({ source: 'faq', answer: faqHit.a });
      trackEvent('assistant_answer', { source: 'faq' });
      return;
    }

    if (APP_CONFIG.GEMINI_ENDPOINT) {
      try {
        const answer = await queryGemini(question);
        out.innerHTML = renderAnswer({ source: 'gemini', answer });
        trackEvent('assistant_answer', { source: 'gemini' });
      } catch {
        out.innerHTML = renderAnswer({ source: 'error', answer: '' });
        trackEvent('assistant_answer', { source: 'error' });
      }
    } else {
      out.innerHTML = renderAnswer({ source: 'unknown', answer: '' });
      trackEvent('assistant_answer', { source: 'unknown' });
    }
  }

  #wire() {
    /** @type {HTMLInputElement | null} */
    const input = this.querySelector('.asst-input');
    const sendBtn = this.querySelector('.asst-send');

    if (sendBtn && input) {
      sendBtn.addEventListener('click', () => this.#ask(input.value));
      input.addEventListener('keydown', (e) => {
        if (/** @type {KeyboardEvent} */ (e).key === 'Enter') this.#ask(input.value);
      });
    }

    this.querySelectorAll('.suggest').forEach((b) => {
      b.addEventListener('click', () => {
        const text = b.textContent || '';
        if (input) input.value = text;
        this.#ask(text);
      });
    });
  }
}

customElements.define('election-assistant', ElectionAssistant);
