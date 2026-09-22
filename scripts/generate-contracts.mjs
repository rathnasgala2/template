import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { renderPolicyDocument } from '../src/core/internal/render-policy-content.js';
import {
  assertTemplateStylingContractShape,
  buildTemplateStylingContract,
} from '../src/core/internal/appearance/styling-contract.js';
import { canonicalizeJcs } from './jcs.mjs';
import { runIfMain } from './run-if-main.mjs';

const RENDER_POLICY_PATH = path.resolve('contracts/render-policy.jcs');
const THEME_STYLING_CONTRACT_PATH = path.resolve(
  'contracts/theme-styling-contract.jcs',
);

/**
 * Regenerate or check both contract files.
 *
 * @returns {Promise<void>} resolves once complete
 */
async function main() {
  const check = process.argv.includes('--check');
  const themeStylingContract = buildTemplateStylingContract();
  // Self-check before ever writing: a generator defect must never publish a
  // structurally invalid contract file (task packet S2-T12).
  assertTemplateStylingContractShape(themeStylingContract);
  /** @type {[string, Record<string, unknown>][]} */
  const targets = [
    [RENDER_POLICY_PATH, renderPolicyDocument()],
    [THEME_STYLING_CONTRACT_PATH, themeStylingContract],
  ];

  let drifted = false;
  for (const [filePath, document] of targets) {
    const canonical = canonicalizeJcs(document);
    if (check) {
      let existing;
      try {
        existing = await readFile(filePath, 'utf8');
      } catch {
        console.error(`${filePath}: missing`);
        drifted = true;
        continue;
      }
      if (existing !== canonical) {
        console.error(`${filePath}: not byte-identical to a fresh emit`);
        drifted = true;
      }
    } else {
      await writeFile(filePath, canonical, 'utf8');
    }
  }

  if (check && drifted) {
    throw new Error('contracts:check found stale or missing contract files');
  }
}

runIfMain(import.meta, main);
