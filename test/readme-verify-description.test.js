/**
 * TPL-M4 acceptance test: README.md's prose description of `npm run verify`
 * names every gate `package.json`'s own `verify` script actually runs, in
 * the same order, so the two cannot drift apart silently again (the original
 * defect: the README described nine gates while `verify` ran thirteen, and
 * mischaracterized `sbom:check` as a presence check rather than a currency
 * check).
 */

import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

/**
 * @returns {Promise<string[]>} the ordered list of npm script names
 *   `package.json`'s `verify` script runs, e.g. `['format:check', 'lint',
 *   ..., 'test', ..., 'audit']` (`npm test`/`npm run test` both normalize to
 *   `'test'`).
 */
async function readVerifyScriptOrder() {
  const pkg = JSON.parse(
    await readFile(path.join(REPO_ROOT, 'package.json'), 'utf8'),
  );
  return pkg.scripts.verify.split('&&').map((command) => {
    const trimmed = command.trim();
    if (trimmed === 'npm test') return 'test';
    const match = /^npm run ([\w:-]+)$/.exec(trimmed);
    if (!match) {
      throw new Error(
        `unrecognized command in package.json's verify script: "${trimmed}"`,
      );
    }
    return match[1];
  });
}

/** @type {Readonly<Record<string, RegExp>>} one distinguishing phrase per
 * verify-chain script name, matched against README.md's `npm run verify`
 * descriptive paragraph. Keep this in sync with both `package.json`'s
 * `verify` script and the README paragraph — if either changes and this
 * mapping doesn't, this test is the thing that should fail. */
const README_GATE_PHRASE = Object.freeze({
  'format:check': /Prettier format check/,
  lint: /ESLint/,
  typecheck: /tsc --checkJs --noEmit/,
  architecture: /dependency-cruiser architecture\/module-tree-absence gate/,
  duplication: /`jscpd` duplication scan/,
  'contracts:check': /the `contracts\/\*\.jcs` canonical-form check/,
  'schema-pin:check': /the no-local-schema-pin check/,
  test: /`node --test`/,
  'licenses:check': /the license inventory check/,
  'sbom:check':
    /the SBOM currency check \(`sbom:check` compares `sbom\.cdx\.json` against the current lockfile — it is not a presence check\)/,
  'workflows:check': /the workflow-pin check/,
  audit: /`npm audit --audit-level=high`/,
});

/**
 * @returns {Promise<string>} the descriptive paragraph beginning
 *   "`npm run verify` ... runs, in order: ..." from README.md, with
 *   Prettier's `proseWrap: always` line breaks collapsed to single spaces so
 *   matching is robust to where exactly the prose happens to wrap
 */
async function readVerifyParagraph() {
  const readme = await readFile(path.join(REPO_ROOT, 'README.md'), 'utf8');
  const start = readme.indexOf(
    '`npm run verify` (this description is kept in sync',
  );
  assert.ok(
    start !== -1,
    'README.md must carry the `npm run verify` descriptive paragraph',
  );
  const end = readme.indexOf('\n\nIndividual gates:', start);
  assert.ok(
    end !== -1,
    'the descriptive paragraph must precede "Individual gates:"',
  );
  return readme.slice(start, end).replace(/\s+/g, ' ');
}

test("README's npm run verify paragraph names every gate package.json's verify script runs, in the same order", async () => {
  const order = await readVerifyScriptOrder();
  const paragraph = await readVerifyParagraph();

  for (const scriptName of order) {
    assert.ok(
      README_GATE_PHRASE[scriptName],
      `no README phrase mapping is registered for verify script "${scriptName}" — ` +
        `add one to README_GATE_PHRASE in this test`,
    );
  }
  assert.equal(
    Object.keys(README_GATE_PHRASE).length,
    order.length,
    'README_GATE_PHRASE must have exactly one entry per verify-chain script, no more, no fewer',
  );

  let searchFrom = 0;
  for (const scriptName of order) {
    const phrase = README_GATE_PHRASE[scriptName];
    const match = phrase.exec(paragraph);
    assert.ok(
      match,
      `README's verify paragraph does not mention "${scriptName}" ` +
        `(expected to match ${phrase})`,
    );
    assert.ok(
      match.index >= searchFrom,
      `README's verify paragraph mentions "${scriptName}" out of order ` +
        `relative to package.json's verify script`,
    );
    searchFrom = match.index;
  }
});
