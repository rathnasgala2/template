/**
 * Task packet S2-T12 acceptance tests: `contracts/theme-styling-contract.jcs`
 * emission and structural self-validation, theme-contract:2.0.0 fixtures for
 * both palettes validated with the schema package's own exported validator,
 * a rendered-HTML drift gate against the published hook catalog, theme
 * asset copy/link integration for both stylesheet-list shapes, and the
 * basePath fix for the appearance script/theme/print stylesheet hrefs.
 */

import { strict as assert } from 'node:assert';
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { validateGalaDocument } from '@rathnasgala2/schemas';

import { renderPublication } from '../src/core/index.js';
import { appearanceBootstrapScriptHref } from '../src/core/internal/appearance/contract.js';
import { ThemeAssetError } from '../src/core/errors.js';
import {
  assertSafeThemeRelativePath,
  loadThemeAssets,
} from '../src/core/internal/theme-assets.js';
import { projectFixedAssetPath } from '../src/core/internal/route.js';
import {
  assertTemplateStylingContractShape,
  buildTemplateStylingContract,
  templateStylingContractHooks,
  templateStylingContractLeaves,
} from '../src/core/internal/appearance/styling-contract.js';
import { canonicalizeJcs } from '../scripts/jcs.mjs';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import {
  applyCurrentRenderPolicy,
  loadCanonicalBuildInput,
} from './helpers/schema-fixtures.js';
import { buildRichFixture, stableId } from './helpers/page-kind-fixtures.js';
import { buildValidThemeJson } from './helpers/theme-contract-fixtures.js';
import { normalizeAuthoredMarkdown } from '../src/core/internal/content-security.js';
import { HIGHLIGHT_GRAMMARS } from '../src/core/internal/render-policy-content.js';
import { buildTestPng, sha256Of } from './helpers/media-fixtures.js';

/**
 * Stage one file under a render's `sourceDirectory` and return a
 * `resolvedFile`-shaped reference for it (mirrors `test/media-pipeline.test.js`'s
 * own local `stage` helper).
 *
 * @param {string} sourceDirectory the render's source directory
 * @param {string} relativePath the repository-relative path to stage at
 * @param {Buffer} bytes the file's bytes
 * @returns {Promise<{path: string, sourceDigest: string}>} the reference
 */
async function stageMediaFile(sourceDirectory, relativePath, bytes) {
  const absolute = path.join(sourceDirectory, relativePath);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, bytes);
  return { path: relativePath, sourceDigest: sha256Of(bytes) };
}

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const FIXTURES_ROOT = path.resolve(import.meta.dirname, 'fixtures');
const CONTRACT_PATH = path.join(
  REPO_ROOT,
  'contracts/theme-styling-contract.jcs',
);

// --- Contract emission and structural validation ---

test('the published contract byte-equals a fresh generate from the reviewed source module', async () => {
  const published = await readFile(CONTRACT_PATH, 'utf8');
  const fresh = canonicalizeJcs(buildTemplateStylingContract());
  assert.equal(published, fresh);
});

test('the published contract passes structural self-validation', async () => {
  const document = JSON.parse(await readFile(CONTRACT_PATH, 'utf8'));
  assert.doesNotThrow(() => assertTemplateStylingContractShape(document));
});

test('a mutated catalogDigest, layer order or attribute row is rejected', () => {
  const document = buildTemplateStylingContract();

  assert.throws(() =>
    assertTemplateStylingContractShape({
      ...document,
      catalogDigest: 'sha256:' + '0'.repeat(64),
    }),
  );
  assert.throws(() =>
    assertTemplateStylingContractShape({
      ...document,
      orderedLayers: [
        'gala-print',
        'gala-tokens',
        'gala-components',
        'gala-utilities',
      ],
    }),
  );
  assert.throws(() =>
    assertTemplateStylingContractShape({
      ...document,
      attributes: document.attributes.filter((row) => row.role !== 'root'),
    }),
  );
});

