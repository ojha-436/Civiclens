/**
 * @file CivicLens India — main application orchestrator.
 * @description Bootstraps the app: loads ECI content, renders feature modules,
 *   registers service worker, initialises analytics, wires navigation.
 */
import { renderJourney }   from './modules/journey.js';
import { renderSimulator } from './modules/simulator.js';
import { renderSecurity }  from './modules/security.js';
import { renderQuiz }      from './modules/quiz.js';
import { renderAssistant } from './modules/assistant.js';
import { safeFetchJSON }   from './modules/security-utils.js';
import { initAnalytics, trackEvent } from './modules/analytics.js';

/**
 * Load all content data files in parallel.
 * @returns {Promise<{ journey: any[], security: any[], quiz: any[] }>}
 */
async function loadContent() {
  const [journey, security, quiz] = await Promise.all([
    safeFetchJSON('./data/journey.json'),
    safeFetchJSON('./data/security.json'),
    safeFetchJSON('./data/quiz.json')
  ]);
  return { journey, security, quiz };
}

/**
 * Register the service worker for offline capability and faster repeat visits.
 * Fails silently on unsupported browsers or http (non-https) contexts.
 */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* graceful degradation */ });
  });
}

/**
 * Toggle the mobile navigation menu.
 * @param {HTMLButtonElement} btn
 */
function wireMobileMenu(btn) {
  btn?.addEventListener('click', () => {
    const nav = document.querySelector('nav');
    const open = nav.classList.toggle('hidden') === false;
    ['flex', 'flex-col', 'absolute', 'top-16', 'right-4', 'bg-white', 'p-4', 'shadow-lg', 'rounded']
      .forEach((c) => nav.classList.toggle(c, open));
    btn.setAttribute('aria-expanded', String(open));
  });
}

/**
 * Handle fatal initialisation errors gracefully.
 * @param {Error} err
 */
function showFatalError(err) {
  console.error('CivicLens init failed:', err);
  const main = document.getElementById('main');
  if (main) {
    main.innerHTML = `
      <div role="alert" class="mt-8 p-6 bg-red-50 border-l-4 border-red-600 rounded">
        <h2 class="font-bold text-red-800 mb-2">Unable to load content</h2>
        <p class="text-red-700">Please refresh the page or check your connection.
          If the problem persists, visit <a class="underline" href="https://eci.gov.in">eci.gov.in</a> directly.</p>
      </div>`;
  }
}

/** Entry point. */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    registerServiceWorker();
    initAnalytics();

    const { journey, security, quiz } = await loadContent();

    renderJourney(document.getElementById('journey-container'),
                  document.getElementById('journey-detail'), journey);
    renderSimulator(document.getElementById('ballot-simulator'));
    renderSecurity(document.getElementById('security-grid'), security);
    renderQuiz(document.getElementById('quiz-container'), quiz);
    renderAssistant(document.getElementById('assistant-container'));

    wireMobileMenu(document.getElementById('menu-toggle'));
    trackEvent('app_loaded', { modules: 5 });
  } catch (err) {
    showFatalError(err);
  }
});
