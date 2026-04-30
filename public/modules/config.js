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
    MEASUREMENT_ID: 'G-XXXXXXXXXX',
    // reCAPTCHA v3 site key for Firebase App Check.
    // Steps to replace:
    //   1. Go to https://www.google.com/recaptcha/admin and create a reCAPTCHA v3 site.
    //   2. Copy the Site Key and paste it here.
    //   3. Register the key in Firebase Console → App Check → Apps → Register.
    //   4. Click Enforce in Firebase Console → App Check → Apps.
    // The current key is a Google test key that never blocks any request.
    RECAPTCHA_SITE_KEY: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // ← REPLACE WITH PRODUCTION KEY
  },
  MAX_QUESTION_LENGTH: 500,
};
