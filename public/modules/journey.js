// @ts-check
/**
 * @module journey
 * @description Renders the 5-stage voter's journey as a gamified, clickable flow.
 */
import { escapeHTML } from './security-utils.js';
import { trackEvent } from './analytics.js';

/**
 * @typedef {Object} JourneyStage
 * @property {string} icon        Emoji representing the stage
 * @property {string} title       Stage title
 * @property {string} tagline     Short subtitle
 * @property {string} description Full explanatory paragraph
 * @property {string[]} safeguards Bulleted safeguards at this stage
 * @property {string} source       Citation source
 */

/**
 * Render the journey flow into its container elements.
 * @param {HTMLElement} grid     Grid container for stage buttons
 * @param {HTMLElement} detail   Detail panel that expands on selection
 * @param {JourneyStage[]} stages
 */
export function renderJourney(grid, detail, stages) {
  if (!grid || !detail) return;

  grid.innerHTML = stages
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
    .join('');

  grid.querySelectorAll('.journey-stage').forEach((btn) => {
    btn.addEventListener('click', () => {
    // @ts-ignore  
      const idx = Number(btn.dataset.idx);
      const s = stages[idx];
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
      trackEvent('journey_stage_viewed', { stage: idx + 1, title: s.title });
    });
  });
}
