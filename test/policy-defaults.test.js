/**
 * The shipped default policy text fails closed: an unreadable export, a
 * malformed member or empty Markdown throws a `RenderPolicyViolationError`
 * before any page is built, and nothing is returned for a page to render.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { RenderPolicyViolationError } from '../src/core/index.js';
import {
  loadSitePolicyDefaults,
  readSitePolicyDefaults,
} from '../src/core/internal/policy-defaults.js';

const SPECIFIER = '@rathnasgala2/schemas/site-policy-defaults';

const VALID = {
  terms: { title: 'Terms of Service', markdown: '# Terms\n\nText.\n' },
  privacy: { title: 'Privacy Policy', markdown: 'Text.\n' },
};

/**
 * @param {unknown} document the document the reader returns
 * @returns {() => string} a reader of that document's JSON text
 */
const readerOf = (document) => () => JSON.stringify(document);

/**
 * @param {() => string} readText the reader under test
 * @param {RegExp} message what the failure says
 * @param {string} name the case, for the assertion message
 * @returns {void}
 */
function assertFailsClosed(readText, message, name) {
  assert.throws(
    () => readSitePolicyDefaults(readText),
    (error) =>
      error instanceof RenderPolicyViolationError &&
      message.test(error.message),
    name,
  );
}

test('a well-formed defaults document is accepted and frozen', () => {
  const defaults = readSitePolicyDefaults(readerOf(VALID));
  assert.deepEqual(defaults, VALID);
  assert.ok(Object.isFrozen(defaults));
  assert.ok(Object.isFrozen(defaults.terms));
  assert.ok(Object.isFrozen(defaults.privacy));
});

test('the installed schemas package supplies non-empty text, read once', () => {
  const defaults = loadSitePolicyDefaults();
  assert.equal(loadSitePolicyDefaults(), defaults);
  for (const page of [defaults.terms, defaults.privacy]) {
    assert.ok(page.title.length > 0);
    assert.ok(page.markdown.trim().length > 0);
  }
});

test('an unreadable or unparseable export fails closed', () => {
  const unreadable = new RegExp(`^${SPECIFIER} could not be read`);
  /** @type {[string, () => string][]} */
  const readers = [
    [
      'the export does not resolve',
      () => {
        throw new Error(`Cannot find package '${SPECIFIER}'`);
      },
    ],
    [
      'the file is missing',
      () => {
        throw Object.assign(new Error('ENOENT: no such file'), {
          code: 'ENOENT',
        });
      },
    ],
    ['the file is not JSON', () => '{ not json'],
    ['the file is empty', () => ''],
    ['the reader returns nothing', () => /** @type {any} */ (undefined)],
  ];
  for (const [name, readText] of readers) {
    assertFailsClosed(readText, unreadable, name);
  }
});

test('a malformed member fails closed, naming the member', () => {
  /** @type {[string, unknown, string][]} */
  const malformed = [
    ['a null document', null, 'terms'],
    ['an array document', [], 'terms'],
    ['a number document', 42, 'terms'],
    ['no terms', { privacy: VALID.privacy }, 'terms'],
    ['no privacy', { terms: VALID.terms }, 'privacy'],
    ['terms that is a string', { ...VALID, terms: 'text' }, 'terms'],
    ['terms that is null', { ...VALID, terms: null }, 'terms'],
    ['privacy that is an array', { ...VALID, privacy: [] }, 'privacy'],
    [
      'no title',
      { ...VALID, privacy: { markdown: VALID.privacy.markdown } },
      'privacy',
    ],
    [
      'a non-string title',
      { ...VALID, terms: { ...VALID.terms, title: 7 } },
      'terms',
    ],
    [
      'an empty title',
      { ...VALID, terms: { ...VALID.terms, title: '' } },
      'terms',
    ],
    [
      'no markdown',
      { ...VALID, privacy: { title: VALID.privacy.title } },
      'privacy',
    ],
    [
      'non-string markdown',
      { ...VALID, terms: { ...VALID.terms, markdown: ['# Terms'] } },
      'terms',
    ],
  ];
  for (const [name, document, member] of malformed) {
    assertFailsClosed(
      readerOf(document),
      new RegExp(
        `^${SPECIFIER}: ${member} must carry a non-empty title and markdown$`,
      ),
      name,
    );
  }
});

test('empty or whitespace-only Markdown fails closed for either page', () => {
  for (const member of /** @type {const} */ (['terms', 'privacy'])) {
    for (const markdown of ['', '   ', '\n\n', ' \t\r\n ']) {
      assertFailsClosed(
        readerOf({ ...VALID, [member]: { ...VALID[member], markdown } }),
        new RegExp(
          `^${SPECIFIER}: ${member} must carry a non-empty title and markdown$`,
        ),
        `${member}: ${JSON.stringify(markdown)}`,
      );
    }
  }
});