test('exactly 64 public theme-slot hooks, sorted by hookId, each atom appearing exactly once', () => {
  const hooks = templateStylingContractHooks();
  assert.equal(hooks.length, 64);
  const atoms = new Set(hooks.map((hook) => hook.selectorAtom));
  assert.equal(atoms.size, 64, 'every hook selectorAtom must be unique');
  const hookIds = new Set(hooks.map((hook) => hook.hookId));
  assert.equal(hookIds.size, 64, 'every hookId must be unique');
});

test('cssLayers/stylesheet shapes: the contract fixes the ordered five-layer catalog including the template-owned gala-base layer', () => {
  const document = buildTemplateStylingContract();
  assert.deepEqual(document.orderedLayers, [
    'gala-base',
    'gala-tokens',
    'gala-components',
    'gala-utilities',
    'gala-print',
  ]);
  assert.deepEqual(document.stylesheetLayers, {
    tokens: 'gala-tokens',
    components: 'gala-components',
    utilities: 'gala-utilities',
    print: 'gala-print',
  });
});

// --- theme-contract:2.0.0 fixtures for both palettes, validated with the
// schema package's own exported validator ---

/**
 * Build the exact 35-row `theme-contract.tokens` array (borrowed shape from
 * `@rathnasgala2/schemas`' own S2 digest-cycle fixture family; structurally
 * valid placeholder digests elsewhere — `validateGalaDocument` performs
 * ajv/JSON-Schema structural validation only, never digest recomputation).
 *
 * @param {{light: string, dark: string}} colors the light/dark hex pair
 *   every color-typed token row carries
 * @returns {{key: string, type: string, light: string, dark: string}[]}
 *   the sorted token rows
 */
function baseThemeContractTokens(colors) {
  const lengthTokens = [
    'border-width',
    'content-measure',
    'focus-width',
    'radius-medium',
    'radius-small',
    'space-1',
    'space-2',
    'space-3',
    'space-4',
    'space-6',
    'space-8',
  ];
  const fontFamilyTokens = ['font-body', 'font-heading', 'font-mono'];
  const fontWeightTokens = [
    'weight-heading',
    'weight-medium',
    'weight-normal',
    'weight-strong',
  ];
  const colorTokens = [
    'color-accent',
    'color-border',
    'color-canvas',
    'color-code-canvas',
    'color-code-text',
    'color-danger',
    'color-focus',
    'color-link',
    'color-link-visited',
    'color-on-accent',
    'color-selection',
    'color-success',
    'color-surface',
    'color-surface-raised',
    'color-text',
    'color-text-muted',
    'color-warning',
  ];
  /** @type {{key: string, type: string, light: string, dark: string}[]} */
  const rows = [];
  for (const key of lengthTokens) {
    rows.push({ key, type: 'length', light: '0.25rem', dark: '0.25rem' });
  }
  for (const key of colorTokens) {
    rows.push({ key, type: 'color', light: colors.light, dark: colors.dark });
  }
  for (const key of fontFamilyTokens) {
    rows.push({ key, type: 'font-family', light: 'Inter', dark: 'Inter' });
  }
  for (const key of fontWeightTokens) {
    rows.push({ key, type: 'font-weight', light: '600', dark: '600' });
  }
  return rows.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}

/**
 * @param {{themeId: string, light: string, dark: string}} options
 * @returns {Record<string, unknown>} a complete `theme-contract:2.0.0`
 *   candidate instance for one palette pair
 */
