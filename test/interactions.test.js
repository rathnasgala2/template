/**
 * Reader interactions, render side (design sections 3 to 5): the always-on
 * API origin in the CSP and the render-policy identity derived from it,
 * `build-input.modules.interactions` validation, the server-rendered section,
 * the manifest flags and the script asset.
 */

import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { renderPublication } from '../src/core/index.js';
import { RenderPolicyViolationError } from '../src/core/errors.js';
import {
  CONTENT_SECURITY_POLICY_COMPLETE,
  CONTENT_SECURITY_POLICY_META_BASELINE,
  PRODUCTION_API_ORIGIN,
  contentSecurityPolicyMeta,
} from '../src/core/internal/render-policy-content.js';
import {
  assertRenderPolicyIdentity,
  computeRenderPolicyIdentity,
  contentSecurityPolicyMetaTag,
} from '../src/core/internal/content-security.js';
import {
  INTERACTIONS_SCRIPT_PATH,
  interactionsActive,
  renderInteractionsSection,
  validateInteractionsModule,
} from '../src/core/internal/interactions.js';
import { getMessages } from '../src/core/internal/messages.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { buildRichFixture } from './helpers/page-kind-fixtures.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const SECTION_CSP =
  "default-src 'none'; base-uri 'none'; object-src 'none'; form-action 'none'; " +
  "script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; " +
  "connect-src 'self' https://api.galascribe.com; media-src 'self'; " +
  "manifest-src 'self'; worker-src 'none'";

/** @returns {any} a valid module selection (fresh each call) */
function moduleSelection() {
  return {
    config: {
      schemaId: 'urn:gala:schema:interactions-config:2.0.0',
      schemaVersion: '2.0.0',
      reactions: {
        enabled: true,
        definitions: [
          {
            key: 'insightful',
            label: 'Insightful',
            visual: { kind: 'emoji', token: '\u{1F4A1}' },
            order: 2,
            enabled: true,
          },
          {
            key: 'hidden-one',
            label: 'Hidden',
            visual: { kind: 'emoji', token: '\u{1F525}' },
            order: 3,
            enabled: false,
          },
          {
            key: 'applause',
            label: 'A & "q"',
            visual: { kind: 'emoji', token: '\u{1F44F}' },
            order: 1,
            enabled: true,
          },
        ],
      },
      comments: { enabled: true, allowReplies: true, maxDepth: 3 },
      publicCounts: { reactions: true, comments: false },
    },
    apiOrigin: 'https://api.galascribe.com',
    appOrigin: 'https://app.galascribe.com',
  };
}

// --- CSP ---

test('the production CSP is exactly the design string, with and without a module', () => {
  assert.equal(CONTENT_SECURITY_POLICY_META_BASELINE, SECTION_CSP);
  assert.equal(contentSecurityPolicyMeta(undefined), SECTION_CSP);
  assert.equal(contentSecurityPolicyMeta(PRODUCTION_API_ORIGIN), SECTION_CSP);
  assert.equal(
    CONTENT_SECURITY_POLICY_COMPLETE,
    SECTION_CSP.replace(
      "form-action 'none';",
      "frame-ancestors 'none'; form-action 'none';",
    ),
  );
  assert.equal(
    contentSecurityPolicyMetaTag(undefined),
    `<meta http-equiv="Content-Security-Policy" content="${SECTION_CSP}">`,
  );
});

test('a differing local API origin is appended to connect-src, sorted and de-duplicated', () => {
  assert.equal(
    contentSecurityPolicyMeta('http://localhost:8787'),
    SECTION_CSP.replace(
      "connect-src 'self' https://api.galascribe.com;",
      "connect-src 'self' http://localhost:8787 https://api.galascribe.com;",
    ),
  );
  assert.equal(
    contentSecurityPolicyMeta('http://127.0.0.1:8080'),
    SECTION_CSP.replace(
      "connect-src 'self' https://api.galascribe.com;",
      "connect-src 'self' http://127.0.0.1:8080 https://api.galascribe.com;",
    ),
  );
  const tag = contentSecurityPolicyMetaTag('https://api.example.test');
  assert.match(
    tag,
    /connect-src 'self' https:\/\/api\.example\.test https:\/\/api\.galascribe\.com;/,
  );
  assert.equal(
    (contentSecurityPolicyMeta('http://localhost:1').match(/localhost/g) ?? [])
      .length,
    1,
  );
});

