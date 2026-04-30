// @ts-check
/// <reference lib="es2017" />

/**
 * Live countdown to the next Indian General Election (April 2029).
 * Updates every second. Displays days, hours, minutes, seconds.
 * @extends {HTMLElement}
 */
class ElectionCountdown extends HTMLElement {
  /** @type {number | null} */
  #timerId = null;

  // TODO: update once ECI officially announces the 2029 Lok Sabha election schedule.
  /** Target date: 1 April 2029 00:00:00 IST (UTC+5:30) — estimated; see eci.gov.in for official date */
  static #TARGET = new Date('2029-04-01T00:00:00+05:30').getTime();

  connectedCallback() {
    this.setAttribute('role', 'timer');
    this.setAttribute('aria-label', 'Countdown to next Indian General Election');
    this.#tick();
    this.#timerId = /** @type {any} */ (setInterval(() => this.#tick(), 1000));
  }

  disconnectedCallback() {
    if (this.#timerId !== null) clearInterval(this.#timerId);
  }

  #tick() {
    const now = Date.now();
    const diff = ElectionCountdown.#TARGET - now;

    if (diff <= 0) {
      this.innerHTML = this.#banner('Election season is here!', '🗳️', '');
      if (this.#timerId !== null) clearInterval(this.#timerId);
      return;
    }

    const totalSec = Math.floor(diff / 1000);
    const days    = Math.floor(totalSec / 86400);
    const hours   = Math.floor((totalSec % 86400) / 3600);
    const mins    = Math.floor((totalSec % 3600) / 60);
    const secs    = totalSec % 60;

    const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
    const units = `
      <span class="font-mono font-bold text-civic-deep" aria-label="${days} days">${days}<span class="text-xs font-normal ml-0.5">d</span></span>
      <span class="text-gray-400 mx-1">:</span>
      <span class="font-mono font-bold text-civic-deep" aria-label="${hours} hours">${pad(hours)}<span class="text-xs font-normal ml-0.5">h</span></span>
      <span class="text-gray-400 mx-1">:</span>
      <span class="font-mono font-bold text-civic-deep" aria-label="${mins} minutes">${pad(mins)}<span class="text-xs font-normal ml-0.5">m</span></span>
      <span class="text-gray-400 mx-1">:</span>
      <span class="font-mono font-bold text-civic-deep" aria-label="${secs} seconds">${pad(secs)}<span class="text-xs font-normal ml-0.5">s</span></span>`;

    this.innerHTML = this.#banner('Next General Election (Est. 2029)', '⏳', units);
  }

  /**
   * @param {string} label
   * @param {string} icon
   * @param {string} unitsHTML
   * @returns {string}
   */
  #banner(label, icon, unitsHTML) {
    return `
      <div class="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-center font-semibold mb-6 shadow-sm flex flex-wrap items-center justify-center gap-3">
        <span aria-hidden="true">${icon}</span>
        <span>${label}</span>
        ${unitsHTML ? `<span class="flex items-center gap-0.5 text-lg">${unitsHTML}</span>` : ''}
      </div>`;
  }
}

customElements.define('election-countdown', ElectionCountdown);
