import { strict as assert } from 'node:assert';
import { execFile } from 'node:child_process';
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  realpath,
  writeFile,
} from 'node:fs/promises';
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

/**
 * Eleventy relativizes every input path against `process.cwd()` with a bare
 * string `startsWith` (`TemplatePath.stripLeadingSubPath` in
 * `@11ty/eleventy-utils`), with no path-boundary check. An absolute input
 * directory that merely shares a string prefix with the working directory
 * (cwd `/x/site`, input `/x/site-work/input`) is therefore cut to
 * `work/input/...`; the dependency-graph node names then match no template map
 * entry, no entry gets its pages, and the build died with
 * `entry._pages is not iterable`. It looked like a flake because the result
 * depended on nothing but the caller's cwd and work-directory names. The
 * adapter must render the same bytes whatever the cwd is called.
 */
test('the confined Eleventy call renders when the input directory only string-prefix-matches the process cwd', async () => {
  const cases = [
    {
      name: 'sibling work directory named after the cwd',
      cwd: 'site',
      input: path.join('site-work', 'input'),
    },
    {
      name: 'sibling work directory sharing a longer prefix with the cwd',
      cwd: 'site',
      input: path.join('site.work', 'nested', 'input'),
    },
    {
      name: 'work directory inside the cwd',
      cwd: 'site',
      input: path.join('site', '.gala', 'work', 'input'),
    },
    {
      name: 'work directory unrelated to the cwd',
      cwd: 'site',
      input: path.join('elsewhere', 'input'),
    },
  ];

  for (const { name, cwd, input } of cases) {
    // The real path: the child's `process.cwd()` is the resolved path, and a
    // symlinked temp root (macOS `/var` to `/private/var`) would hide the
    // prefix match this test exists to exercise.
    const root = await realpath(
      await mkdtemp(path.join(tmpdir(), 'gala-template-eleventy-cwd-')),
    );
    const cwdDirectory = path.join(root, cwd);
    const inputDirectory = path.join(root, input);
    const outputDirectory = path.join(root, 'output');
    await mkdir(cwdDirectory, { recursive: true });

    const scriptPath = path.join(root, 'run.mjs');
    await writeFile(
      scriptPath,
      [
        `import { renderPagesWithEleventy } from '${ELEVENTY_RENDER_MODULE_URL}';`,
        'await renderPagesWithEleventy({',
        '  pages: [',
        '    { virtualPath: "pages/one.html", content: "<p>one</p>", permalink: "index.html", layout: "skeleton.njk", data: { title: "t", lang: "en" } },',
        '    { virtualPath: "feeds/atom.html", content: "<feed/>", permalink: "feed/atom.xml" },',
        '  ],',
        `  inputDirectory: ${JSON.stringify(inputDirectory)},`,
        `  outputDirectory: ${JSON.stringify(outputDirectory)},`,
        '});',
        'console.log("render-ok");',
      ].join('\n'),
      'utf8',
    );

    const { stdout } = await execFileAsync(process.execPath, [scriptPath], {
      cwd: cwdDirectory,
    });
    assert.match(stdout, /render-ok/, name);
    assert.match(
      await readFile(path.join(outputDirectory, 'index.html'), 'utf8'),
      /<p>one<\/p>/,
      name,
    );
    assert.equal(
      await readFile(path.join(outputDirectory, 'feed', 'atom.xml'), 'utf8'),
      '<feed/>',
      name,
    );
    // Nothing is written into the working directory by the render.
    const cwdEntries = await readdir(cwdDirectory);
    assert.deepEqual(
      cwdEntries.filter((entry) => entry !== '.gala'),
      [],
      name,
    );
  }
});

/**
 * The same Eleventy prefix cut applies to a process started in the filesystem
 * root (a container `WORKDIR /`): every absolute path starts with `/`, so every
 * input path lost its first two characters.
 */
test('the confined Eleventy call renders when the process cwd is the filesystem root', async () => {
  const root = await realpath(
    await mkdtemp(path.join(tmpdir(), 'gala-template-eleventy-rootcwd-')),
  );
  const outputDirectory = path.join(root, 'output');
  const scriptPath = path.join(root, 'run.mjs');
  await writeFile(
    scriptPath,
    [
      `import { renderPagesWithEleventy } from '${ELEVENTY_RENDER_MODULE_URL}';`,
      'await renderPagesWithEleventy({',
      '  pages: [{ virtualPath: "pages/one.html", content: "<p>one</p>", permalink: "index.html", layout: "skeleton.njk", data: { title: "t", lang: "en" } }],',
      `  inputDirectory: ${JSON.stringify(path.join(root, 'work', 'input'))},`,
      `  outputDirectory: ${JSON.stringify(outputDirectory)},`,
      '});',
      'console.log("render-ok");',
    ].join('\n'),
    'utf8',
  );

  const { stdout } = await execFileAsync(process.execPath, [scriptPath], {
    cwd: path.parse(root).root,
  });
  assert.match(stdout, /render-ok/);
  assert.match(
    await readFile(path.join(outputDirectory, 'index.html'), 'utf8'),
    /<p>one<\/p>/,
  );
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