// --- render-policy identity ---

test('the render-policy identity is derived from the published contract, which now carries the API origin', async () => {
  const contract = await readFile(
    path.join(REPO_ROOT, 'contracts', 'render-policy.jcs'),
  );
  assert.ok(
    contract.includes("connect-src 'self' https://api.galascribe.com;"),
    'the published contract carries the new connect-src',
  );
  const expected = createHash('sha256')
    .update('GALA-RENDER-POLICY-V2\0', 'utf8')
    .update(contract)
    .digest('hex');
  const identity = await computeRenderPolicyIdentity();
  assert.deepEqual(identity, {
    name: 'gala-render-policy',
    version: '2.0.0',
    digest: `sha256:${expected}`,
  });
  // The identity before the CSP change: it must no longer be accepted.
  const previous = {
    ...identity,
    digest:
      'sha256:6b802d375d95376ddd88946d3b1afb3d7be97c09bffa3cb233ad6d1d61ef8f74',
  };
  assert.notEqual(previous.digest, identity.digest);
  assert.doesNotThrow(() =>
    assertRenderPolicyIdentity(identity, identity, 'test'),
  );
  assert.throws(
    () => assertRenderPolicyIdentity(previous, identity, 'test'),
    RenderPolicyViolationError,
  );
});

// --- module validation ---

test('a valid interactions module is accepted and a disabled one is inactive', () => {
  const valid = moduleSelection();
  assert.doesNotThrow(() => validateInteractionsModule(valid));
  assert.equal(interactionsActive(valid), true);
  assert.equal(interactionsActive(undefined), false);
  valid.config.reactions.enabled = false;
  valid.config.comments.enabled = false;
  assert.equal(interactionsActive(valid), false);
});

test('an invalid interactions module fails closed', () => {
  /** @type {[string, (m: any) => void][]} */
  const cases = [
    ['extra top-level key', (m) => (m.extra = 1)],
    ['missing appOrigin', (m) => delete m.appOrigin],
    ['http non-local apiOrigin', (m) => (m.apiOrigin = 'http://example.com')],
    ['apiOrigin with a path', (m) => (m.apiOrigin = 'https://a.example/x')],
    ['wrong schema id', (m) => (m.config.schemaId = 'urn:other')],
    ['extra config key', (m) => (m.config.extra = 1)],
    ['non-boolean enabled', (m) => (m.config.reactions.enabled = 'yes')],
    [
      'reserved like key',
      (m) => (m.config.reactions.definitions[0].key = 'like'),
    ],
    ['bad key pattern', (m) => (m.config.reactions.definitions[0].key = 'A')],
    [
      'duplicate key',
      (m) => (m.config.reactions.definitions[1].key = 'insightful'),
    ],
    ['empty label', (m) => (m.config.reactions.definitions[0].label = '')],
    [
      'label over 32 characters',
      (m) => (m.config.reactions.definitions[0].label = 'x'.repeat(33)),
    ],
    [
      'emoji outside the approved list',
      (m) => (m.config.reactions.definitions[0].visual.token = '\u{1F4A9}'),
    ],
    [
      'non-emoji visual kind',
      (m) => (m.config.reactions.definitions[0].visual.kind = 'icon'),
    ],
    ['order 0', (m) => (m.config.reactions.definitions[0].order = 0)],
    ['order 17', (m) => (m.config.reactions.definitions[0].order = 17)],
    ['duplicate order', (m) => (m.config.reactions.definitions[1].order = 2)],
    [
      'more than 16 definitions',
      (m) =>
        (m.config.reactions.definitions = Array.from(
          { length: 17 },
          (_, i) => ({
            key: `reaction-${i}`,
            label: 'x',
            visual: { kind: 'emoji', token: '\u{1F44D}' },
            order: (i % 16) + 1,
            enabled: true,
          }),
        )),
    ],
    ['maxDepth 0', (m) => (m.config.comments.maxDepth = 0)],
    ['maxDepth 5', (m) => (m.config.comments.maxDepth = 5)],
    ['maxDepth fractional', (m) => (m.config.comments.maxDepth = 2.5)],
    ['publicCounts missing key', (m) => delete m.config.publicCounts.comments],
  ];
  for (const [name, mutate] of cases) {
    const candidate = moduleSelection();
    mutate(candidate);
    assert.throws(
      () => validateInteractionsModule(candidate),
      RenderPolicyViolationError,
      name,
    );
  }
  assert.throws(
    () => validateInteractionsModule(null),
    RenderPolicyViolationError,
  );
});

