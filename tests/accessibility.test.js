/**
 * Accessibility structural tests.
 * Static analysis of index.html for WCAG 2.1 AA compliance markers.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(__dirname, '..', 'public', 'index.html'), 'utf8');

test('html element declares language (WCAG 3.1.1)', () => {
  assert.match(html, /<html[^>]+lang=["']en["']/);
});

test('has exactly one <main> landmark (WCAG 1.3.1)', () => {
  const matches = html.match(/<main\b/g) || [];
  assert.equal(matches.length, 1);
});

test('has <header> landmark', () => {
  assert.match(html, /<header\b/);
});

test('has <footer> landmark', () => {
  assert.match(html, /<footer\b/);
});

test('has <nav> with aria-label (WCAG 2.4.1)', () => {
  assert.match(html, /<nav[^>]+aria-label=/);
});

test('has skip-to-content link (WCAG 2.4.1)', () => {
  assert.match(html, /href=["']#main["']/);
});

test('has viewport meta for responsive design', () => {
  assert.match(html, /<meta[^>]+name=["']viewport["']/);
});

test('has meta description for SEO and screen readers', () => {
  assert.match(html, /<meta[^>]+name=["']description["']/);
});

test('has single <h1> (WCAG 1.3.1)', () => {
  const matches = html.match(/<h1\b/g) || [];
  assert.equal(matches.length, 1);
});

test('every <section> with heading uses aria-labelledby', () => {
  const sections = html.match(/<section[^>]+id=[^>]+>/g) || [];
  sections.forEach((s) => {
    if (!/aria-labelledby/.test(s)) {
      throw new Error(`Section missing aria-labelledby: ${s}`);
    }
  });
});

test('live regions are declared for dynamic content', () => {
  assert.match(html, /aria-live=/);
});

test('has favicon declared', () => {
  assert.match(html, /<link[^>]+rel=["']icon["']/);
});

test('has theme-color meta for mobile chrome', () => {
  assert.match(html, /<meta[^>]+name=["']theme-color["']/);
});
