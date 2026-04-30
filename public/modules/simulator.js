// @ts-check
import { escapeHTML } from './security-utils.js';
import { trackEvent } from './analytics.js';

const FICTIONAL_CANDIDATES = [
  { id: 'c1', name: 'Candidate A', party: 'Fictional Green Party', symbol: '🌿' },
  { id: 'c2', name: 'Candidate B', party: 'Fictional Blue Party', symbol: '🟦' },
  { id: 'c3', name: 'Candidate C', party: 'Fictional Orange Party', symbol: '🟧' },
  { id: 'none', name: 'NOTA', party: 'None Of The Above', symbol: '🚫' },
];

const STEP_LABELS = ['ID Check', 'Indelible Ink', 'Cast Vote', 'VVPAT Check', 'Done', 'Mismatch'];
const STEP_KEYS = ['id', 'ink', 'evm', 'vvpat', 'done', 'mismatch'];

function renderProgress(step) {
  return `
    <div class="flex items-center justify-between mb-6 text-xs" role="list" aria-label="Progress">
      ${STEP_LABELS.map((label, i) => {
        const active = STEP_KEYS.indexOf(step) >= i;
        return `<div class="flex-1 text-center" role="listitem">
          <div class="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center font-bold
            ${active ? 'bg-civic-deep text-white' : 'bg-gray-200 text-gray-500'}"
            aria-current="${STEP_KEYS[i] === step ? 'step' : 'false'}">${i + 1}</div>
          <div class="${active ? 'text-civic-deep font-semibold' : 'text-gray-500'}">${escapeHTML(label)}</div>
        </div>`;
      }).join('')}
    </div>`;
}

export class BallotSimulator extends HTMLElement {
  constructor() {
    super();
    this.state = { step: 'id', choice: null };
  }

  connectedCallback() {
    this.render();
  }