test('http localhost and 127.0.0.1 origins are accepted for the local stack', () => {
  const local = moduleSelection();
  local.apiOrigin = 'http://localhost:8787';
  local.appOrigin = 'http://127.0.0.1:5173';
  assert.doesNotThrow(() => validateInteractionsModule(local));
});

// --- markup ---

/**
 * @param {any} module the module selection
 * @returns {string} the rendered section
 */
function section(module) {
  return renderInteractionsSection({
    module,
    messages: getMessages('en'),
    publicationId: '019c0000-0000-7000-8000-00000000aaaa',
    contentId: '019c0000-0000-7000-8000-00000000bbbb',
    canonicalUrl: 'https://example.test/blog/a?x=1&y=2',
  });
}

test('the section carries the page contract: attributes, order, labels and escaping', () => {
  const html = section(moduleSelection());
  assert.match(
    html,
    /^<section class="g-interactions" id="comments" aria-labelledby="g-interactions-title" data-gala-interactions /,
  );
  for (const fragment of [
    'data-api-origin="https://api.galascribe.com"',
    'data-app-origin="https://app.galascribe.com"',
    'data-publication-id="019c0000-0000-7000-8000-00000000aaaa"',
    'data-content-id="019c0000-0000-7000-8000-00000000bbbb"',
    'data-canonical-url="https://example.test/blog/a?x=1&amp;y=2"',
    'data-reactions-enabled="true"',
    'data-comments-enabled="true"',
    'data-count-reactions="true"',
    'data-count-comments="false"',
    'data-allow-replies="true"',
    'data-max-depth="3"',
    '<h2 id="g-interactions-title" class="g-interactions__title">Responses</h2>',
    '<div class="g-reactions" data-gala-reactions role="group" aria-label="Reactions">',
    '<h3 class="g-comments__title">Conversation <span class="g-comments__count" data-gala-comment-count></span></h3>',
    '<p class="g-interactions__notice" data-gala-static-notice>Reactions and comments need JavaScript.</p>',
    '<div class="g-composer-slot" data-gala-composer-slot></div>',
    '<ol class="g-comment-list" data-gala-comment-list></ol>',
    '<button type="button" class="g-comments__more" data-gala-more hidden>Show more comments</button>',
    '<div class="g-interactions__status" role="status" aria-live="polite" data-gala-status></div>',
  ]) {
    assert.ok(html.includes(fragment), `missing: ${fragment}`);
  }
  const keys = [...html.matchAll(/data-reaction-key="([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(keys, ['like', 'applause', 'insightful']);
  assert.ok(!html.includes('hidden-one'), 'disabled definitions are omitted');
  assert.match(
    html,
    /<button type="button" class="g-reaction" data-reaction-key="like" aria-pressed="false" disabled><span class="g-reaction__icon" aria-hidden="true"><svg class="g-icon"[^>]*>.*?<\/svg><\/span><span class="g-reaction__label">Like<\/span><span class="g-reaction__count" data-gala-count><\/span><\/button>/,
  );
  assert.ok(
    html.includes(
      '<span class="g-reaction__icon" aria-hidden="true">\u{1F4A1}</span>',
    ),
  );
  assert.ok(html.includes('A &amp; &quot;q&quot;'));
  assert.ok(!html.includes('<b>'));
  assert.ok(html.indexOf('g-reactions') < html.indexOf('g-comments'));
});

test('only enabled parts are rendered; nothing is rendered when both are off', () => {
  const noComments = moduleSelection();
  noComments.config.comments.enabled = false;
  const reactionsOnly = section(noComments);
  assert.ok(reactionsOnly.includes('class="g-reactions"'));
  assert.ok(!reactionsOnly.includes('g-comments'));
  assert.ok(reactionsOnly.includes('data-comments-enabled="false"'));

  const noReactions = moduleSelection();
  noReactions.config.reactions.enabled = false;
  const commentsOnly = section(noReactions);
  assert.ok(!commentsOnly.includes('g-reactions'));
  assert.ok(!commentsOnly.includes('data-reaction-key'));
  assert.ok(commentsOnly.includes('class="g-comments"'));

  const neither = moduleSelection();
  neither.config.reactions.enabled = false;
  neither.config.comments.enabled = false;
  assert.equal(section(neither), '');
});

test('every interactions label comes from the message catalog', () => {
  const messages = getMessages('en');
  for (const key of [
    'interactionsHeading',
    'reactionsGroupLabel',
    'likeLabel',
    'commentsHeading',
    'interactionsNeedScriptNotice',
    'showMoreCommentsLabel',
  ]) {
    assert.equal(typeof messages[key], 'string', key);
  }
});

// --- end to end ---

/**
 * Render the rich fixture and read back every output file.
 *
 * @param {any} modules the build input's `modules`
 * @returns {Promise<{manifest: any, files: Map<string, string>, bytes: (p: string) => Promise<Buffer>}>}
 */
async function renderRich(modules) {
  const input = /** @type {any} */ (await buildRichFixture());
  input.modules = modules;
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    const { manifest } = await renderPublication(input, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      provenance: testProvenance(),
    });
    /** @type {Map<string, string>} */
    const files = new Map();
    const buffers = new Map();
    for (const entry of [...manifest.routes, ...manifest.assets]) {
      const buffer = await readFile(path.join(outputDirectory, entry.path));
      buffers.set(entry.path, buffer);
      files.set(entry.path, buffer.toString('utf8'));
    }
    return {
      manifest,
      files,
      bytes: async (p) => /** @type {Buffer} */ (buffers.get(p)),
    };
  } finally {
    await cleanup();
  }
}

