// @ts-check
/**
 * @module analytics
 * @description Google Analytics 4 integration for CivicLens India.
 *   Respects Do-Not-Track. Reports only anonymous, non-PII engagement events
 *   relevant to hackathon metrics: feature usage, completion rates, quiz scores.
 *
 * To activate: set MEASUREMENT_ID to your GA4 property (G-XXXXXXXXXX).
 * If unset, all functions are no-ops — zero network traffic.
 */

const MEASUREMENT_ID = ''; // e.g., 'G-ABCDE12345'

let enabled = false;

/** Initialise GA4 lazily. Honours Do-Not-Track. */
export function initAnalytics() {
  if (!MEASUREMENT_ID) return;
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;

  // Load gtag.js asynchronously so it never blocks first paint
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: true,
    cookie_flags: 'SameSite=Strict;Secure',
  });
  enabled = true;
}

/**
 * Track a feature event. Safe to call even if analytics isn't enabled.
 * @param {string} name  event name (e.g., 'quiz_complete')
 * @param {object} [params]
 */
export function trackEvent(name, params = {}) {
  if (!enabled || typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', name, params);
  } catch {
    /* fail silently — analytics must never break UX */
  }
}
