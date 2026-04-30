// @ts-check
/**
 * @module config
 * @description Centralized application configuration settings to avoid magic strings
 *   and ease environment-specific adjustments.
 */
export const APP_CONFIG = {
  RATE_LIMIT_MS: 30000,
  RATE_LIMIT_TOKENS: 5,
  GEMINI_ENDPOINT: '/askGemini',
  GEMINI_TIMEOUT_MS: 15000,
  FIREBASE: {
    COLLECTIONS: {
      QUIZ_SCORES: 'quiz_scores',
    },
    // GA4 Measurement ID — find this in Firebase Console → Analytics → Data Streams
    // Format: G-XXXXXXXXXX
    MEASUREMENT_ID: 'G-41MRDPJ8JR',
    // reCAPTCHA v3 site key for Firebase App Check.
    // This is a PUBLIC key (safe to commit — it goes in the HTML like any reCAPTCHA integration).
    // It is NOT a secret; the corresponding secret key lives only in the reCAPTCHA admin console.
    // To replace: Google reCAPTCHA admin → create v3 site → copy Site Key here →
    //   register in Firebase Console → App Check → Apps → Enforce.
    RECAPTCHA_SITE_KEY: '6Lcn6dEsAAAAAH_LBY5j0gIB5B1BEi9ks_KdOsew', // production key — civiclens-faf3d.web.app
  },
  MAX_QUESTION_LENGTH: 500,
};
