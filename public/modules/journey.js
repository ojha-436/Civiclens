// @ts-check
import { escapeHTML } from './security-utils.js';
import { trackEvent } from './analytics.js';

export class VoterJourney extends HTMLElement {
  constructor() {
    super();
    this.stages = [];
  }

  set data(stages) {
    this.stages = stages;
    this.render();
  }

  render() {
    this.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-5 gap-3 journey-grid">
        ${this.stages
          .map(
            (s, i) => `
          <button
            class="journey-stage bg-white border-2 border-civic-deep/20 hover:border-civic-accent
                   rounded-lg p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-civic-accent/40"
            data-idx="${i}"
            aria-label="Stage ${i + 1}: ${escapeHTML(s.title)}">
            <div class="text-3xl mb-2" aria-hidden="true">${escapeHTML(s.icon)}</div>
            <div class="text-xs font-semibold text-civic-accent uppercase tracking-wide">Stage ${i + 1}</div>
            <div class="font-bold text-civic-deep">${escapeHTML(s.title)}</div>
            <div class="text-xs text-gray-600 mt-1">${escapeHTML(s.tagline)}</div>
          </button>
        `
          )
          .join('')}
      </div>
      <div class="journey-detail mt-6 bg-white border-l-4 border-civic-accent p-6 rounded shadow-sm hidden" role="region" aria-live="polite"></div>
    `;

    const detail = this.querySelector('.journey-detail');
    this.querySelectorAll('.journey-stage').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.idx);
        const s = this.stages[idx];
        if (detail) {
          detail.classList.remove('hidden');
          detail.innerHTML = `
            <h3 class="text-2xl font-serif font-bold text-civic-deep mb-3">
              ${escapeHTML(s.icon)} ${escapeHTML(s.title)}
            </h3>
            <p class="text-gray-800 leading-relaxed mb-4">${escapeHTML(s.description)}</p>
            <h4 class="font-semibold text-civic-deep mb-2">Key safeguards at this stage:</h4>
            <ul class="list-disc pl-6 space-y-1 text-gray-700">
              ${s.safeguards.map((sg) => `<li>${escapeHTML(sg)}</li>`).join('')}
            </ul>
            <p class="mt-4 text-xs text-gray-500">Source: ${escapeHTML(s.source)}</p>
          `;
          detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        trackEvent('journey_stage_viewed', { stage: idx + 1, title: s.title });
      });
    });
  }
}

customElements.define('voter-journey', VoterJourney);