test('module on: article routes carry the section and the deferred script; every other route does not', async () => {
  const { manifest, files, bytes } = await renderRich({
    interactions: moduleSelection(),
  });
  const scriptPath = manifest.assets
    .map((/** @type {any} */ asset) => asset.path)
    .find((/** @type {string} */ p) => p.endsWith(INTERACTIONS_SCRIPT_PATH));
  assert.ok(scriptPath, 'script is a manifest asset');
  const scriptEntry = manifest.assets.find(
    (/** @type {any} */ asset) => asset.path === scriptPath,
  );
  const source = await readFile(
    path.join(
      REPO_ROOT,
      'src/modules/interactions/browser/gala-interactions.js',
    ),
  );
  assert.equal(
    scriptEntry.sha256,
    `sha256:${createHash('sha256').update(source).digest('hex')}`,
  );
  assert.equal(scriptEntry.mediaType, 'application/javascript; charset=utf-8');
  assert.deepEqual(await bytes(scriptPath), source);

  let bearing = 0;
  for (const route of manifest.routes) {
    if (route.routeClass !== 'html' && route.routeClass !== 'error') {
      assert.equal(route.interactionBearing, false, route.path);
      continue;
    }
    const html = /** @type {string} */ (files.get(route.path));
    const isArticle = html.includes('data-gala-page-kind="article"');
    assert.equal(route.interactionBearing, isArticle, route.path);
    assert.equal(
      html.includes('data-gala-interactions'),
      isArticle,
      `${route.path}: section presence`,
    );
    assert.equal(
      html.includes('gala-interactions-v1.js" defer></script>'),
      isArticle,
      `${route.path}: script tag presence`,
    );
    assert.ok(html.includes(`content="${SECTION_CSP}"`), route.path);
    if (!isArticle) continue;
    bearing += 1;
    assert.equal(
      html.match(/<script[^>]*\bsrc=/g)?.length,
      2,
      'appearance script plus interactions script',
    );
    const contentId = /data-content-id="([^"]+)"/.exec(html)?.[1];
    assert.match(contentId ?? '', /^019c0000-0000-7000-8000-/);
    const canonical = /<link rel="canonical" href="([^"]+)">/.exec(html)?.[1];
    assert.equal(
      /data-canonical-url="([^"]+)"/.exec(html)?.[1],
      canonical,
      `${route.path}: canonical URL`,
    );
    assert.ok(html.includes('data-publication-id="'));
    const at = (/** @type {string} */ marker) => html.indexOf(marker);
    assert.ok(at('g-author-card') < at('g-interactions'));
    if (html.includes('g-series-box')) {
      assert.ok(at('g-interactions') < at('g-series-box'));
    }
    if (html.includes('g-pager')) {
      assert.ok(at('g-interactions') < at('<nav class="g-pager"'));
    }
  }
  assert.ok(bearing >= 3, 'the rich fixture has several articles');
});