function buildThemeContractFixture({ themeId, light, dark }) {
  return {
    schemaId: 'urn:gala:schema:theme-contract:2.0.0',
    schemaVersion: '2.0.0',
    themeId,
    package: `@rathnasgala2/theme-default@2.0.0`,
    contractVersion: '2.0.0',
    templateRange: '^2.0.0',
    stylesheets: ['tokens.css', 'components.css', 'print.css'],
    cssLayers: ['gala-tokens', 'gala-components', 'gala-print'],
    slotHooks: ['landmark-header'],
    tokens: baseThemeContractTokens({ light, dark }),
    modes: ['dark', 'light', 'system'],
    assets: [
      {
        path: 'content/fixture-1.md',
        mediaType: 'text/css',
        byteLength: '1',
        sha256: `sha256:${'0'.repeat(63)}1`,
        license: 'MIT',
      },
    ],
    fixtures: ['fixture-1'],
    browserPolicyRef: 'gala-theme-css-v2-20211224',
    integrity: `sha256:${'0'.repeat(63)}1`,
    budgets: { maximumFileBytes: '1', maximumTotalBytes: '1', maximumFiles: 1 },
    fixtureDigest: `sha256:${'02'.repeat(32)}`,
    evidenceDigest: `sha256:${'03'.repeat(32)}`,
    stylingContractDigest: `sha256:${'04'.repeat(32)}`,
  };
}

test('theme-contract:2.0.0 fixture validates for a light-dominant palette', () => {
  const instance = buildThemeContractFixture({
    themeId: 'default',
    light: '#ffffff',
    dark: '#101010',
  });
  const result = validateGalaDocument(
    'urn:gala:schema:theme-contract:2.0.0',
    instance,
  );
  assert.equal(
    result.valid,
    true,
    `expected valid, got diagnostics: ${JSON.stringify(result.diagnostics)}`,
  );
});

test('theme-contract:2.0.0 fixture validates for a dark-dominant palette', () => {
  const instance = buildThemeContractFixture({
    themeId: 'default',
    light: '#f5f0e8',
    dark: '#0b0b12',
  });
  const result = validateGalaDocument(
    'urn:gala:schema:theme-contract:2.0.0',
    instance,
  );
  assert.equal(
    result.valid,
    true,
    `expected valid, got diagnostics: ${JSON.stringify(result.diagnostics)}`,
  );
});

test('an invalid theme-contract:2.0.0 fixture (missing required field) is rejected', () => {
  const instance = buildThemeContractFixture({
    themeId: 'default',
    light: '#ffffff',
    dark: '#101010',
  });
  delete instance.stylingContractDigest;
  const result = validateGalaDocument(
    'urn:gala:schema:theme-contract:2.0.0',
    instance,
  );
  assert.equal(result.valid, false);
  assert.ok(result.diagnostics.length > 0);
});

// --- Drift gate: every hook this contract publishes must actually be
// rendered by a rich fixture build, and every hook-like construct the
// renderer actually emits must be published ---

/**
 * A markdown source exercising every heading level, list kind, code fence
 * grammar (all 14 admitted highlighter grammars), and the other inline/
 * block elements this template's markdown-it pipeline can produce.
 *
 * @returns {string}
 */
function richMarkdownSource() {
  const fences = HIGHLIGHT_GRAMMARS.map(
    (grammar) => `\`\`\`${grammar}\nconst x = 1;\n\`\`\`\n`,
  ).join('\n');
  return (
    '## Section two\n\n' +
    'Some **strong** and *emphasis* text with a [link](https://example.test/) ' +
    'and an image ![alt](photo.png).\n\n' +
    '> A blockquote.\n\n' +
    '- one\n- two\n\n' +
    '1. first\n2. second\n\n' +
    '---\n\n' +
    '### Section three\n\n' +
    '#### Section four\n\n' +
    '##### Section five\n\n' +
    '###### Section six\n\n' +
    fences
  );
}

/**
 * @returns {Promise<Record<string, unknown>>} the rich fixture with one
 *   additional article whose body exercises every markdown-derived hook
 */
async function buildCoverageFixture() {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  const { html, bodyDigest } = normalizeAuthoredMarkdown(richMarkdownSource());
  const [templateRecord] = buildInput.content;
  const coverageRecord = JSON.parse(JSON.stringify(templateRecord));
  coverageRecord.frontmatter.id = stableId(99);
  coverageRecord.frontmatter.slug = 'coverage-article';
  coverageRecord.frontmatter.route = undefined;
  coverageRecord.frontmatter.title = 'Coverage article';
  coverageRecord.frontmatter.tags = [];
  coverageRecord.frontmatter.series = undefined;
  coverageRecord.frontmatter.seriesOrder = undefined;
  coverageRecord.body = html;
  coverageRecord.bodyDigest = bodyDigest;
  buildInput.content.push(coverageRecord);
  await applyCurrentRenderPolicy(buildInput);
  return buildInput;
}

