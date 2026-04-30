/**
 * Quiz logic tests.
 * Tests the REAL production scoreToTier function from quiz-scoring.js.
 * Also verifies quiz content accuracy against known facts.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Import the REAL production function — not a local copy
import { scoreToTier } from '../public/modules/quiz-scoring.js';

// Verify the imported function is the real one (returns pct)
test('scoreToTier returns pct field (production signature)', () => {
  const t = scoreToTier(5, 7);
  assert.ok('pct' in t, 'Production scoreToTier must return pct field');
  assert.equal(typeof t.pct, 'number');
});

test('100% scores earn Civic Expert tier', () => {
  const t = scoreToTier(7, 7);
  assert.equal(t.label, 'Civic Expert');
  assert.equal(t.pct, 100);
});

test('80% scores earn Civic Expert tier (boundary)', () => {
  const t = scoreToTier(4, 5);
  assert.equal(t.label, 'Civic Expert');
  assert.equal(t.pct, 80);
});

test('60% scores earn Informed Voter tier (boundary)', () => {
  const t = scoreToTier(3, 5);
  assert.equal(t.label, 'Informed Voter');
  assert.equal(t.pct, 60);
});

test('sub-60% scores earn Keep learning tier', () => {
  const t = scoreToTier(2, 5);
  assert.equal(t.label, 'Keep learning!');
  assert.equal(t.pct, 40);
});

test('0% scores earn Keep learning tier', () => {
  const t = scoreToTier(0, 5);
  assert.equal(t.label, 'Keep learning!');
  assert.equal(t.pct, 0);
});

test('scoreToTier uses Math.round for pct', () => {
  // 2/3 = 66.66... → should round to 67
  const t = scoreToTier(2, 3);
  assert.equal(t.pct, 67);
});

// Test real quiz answers for correctness against known facts
const quiz = JSON.parse(readFileSync(join(__dirname, '..', 'public', 'data', 'quiz.json'), 'utf8'));

test('Q1: voting age in India is 18', () => {
  const q = quiz.find((x) => /minimum age/i.test(x.question));
  assert.ok(q, 'Age question not found');
  assert.equal(q.options[q.correct], '18 years');
});

test('Q2: new voter registration is Form 6', () => {
  const q = quiz.find((x) => /register as a new voter/i.test(x.question));
  assert.ok(q);
  assert.equal(q.options[q.correct], 'Form 6');
});

test('VVPAT question has correct definition', () => {
  const q = quiz.find((x) => /VVPAT stand for/i.test(x.question));
  assert.ok(q);
  assert.match(q.options[q.correct], /Voter Verifiable Paper Audit Trail/);
});

test('5-booth VVPAT verification rule is accurate', () => {
  const q = quiz.find((x) => /VVPATs are mandatorily hand-counted/i.test(x.question));
  assert.ok(q);
  assert.equal(q.options[q.correct], '5');
});

test('EVM connectivity question correctly states air-gapped', () => {
  const q = quiz.find((x) => /EVMs connected to the internet/i.test(x.question));
  assert.ok(q);
  assert.match(q.options[q.correct], /standalone|air-gapped/i);
});
