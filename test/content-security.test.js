import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import {
  RenderPolicyViolationError,
  computeBodyDigest,
  normalizeAuthoredMarkdown,
  renderPublication,
} from '../src/core/index.js';
import {
  assertRenderPolicyIdentity,
  computeRenderPolicyIdentity,
  contentSecurityPolicyBaseline,
  contentSecurityPolicyHeaderOnlyDirectives,
  contentSecurityPolicyMetaTag,
} from '../src/core/internal/content-security.js';
import { HIGHLIGHT_GRAMMARS } from '../src/core/internal/render-policy-content.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { loadCanonicalBuildInput } from './helpers/schema-fixtures.js';

// TPL-H4 fix: frame-ancestors is excluded here (CSP ignores it inside
// <meta http-equiv>) and covered separately below as a header-only
// directive.
const CSP_BASELINE_STRING =
  "default-src 'none'; base-uri 'none'; object-src 'none'; " +
  "form-action 'none'; script-src 'self'; " +
  "style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; " +
  "media-src 'self'; manifest-src 'self'; worker-src 'none'";

/**
 * Convenience wrapper for the tests below: run the upstream normalization
 * step and return only the HTML half of its `{html, bodyDigest}` result.
 *
 * @param {string} markdownSource author-authored Markdown
 * @returns {string} the normalized, policy-conformant HTML
 */
function normalize(markdownSource) {
  return normalizeAuthoredMarkdown(markdownSource).html;
}

// --- normalizeAuthoredMarkdown: the public, upstream normalization step ---
// (markdown-it -> sanitize-html -> highlighter). These cases exercise what a
// `build-input:2.0.0` producer (publish-kernel/publish-action) is expected
// to run once per authored Markdown source before it ever reaches this
// renderer.

test('normalizeAuthoredMarkdown options are exactly {html:false, linkify:false, typographer:false}', () => {
  // html:false: literal `<...>` is never parsed as an element.
  assert.equal(normalize('<b>x</b>'), '<p>&lt;b&gt;x&lt;/b&gt;</p>\n');
  // linkify:false: a bare URL is never auto-linked.
  const bareUrl = normalize('see https://example.com/x');
  assert.ok(!bareUrl.includes('<a '));
  assert.match(bareUrl, /see https:\/\/example\.com\/x/);
  // typographer:false: straight quotes/dashes are left untouched (no smart
  // quotes, no em-dash substitution).
  const typography = normalize('say "hi" -- now');
  assert.match(typography, /say "hi" -- now/);
});

test('normalizeAuthoredMarkdown returns a {html, bodyDigest} pair, and bodyDigest is a plain digest of the html bytes', () => {
  const result = normalizeAuthoredMarkdown('Hello *world*');
  assert.equal(result.html, '<p>Hello <em>world</em></p>\n');
  assert.equal(result.bodyDigest, computeBodyDigest(result.html));
  assert.match(result.bodyDigest, /^sha256:[0-9a-f]{64}$/);
});

test('adversarial corpus: script tags and event handlers become inert escaped text, never live markup', () => {
  const scriptOutput = normalize('<script>alert(1)</script>');
  assert.ok(!scriptOutput.includes('<script'));
  assert.match(scriptOutput, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);

  const eventHandlerOutput = normalize('Hello <b onclick="alert(1)">world</b>');
  // `html:false` means this never parses as an element at all; it is
  // escaped text (`&lt;b onclick="alert(1)"&gt;...`), so no live `<b>` tag
  // — carrying a real, sanitizer-bypassing `onclick` attribute — exists.
  assert.ok(!/<b[\s>]/i.test(eventHandlerOutput));
  assert.match(eventHandlerOutput, /&lt;b onclick="alert\(1\)"&gt;/);
});

test('adversarial corpus: javascript:, vbscript:, data: and protocol-relative URLs never become a live href/src', () => {
  const cases = [
    '[x](javascript:alert(1))',
    '[x](vbscript:alert(1))',
    '[x](JavaScript:alert(1))',
    '[x](java\tscript:alert(1))',
    '[x](//evil.example.com/a)',
    '![img](data:image/png;base64,AAAA)',
  ];
  for (const markdown of cases) {
    const output = normalize(markdown);
    assert.ok(
      !/<a\s|<img\s/.test(output),
      `${markdown}: must never produce a live link or image (got ${output})`,
    );
  }
});