/**
 * @param {string} outputDirectory a finished candidate output directory
 * @param {readonly {path: string, routeClass: string}[]} routes
 * @returns {Promise<string>} the concatenation of every HTML route's bytes
 */
async function readAllHtml(outputDirectory, routes) {
  const chunks = [];
  for (const route of routes) {
    if (route.routeClass !== 'html' && route.routeClass !== 'error') continue;
    chunks.push(await readFile(path.join(outputDirectory, route.path), 'utf8'));
  }
  return chunks.join('\n');
}

test('drift gate: every published hook is actually rendered by the rich fixture, and every rendered hook-like construct is published', async () => {
  const buildInput = await buildCoverageFixture();
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    const { manifest } = await renderPublication(buildInput, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      provenance: testProvenance(),
    });
    const html = await readAllHtml(outputDirectory, manifest.routes);
    const hooks = templateStylingContractHooks();

    // Direction 1: every declared hook must actually be rendered.
    for (const hook of hooks) {
      let pattern;
      if (hook.kind === 'type') {
        pattern = new RegExp(`<${hook.selectorAtom}[ >]`);
      } else if (hook.kind === 'class') {
        const className = hook.selectorAtom.slice(1);
        pattern = new RegExp(`class="[^"]*\\b${className}\\b[^"]*"`);
      } else if (hook.kind === 'id') {
        const idValue = hook.selectorAtom.slice(1);
        pattern = new RegExp(`id="${idValue}"`);
      } else {
        const match = /^\[([a-z-]+)="([a-z-]+)"\]$/.exec(hook.selectorAtom);
        pattern = new RegExp(`${match[1]}="${match[2]}"`);
      }
      assert.ok(
        pattern.test(html),
        `hook ${hook.hookId} (${hook.selectorAtom}) is declared but never rendered`,
      );
    }

    // Direction 2a: every rendered data-gala-* attribute name is declared.
    const declaredAttributeNames = new Set([
      'data-gala-publication-root',
      'data-gala-resolved-color-mode',
      'data-gala-slot',
      'data-gala-page-kind',
      // Set by the client-side bootstrap script only, never server-rendered
      // (S2-T07); included here so a false positive never occurs if it ever
      // is.
      'data-gala-color-mode-selection',
    ]);
    const foundAttributeNames = new Set(
      [...html.matchAll(/data-gala-[a-z-]+/g)].map((m) => m[0]),
    );
    for (const name of foundAttributeNames) {
      assert.ok(
        declaredAttributeNames.has(name),
        `rendered attribute ${name} is not part of the published contract`,
      );
    }

    // Direction 2b: every `pre.class`/`code.class` language class, and the
    // base Prism `.token` class on a highlighted `<span>`, is declared.
    // Deliberately excluded (module documentation's scoped decision, not a
    // drift finding): Prism's own per-token-kind subclasses (`keyword`,
    // `operator`, `number`, `punctuation`, ...) — S2's public hook surface
    // never promotes them, so a theme cannot recolor individual token kinds,
    // only a highlighted block's overall presentation.
    const { classes: declaredClasses } = templateStylingContractLeaves();
    const declaredClassSet = new Set(declaredClasses);
    for (const match of html.matchAll(/<(?:pre|code)[^>]*\bclass="([^"]*)"/g)) {
      for (const token of match[1].split(/\s+/).filter(Boolean)) {
        assert.ok(
          declaredClassSet.has(token),
          `rendered class ${token} on <pre>/<code> is not part of the published contract`,
        );
      }
    }
    assert.ok(
      html.includes('class="token'),
      'the base Prism .token class must actually be rendered',
    );

    // Direction 2c: every element tag inside <body>, other than the fixed,
    // documented, non-hook structural set, is a declared type-selector leaf
    // (headings' own dynamically-content-derived `id` values are excluded
    // from this check by construction — idSelectors never carry a dynamic,
    // per-content value; see module documentation).
    const { types: declaredTypes } = templateStylingContractLeaves();
    const declaredTypeSet = new Set(declaredTypes);
    // `<body>` itself and the plain `<div>` slot wrapper
    // (`internal/skeleton.js`'s `renderSlot`) carry no styling meaning of
    // their own — a theme targets a slot's `[data-gala-slot="..."]`
    // attribute-value hook instead, never the wrapping `div` by type.
    const NON_HOOK_STRUCTURAL_TAGS = new Set(['body', 'div']);
    for (const bodyMatch of html.matchAll(/<body[^>]*>([\s\S]*?)<\/body>/g)) {
      for (const tagMatch of bodyMatch[1].matchAll(/<([a-z][a-z0-9]*)[ >]/g)) {
        const tag = tagMatch[1];
        if (NON_HOOK_STRUCTURAL_TAGS.has(tag)) continue;
        assert.ok(
          declaredTypeSet.has(tag),
          `rendered element <${tag}> is not part of the published contract`,
        );
      }
    }
  } finally {
    await cleanup();
  }
});

