// @ts-check
/**
 * @module config
 * @description Centralized application configuration settings to avoid magic strings
 *   and ease environment-specific adjustments.
 */
export const APP_CONFIG = {
  RATE_LIMIT_MS: 30000,
  RATE_LIMIT_TOKENS: 5,
  GEMINI_ENDPOINT: '/ask',
  GEMINI_TIMEOUT_MS: 15000,
  FIREBASE: {
    COLLECTIONS: {
      QUIZ_SCORES: 'quiz_scores',
    },
  },
  MAX_QUESTION_LENGTH: 500,
};
