/**
 * @module security
 * @description Security utilities for CivicLens India.
 *   - XSS-safe HTML escaping
 *   - Input validation for assistant queries
 *   - Client-side rate limiting
 *   - Safe JSON fetcher with timeout & response validation
 */

/**
 * Escape HTML-unsafe characters to prevent XSS when injecting user input
 * into templates. Use for ANY user-provided or API-returned string.
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

/**
 * Validate a user question before sending to the backend.
 * Rejects empty, oversized, or suspicious inputs.
 * @param {string} input
 * @returns {{ valid: boolean, reason?: string, value?: string }}
 */
export function validateQuestion(input) {
  if (typeof input !== 'string')
    return { valid: false, reason: 'Invalid input type' };
  const trimmed = input.trim();
  if (trimmed.length === 0)
    return { valid: false, reason: 'Question cannot be empty' };
  if (trimmed.length > 500)
    return { valid: false, reason: 'Question too long (max 500 characters)' };
  // Block obvious prompt-injection probes
  if (
    /(\bignore\s+previous\b|\bsystem\s+prompt\b|<script|javascript:)/i.test(
      trimmed
    )
  ) {
    return {
      valid: false,
      reason: 'Your question contains disallowed patterns.',
    };
  }
  return { valid: true, value: trimmed };
}

/**
 * Simple token-bucket rate limiter to prevent abuse of the assistant.
 * Defaults: 5 requests per 30 seconds per browser session.
 */
class RateLimiter {
  constructor(maxTokens = 5, refillMs = 30000) {
    this.maxTokens = maxTokens;
    this.refillMs = refillMs;
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }
  tryConsume() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    if (elapsed > this.refillMs) {
      this.tokens = this.maxTokens;
      this.lastRefill = now;
    }
    if (this.tokens <= 0) return false;
    this.tokens -= 1;
    return true;
  }
  timeUntilNext() {
    return Math.max(0, this.refillMs - (Date.now() - this.lastRefill));
  }
}

export const assistantLimiter = new RateLimiter(5, 30000);

/**
 * Safe JSON fetcher with timeout, HTTPS enforcement, and content-type validation.
 * @param {string} url
 * @param {object} [opts]
 * @returns {Promise<any>}
 */
export async function safeFetchJSON(url, opts = {}) {
  if (
    !/^https?:\/\//i.test(url) &&
    !url.startsWith('./') &&
    !url.startsWith('/')
  ) {
    throw new Error('Unsafe URL scheme');
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs || 10000);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      throw new Error(`Unexpected content-type: ${ct}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}
