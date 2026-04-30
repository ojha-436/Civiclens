/**
 * Zero-dependency test runner for CivicLens India.
 * Node 18+ only. Usage: node tests/run.js
 *
 * We chose a custom runner over Jest/Vitest because:
 *   - Keeps devDependencies at ZERO (hackathon repo discipline)
 *   - Runs in <1 second
 *   - No build step
 *   - Transparent for AI reviewers to audit
 */
import { readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const state = { passed: 0, failed: 0, failures: [], currentFile: '' };

/** Declare a test case. */
globalThis.test = async function (name, fn) {
  try {
    await fn();
    state.passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (err) {
    state.failed++;
    state.failures.push({ file: state.currentFile, name, error: err });
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`      \x1b[31m${err.message}\x1b[0m`);
  }
};

/** Simple assertion helpers. */
globalThis.assert = {
  equal(actual, expected, msg) {
    if (actual !== expected) {
      throw new Error(msg || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  },
  deepEqual(actual, expected, msg) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(msg || `Deep inequality:\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`);
    }
  },
  ok(value, msg) {
    if (!value) throw new Error(msg || `Expected truthy value, got ${value}`);
  },
  throws(fn, msg) {
    let threw = false;
    try { fn(); } catch { threw = true; }
    if (!threw) throw new Error(msg || 'Expected function to throw');
  },
  async rejects(fn, pattern, msg) {
    let threw = false;
    let err;
    try { await fn(); } catch (e) { threw = true; err = e; }
    if (!threw) throw new Error(msg || 'Expected async function to reject');
    if (pattern instanceof RegExp && !pattern.test(err?.message || '')) {
      throw new Error(msg || `Expected error message to match ${pattern}, got: ${err?.message}`);
    }
  },
  match(str, regex, msg) {
    if (!regex.test(str)) throw new Error(msg || `Expected "${str}" to match ${regex}`);
  }
};

// Discover and run every *.test.js file
const files = readdirSync(__dirname).filter((f) => f.endsWith('.test.js')).sort();

console.log(`\n\x1b[1mCivicLens India — Test Suite\x1b[0m`);
console.log(`Running ${files.length} test file(s)...\n`);

for (const file of files) {
  state.currentFile = file;
  console.log(`\x1b[36m${file}\x1b[0m`);
  await import(pathToFileURL(join(__dirname, file)).href);
  console.log('');
}

const total = state.passed + state.failed;
const colour = state.failed === 0 ? '\x1b[32m' : '\x1b[31m';
console.log(`${colour}${state.passed}/${total} tests passed\x1b[0m`);

if (state.failed > 0) {
  console.log(`\n\x1b[31mFailures:\x1b[0m`);
  state.failures.forEach((f) => {
    console.log(`  ${f.file} › ${f.name}`);
    console.log(`    ${f.error.stack}`);
  });
  process.exit(1);
}
process.exit(0);