test('the interactions section is nested in the article footer and its ids match front matter and publication', async () => {
  const input = /** @type {any} */ (await buildRichFixture());
  const { manifest, files } = await renderRich({
    interactions: moduleSelection(),
  });
  const publicationId = input.publication.id;
  const articleIds = new Set(
    input.content
      .filter((/** @type {any} */ r) => r.frontmatter.kind === 'article')
      .map((/** @type {any} */ r) => r.frontmatter.id),
  );
  const seen = new Set();
  for (const route of manifest.routes) {
    const html = files.get(route.path) ?? '';
    if (!html.includes('data-gala-interactions')) continue;
    assert.ok(
      html.includes(`data-publication-id="${publicationId}"`),
      route.path,
    );
    const id = /data-content-id="([^"]+)"/.exec(html)?.[1];
    assert.ok(articleIds.has(id), `${route.path}: ${id}`);
    seen.add(id);
    assert.match(
      html,
      /<div class="g-wrap g-article-foot">.*<section class="g-interactions"/,
    );
  }
  assert.equal(seen.size, articleIds.size, 'every article has its own id');
});

test('module off: no section, no script, no asset, every flag false and the production CSP', async () => {
  const { manifest, files } = await renderRich({});
  assert.ok(
    !manifest.assets.some((/** @type {any} */ a) =>
      a.path.endsWith('gala-interactions-v1.js'),
    ),
  );
  for (const route of manifest.routes) {
    assert.equal(route.interactionBearing, false, route.path);
    const html = files.get(route.path) ?? '';
    assert.ok(!html.includes('data-gala-interactions'), route.path);
    assert.ok(!html.includes('gala-interactions-v1'), route.path);
    if (route.routeClass === 'html' || route.routeClass === 'error') {
      assert.ok(html.includes(`content="${SECTION_CSP}"`), route.path);
      assert.equal(html.match(/<script[^>]*\bsrc=/g)?.length, 1);
    }
  }
});

test('a local API origin reaches connect-src on every HTML route', async () => {
  const module = moduleSelection();
  module.apiOrigin = 'http://localhost:8787';
  module.appOrigin = 'http://localhost:5173';
  const { manifest, files } = await renderRich({ interactions: module });
  const expected = contentSecurityPolicyMeta('http://localhost:8787');
  for (const route of manifest.routes) {
    if (route.routeClass !== 'html' && route.routeClass !== 'error') continue;
    assert.ok(
      (files.get(route.path) ?? '').includes(`content="${expected}"`),
      route.path,
    );
  }
});

