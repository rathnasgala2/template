import { strict as assert } from 'node:assert';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

/** Directories (relative to REPO_ROOT) and standalone files this test scans. */
const SCAN_ROOTS = ['src', 'scripts', 'types', 'contracts', 'docs'];
const SCAN_FILES = ['README.md'];

/** Internal-only orchestration shorthand (TPL-M5) that no external reader of
 * this public package can resolve: a `DEC-###` decision-record id or an
 * `S2-T##` task-packet id. CHANGELOG.md is the one file allowed to carry
 * these, as dated historical entries, and is deliberately excluded from
 * `SCAN_ROOTS`/`SCAN_FILES` above rather than allowlisted inline. */
const INTERNAL_IDENTIFIER = /\bDEC-\d{3}\b|\bS2-T\d+\b/;

/**
 * Recursively list every file path under `root`, relative to `REPO_ROOT`.
 *
 * @param {string} root absolute directory to walk
 * @returns {Promise<string[]>} relative file paths, order not significant
 */
async function listFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(root, entry.name);
      if (entry.isDirectory()) return listFiles(entryPath);
      return [path.relative(REPO_ROOT, entryPath)];
    }),
  );
  return files.flat();
}

test('no file under src/, scripts/, types/, contracts/, docs/ or README.md carries an unresolvable DEC-###/S2-T## internal identifier', async () => {
  const relativePaths = [
    ...(
      await Promise.all(
        SCAN_ROOTS.map((root) => listFiles(path.join(REPO_ROOT, root))),
      )
    ).flat(),
    ...SCAN_FILES,
  ];
  assert.ok(relativePaths.length > 0, 'expected at least one file to scan');

  for (const relativePath of relativePaths) {
    const contents = await readFile(path.join(REPO_ROOT, relativePath), 'utf8');
    const match = INTERNAL_IDENTIFIER.exec(contents);
    assert.equal(
      match,
      null,
      `${relativePath}: carries unresolvable internal identifier "${match?.[0]}" ` +
        "(DEC-### and S2-T## are only meaningful inside this project's own " +
        'orchestration history, not to an external reader of this package; ' +
        'CHANGELOG.md is the only place these are allowed, as dated history)',
    );
  }
});
