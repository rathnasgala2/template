/**
 * Shared fixtures and assertions for the article summary and FAQ (schemas
 * 3.55.0): the hostile strings, the HTML and JSON-LD readers, and a probe for
 * whether the installed build-input schema accepts the two fields yet.
 */

import { strict as assert } from 'node:assert';

import { escapeHtml } from '../../src/core/internal/skeleton.js';
import { renderPublication } from '../../src/core/index.js';
import { buildRichFixture } from './page-kind-fixtures.js';
import { createRenderDirectories, testProvenance } from './render-fixtures.js';

export const SUMMARY = 'A short summary & more, with "quotes" and <b>tags</b>.';
export const FAQ = [
  { question: 'Is it <script>alert(1)</script> safe?', answer: 'Yes.' },
  {
    question: 'What about "quotes" & ampersands?',
    answer: 'First line with </script><img src=x onerror=1>\nSecond line.',
  },
];

/**
 * @param {any} input a build input
 * @param {'summary' | 'faq' | 'both' | 'neither'} variant which fields to set
 * @param {string} [slug] the article that receives them
 * @returns {any} the input
 */
export function withSummaryFaq(input, variant, slug = 'first-article') {
  const record = input.content.find(
    (/** @type {any} */ r) => r.frontmatter.slug === slug,
  );
  if (variant === 'summary' || variant === 'both') {
    record.frontmatter.summary = SUMMARY;
  }
  if (variant === 'faq' || variant === 'both') {
    record.frontmatter.faq = FAQ.map((item) => ({ ...item }));
  }
  return input;
}

/** @type {Promise<boolean> | undefined} */
let supported;

/**
 * Whether the installed `@rathnasgala2/schemas` accepts `summary` and `faq`.
 * It does from 3.55.0; until the lock moves, tests that build a page with the
 * fields skip with this as the reason. The release step removes the probe.
 *
 * @returns {Promise<boolean>} true when a build input carrying them validates
 */
export function schemaAcceptsSummaryFaq() {
  supported ??= (async () => {
    const dirs = await createRenderDirectories();
    try {
      await renderPublication(
        withSummaryFaq(await buildRichFixture(), 'both'),
        {
          outputDirectory: dirs.outputDirectory,
          workDirectory: dirs.workDirectory,
          sourceDirectory: dirs.sourceDirectory,
          provenance: testProvenance(),
        },
      );
      return true;
    } catch {
      return false;
    } finally {
      await dirs.cleanup();
    }
  })();
  return supported;
}

export const SKIP_REASON =
  'needs @rathnasgala2/schemas 3.55.0 (summary and faq in build-input)';

/**
 * @param {string} html a page
 * @returns {any} the page's parsed JSON-LD document
 */
export function jsonLdOf(html) {
  const match = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  assert.ok(match, 'the page has a JSON-LD script');
  return JSON.parse(match[1]);
}

/**
 * Assert a page shows exactly the given summary and FAQ, and states the FAQ in
 * its JSON-LD with the same strings, escaped in HTML and safe in the script.
 *
 * @param {string} html an article page
 * @param {{summary?: string, faq?: readonly {question: string, answer: string}[]}} expected
 * @returns {void}
 */
export function assertSummaryFaq(html, { summary, faq }) {
  const hasSummary = html.includes('aria-labelledby="g-summary-title"');
  const hasFaq = html.includes('aria-labelledby="g-faq-title"');
  assert.equal(hasSummary, summary !== undefined);
  assert.equal(hasFaq, faq !== undefined);
  const ld = jsonLdOf(html);
  const faqNodes = ld['@graph'].filter(
    (/** @type {any} */ node) => node['@type'] === 'FAQPage',
  );
  if (summary !== undefined) {
    assert.match(
      html,
      /<section aria-labelledby="g-summary-title"><h2 class="g-label" id="g-summary-title">/,
    );
    assert.ok(html.includes(`<p>${escapeHtml(summary)}</p></section>`));
    assert.ok(
      html.indexOf('g-summary-title') < html.indexOf('class="g-prose"'),
      'the summary comes before the body',
    );
  }
  if (faq === undefined) {
    assert.equal(faqNodes.length, 0, 'no FAQPage node without questions');
    return;
  }
  assert.ok(
    html.indexOf('class="g-prose"') < html.indexOf('g-faq-title'),
    'the questions come after the body start',
  );
  assert.ok(
    html.indexOf('g-faq-title') < html.indexOf('class="g-tags"') ||
      !html.includes('class="g-tags"'),
    'the questions come before the tags',
  );
  assert.ok(
    html.indexOf('g-faq-title') < html.indexOf('g-article-foot'),
    'the questions come before the closing blocks',
  );
  for (const item of faq) {
    assert.ok(html.includes(`<h3>${escapeHtml(item.question)}</h3>`));
    for (const line of item.answer.split('\n')) {
      assert.ok(
        html.includes(`<p>${escapeHtml(line)}</p>`),
        `answer paragraph: ${line}`,
      );
    }
  }
  assert.equal(faqNodes.length, 1);
  assert.deepEqual(
    faqNodes[0].mainEntity.map((/** @type {any} */ q) => [
      q.name,
      q.acceptedAnswer.text,
    ]),
    faq.map((item) => [item.question, item.answer]),
  );
  // The script element holds no raw angle bracket, so nothing can close it.
  const script = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  )?.[1];
  assert.ok(script && !/[<>&]/.test(script), 'JSON-LD is embed-safe');
  // Hostile text never appears unescaped in the markup.
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(!html.includes('<img src=x onerror=1>'));
}