// --- Theme asset path containment (independent-review finding B1) ---

/**
 * Build a fresh, minimal, otherwise fully `theme-contract:2.0.0`-conformant
 * (TPL-H1) theme package directory (three stylesheets, no `utilities.css`)
 * with a caller-supplied set of extra passive-asset files, for exercising
 * `loadThemeAssets`'s path-containment checks directly (unit level, rather
 * than through a full `renderPublication` build).
 *
 * @param {readonly {path: string, mediaType: string, bytes: Buffer}[]} extraFiles
 *   declared passive-asset files (already written to disk by the caller) to
 *   add to `theme.json.assets`, each with an internally-consistent digest
 * @returns {Promise<string>} the fresh temporary theme directory
 */
async function buildThemeFixtureDirectory(extraFiles) {
  const dir = await mkdtemp(path.join(tmpdir(), 'gala-theme-fixture-'));
  const stylesheetFiles = [
    {
      path: 'tokens.css',
      mediaType: 'text/css',
      text: '@layer gala-tokens {\n}\n',
    },
    {
      path: 'components.css',
      mediaType: 'text/css',
      text: '@layer gala-components {\n}\n',
    },
    {
      path: 'print.css',
      mediaType: 'text/css',
      text: '@layer gala-print {\n}\n',
    },
  ];
  for (const file of stylesheetFiles) {
    await writeFile(path.join(dir, file.path), file.text);
  }
  const themeJson = buildValidThemeJson({
    stylesheets: stylesheetFiles.map((f) => f.path),
    cssLayers: ['gala-tokens', 'gala-components', 'gala-print'],
    files: [
      ...stylesheetFiles.map((f) => ({
        path: f.path,
        mediaType: f.mediaType,
        bytes: Buffer.from(f.text, 'utf8'),
      })),
      ...extraFiles,
    ],
  });
  await writeFile(path.join(dir, 'theme.json'), JSON.stringify(themeJson));
  return dir;
}

/**
 * @param {() => Promise<unknown>} action the async action to run
 * @returns {Promise<void>} resolves once `action` is asserted to reject
 *   with a `ThemeAssetError` whose `reasonCode` is `THEME_ASSET_PATH_UNSAFE`
 */
async function assertRejectsUnsafeThemePath(action) {
  await assert.rejects(
    action,
    (error) =>
      error instanceof ThemeAssetError &&
      error.reasonCode === 'THEME_ASSET_PATH_UNSAFE',
  );
}

