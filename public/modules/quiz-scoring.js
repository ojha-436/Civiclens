// @ts-check
/**
 * @module quiz-scoring
 * @description Pure scoring logic extracted for testability.
 *   No browser or Firebase dependencies — importable in both browser and Node.
 */

/**
 * Map a numeric score to an achievement tier.
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