  getStepRenderer() {
    const renderers = {
      id: () => `
        <h3 class="font-bold text-civic-deep text-lg mb-3">Step 1 — Identity Verification</h3>
        <p class="text-gray-700 mb-4">The Polling Officer checks your name on the electoral roll and verifies your identity using your <strong>EPIC (Voter ID)</strong> or one of 11 alternate documents.</p>
        <div class="bg-civic-paper border border-civic-deep/20 rounded p-4 mb-4">
          <div class="text-xs text-gray-600 mb-1">Acceptable documents (any ONE):</div>
          <div class="text-sm">EPIC · Aadhaar · Passport · Driving Licence · PAN Card · Service ID with photo · MGNREGA job card · Bank/Post Office passbook with photo · Health insurance smart card · Pension document with photo · Official ID cards issued to MPs/MLAs/MLCs</div>
        </div>
        <button class="sim-btn-show-id w-full bg-civic-deep text-white py-3 rounded font-semibold hover:bg-civic-accent focus:outline-none focus:ring-4 focus:ring-civic-accent/40">
          Show EPIC to Polling Officer →
        </button>`,

      ink: () => `
        <h3 class="font-bold text-civic-deep text-lg mb-3">Step 2 — Indelible Ink</h3>
        <p class="text-gray-700 mb-4">A mark of indelible ink is applied to your left index finger. This prevents anyone from voting twice — the ink lasts several days and cannot be washed off.</p>
        <div class="flex justify-center my-6 text-6xl" aria-hidden="true">☝️</div>
        <button class="sim-btn-apply-ink w-full bg-civic-deep text-white py-3 rounded font-semibold hover:bg-civic-accent focus:outline-none focus:ring-4 focus:ring-civic-accent/40">
          Receive ink mark →
        </button>`,

      evm: () => `
        <h3 class="font-bold text-civic-deep text-lg mb-3">Step 3 — Electronic Voting Machine</h3>
        <p class="text-gray-700 mb-4">Press the button next to your chosen candidate. You can vote for any candidate or choose <strong>NOTA</strong> (None Of The Above) if you reject all options.</p>
        <div class="border-4 border-gray-700 rounded-lg bg-gray-100 p-4 space-y-2" role="radiogroup" aria-label="EVM Ballot Unit (fictional candidates)">
          ${FICTIONAL_CANDIDATES.map(
            (c, i) => `
            <button class="evm-btn w-full flex items-center gap-3 bg-white p-3 rounded border-2 border-gray-300 hover:border-civic-accent focus:border-civic-accent focus:outline-none focus:ring-2 focus:ring-civic-accent transition"
                    data-id="${escapeHTML(c.id)}" role="radio" aria-checked="false"
                    aria-label="Button ${i + 1}: ${escapeHTML(c.name)} of ${escapeHTML(c.party)}">
              <span class="bg-gray-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">${i + 1}</span>
              <span class="text-2xl" aria-hidden="true">${escapeHTML(c.symbol)}</span>
              <div class="text-left flex-1">
                <div class="font-semibold text-civic-deep">${escapeHTML(c.name)}</div>
                <div class="text-xs text-gray-600">${escapeHTML(c.party)}</div>
              </div>
              <span class="w-6 h-6 rounded-full border-2 border-civic-deep bg-civic-accent/20" aria-hidden="true"></span>
            </button>
          `
          ).join('')}
        </div>`,

      vvpat: () => {
        const picked = FICTIONAL_CANDIDATES.find((c) => c.id === this.state.choice);
        if (!picked) return `<div class="text-red-500">Error: Candidate not found.</div>`;
        return `
          <h3 class="font-bold text-civic-deep text-lg mb-3">Step 4 — VVPAT Verification</h3>
          <p class="text-gray-700 mb-4">The VVPAT machine prints a paper slip showing your choice. It is visible for <strong>7 seconds</strong> before dropping into a sealed box. Check that your vote was recorded correctly.</p>
          <div class="bg-yellow-50 border-2 border-dashed border-yellow-500 rounded p-4 font-mono text-sm">
            <div class="text-center text-gray-600 text-xs mb-2">── VVPAT SLIP (FICTIONAL) ──</div>
            <div class="text-center text-2xl mb-2" aria-hidden="true">${escapeHTML(picked.symbol)}</div>
            <div class="text-center font-bold">${escapeHTML(picked.name)}</div>
            <div class="text-center text-gray-700">${escapeHTML(picked.party)}</div>
            <div class="text-center text-gray-500 text-xs mt-2">Serial: 001 · ${new Date().toLocaleDateString('en-IN')}</div>
          </div>
          <div class="mt-4 flex gap-2">
            <button class="sim-btn-confirm-vvpat flex-1 bg-civic-deep text-white py-3 rounded font-semibold hover:bg-civic-accent focus:outline-none focus:ring-4 focus:ring-civic-accent/40">
              ✓ Slip matches my choice
            </button>
            <button class="sim-btn-mismatch-vvpat flex-1 border-2 border-civic-accent text-civic-accent py-3 rounded font-semibold hover:bg-civic-accent hover:text-white focus:outline-none focus:ring-4 focus:ring-civic-accent/40">
              ✗ Slip does NOT match
            </button>
          </div>`;
      },

      done: () => {
        const picked = FICTIONAL_CANDIDATES.find((c) => c.id === this.state.choice);
        if (!picked) return '';
        return `
          <div class="text-center py-4">
            <div class="text-5xl mb-3" aria-hidden="true">✅</div>
            <h3 class="font-bold text-civic-deep text-xl mb-2">Vote Successfully Cast</h3>
            <p class="text-gray-700 mb-4">Your vote for <strong>${escapeHTML(picked.name)}</strong> is now recorded on the EVM and the paper slip is sealed inside the VVPAT box.</p>
            <div class="bg-civic-paper border-l-4 border-civic-deep text-left p-4 my-4 text-sm">
              <strong class="text-civic-deep">What happens next?</strong>
              <ul class="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                <li>After polling closes, the EVM is sealed with signatures from candidate agents</li>
                <li>It is transported under armed escort to a strongroom</li>
                <li>On counting day, totals are announced round-by-round in the presence of all candidate agents</li>
                <li>VVPAT slips from 5 random booths per Assembly segment are hand-counted to cross-check</li>
              </ul>
            </div>
            <button class="sim-btn-reset bg-civic-deep text-white px-5 py-2 rounded font-semibold focus:outline-none focus:ring-4 focus:ring-civic-accent/40">Try Again</button>
          </div>`;
      },

      mismatch: () => `
        <div class="text-center py-4">
          <div class="text-5xl mb-3" aria-hidden="true">⚠️</div>
          <h3 class="font-bold text-civic-accent text-xl mb-2">Report to Presiding Officer</h3>
          <p class="text-gray-700 mb-4">If the VVPAT slip does not match your choice, you have the right to complain to the Presiding Officer under <strong>Rule 49MA of the Conduct of Election Rules, 1961</strong>.</p>
          <div class="bg-amber-50 border-l-4 border-amber-600 text-left p-4 my-4 text-sm">
            <strong>What happens:</strong>
            <ul class="list-disc pl-5 mt-2 space-y-1 text-gray-700">
              <li>You submit a written declaration stating your complaint</li>
              <li>You cast a test vote in the presence of the Presiding Officer and candidates' agents</li>
              <li>If the complaint is found true, polling at that booth is stopped and reported to the ECI</li>
              <li>If found false, you may face prosecution under Section 177 IPC for false statements</li>
            </ul>
          </div>
          <button class="sim-btn-reset bg-civic-deep text-white px-5 py-2 rounded font-semibold focus:outline-none focus:ring-4 focus:ring-civic-accent/40">Try Again</button>
        </div>`,
    };

    return renderers[this.state.step] || renderers.id;
  }