// The next three checks are syntactic and are now caught twice: once by
// `urn:gala:schema:theme-contract:2.0.0`'s own `repoRelativePath` format
// (TPL-H1 makes that load-bearing at consume time, so a malformed path never
// even reaches `loadThemeAssets`'s own logic for a real theme package), and
// independently by `assertSafeThemeRelativePath` itself. They are exercised
// directly against that function so this suite keeps testing this module's
// own containment logic instead of only re-proving the schema's format
// check.

test('theme asset path containment: a "../" traversal in a declared asset path is rejected', () => {
  assert.throws(
    () => assertSafeThemeRelativePath('../evil.svg'),
    (error) =>
      error instanceof ThemeAssetError &&
      error.reasonCode === 'THEME_ASSET_PATH_UNSAFE',
  );
});

test('theme asset path containment: an absolute declared asset path is rejected', () => {
  assert.throws(
    () => assertSafeThemeRelativePath('/etc/passwd'),
    (error) =>
      error instanceof ThemeAssetError &&
      error.reasonCode === 'THEME_ASSET_PATH_UNSAFE',
  );
});

test('theme asset path containment: a backslash-separated declared asset path is rejected', () => {
  assert.throws(
    () => assertSafeThemeRelativePath('assets\\evil.svg'),
    (error) =>
      error instanceof ThemeAssetError &&
      error.reasonCode === 'THEME_ASSET_PATH_UNSAFE',
  );
});

