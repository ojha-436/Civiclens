// @ts-check
import {
  auth,
  db,
  analytics,
  logEvent,
  signInAnonymously,
  collection,
  addDoc,
} from './firebase-config.js';
/**
 * @module quiz
 * @description Gamified quiz with shareable results. Pure scoring logic is
 *   extracted into `scoreToTier` for unit-testability.
 */
import { escapeHTML } from './security-utils.js';
import { trackEvent } from './analytics.js';

/**
 * @typedef {Object} QuizQuestion
 * @property {string} question
 * @property {string[]} options
 * @property {number} correct     Zero-based index of correct option
 * @property {string} explanation
 */

/**
 * Map a numeric score to an achievement tier.
 * Pure function — exported for testability.
 * @param {number} score
 * @param {number} total
 * @returns {{ emoji: string, label: string, pct: number }}
 */
export function scoreToTier(score, total) {
  const pct = Math.round((score / total) * 100);
  if (pct >= 80) return { emoji: '🏆', label: 'Civic Expert', pct };
  if (pct >= 60) return { emoji: '📘', label: 'Informed Voter', pct };
  return { emoji: '🌱', label: 'Keep learning!', pct };
}
/** * @param {number} finalScore 
 * @param {string} tier 
 */
async function saveScoreToCloud(finalScore, tier) {
  try {
    // 1. Authenticate silently
    const userCredential = await signInAnonymously(auth);

    // 2. Save data to Database
    await addDoc(collection(db, 'quiz_scores'), {
      uid: userCredential.user.uid,
      score: finalScore,
      tier: tier,
      timestamp: new Date(),
    });

    // 3. Log Analytics Event
    logEvent(analytics, 'quiz_completed', {
      score: finalScore,
      tier: tier,
    });

    console.log('✅ Score saved to Google Cloud Firestore & Analytics logged!');
  } catch (error) {
    console.error('Firebase Cloud integration error:', error);
  }
}
/**
 * Render the quiz into `root`.
 * @param {HTMLElement} root
 * @param {QuizQuestion[]} questions
 */
export function renderQuiz(root, questions) {
  if (!root) return;
  let idx = 0;
  let score = 0;
  let answered = false;

  const render = () => {
    if (idx >= questions.length) return renderResults();

    const q = questions[idx];
    root.innerHTML = `
      <div class="mb-4 flex justify-between text-sm text-gray-600">
        <span>Question ${idx + 1} of ${questions.length}</span>
        <span>Score: ${score}</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2 mb-6" role="progressbar"
           aria-valuenow="${idx}" aria-valuemin="0" aria-valuemax="${questions.length}">
        <div class="bg-civic-deep h-2 rounded-full transition-all" style="width: ${(idx / questions.length) * 100}%"></div>
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
      <div id="feedback" class="mt-4" aria-live="polite"></div>
    `;
    answered = false;

    root.querySelectorAll('.quiz-opt').forEach((btn) => {
      // @ts-ignore
      btn.addEventListener('click', () => handleAnswer(btn, q));
    });
  };
/** * @param {HTMLButtonElement} btn 
 * @param {any} q 
 */
  const handleAnswer = (btn, q) => {
    if (answered) return;
    answered = true;
    const selected = Number(btn.dataset.idx);
    const correct = selected === q.correct;
    if (correct) score += 1;

    root.querySelectorAll('.quiz-opt').forEach((b, i) => {
      // @ts-ignore
      b.disabled = true;
      b.setAttribute('aria-checked', i === selected ? 'true' : 'false');
      if (i === q.correct) b.classList.add('bg-green-100', 'border-green-600');
      else if (i === selected) b.classList.add('bg-red-100', 'border-red-600');
    });

    // @ts-ignore
    root.querySelector('#feedback').innerHTML = `
      <div class="p-4 rounded ${correct ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}">
        <strong>${correct ? '✓ Correct!' : '✗ Not quite.'}</strong>
        <p class="mt-1 text-sm">${escapeHTML(q.explanation)}</p>
        <button id="next" class="mt-3 bg-civic-deep text-white px-4 py-2 rounded text-sm font-semibold">
          ${idx + 1 < questions.length ? 'Next Question →' : 'See Results →'}
        </button>
      </div>
    `;
    trackEvent('quiz_answered', { question: idx + 1, correct });
    // @ts-ignore
    root.querySelector('#next').addEventListener('click', () => {
      idx += 1;
      render();
    });
  };

  const renderResults = () => {
    const tier = scoreToTier(score, questions.length);
    saveScoreToCloud(score, tier.label);
    root.innerHTML = `
      <div class="text-center py-6">
        <div class="text-6xl mb-4" aria-hidden="true">${tier.emoji}</div>
        <h3 class="text-2xl font-bold text-civic-deep mb-1">${tier.label}</h3>
        <p class="text-gray-700 mb-4">You scored <strong>${score}/${questions.length}</strong> (${tier.pct}%)</p>
        <button id="share" class="bg-civic-deep text-white px-5 py-2 rounded font-semibold mr-2">Share Result</button>
        <button id="retry" class="border-2 border-civic-deep text-civic-deep px-5 py-2 rounded font-semibold">Try Again</button>
      </div>
    `;
    trackEvent('quiz_complete', {
      score,
      total: questions.length,
      tier: tier.label,
    });

    // @ts-ignore
    root.querySelector('#retry').addEventListener('click', () => {
      idx = 0;
      score = 0;
      render();
    });
    // @ts-ignore
    root.querySelector('#share').addEventListener('click', async () => {
      const text = `I scored ${score}/${questions.length} on CivicLens India's election knowledge quiz. Test yourself!`;
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
        /* user cancelled — no-op */
      }
    });
  };

  render();
}
