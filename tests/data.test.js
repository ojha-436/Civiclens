/**
 * Data integrity tests.
 * Ensures every piece of ECI-sourced content is well-formed and internally consistent.
 * These tests run in CI and on every PR to prevent content regressions.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'public', 'data');

const journey  = JSON.parse(readFileSync(join(dataDir, 'journey.json'),  'utf8'));
const security = JSON.parse(readFileSync(join(dataDir, 'security.json'), 'utf8'));
const quiz     = JSON.parse(readFileSync(join(dataDir, 'quiz.json'),     'utf8'));

test('journey.json has exactly 5 stages', () => {
  assert.equal(journey.length, 5);
});

test('every journey stage has all required fields', () => {
  const required = ['icon', 'title', 'tagline', 'description', 'safeguards', 'source'];
  journey.forEach((stage, i) => {
    required.forEach((field) => {
      assert.ok(stage[field], `Stage ${i} missing field: ${field}`);
    });
  });
});

test('every journey stage cites an authoritative source', () => {
  const authoritative = /(ECI|Election Commission|Supreme Court|Act|Rules|Constitution|voters\.eci)/i;
  journey.forEach((stage, i) => {
    assert.match(stage.source, authoritative, `Stage ${i} lacks authoritative source`);
  });
});

test('every journey stage has at least 3 safeguards', () => {
  journey.forEach((stage, i) => {
    assert.ok(stage.safeguards.length >= 3, `Stage ${i} has only ${stage.safeguards.length} safeguards`);
  });
});

test('security.json has at least 6 safeguard cards', () => {
  assert.ok(security.length >= 6, `Expected ≥6 cards, got ${security.length}`);
});

test('every security card has required fields', () => {
  const required = ['icon', 'title', 'description', 'howItWorks'];
  security.forEach((card, i) => {
    required.forEach((field) => {
      assert.ok(card[field], `Card ${i} missing field: ${field}`);
    });
  });
});

test('quiz has at least 5 questions', () => {
  assert.ok(quiz.length >= 5);
});

test('every quiz question has a correct answer index in range', () => {
  quiz.forEach((q, i) => {
    assert.ok(
      Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length,
      `Question ${i} has invalid correct index: ${q.correct}`
    );
  });
});

test('every quiz question has at least 2 options and an explanation', () => {
  quiz.forEach((q, i) => {
    assert.ok(q.options.length >= 2, `Question ${i} has fewer than 2 options`);
    assert.ok(q.explanation && q.explanation.length > 20, `Question ${i} lacks substantive explanation`);
  });
});

test('no party, candidate, or leader names leak into content (MCC compliance)', () => {
  const forbidden = /\b(BJP|Congress|INC|AAP|TMC|DMK|AIADMK|CPI|SP|BSP|Modi|Rahul|Kejriwal|Mamata|Shah)\b/;
  const checkAll = (arr, label) => {
    arr.forEach((item, i) => {
      const serialised = JSON.stringify(item);
      if (forbidden.test(serialised)) {
        throw new Error(`${label}[${i}] contains forbidden political reference`);
      }
    });
  };
  checkAll(journey, 'journey');
  checkAll(security, 'security');
  checkAll(quiz, 'quiz');
});

test('no U.S. election references remain', () => {
  const usRefs = /\b(vote\.gov|NCSL|CISA|EAC|Brennan Center|Secretary of State)\b/;
  [...journey, ...security, ...quiz].forEach((item) => {
    assert.ok(!usRefs.test(JSON.stringify(item)), 'Stray U.S. reference found');
  });
});
