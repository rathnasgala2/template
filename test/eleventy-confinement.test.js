import { strict as assert } from 'node:assert';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { test } from 'node:test';

const execFileAsync = promisify(execFile);
const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const ELEVENTY_RENDER_MODULE_URL = new URL(
  '../src/core/internal/eleventy-render.js',
  import.meta.url,
).href;

/**
 * Eleventy confinement (brief S2 section 3: "no ... `.eleventy.js`
 * discovery from the author repository"). Eleventy's default config
 * discovery searches `process.cwd()` for `.eleventy.js`/`eleventy.config.*`.
 * This test runs the renderer's confined Eleventy call in a fresh
 * subprocess whose `cwd` is a directory holding a decoy `.eleventy.js` that
 * throws if ever loaded, proving the adapter's explicit `configPath: false`
 * (not merely "no config file happens to exist nearby in CI") is what
 * prevents discovery.
 */
test('the confined Eleventy call never discovers a .eleventy.js in its process cwd', async () => {
  const decoyDirectory = await mkdtemp(
    path.join(tmpdir(), 'gala-template-eleventy-decoy-'),
  );
  await writeFile(
    path.join(decoyDirectory, '.eleventy.js'),
    'module.exports = function () { throw new Error("decoy .eleventy.js must never be loaded"); };\n',
    'utf8',
  );

  const scriptPath = path.join(decoyDirectory, 'run.mjs');
  const workDirectory = path.join(decoyDirectory, 'work');
  const outputDirectory = path.join(decoyDirectory, 'output');
  await writeFile(
    scriptPath,
    [
      `import { renderPagesWithEleventy } from '${ELEVENTY_RENDER_MODULE_URL}';`,
      'await renderPagesWithEleventy({',
      '  pages: [{ virtualPath: "pages/one.html", content: "<p>ok</p>", permalink: "index.html", layout: "skeleton.njk", data: { title: "t", lang: "en" } }],',
      `  inputDirectory: ${JSON.stringify(path.join(workDirectory, 'input'))},`,
      `  outputDirectory: ${JSON.stringify(outputDirectory)},`,
      '});',
      'console.log("render-ok");',
    ].join('\n'),
    'utf8',
  );

  const { stdout } = await execFileAsync(process.execPath, [scriptPath], {
    cwd: decoyDirectory,
  });
  assert.match(stdout, /render-ok/);

  const rendered = await readFile(
    path.join(outputDirectory, 'index.html'),
    'utf8',
  );
  assert.match(rendered, /<p>ok<\/p>/);
});

test('src/core/internal/eleventy-render.js is the only module that imports @11ty/eleventy', async () => {
  const { readdir } = await import('node:fs/promises');

  /**
   * @param {string} directory absolute directory to walk
   * @returns {Promise<string[]>} every file path under it, recursively
   */
  async function listFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return listFiles(entryPath);
        return [entryPath];
      }),
    );
    return files.flat();
  }

  const sourceFiles = await listFiles(path.join(REPO_ROOT, 'src', 'core'));
  const importers = [];
  for (const filePath of sourceFiles) {
    const contents = await readFile(filePath, 'utf8');
    if (contents.includes("'@11ty/eleventy'")) {
      importers.push(path.relative(REPO_ROOT, filePath));
    }
  }

  assert.deepEqual(importers, ['src/core/internal/eleventy-render.js']);
});
