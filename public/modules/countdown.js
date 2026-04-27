// @ts-check

/**
 * A custom Web Component that displays a static countdown banner.
 */
class ElectionCountdown extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-center font-semibold mb-6 shadow-sm">
        ⏳ Next General Election: Expected 2029
      </div>
    `;
  }
}

// Register the custom element with the browser
customElements.define('election-countdown', ElectionCountdown);
