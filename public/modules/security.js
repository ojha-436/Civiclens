import { escapeHTML } from './security-utils.js';
import { trackEvent } from './analytics.js';

export class SecurityGrid extends HTMLElement {
  constructor() {
    super();
    this.items = [];
  }

  set data(items) {
    this.items = items;
    this.render();
  }

  render() {
    this.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${this.items
          .map(
            (item) => `
          <article class="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
            <div class="text-3xl mb-2" aria-hidden="true">${escapeHTML(item.icon)}</div>
            <h3 class="font-bold text-civic-deep mb-2">${escapeHTML(item.title)}</h3>
            <p class="text-sm text-gray-700 mb-3">${escapeHTML(item.description)}</p>
            <details class="text-sm sec-details">
              <summary class="cursor-pointer text-civic-accent font-semibold">How it works →</summary>
              <p class="mt-2 text-gray-600">${escapeHTML(item.howItWorks)}</p>
            </details>
          </article>
        `
          )
          .join('')}
      </div>
    `;

    this.querySelectorAll('details.sec-details').forEach((d, i) => {
      d.addEventListener('toggle', () => {
        if (d.open) trackEvent('security_card_expanded', { card: this.items[i].title });
      });
    });
  }
}

customElements.define('security-grid', SecurityGrid);

// Backward compatibility for app.js
export function renderSecurity(root, items) {
  if (root && root.tagName.toLowerCase() === 'security-grid') {
    root.data = items;
  }
}
