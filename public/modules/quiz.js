// @ts-check
// Firebase SDK is lazy-loaded on quiz completion to save ~80-120KB on first paint.
// Only users who finish the quiz trigger the download.
import { escapeHTML } from './security-utils.js';
import { trackEvent } from './analytics.js';
import { APP_CONFIG } from './config.js';
import { scoreToTier } from './quiz-scoring.js';

async function saveScoreToCloud(finalScore, tier) {
  try {
    // Lazy-load Firebase only when needed — dynamic import defers the ~80-120KB download
    const {
      auth, db, analytics, logEvent, signInAnonymously, collection, addDoc,
    } = await import('./firebase-config.js');
    const userCredential = await signInAnonymously(auth);
    await addDoc(collection(db, APP_CONFIG.FIREBASE.COLLECTIONS.QUIZ_SCORES), {
      uid: userCredential.user.uid,
      score: finalScore,
      tier: tier,
      timestamp: new Date(),
    });
    logEvent(analytics, 'quiz_completed', { score: finalScore, tier: tier });
  } catch (error) {
    console.error('Firebase Cloud integration error:', error);
  }
}

export class CivicQuiz extends HTMLElement {
  constructor() {
    super();
    this.questions = [];
    this.idx = 0;
    this.score = 0;
    this.answered = false;
  }

  set data(questions) {
    this.questions = questions;
    this.render();
  }

  render() {
    if (this.idx >= this.questions.length) return this.renderResults();

    const q = this.questions[this.idx];
    this.innerHTML = `
      <div class="mb-4 flex justify-between text-sm text-gray-600">
        <span>Question ${this.idx + 1} of ${this.questions.length}</span>
        <span>Score: ${this.score}</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2 mb-6" role="progressbar"
           aria-valuenow="${this.idx}" aria-valuemin="0" aria-valuemax="${this.questions.length}">
        <div class="bg-civic-deep h-2 rounded-full transition-all" style="width: ${(this.idx / this.questions.length) * 100}%"></div>
      </div>
      <h3 class="text-xl font-semibold text-civic-deep mb-4">${escapeHTML(q.question)}</h3>
      <div class="space-y-2" role="radiogroup" aria-label="Answer choices">
        ${q.options
          .map(
            (opt, i) => `
          <button class="quiz-opt w-full text-left p-3 border-2 border-gray-200 rounded hover:border-civic-deep transition focus:outline-none focus:ring-2 focus:ring-civic-accent"
                  data-idx="${i}" role="radio" aria-checked="false">
            ${escapeHTML(opt)}
          </button>
        `
          )
          .join('')}
      </div>
      <div class="quiz-feedback mt-4" aria-live="polite"></div>
    `;
    this.answered = false;

    const opts = /** @type {NodeListOf<HTMLButtonElement>} */ (this.querySelectorAll('.quiz-opt'));
    // Roving tabindex: first option tabbable, rest -1
    opts.forEach((btn, i) => {
      btn.setAttribute('tabindex', i === 0 ? '0' : '-1');
      btn.addEventListener('click', () => this.handleAnswer(btn, q));
    });

    // Arrow-key navigation per WAI-ARIA radiogroup pattern
    const radiogroup = this.querySelector('[role="radiogroup"]');
    if (radiogroup) {
      radiogroup.addEventListener('keydown', (e) => {
        const key = /** @type {KeyboardEvent} */ (e).key;
        if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(key)) return;
        e.preventDefault();
        const current = /** @type {HTMLElement} */ (document.activeElement);
        const items = [...opts];
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
  }

  handleAnswer(btn, q) {
    if (this.answered) return;
    this.answered = true;
    const selected = Number(btn.dataset.idx);
    const correct = selected === q.correct;
    if (correct) this.score += 1;

    const quizOpts = /** @type {NodeListOf<HTMLButtonElement>} */ (this.querySelectorAll('.quiz-opt'));
    quizOpts.forEach((b, i) => {
      b.disabled = true;
      b.setAttribute('aria-checked', i === selected ? 'true' : 'false');
      if (i === q.correct) b.dataset.state = 'correct';
      else if (i === selected) b.dataset.state = 'incorrect';
    });

    const feedback = this.querySelector('.quiz-feedback');
    if(feedback) {
      feedback.innerHTML = `
        <div class="p-4 rounded ${correct ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}">
          <strong>${correct ? '✓ Correct!' : '✗ Not quite.'}</strong>
          <p class="mt-1 text-sm">${escapeHTML(q.explanation)}</p>
          <button class="quiz-next-btn mt-3 bg-civic-deep text-white px-4 py-2 rounded text-sm font-semibold">
            ${this.idx + 1 < this.questions.length ? 'Next Question →' : 'See Results →'}
          </button>
        </div>
      `;
    }

    trackEvent('quiz_answered', { question: this.idx + 1, correct });
    const nextBtn = this.querySelector('.quiz-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.idx += 1;
        this.render();
      });
    }
  }

  renderResults() {
    const tier = scoreToTier(this.score, this.questions.length);
    saveScoreToCloud(this.score, tier.label);
    this.innerHTML = `
      <div class="text-center py-6">
        <div class="text-6xl mb-4" aria-hidden="true">${tier.emoji}</div>
        <h3 class="text-2xl font-bold text-civic-deep mb-1">${tier.label}</h3>
        <p class="text-gray-700 mb-4">You scored <strong>${this.score}/${this.questions.length}</strong> (${tier.pct}%)</p>
        <button class="quiz-share-btn bg-civic-deep text-white px-5 py-2 rounded font-semibold mr-2">Share Result</button>
        <button class="quiz-retry-btn border-2 border-civic-deep text-civic-deep px-5 py-2 rounded font-semibold">Try Again</button>
      </div>
    `;
    trackEvent('quiz_complete', {
      score: this.score,
      total: this.questions.length,
      tier: tier.label,
    });

    const retryBtn = this.querySelector('.quiz-retry-btn');
    if(retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.idx = 0;
        this.score = 0;
        this.render();
      });
    }

    const shareBtn = this.querySelector('.quiz-share-btn');
    if(shareBtn) {
      shareBtn.addEventListener('click', async () => {
        const text = `I scored ${this.score}/${this.questions.length} on CivicLens India's election knowledge quiz. Test yourself!`;
        try {
          if (navigator.share) {
            await navigator.share({
              title: 'CivicLens India Quiz',
              text,
              url: location.href,
            });
          } else {
            await navigator.clipboard.writeText(`${text} ${location.href}`);
            alert('Result copied to clipboard!');
            trackEvent('quiz_shared', { method: 'clipboard' });
          }
        } catch {
          /* user cancelled */
        }
      });
    }
  }
}

customElements.define('civic-quiz', CivicQuiz);

