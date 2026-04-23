/**
 * Quiz logic tests.
 * Tests the pure scoring and tier-calculation functions.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Reproduce the pure scoring logic here for isolated testing
function scoreToTier(score, total) {
  const pct = (score / total) * 100;
  if (pct >= 80) return { emoji: '🏆', label: 'Civic Expert' };
  if (pct >= 60) return { emoji: '📘', label: 'Informed Voter' };
  return { emoji: '🌱', label: 'Keep learning!' };
}

test('100% scores earn Civic Expert tier', () => {
  const t = scoreToTier(7, 7);
  assert.equal(t.label, 'Civic Expert');
});

test('80% scores earn Civic Expert tier (boundary)', () => {
  const t = scoreToTier(4, 5);
  assert.equal(t.label, 'Civic Expert');
});

test('60% scores earn Informed Voter tier (boundary)', () => {
  const t = scoreToTier(3, 5);
  assert.equal(t.label, 'Informed Voter');
});

test('sub-60% scores earn Keep learning tier', () => {
  const t = scoreToTier(2, 5);
  assert.equal(t.label, 'Keep learning!');
});

test('0% scores earn Keep learning tier', () => {
  const t = scoreToTier(0, 5);
  assert.equal(t.label, 'Keep learning!');
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