test('theme asset path containment: a symlink component that escapes the theme directory is rejected', async () => {
  const dir = await buildThemeFixtureDirectory([
    {
      path: 'assets/escape.svg',
      mediaType: 'image/svg+xml',
      bytes: Buffer.from('<svg></svg>', 'utf8'),
    },
  ]);
  try {
    const secretDir = await mkdtemp(
      path.join(tmpdir(), 'gala-theme-outside-secret-'),
    );
    const secretFile = path.join(secretDir, 'secret.svg');
    await writeFile(secretFile, '<svg></svg>');
    await mkdir(path.join(dir, 'assets'), { recursive: true });
    await symlink(secretFile, path.join(dir, 'assets', 'escape.svg'));
    try {
      await assertRejectsUnsafeThemePath(() =>
        loadThemeAssets({ themeDirectory: dir, basePath: '/' }),
      );
    } finally {
      await rm(secretDir, { recursive: true, force: true });
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('theme asset path containment: a file physically present but never declared in theme.json is never copied', async () => {
  const dir = await buildThemeFixtureDirectory([]);
  await mkdir(path.join(dir, 'assets'), { recursive: true });
  await writeFile(path.join(dir, 'assets', 'undeclared.svg'), '<svg></svg>');
  try {
    const result = await loadThemeAssets({
      themeDirectory: dir,
      basePath: '/',
    });
    assert.equal(result.files.length, 3, 'only the three declared stylesheets');
    assert.ok(
      !result.files.some((file) => file.path.includes('undeclared.svg')),
      'an undeclared file present in the theme directory must never be copied',
    );
    assert.ok(
      !result.assets.some((asset) => asset.path.includes('undeclared.svg')),
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// --- Theme asset integration ---

test('theme asset integration (with utilities.css): stylesheets are copied, manifest rows recorded and <link> elements emitted in cssLayers order', async () => {
  const buildInput = await loadCanonicalBuildInput();
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    const { manifest } = await renderPublication(buildInput, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      themeDirectory: path.join(FIXTURES_ROOT, 'theme-fixture-full'),
      provenance: testProvenance(),
    });

    for (const filename of [
      'tokens.css',
      'components.css',
      'utilities.css',
      'print.css',
    ]) {
      const outputPath = projectFixedAssetPath(
        buildInput.basePath,
        `/assets/theme/${filename}`,
      );
      const asset = manifest.assets.find((a) => a.path === outputPath);
      assert.ok(asset, `${outputPath} must have a manifestAsset row`);
      assert.equal(asset.mediaType, 'text/css; charset=utf-8');
      const bytes = await readFile(path.join(outputDirectory, outputPath));
      assert.equal(String(bytes.byteLength), asset.byteLength);
    }
    const passiveAsset = manifest.assets.find(
      (a) =>
        a.path ===
        projectFixedAssetPath(
          buildInput.basePath,
          '/assets/theme/assets/mark.svg',
        ),
    );
    assert.ok(
      passiveAsset,
      'the passive svg asset must be copied and recorded',
    );
    assert.equal(passiveAsset.mediaType, 'image/svg+xml');

    const route = manifest.routes.find(
      (candidate) => candidate.routeClass === 'html',
    );
    const html = await readFile(path.join(outputDirectory, route.path), 'utf8');
    const linkOrder = [...html.matchAll(/assets\/theme\/([a-z]+\.css)/g)].map(
      (m) => m[1],
    );
    assert.deepEqual(linkOrder, [
      'tokens.css',
      'components.css',
      'utilities.css',
      'print.css',
    ]);
    assert.ok(html.includes('media="print"'));
    assert.ok(
      !/<link rel="stylesheet" href="[^"]*tokens\.css"[^>]*media="print"/.test(
        html,
      ),
      'only print.css carries media="print"',
    );
  } finally {
    await cleanup();
  }
});

test('theme asset integration (without utilities.css): the three-stylesheet shape is accepted', async () => {
  const buildInput = await loadCanonicalBuildInput();
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    const { manifest } = await renderPublication(buildInput, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      themeDirectory: path.join(FIXTURES_ROOT, 'theme-fixture-minimal'),
      provenance: testProvenance(),
    });
    const utilities = manifest.assets.find(
      (a) =>
        a.path ===
        projectFixedAssetPath(
          buildInput.basePath,
          '/assets/theme/utilities.css',
        ),
    );
    assert.equal(utilities, undefined);
    for (const filename of ['tokens.css', 'components.css', 'print.css']) {
      const outputPath = projectFixedAssetPath(
        buildInput.basePath,
        `/assets/theme/${filename}`,
      );
      assert.ok(manifest.assets.some((a) => a.path === outputPath));
    }
  } finally {
    await cleanup();
  }
});

test('renderPublication falls back to the default print-stylesheet link when no themeDirectory is supplied', async () => {
  const buildInput = await loadCanonicalBuildInput();
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    const { manifest } = await renderPublication(buildInput, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      provenance: testProvenance(),
    });
    assert.ok(
      !manifest.assets.some((a) => a.path.startsWith('assets/theme/')),
      'no theme asset row is emitted without options.themeDirectory',
    );
    const route = manifest.routes.find((r) => r.routeClass === 'html');
    const html = await readFile(path.join(outputDirectory, route.path), 'utf8');
    assert.ok(
      html.includes(
        '<link rel="stylesheet" href="/fixture-1/assets/theme/print.css" media="print">',
      ),
    );
  } finally {
    await cleanup();
  }
});

// --- basePath fix (LOCAL-7 follow-up / independent-review finding B2) ---

/**
 * @param {string} absolutePath a candidate absolute path
 * @returns {Promise<boolean>} whether a regular file exists there
 */
async function fileExists(absolutePath) {
  try {
    const stats = await stat(absolutePath);
    return stats.isFile();
  } catch {
    return false;
  }
}