  render() {
    const body = this.getStepRenderer()();
    this.innerHTML = `
      <div class="max-w-2xl mx-auto">
        ${renderProgress(this.state.step)}
        <div class="border-2 border-civic-deep rounded-lg p-6 bg-white">${body}</div>
        <div class="mt-3 text-xs text-gray-500 text-center">
          For educational use only. Candidates and parties shown are fictional.
        </div>
      </div>`;
    this.wire();
  }

  advance(to) {
    this.state.step = to;
    trackEvent('simulator_step', { step: to });
    this.render();
  }

  wire() {
    const btnShowId = this.querySelector('.sim-btn-show-id');
    if (btnShowId) btnShowId.addEventListener('click', () => this.advance('ink'));

    const btnApplyInk = this.querySelector('.sim-btn-apply-ink');
    if (btnApplyInk) btnApplyInk.addEventListener('click', () => this.advance('evm'));

    const evmBtns = /** @type {NodeListOf<HTMLButtonElement>} */ (this.querySelectorAll('.evm-btn'));
    evmBtns.forEach((btn, i) => {
      btn.setAttribute('tabindex', i === 0 ? '0' : '-1');
      btn.addEventListener('click', () => {
        this.state.choice = btn.dataset.id;
        trackEvent('simulator_vote', {
          choice: this.state.choice === 'none' ? 'NOTA' : 'candidate',
        });
        this.advance('vvpat');
      });
    });

    // Arrow-key navigation per WAI-ARIA radiogroup pattern for EVM
    const evmGroup = this.querySelector('[role="radiogroup"]');
    if (evmGroup) {
      evmGroup.addEventListener('keydown', (e) => {
        const key = /** @type {KeyboardEvent} */ (e).key;
        if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(key)) return;
        e.preventDefault();
        const current = /** @type {HTMLElement} */ (document.activeElement);
        const items = [...evmBtns];
        const idx = items.indexOf(/** @type {HTMLButtonElement} */ (current));
        if (idx === -1) return;
        const next = (key === 'ArrowDown' || key === 'ArrowRight')
          ? (idx + 1) % items.length
          : (idx - 1 + items.length) % items.length;
        items[idx].setAttribute('tabindex', '-1');
        items[next].setAttribute('tabindex', '0');
        items[next].focus();
      });
    }

    const btnConfirm = this.querySelector('.sim-btn-confirm-vvpat');
    if (btnConfirm) btnConfirm.addEventListener('click', () => this.advance('done'));

    const btnMismatch = this.querySelector('.sim-btn-mismatch-vvpat');
    if (btnMismatch) btnMismatch.addEventListener('click', () => this.advance('mismatch'));

    const btnReset = this.querySelector('.sim-btn-reset');
    if (btnReset) btnReset.addEventListener('click', () => {
      this.state.step = 'id';
      this.state.choice = null;
      this.render();
    });
  }
}

customElements.define('ballot-simulator', BallotSimulator);