test('both parts disabled behaves as module off for markup, script and flags', async () => {
  const module = moduleSelection();
  module.config.reactions.enabled = false;
  module.config.comments.enabled = false;
  const { manifest, files } = await renderRich({ interactions: module });
  assert.ok(
    !manifest.assets.some((/** @type {any} */ a) =>
      a.path.endsWith('gala-interactions-v1.js'),
    ),
  );
  for (const route of manifest.routes) {
    assert.equal(route.interactionBearing, false);
    assert.ok(!(files.get(route.path) ?? '').includes('g-interactions'));
  }
});

test('a module-on build is byte-identical across runs', async () => {
  const first = await renderRich({ interactions: moduleSelection() });
  const second = await renderRich({ interactions: moduleSelection() });
  assert.equal(first.manifest.artifactDigest, second.manifest.artifactDigest);
  assert.deepEqual(first.manifest.routes, second.manifest.routes);
  assert.deepEqual(first.manifest.assets, second.manifest.assets);
});

test('an unknown module is still rejected before rendering', async () => {
  const input = /** @type {any} */ (await buildRichFixture());
  input.modules = { newsletter: {} };
  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    await assert.rejects(
      renderPublication(input, {
        outputDirectory,
        workDirectory,
        sourceDirectory,
        provenance: testProvenance(),
      }),
      (error) =>
        error instanceof Error &&
        ['BuildInputValidationError', 'RenderPolicyViolationError'].includes(
          error.name,
        ),
    );
  } finally {
    await cleanup();
  }
});

// --- base layer ---

test('the base layer styles every interactions class, with focus, dark-mode tokens and narrow-screen rules', async () => {
  const { GALA_BASE_COMPONENT_CSS, GALA_BASE_STYLESHEET_SOURCE } =
    await import('../src/core/internal/appearance/base-layer.js');
  const classes = [
    'g-interactions',
    'g-interactions__title',
    'g-interactions__notice',
    'g-interactions__status',
    'g-interactions__signout',
    'g-reactions',
    'g-reaction',
    'g-reaction__icon',
    'g-reaction__label',
    'g-reaction__count',
    'g-reaction--active',
    'g-comments',
    'g-comments__title',
    'g-comments__count',
    'g-comments__more',
    'g-composer',
    'g-composer__input',
    'g-composer__actions',
    'g-composer__submit',
    'g-composer__cancel',
    'g-composer__signin',
    'g-comment-list',
    'g-comment',
    'g-comment__head',
    'g-comment__avatar',
    'g-comment__author',
    'g-comment__time',
    'g-comment__body',
    'g-comment__actions',
    'g-comment__action',
    'g-comment__replies',
    'g-comment--tombstone',
    'g-comment--mine',
    'g-report',
  ];
  for (const name of classes) {
    assert.ok(
      new RegExp(`\\.${name}(?![a-z0-9_-])`).test(GALA_BASE_COMPONENT_CSS),
      `${name} has a rule`,
    );
  }
  // Only tokens: the existing no-colour-literal test covers the whole sheet;
  // here the new rules must read the theme tokens they depend on.
  assert.match(GALA_BASE_COMPONENT_CSS, /\.g-reaction\[aria-pressed="true"\]/);
  assert.match(
    GALA_BASE_COMPONENT_CSS,
    /\.g-comment__replies \{[^}]*padding-left: var\(--gala-space-3\)/,
  );
  assert.match(
    GALA_BASE_STYLESHEET_SOURCE,
    /@media \(prefers-reduced-motion: reduce\)/,
  );
  // The shared :focus-visible ring covers every control the script creates.
  assert.match(
    GALA_BASE_COMPONENT_CSS,
    /:focus-visible \{[^}]*outline-style: solid/,
  );
});