test('basePath fix: appearance script, theme stylesheet, media derivative and social-image hrefs are all basePath-joined, and the physical files for every asset class actually exist at that joined path, under a non-root, multi-segment basePath', async () => {
  const buildInput = /** @type {any} */ (await loadCanonicalBuildInput());
  buildInput.basePath = '/blog/2024';
  buildInput.content[0].frontmatter.route = '/blog/2024/fixture-1';
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    buildInput.publication.defaultImage = await stageMediaFile(
      sourceDirectory,
      'assets/default.png',
      buildTestPng(400, 200),
    );
    await applyCurrentRenderPolicy(buildInput);
    const { manifest } = await renderPublication(buildInput, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      themeDirectory: path.join(FIXTURES_ROOT, 'theme-fixture-minimal'),
      provenance: testProvenance(),
    });
    const route = manifest.routes.find(
      (candidate) => candidate.routeClass === 'html',
    );
    const html = await readFile(path.join(outputDirectory, route.path), 'utf8');
    assert.equal(
      appearanceBootstrapScriptHref('/blog/2024'),
      '/blog/2024/assets/gala-appearance-bootstrap-v1.js',
    );
    assert.ok(
      html.includes(
        '<script src="/blog/2024/assets/gala-appearance-bootstrap-v1.js"></script>',
      ),
    );
    // TPL-M1 fix: theme stylesheet <link>s now carry integrity/crossorigin;
    // matched loosely here (both are content-derived) rather than
    // hardcoding the digest.
    assert.match(
      html,
      /<link rel="stylesheet" href="\/blog\/2024\/assets\/theme\/tokens\.css" integrity="sha256-[^"]+" crossorigin="anonymous">/,
    );
    assert.match(
      html,
      /<link rel="stylesheet" href="\/blog\/2024\/assets\/theme\/print\.css" integrity="sha256-[^"]+" crossorigin="anonymous" media="print">/,
    );

    // Physical existence, one file per asset class, at the exact
    // manifest/href-joined path — the local-directory adapter serves a
    // manifest `path` verbatim, so a mismatch here means a 404 in
    // production, not just a wrong href.
    const themeCssAsset = manifest.assets.find(
      (a) => a.path === 'blog/2024/assets/theme/tokens.css',
    );
    assert.ok(themeCssAsset, 'theme tokens.css manifest row must exist');
    assert.ok(
      await fileExists(path.join(outputDirectory, themeCssAsset.path)),
      'theme tokens.css must physically exist at its joined manifest path',
    );

    const mediaAsset = manifest.assets.find((a) =>
      a.path.startsWith('blog/2024/assets/media/'),
    );
    assert.ok(mediaAsset, 'a joined media derivative manifest row must exist');
    assert.ok(
      await fileExists(path.join(outputDirectory, mediaAsset.path)),
      'the media derivative must physically exist at its joined manifest path',
    );

    const appearanceScriptAsset = manifest.assets.find(
      (a) => a.path === 'blog/2024/assets/gala-appearance-bootstrap-v1.js',
    );
    assert.ok(
      appearanceScriptAsset,
      'the appearance bootstrap script manifest row must exist',
    );
    assert.ok(
      await fileExists(path.join(outputDirectory, appearanceScriptAsset.path)),
      'the appearance bootstrap script must physically exist at its joined manifest path',
    );

    // Every manifest asset path must be joined the same way — none should
    // remain at a bare, unjoined `assets/...` root path.
    for (const asset of manifest.assets) {
      assert.ok(
        asset.path.startsWith('blog/2024/'),
        `manifest asset ${asset.path} must be basePath-joined under blog/2024`,
      );
    }
  } finally {
    await cleanup();
  }
});

test('basePath fix: og:image is basePath-joined against baseUrl for a non-root basePath', async () => {
  const buildInput = /** @type {any} */ (await loadCanonicalBuildInput());
  buildInput.basePath = '/blog';
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    buildInput.publication.defaultImage = await stageMediaFile(
      sourceDirectory,
      'assets/default.png',
      buildTestPng(400, 200),
    );
    await applyCurrentRenderPolicy(buildInput);
    const { manifest } = await renderPublication(buildInput, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      provenance: testProvenance(),
    });
    const route = manifest.routes.find(
      (candidate) => candidate.routeClass === 'html',
    );
    const html = await readFile(path.join(outputDirectory, route.path), 'utf8');
    const match = /<meta property="og:image" content="([^"]*)">/.exec(html);
    assert.ok(match, 'og:image meta must be present');
    assert.ok(
      new URL(match[1]).pathname.startsWith('/blog/assets/media/'),
      `og:image ${match[1]} must be basePath-joined under /blog`,
    );
  } finally {
    await cleanup();
  }
});
