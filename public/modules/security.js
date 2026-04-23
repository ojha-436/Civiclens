/**
 * @module security
 * @description Renders safeguard cards explaining EVM and VVPAT security.
 */
import { escapeHTML } from './security-utils.js';
import { trackEvent } from './analytics.js';

/**
 * @typedef {Object} SecurityCard
 * @property {string} icon
 * @property {string} title
 * @property {string} description
 * @property {string} howItWorks
 */

/**
 * Render security cards.
 * @param {HTMLElement} root
 * @param {SecurityCard[]} items
 */
export function renderSecurity(root, items) {
  if (!root) return;
  root.innerHTML = items.map((item) => `
    <article class="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
      <div class="text-3xl mb-2" aria-hidden="true">${escapeHTML(item.icon)}</div>
      <h3 class="font-bold text-civic-deep mb-2">${escapeHTML(item.title)}</h3>
      <p class="text-sm text-gray-700 mb-3">${escapeHTML(item.description)}</p>
      <details class="text-sm">
        <summary class="cursor-pointer text-civic-accent font-semibold">How it works →</summary>
        <p class="mt-2 text-gray-600">${escapeHTML(item.howItWorks)}</p>
      </details>
    </article>
  `).join('');

  // Track expansion of "how it works" for engagement analytics
  root.querySelectorAll('details').forEach((d, i) => {
    d.addEventListener('toggle', () => {
      if (d.open) trackEvent('security_card_expanded', { card: items[i].title });
    });
  });
}