test('adversarial corpus: SVG-in-markdown is neutralized to inert escaped text', () => {
  const output = normalize(
    '<svg onload=alert(1)><script>alert(2)</script></svg>',
  );
  assert.ok(!output.includes('<svg'));
  assert.ok(!output.includes('<script'));
  assert.match(output, /&lt;svg onload=alert\(1\)&gt;/);
});

test('adversarial corpus: nested and unbalanced raw markup never crashes and is always escaped', () => {
  const cases = [
    '<div><span>unclosed',
    '<b><i>unbalanced</b></i>',
    '</closing-only>',
    '<<<nested<<<',
  ];
  for (const markdown of cases) {
    const output = normalize(markdown);
    assert.ok(!/<(div|span|i)[\s>]/.test(output));
  }
});

test('adversarial corpus: a Unicode homoglyph URL is never rendered as its visually deceptive source bytes', () => {
  // U+0430 CYRILLIC SMALL LETTER A, visually identical to ASCII "a".
  const homoglyphHost = 'http://аpple.com/x';
  const output = normalize(`[link](${homoglyphHost})`);
  assert.ok(
    !output.includes(homoglyphHost),
    'the deceptive homoglyph host bytes must never reach rendered output',
  );
  assert.match(output, /href="http:\/\/xn--/);
});

test('the owned highlighter accepts only the closed grammar catalog and falls back to escaped code otherwise', () => {
  assert.ok(HIGHLIGHT_GRAMMARS.includes('javascript'));
  const known = normalize('```javascript\nconst a = 1 < 2;\n```');
  assert.match(known, /<pre class="language-javascript">/);
  assert.match(known, /<span class="token keyword">const<\/span>/);
  assert.match(known, /&lt;/); // the `<` in `1 < 2` is still escaped

  for (const unknown of ['unknownlang', 'text', '', 'javascript"><script>x']) {
    const output = normalize(`\`\`\`${unknown}\n<script>x</script>\n\`\`\``);
    assert.ok(
      !output.includes('<script'),
      `grammar ${JSON.stringify(unknown)}`,
    );
    assert.match(output, /&lt;script&gt;x&lt;\/script&gt;/);
  }
});

test('headings get deterministic, collision-free ids and no other id survives', () => {
  const source =
    '# Heading One\n\n## Heading One\n\n### Héading Öne!\n\n<p id="author-supplied">text</p>';
  const output = normalize(source);
  assert.match(output, /<h1 id="heading-one">Heading One<\/h1>/);
  assert.match(output, /<h2 id="heading-one-2">Heading One<\/h2>/);
  assert.match(output, /<h3 id="h.ading-.ne">Héading Öne!<\/h3>/);
  // The author-authored `<p id="...">` above never parses as an element at
  // all (`html:false`), so it is escaped text (`&lt;p id="author-supplied"
  // ...`), never a live element carrying that `id`.
  assert.ok(!/<p\s+id="author-supplied"/.test(output));
  assert.match(output, /&lt;p id="author-supplied"&gt;/);

  // Rendering the same source twice produces byte-identical heading ids.
  assert.equal(output, normalize(source));
});

test('cross-origin links get rel="noopener noreferrer" and no link ever carries target', () => {
  const external = normalize('[x](https://example.com/a)');
  assert.match(external, /rel="noopener noreferrer"/);
  assert.ok(!external.includes('target='));

  const internal = normalize('[x](/relative/path)');
  assert.ok(!internal.includes('rel='));
  assert.ok(!internal.includes('target='));

  const mail = normalize('[x](mailto:a@example.com)');
  assert.ok(!mail.includes('rel='));
});

test('img[src] admits only repository-relative paths, never an absolute or data: URL', () => {
  const relative = normalize('![alt](assets/pic.png)');
  assert.match(relative, /<img src="assets\/pic\.png" alt="alt"/);

  const absolute = normalize('![alt](https://evil.example.com/x.png)');
  assert.ok(
    !absolute.includes('src='),
    'an absolute image URL must never survive as src',
  );

  const dataUri = normalize('![alt](data:image/png;base64,AAAA)');
  assert.ok(!dataUri.includes('src='));
});

test('the per-artifact CSP baseline is byte-exact', () => {
  assert.equal(contentSecurityPolicyBaseline(), CSP_BASELINE_STRING);
  assert.equal(
    contentSecurityPolicyMetaTag(),
    `<meta http-equiv="Content-Security-Policy" content="${CSP_BASELINE_STRING}">`,
  );
});

test('TPL-H4 fix: frame-ancestors is a header-only directive, excluded from the <meta> baseline', () => {
  assert.ok(
    !contentSecurityPolicyBaseline().includes('frame-ancestors'),
    'frame-ancestors must not appear in the meta-safe baseline (CSP ignores it there)',
  );
  assert.deepEqual(contentSecurityPolicyHeaderOnlyDirectives(), [
    "frame-ancestors 'none'",
  ]);
});

test('computeRenderPolicyIdentity byte-equals a fresh domain-separated digest of the published contract file', async () => {
  const { createHash } = await import('node:crypto');
  const filePath = path.resolve('contracts/render-policy.jcs');
  const fileBytes = await readFile(filePath);
  const hash = createHash('sha256');
  hash.update('GALA-RENDER-POLICY-V2 ', 'utf8');
  hash.update(fileBytes);
  const expectedDigest = `sha256:${hash.digest('hex')}`;

  const identity = await computeRenderPolicyIdentity();
  assert.equal(identity.name, 'gala-render-policy');
  assert.equal(identity.version, '2.0.0');
  assert.equal(identity.digest, expectedDigest);
});

test('assertRenderPolicyIdentity rejects a name, version or digest mismatch, and accepts an exact match', async () => {
  const identity = await computeRenderPolicyIdentity();
  assert.doesNotThrow(() =>
    assertRenderPolicyIdentity({ ...identity }, identity, 'test'),
  );
  for (const mutation of [
    { ...identity, name: 'not-gala-render-policy' },
    { ...identity, version: '9.9.9' },
    { ...identity, digest: 'sha256:' + '0'.repeat(64) },
    undefined,
    {},
  ]) {
    assert.throws(
      () => assertRenderPolicyIdentity(mutation, identity, 'test'),
      RenderPolicyViolationError,
    );
  }
});

// --- renderPublication: the renderer's own verify-then-insert path ---
// `renderableBody.body` arrives already as policy-conformant HTML (produced
// upstream by normalizeAuthoredMarkdown); the renderer verifies it and
// inserts it as-is, never re-running markdown-it on it.

/**
 * Assert that rendering `buildInput` rejects with
 * {@link RenderPolicyViolationError} before any output directory entry is
 * written, shared by every "fails closed on a tampered renderableBody" case
 * below.
 *
 * @param {Record<string, unknown>} buildInput a build input, already mutated
 *   by the caller into a rejection-worthy shape
 * @returns {Promise<void>} resolves once the assertion completes
 */
async function assertRejectsClosedWithRenderPolicyViolation(buildInput) {
  const { outputDirectory, workDirectory, cleanup } =
    await createRenderDirectories();
  try {
    await assert.rejects(
      () =>
        renderPublication(buildInput, {
          outputDirectory,
          workDirectory,
          provenance: testProvenance(),
        }),
      RenderPolicyViolationError,
    );
    const { readdir } = await import('node:fs/promises');
    await assert.rejects(() => readdir(outputDirectory), { code: 'ENOENT' });
  } finally {
    await cleanup();
  }
}

test('renderPublication fails closed before writing anything when a renderPolicy reference does not match the published identity', async () => {
  const buildInput = await loadCanonicalBuildInput();
  buildInput.content[0].renderPolicy.digest = 'sha256:' + '0'.repeat(63) + '9';
  await assertRejectsClosedWithRenderPolicyViolation(buildInput);
});

test('renderPublication fails closed before writing anything when bodyDigest does not match the body bytes', async () => {
  const buildInput = await loadCanonicalBuildInput();
  buildInput.content[0].bodyDigest = 'sha256:' + '1'.repeat(64);
  await assertRejectsClosedWithRenderPolicyViolation(buildInput);
});

test('renderPublication fails closed when body is not idempotent under the sanitizer (non-conformant HTML), even with a matching bodyDigest', async () => {
  const buildInput = await loadCanonicalBuildInput();
  // A real `<script>` element: bodyDigest is computed correctly over these
  // exact bytes (so the digest check alone would pass), but sanitizing this
  // body strips the script tag, so the idempotence check must reject it —
  // this body was never actually produced by normalizeAuthoredMarkdown.
  const nonConformantBody = '<p>ok</p><script>alert(1)</script>';
  buildInput.content[0].body = nonConformantBody;
  buildInput.content[0].bodyDigest = computeBodyDigest(nonConformantBody);
  await assertRejectsClosedWithRenderPolicyViolation(buildInput);
});

test('renderPublication inserts an already policy-conformant HTML body verbatim, never re-running markdown-it on it', async () => {
  const buildInput = await loadCanonicalBuildInput();

  // Realistic, multi-element HTML produced by the upstream normalization
  // step: headings with generated ids, emphasis, a cross-origin link, and a
  // highlighted code fence. If the renderer mistakenly re-ran markdown-it
  // on this (html:false) it would escape every tag here into literal text
  // (`<h2 ...>` becoming `&lt;h2 ...&gt;`) instead of inserting live markup.
  const { html, bodyDigest } = normalizeAuthoredMarkdown(
    '## Section Title\n\nSome *emphasized* text with a [link](https://example.com/a).\n\n' +
      '```javascript\nconst a = 1;\n```\n',
  );
  assert.match(
    html,
    /<h2 id="section-title">/,
    'sanity: fixture is real multi-element HTML',
  );

  buildInput.content[0].body = html;
  buildInput.content[0].bodyDigest = bodyDigest;

  const { outputDirectory, workDirectory, sourceDirectory, cleanup } =
    await createRenderDirectories();
  try {
    const { manifest } = await renderPublication(buildInput, {
      outputDirectory,
      workDirectory,
      sourceDirectory,
      provenance: testProvenance(),
    });
    // S2-T06 generates one page for the content record itself plus its
    // author, index, tag and archive listing pages (see
    // `internal/page-kinds.js`); the content record's own page is the one
    // whose path matches its `basePath`-joined route.
    const route = manifest.routes.find(
      (candidate) => candidate.path === 'fixture-1/fixture-1/index.html',
    );
    assert.ok(route, "the content record's own page must be emitted");
    const rendered = await readFile(
      path.join(outputDirectory, route.path),
      'utf8',
    );

    // The exact HTML produced upstream appears verbatim, as live markup —
    // not escaped, not re-derived, not altered.
    assert.ok(
      rendered.includes(html),
      'the policy-conformant HTML body must appear byte-for-byte, uninterpreted, in the rendered page',
    );
    assert.match(rendered, /<h2 id="section-title">Section Title<\/h2>/);
    assert.match(rendered, /<em>emphasized<\/em>/);
    assert.match(
      rendered,
      /<a href="https:\/\/example\.com\/a" rel="noopener noreferrer">link<\/a>/,
    );
    assert.match(rendered, /<pre class="language-javascript">/);
    assert.match(rendered, /<span class="token keyword">const<\/span>/);
    // Never double-escaped.
    assert.ok(!rendered.includes('&lt;h2'));
    assert.ok(!rendered.includes('&amp;lt;'));
  } finally {
    await cleanup();
  }
});

test('renderPublication rejects a non-empty modules or placements value before rendering, even if it somehow reached this far', async () => {
  const buildInput = await loadCanonicalBuildInput();
  // The build-input schema itself already closes `modules`/`placements`
  // (S2-T01/T02); a non-empty value is caught there first, proving this
  // module's own belt-and-suspenders check (source module documentation:
  // `assertRenderPolicyCompliance`) is never the only thing standing
  // between a module-bearing input and rendered output.
  buildInput.modules = { deferred: true };
  const { outputDirectory, workDirectory, cleanup } =
    await createRenderDirectories();
  try {
    // A non-empty `modules` value is itself a schema violation, so this
    // rejects with BuildInputValidationError before this module's own
    // defense-in-depth check ever runs — proving the schema gate is not
    // silently bypassed.
    const { BuildInputValidationError } = await import('../src/core/index.js');
    await assert.rejects(
      () =>
        renderPublication(buildInput, {
          outputDirectory,
          workDirectory,
          provenance: testProvenance(),
        }),
      BuildInputValidationError,
    );
  } finally {
    await cleanup();
  }
});

test('golden output: the canonical S2 fixture renders its content page byte-exact, its already-conformant body inserted verbatim', async () => {
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
    // S2-T06: this one-article, one-tag, one-author fixture also generates
    // its author page, its index page, its `/tags` root plus its one tag
    // page, and its `/archive` root plus its one year page (see
    // `internal/page-kinds.js`'s module documentation) — seven routes in
    // total, not just the content record's own page. S2-T08 adds five more:
    // the generated `404.html`, the Atom and RSS feeds, the sitemap and the
    // static search index — twelve routes in total.
    assert.equal(manifest.routes.length, 12);
    const route = manifest.routes.find(
      (candidate) => candidate.path === 'fixture-1/fixture-1/index.html',
    );
    assert.ok(route, "the content record's own page must be emitted");

    const bytes = await readFile(
      path.join(outputDirectory, route.path),
      'utf8',
    );
    assert.equal(
      bytes,
      '<!doctype html>\n' +
        '<html lang="en-US" dir="ltr" data-gala-publication-root data-gala-resolved-color-mode="light">\n' +
        '<head>\n' +
        '<meta charset="utf-8">\n' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
        `<meta http-equiv="Content-Security-Policy" content="${CSP_BASELINE_STRING}">\n` +
        '<meta name="color-scheme" content="light dark">\n' +
        '<script src="/fixture-1/assets/gala-appearance-bootstrap-v1.js"></script>\n' +
        '<title>fixture-1</title>\n' +
        '\n' +
        '\n' +
        '<link rel="canonical" href="https://fixture-1.example.com/fixture-1/fixture-1">\n' +
        '<meta property="og:site_name" content="fixture-1">\n' +
        '<meta property="og:url" content="https://fixture-1.example.com/fixture-1/fixture-1">\n' +
        '<meta property="og:type" content="article">\n' +
        '<meta property="og:title" content="fixture-1">\n' +
        '\n' +
        '\n' +
        '<meta name="twitter:card" content="summary">\n' +
        '<meta name="twitter:title" content="fixture-1">\n' +
        '\n' +
        '\n' +
        '<link rel="alternate" type="application/atom+xml" href="https://fixture-1.example.com/fixture-1/feed/atom.xml" title="fixture-1">\n' +
        '<link rel="alternate" type="application/rss+xml" href="https://fixture-1.example.com/fixture-1/feed/rss.xml" title="fixture-1">\n' +
        '<link rel="stylesheet" href="/fixture-1/assets/gala-base-v1.css">\n' +
        '<link rel="stylesheet" href="/fixture-1/assets/theme/print.css" media="print">\n' +
        '</head>\n' +
        '<body data-gala-page-kind="article">\n' +
        '<a href="#main-content">Skip to content</a>' +
        '<header><a href="/fixture-1"><span>fixture-1</span></a>' +
        '<div data-gala-slot="header-actions">' +
        '<label for="gala-appearance-color-mode">Appearance</label>' +
        '<select id="gala-appearance-color-mode" name="gala-appearance-color-mode">' +
        '<option value="light">Light</option>' +
        '<option value="dark">Dark</option>' +
        '<option value="system" selected>System</option>' +
        '</select></div></header>' +
        '<nav aria-label="Primary"><ul><li><a href="/fixture-1">fixture-1</a>' +
        '<ul><li><a href="/fixture-1">fixture-1</a></li></ul></li></ul></nav>' +
        '<main id="main-content">' +
        '<nav aria-label="Breadcrumb"><ol>' +
        '<li><a href="/fixture-1">Home</a></li>' +
        '<li><a href="/fixture-1">All articles</a></li>' +
        '<li aria-current="page">fixture-1</li>' +
        '</ol></nav>' +
        '<article><div data-gala-slot="article-preamble"></div>' +
        '<h1>fixture-1</h1><p>By fixture-1</p>' +
        '<time datetime="2026-09-13T12:00:00.000Z">2026-09-13T12:00:00.000Z</time>' +
        '<ul><li><a href="/fixture-1/tags/fixture-1-042896dc19">fixture-1</a></li></ul>' +
        // The fixture's `body` is the literal string "fixture-1" — already
        // policy-conformant HTML (a bare text node) — inserted verbatim,
        // with no markdown-it paragraph wrapping applied by this renderer.
        'fixture-1' +
        '<div data-gala-slot="article-end"></div>' +
        '<div data-gala-slot="article-footer-ad" hidden></div></article>' +
        '</main>' +
        '<footer><p>fixture-1</p>' +
        '<nav aria-label="Footer"><ul><li><a href="/fixture-1">fixture-1</a>' +
        '<ul><li><a href="/fixture-1">fixture-1</a></li></ul></li></ul></nav>' +
        '<div data-gala-slot="footer-profile"></div>' +
        '<div data-gala-slot="footer-auxiliary"></div>' +
        '<div data-gala-slot="account-intent"></div>' +
        '<div data-gala-slot="conversation"></div>' +
        '<div data-gala-slot="newsletter"></div>' +
        '<div data-gala-slot="edition-selector"></div>' +
        '<p>Published with the Galascribe template renderer.</p>' +
        '</footer>\n' +
        '</body>\n' +
        '</html>\n',
    );
  } finally {
    await cleanup();
  }
});
