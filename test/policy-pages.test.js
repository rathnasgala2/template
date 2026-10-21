/**
 * The generated Terms and Privacy pages, the legal footer navigation's
 * referral link and the `POLICY_ROUTE_CONFLICT` failure.
 */

import { strict as assert } from 'node:assert';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import {
  BuildInputValidationError,
  RenderPolicyViolationError,
  computeBodyDigest,
  normalizeAuthoredMarkdown,
  renderPublication,
} from '../src/core/index.js';
import { madeWithGalascribeHref } from '../src/core/internal/chrome.js';
import { loadSitePolicyDefaults } from '../src/core/internal/policy-defaults.js';
import {
  renderGalascribeSection,
  validatePolicies,
} from '../src/core/internal/policy-pages.js';
import { buildRichFixture } from './helpers/page-kind-fixtures.js';
import { sha256Of } from './helpers/media-fixtures.js';
import { applyCurrentRenderPolicy } from './helpers/schema-fixtures.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';

/**
 * @param {(buildInput: any) => Promise<void>} [prepare] changes the build input
 * @returns {Promise<{files: Map<string, string>, manifest: any}>} each route's
 *   UTF-8 text, and the manifest
 */
async function renderWithManifest(prepare = async () => {}) {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  await prepare(buildInput);
  const dirs = await createRenderDirectories();
  try {
    const { manifest } = await renderPublication(buildInput, {
      outputDirectory: dirs.outputDirectory,
      workDirectory: dirs.workDirectory,
      sourceDirectory: dirs.sourceDirectory,
      provenance: testProvenance(),
    });
    /** @type {Map<string, string>} */
    const files = new Map();
    for (const route of manifest.routes) {
      files.set(
        route.path,
        await readFile(path.join(dirs.outputDirectory, route.path), 'utf8'),
      );
    }
    return { files, manifest };
  } finally {
    await dirs.cleanup();
  }
}

/**
 * @param {(buildInput: any) => Promise<void>} [prepare] changes the build input
 * @returns {Promise<Map<string, string>>} each route's UTF-8 text
 */
async function render(prepare = async () => {}) {
  return (await renderWithManifest(prepare)).files;
}

test('both policy pages render with titles, robots, breadcrumb and prose', async () => {
  const files = await render();
  const defaults = loadSitePolicyDefaults();
  for (const [file, title, text] of [
    [
      'fixture-1/terms/index.html',
      defaults.terms.title,
      'Terms of Service</a>',
    ],
    [
      'fixture-1/privacy/index.html',
      defaults.privacy.title,
      'This site loads no analytics or advertising trackers.',
    ],
  ]) {
    const html = /** @type {string} */ (files.get(file));
    assert.ok(html, file);
    assert.match(html, new RegExp(`<title>${title} \\| `));
    assert.match(html, /<meta name="robots" content="index, follow">/);
    assert.match(html, /data-gala-page-kind="policy"/);
    assert.equal((html.match(/<h1>/g) ?? []).length, 1);
    // The title is the one <h1>, in the article head after the breadcrumb.
    assert.ok(
      html.includes(
        `<li aria-current="page">${title}</li></ol></nav><h1>${title}</h1></div>`,
      ),
      file,
    );
    assert.ok(html.includes(text), file);
  }
});

test('without policies each page is the shipped default text, then the Galascribe section', async () => {
  const files = await render();
  const defaults = loadSitePolicyDefaults();
  for (const [file, page] of [
    ['fixture-1/terms/index.html', defaults.terms],
    ['fixture-1/privacy/index.html', defaults.privacy],
  ]) {
    const html = /** @type {string} */ (files.get(file));
    const rendered = normalizeAuthoredMarkdown(page.markdown).html;
    assert.ok(!rendered.includes('<img'), 'the defaults carry no images');
    // The title is printed once, as the page's <h1>, not again in the prose.
    const prose = rendered.replace(
      /^\s*<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>\s*/i,
      '',
    );
    const at = html.indexOf(prose);
    assert.ok(at > 0, `${file} carries the rendered default text`);
    const section = html.indexOf('<section><h2>Galascribe</h2>');
    assert.ok(section > at, `${file}: the Galascribe section follows the text`);
    assert.equal((html.match(/<h2>Galascribe<\/h2>/g) ?? []).length, 1);
  }
});

/** @type {(markdown: string, sourcePath: string) => any} */
const authoredBody = (markdown, sourcePath) => ({
  sourcePath,
  sourceDigest: sha256Of(Buffer.from(markdown, 'utf8')),
  bodyMediaType: 'text/html',
  body: normalizeAuthoredMarkdown(markdown).html,
  // Replaced with the published identity and the body's own digest by
  // `applyCurrentRenderPolicy`.
  bodyDigest: `sha256:${'0'.repeat(64)}`,
  renderPolicy: { name: 'x', version: '0', digest: `sha256:${'0'.repeat(64)}` },
});

const AUTHORED_TERMS_MARKDOWN =
  '# Reader Terms\n\nBe kind & careful with every <comment>.\n\n## Contact\n\nWrite to the editor.\n';
const AUTHORED_PRIVACY_MARKDOWN =
  'We keep **no** reader accounts.\n\n- Logs\n- Nothing else\n';

/**
 * @param {any} buildInput the build input
 * @returns {void} gives it authored policies (not yet render-policy-correct)
 */
function addAuthoredPolicies(buildInput) {
  buildInput.policies = {
    terms: {
      title: 'Reader Terms',
      body: authoredBody(AUTHORED_TERMS_MARKDOWN, 'gala/policies/terms.md'),
    },
    privacy: {
      title: 'Data Notice',
      body: authoredBody(AUTHORED_PRIVACY_MARKDOWN, 'gala/policies/privacy.md'),
    },
  };
}

test('authored policies replace the default text: title, body, then the Galascribe section', async () => {
  const files = await render(async (buildInput) => {
    addAuthoredPolicies(buildInput);
    await applyCurrentRenderPolicy(buildInput);
  });
  const defaults = loadSitePolicyDefaults();
  const terms = /** @type {string} */ (files.get('fixture-1/terms/index.html'));
  const privacy = /** @type {string} */ (
    files.get('fixture-1/privacy/index.html')
  );
  for (const [html, title, body] of [
    [
      terms,
      'Reader Terms',
      // The body's leading <h1> repeats the title, so it is dropped.
      normalizeAuthoredMarkdown(AUTHORED_TERMS_MARKDOWN).html.replace(
        /^<h1[^>]*>Reader Terms<\/h1>\s*/,
        '',
      ),
    ],
    [
      privacy,
      'Data Notice',
      normalizeAuthoredMarkdown(AUTHORED_PRIVACY_MARKDOWN).html,
    ],
  ]) {
    assert.match(html, new RegExp(`<title>${title} \\| `));
    assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
    assert.ok(
      html.includes(
        `<li aria-current="page">${title}</li></ol></nav><h1>${title}</h1></div>`,
      ),
      title,
    );
    const at = html.indexOf(body);
    assert.ok(at > 0, `${title}: the authored body is placed`);
    const section = html.indexOf('<section><h2>Galascribe</h2>');
    assert.ok(
      section > at,
      `${title}: the Galascribe section follows the body`,
    );
    assert.ok(html.indexOf('</section></div></div></article>') > section);
  }
  assert.ok(
    terms.includes('Be kind &amp; careful with every &lt;comment&gt;.'),
  );
  assert.ok(privacy.includes('<strong>no</strong>'));
  // The shipped default text is not rendered beside the authored one.
  for (const page of [defaults.terms, defaults.privacy]) {
    const rendered = normalizeAuthoredMarkdown(page.markdown).html;
    assert.ok(!terms.includes(rendered) && !privacy.includes(rendered));
  }
});

/**
 * @param {(buildInput: any) => Promise<void>} prepare changes the build input
 * @returns {Promise<{error: unknown, written: boolean}>} the build failure
 *   and whether anything was written
 */
async function renderFailure(prepare) {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  await prepare(buildInput);
  const dirs = await createRenderDirectories();
  try {
    /** @type {unknown} */
    let error;
    await assert.rejects(
      renderPublication(buildInput, {
        outputDirectory: dirs.outputDirectory,
        workDirectory: dirs.workDirectory,
        sourceDirectory: dirs.sourceDirectory,
        provenance: testProvenance(),
      }),
      (failure) => {
        error = failure;
        return true;
      },
    );
    const written = await stat(dirs.outputDirectory).then(
      () => true,
      () => false,
    );
    return { error, written };
  } finally {
    await dirs.cleanup();
  }
}

test('an authored policy body is verified like a content body: renderPolicy, digest and conformance', async () => {
  // A foreign render-policy identity.
  const identity = await renderFailure(async (buildInput) => {
    addAuthoredPolicies(buildInput);
    await applyCurrentRenderPolicy(buildInput);
    buildInput.policies.terms.body.renderPolicy.digest = `sha256:${'f'.repeat(64)}`;
  });
  assert.ok(identity.error instanceof RenderPolicyViolationError);
  assert.match(
    /** @type {Error} */ (identity.error).message,
    /^policies\.terms\.body: renderPolicy does not byte-equal/,
  );
  assert.equal(identity.written, false);

  // A digest that is not the body's own.
  const digest = await renderFailure(async (buildInput) => {
    addAuthoredPolicies(buildInput);
    await applyCurrentRenderPolicy(buildInput);
    buildInput.policies.privacy.body.bodyDigest = `sha256:${'a'.repeat(64)}`;
  });
  assert.ok(digest.error instanceof RenderPolicyViolationError);
  assert.match(
    /** @type {Error} */ (digest.error).message,
    /^policies\.privacy\.body: bodyDigest does not byte-equal/,
  );
  assert.equal(digest.written, false);

  // A body the sanitizer would change (not produced by the pipeline).
  const unsafe = await renderFailure(async (buildInput) => {
    addAuthoredPolicies(buildInput);
    const body = '<p onclick="steal()">Hello</p><script>alert(1)</script>';
    buildInput.policies.terms.body.body = body;
    await applyCurrentRenderPolicy(buildInput);
    assert.equal(
      buildInput.policies.terms.body.bodyDigest,
      computeBodyDigest(body),
    );
  });
  assert.ok(unsafe.error instanceof RenderPolicyViolationError);
  assert.match(
    /** @type {Error} */ (unsafe.error).message,
    /^policies\.terms\.body: body is not idempotent under the render policy/,
  );
  assert.equal(unsafe.written, false);
});

test('an image in an authored policy body never resolves and fails the build closed', async () => {
  const { error, written } = await renderFailure(async (buildInput) => {
    addAuthoredPolicies(buildInput);
    buildInput.policies.privacy.body = authoredBody(
      '![Seal](gala/policies/seal.png)\n',
      'gala/policies/privacy.md',
    );
    await applyCurrentRenderPolicy(buildInput);
  });
  assert.ok(error instanceof BuildInputValidationError);
  assert.deepEqual(
    error.diagnostics.map((/** @type {any} */ d) => [
      d.code,
      d.instancePointer,
    ]),
    [['MEDIA_REFERENCE_UNRESOLVED', '/policies/privacy/body/body']],
  );
  assert.equal(written, false);
});

test('validatePolicies admits exactly two titled pages with renderable bodies', () => {
  const page = (/** @type {string} */ title) => ({
    title,
    body: authoredBody('Text.\n', 'gala/policies/x.md'),
  });
  const valid = { terms: page('Terms'), privacy: page('Privacy') };
  assert.equal(validatePolicies(valid), valid);
  assert.equal(
    validatePolicies({ ...valid, terms: page('é'.repeat(80)) }).terms.title
      .length,
    80,
  );
  /** @type {[string, unknown, RegExp][]} */
  const refused = [
    ['not an object', 'terms', /build-input\.policies must be an object/],
    ['no privacy', { terms: page('T') }, /policies\.privacy is required/],
    [
      'an extra page',
      { ...valid, cookies: page('C') },
      /policies\.cookies is not allowed/,
    ],
    [
      'an extra member',
      { ...valid, terms: { ...page('T'), markdown: 'x' } },
      /policies\.terms\.markdown is not allowed/,
    ],
    [
      'no title',
      { ...valid, terms: { body: page('T').body } },
      /terms\.title is required/,
    ],
    [
      'an empty title',
      { ...valid, terms: page('') },
      /terms\.title must be 1 to 80/,
    ],
    [
      'a title over 80 graphemes',
      { ...valid, terms: page('x'.repeat(81)) },
      /terms\.title must be 1 to 80/,
    ],
    [
      'a non-string title',
      { ...valid, privacy: { ...page('P'), title: 7 } },
      /privacy\.title must be a string/,
    ],
    [
      'a body that is not a renderableBody',
      { ...valid, privacy: { title: 'P', body: { body: '<p>x</p>' } } },
      /privacy\.body\.sourcePath is required/,
    ],
  ];
  for (const [name, candidate, pattern] of refused) {
    assert.throws(
      () => validatePolicies(candidate),
      (error) =>
        error instanceof RenderPolicyViolationError &&
        pattern.test(error.message),
      name,
    );
  }
});

/** @returns {any} a valid analytics module */
const analyticsModule = () => ({
  config: {
    schemaId: 'urn:gala:schema:analytics-config:2.0.0',
    schemaVersion: '2.0.0',
    provider: { kind: 'google-analytics-4', measurementId: 'G-ABC123XYZ' },
    consent: { policy: 'opt-in' },
  },
});

test('the Galascribe section computes every fact from the build input', () => {
  const base = {
    publicationName: 'My <Notes> & Co',
    authoredText: false,
    interactionsOn: false,
  };
  const off = renderGalascribeSection(base);
  assert.ok(off.startsWith('<section><h2>Galascribe</h2>'));
  assert.ok(off.endsWith('</section>'));
  // The author-supplied name is escaped; the incorporated documents, the
  // company and the support contact are always named.
  assert.ok(
    off.includes('published by My &lt;Notes&gt; &amp; Co with Galascribe'),
  );
  assert.ok(off.includes('Rathnas LLC'));
  assert.ok(
    off.includes(
      'href="https://app.galascribe.com/terms" rel="noopener">Galascribe&#39;s Terms of Service</a>',
    ),
  );
  assert.ok(
    off.includes(
      'href="https://app.galascribe.com/privacy" rel="noopener">Galascribe&#39;s Privacy Policy</a>',
    ),
  );
  // The legal documents are on the App's origin, never the marketing apex.
  assert.ok(!off.includes('href="https://galascribe.com'));
  assert.ok(
    off.includes(
      '<a href="mailto:support@galascribe.com">support@galascribe.com</a>',
    ),
  );
  assert.ok(
    off.includes('This site loads no analytics or advertising trackers.'),
  );
  for (const absent of [
    'Reactions and comments',
    'Google Analytics',
    '_ga',
    'gala.consent.v1',
    'Global Privacy Control',
  ]) {
    assert.ok(!off.includes(absent), absent);
  }

  const interactions = renderGalascribeSection({
    ...base,
    interactionsOn: true,
  });
  assert.ok(
    interactions.includes(
      'Reactions and comments on this site are provided by Galascribe.',
    ),
  );
  assert.ok(
    interactions.includes(
      'Galascribe (Rathnas LLC) processes the data you submit',
    ),
  );
  assert.ok(
    interactions.includes(
      'This site loads no analytics or advertising trackers.',
    ),
  );

  const analytics = renderGalascribeSection({
    ...base,
    analytics: analyticsModule(),
  });
  assert.ok(!analytics.includes('Reactions and comments'));
  assert.ok(!analytics.includes('loads no analytics'));
  for (const present of [
    'With your consent this site uses Google Analytics 4 (Google LLC)',
    'Nothing is loaded before you accept.',
    '<code>_ga</code> and <code>_ga_*</code> cookies',
    '<code>localStorage</code> under <code>gala.consent.v1</code>',
    '"Privacy choices" in the footer',
    'Global Privacy Control signal',
    'href="https://policies.google.com/privacy"',
  ]) {
    assert.ok(analytics.includes(present), present);
  }
});

test('with interactions and analytics on both pages carry the full Galascribe section', async () => {
  let publicationName = '';
  const files = await render(async (buildInput) => {
    publicationName = buildInput.publication.title;
    buildInput.modules = {
      analytics: analyticsModule(),
      interactions: {
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
      },
    };
    await applyCurrentRenderPolicy(buildInput);
  });
  const expected = renderGalascribeSection({
    publicationName,
    authoredText: false,
    interactionsOn: true,
    analytics: analyticsModule(),
  });
  for (const file of [
    'fixture-1/terms/index.html',
    'fixture-1/privacy/index.html',
  ]) {
    const html = /** @type {string} */ (files.get(file));
    assert.ok(html.includes(expected), file);
  }
});

test('policy pages are in the sitemap and absent from search, feeds and llms', async () => {
  const files = await render();
  const sitemap = /** @type {string} */ (files.get('fixture-1/sitemap.xml'));
  assert.match(sitemap, /<loc>[^<]*\/terms\/<\/loc>/);
  assert.match(sitemap, /<loc>[^<]*\/privacy\/<\/loc>/);
  for (const file of [
    'fixture-1/search-index.json',
    'fixture-1/llms.txt',
    'fixture-1/llms-full.txt',
    'fixture-1/feed/atom.xml',
    'fixture-1/feed/rss.xml',
  ]) {
    const text = /** @type {string} */ (files.get(file));
    assert.ok(text, file);
    const urls = file.endsWith('.json')
      ? jsonStrings(JSON.parse(text))
      : file.endsWith('.xml')
        ? [
            ...text.matchAll(/<(?:link|id|guid)[^>]*>([^<]*)</g),
            ...text.matchAll(/<link[^>]*href="([^"]*)"/g),
          ].map((match) => match[1])
        : [...text.matchAll(/https?:\/\/[^\s)<>"]+|\]\(([^)\s]+)\)/g)].map(
            (match) => match[1] ?? match[0],
          );
    assert.ok(urls.length > 0, `${file} lists URLs`);
    for (const url of urls) {
      assert.ok(!isPolicyRoute(url), `${file} lists ${url}`);
    }
  }
});

/**
 * @param {unknown} value parsed JSON
 * @returns {string[]} every string inside it
 */
function jsonStrings(value) {
  if (typeof value === 'string') return [value];
  if (value === null || typeof value !== 'object') return [];
  return Object.values(value).flatMap(jsonStrings);
}

/**
 * @param {string} value a URL or route
 * @returns {boolean} whether its path ends in the Terms or Privacy route
 */
function isPolicyRoute(value) {
  const route = value.replace(/^https?:\/\/[^/]*/, '').replace(/\/$/, '');
  return /(^|\/)(terms|privacy)$/.test(route);
}

test('an authored page on /terms fails the build closed', async () => {
  const buildInput = /** @type {any} */ (await buildRichFixture());
  const page = buildInput.content.find(
    (/** @type {any} */ record) => record.frontmatter.kind === 'page',
  );
  page.frontmatter.slug = 'terms';
  page.frontmatter.route = undefined;
  await applyCurrentRenderPolicy(buildInput);
  const dirs = await createRenderDirectories();
  try {
    /** @type {any} */
    let failure;
    await assert.rejects(
      renderPublication(buildInput, {
        outputDirectory: dirs.outputDirectory,
        workDirectory: dirs.workDirectory,
        sourceDirectory: dirs.sourceDirectory,
        provenance: testProvenance(),
      }),
      (error) => {
        failure = error;
        return error instanceof BuildInputValidationError;
      },
    );
    assert.deepEqual(
      failure.diagnostics.map((/** @type {any} */ d) => d.code),
      ['POLICY_ROUTE_CONFLICT'],
    );
    await assert.rejects(stat(dirs.outputDirectory), { code: 'ENOENT' });
  } finally {
    await dirs.cleanup();
  }
});

/**
 * @param {string[]} redirects redirect routes for the first document
 * @returns {Promise<any>} the build failure
 */
async function redirectFailure(redirects) {
  const { error } = await renderFailure(async (buildInput) => {
    buildInput.content[0].frontmatter.redirects = redirects;
  });
  assert.ok(error instanceof BuildInputValidationError);
  return error;
}

test('a redirect from /privacy fails the build closed', async () => {
  const failure = await redirectFailure(['/privacy']);
  assert.deepEqual(
    failure.diagnostics.map((/** @type {any} */ d) => d.code),
    ['POLICY_ROUTE_CONFLICT'],
  );
});

test('trailing-slash and upper-case spellings of a policy route conflict too', async () => {
  // The route format admits both a trailing slash and upper-case letters.
  for (const route of ['/terms/', '/Terms', '/PRIVACY/']) {
    const failure = await redirectFailure([route]);
    assert.deepEqual(
      failure.diagnostics.map((/** @type {any} */ d) => d.code),
      ['POLICY_ROUTE_CONFLICT'],
      route,
    );
  }
});

test('madeWithGalascribeHref names the percent-encoded host', () => {
  const tail =
    '&utm_medium=referral&utm_campaign=made-with-galascribe&utm_content=footer';
  assert.equal(
    madeWithGalascribeHref('https://my-notes.example.com/blog/'),
    `https://galascribe.com/?utm_source=my-notes.example.com${tail}`,
  );
  assert.equal(
    madeWithGalascribeHref('https://münchen.example/'),
    `https://galascribe.com/?utm_source=xn--mnchen-3ya.example${tail}`,
  );
});

const POLICY_FILES = [
  'fixture-1/terms/index.html',
  'fixture-1/privacy/index.html',
];

test("the rendered Galascribe section links the App's legal documents while the footer keeps the apex referral link", async () => {
  const files = await render();
  for (const file of POLICY_FILES) {
    const html = /** @type {string} */ (files.get(file));
    assert.ok(
      html.includes('href="https://app.galascribe.com/terms" rel="noopener"'),
      file,
    );
    assert.ok(
      html.includes('href="https://app.galascribe.com/privacy" rel="noopener"'),
      file,
    );
    assert.ok(!html.includes('href="https://galascribe.com/terms'), file);
    assert.ok(!html.includes('href="https://galascribe.com/privacy'), file);
    // The apex 301 preserves the query, so the referral link is unchanged.
    assert.ok(html.includes('href="https://galascribe.com/?utm_source='), file);
  }
});

const AUTHORED_SENTENCE = "The text above is written by the site's author.";
const DEFAULT_SENTENCE =
  "The text above is Galascribe's standard text for this site; the site's author can replace it in Galascribe.";

test('the Galascribe section says whose text it follows: authored or the shipped default', async () => {
  const base = { publicationName: 'N', interactionsOn: false };
  const authored = renderGalascribeSection({ ...base, authoredText: true });
  const standard = renderGalascribeSection({ ...base, authoredText: false });
  assert.ok(authored.includes(AUTHORED_SENTENCE));
  assert.ok(!authored.includes(DEFAULT_SENTENCE));
  assert.ok(standard.includes(DEFAULT_SENTENCE));
  assert.ok(!standard.includes("written by the site's author"));
  for (const section of [authored, standard]) {
    assert.ok(
      section.includes(
        'This section is added by Galascribe to every site it publishes and cannot be changed by the author.',
      ),
    );
  }

  // Rendered: the defaults claim no authorship; authored policies do.
  const defaults = await render();
  const withPolicies = await render(async (buildInput) => {
    addAuthoredPolicies(buildInput);
    await applyCurrentRenderPolicy(buildInput);
  });
  for (const file of POLICY_FILES) {
    const byDefault = /** @type {string} */ (defaults.get(file));
    assert.ok(byDefault.includes(DEFAULT_SENTENCE), file);
    assert.ok(!byDefault.includes("written by the site's author"), file);
    const byAuthor = /** @type {string} */ (withPolicies.get(file));
    assert.ok(byAuthor.includes(AUTHORED_SENTENCE), file);
    assert.ok(!byAuthor.includes(DEFAULT_SENTENCE), file);
  }
});

test('authored policy sources are included sources of the manifest, with their digests; the shipped default lists none', async () => {
  /** @type {string} */
  let sourceRevision = '';
  const authored = await renderWithManifest(async (buildInput) => {
    sourceRevision = buildInput.sourceRevision;
    addAuthoredPolicies(buildInput);
    await applyCurrentRenderPolicy(buildInput);
  });
  const rows = /** @type {{path: string}[]} */ (
    authored.manifest.includedSources
  );
  for (const [sourcePath, markdown] of [
    ['gala/policies/terms.md', AUTHORED_TERMS_MARKDOWN],
    ['gala/policies/privacy.md', AUTHORED_PRIVACY_MARKDOWN],
  ]) {
    assert.deepEqual(
      rows.filter((row) => row.path === sourcePath),
      [
        {
          path: sourcePath,
          sha256: sha256Of(Buffer.from(markdown, 'utf8')),
          sourceRevision,
          role: 'content',
        },
      ],
      sourcePath,
    );
  }
  const paths = rows.map((row) => row.path);
  assert.equal(new Set(paths).size, paths.length, 'one row per source');
  assert.deepEqual(
    paths,
    [...paths].sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b))),
    'rows stay in UTF-8 byte order',
  );

  // Without `policies` the text comes from the schemas package: no row, and a
  // different source inventory.
  const defaults = await renderWithManifest();
  assert.ok(
    !defaults.manifest.includedSources.some((/** @type {any} */ row) =>
      row.path.startsWith('gala/policies/'),
    ),
  );
  assert.notEqual(
    defaults.manifest.sourceInventoryDigest,
    authored.manifest.sourceInventoryDigest,
  );
});

test('a hostile authored title is escaped in the heading, title, breadcrumb and JSON-LD, and the fixed labels stay Terms and Privacy', async () => {
  const title = '<b>"T&C"</b>';
  const escaped = '&lt;b&gt;&quot;T&amp;C&quot;&lt;/b&gt;';
  const files = await render(async (buildInput) => {
    addAuthoredPolicies(buildInput);
    for (const key of ['terms', 'privacy']) {
      buildInput.policies[key].title = title;
      buildInput.policies[key].body = authoredBody(
        'Plain text.\n',
        `gala/policies/${key}.md`,
      );
    }
    // The consent banner links to the Privacy page as well.
    buildInput.modules = { analytics: analyticsModule() };
    await applyCurrentRenderPolicy(buildInput);
  });
  for (const file of POLICY_FILES) {
    const html = /** @type {string} */ (files.get(file));
    assert.ok(html.includes(`<title>${escaped} | `), `${file} <title>`);
    assert.ok(
      html.includes(
        `<li aria-current="page">${escaped}</li></ol></nav><h1>${escaped}</h1></div>`,
      ),
      `${file} breadcrumb and <h1>`,
    );
    assert.ok(!html.includes(title), `${file} carries no raw title`);
    assert.ok(!html.includes('<b>&quot;'), `${file} carries no raw element`);

    const block =
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html);
    assert.ok(block, `${file} has JSON-LD`);
    assert.ok(!/[<>&]/.test(block[1]), `${file} JSON-LD is embed-safe`);
    const graph = JSON.parse(block[1])['@graph'];
    const page = graph.find(
      (/** @type {any} */ node) => node['@type'] === 'WebPage',
    );
    assert.equal(page.name, title);
    const trail = graph.find(
      (/** @type {any} */ node) => node['@type'] === 'BreadcrumbList',
    ).itemListElement;
    assert.equal(trail.at(-1).name, title);

    // Footer and consent labels are the template's own, not the page title.
    assert.match(
      html,
      /<li><a href="[^"]*terms[^"]*">Terms<\/a><\/li><li><a href="[^"]*privacy[^"]*">Privacy<\/a><\/li>/,
      `${file} footer labels`,
    );
    assert.match(
      html,
      /<a href="[^"]*privacy[^"]*">Privacy<\/a><\/div><\/aside>/,
      `${file} consent link label`,
    );
  }
  const home = /** @type {string} */ (files.get('fixture-1/index.html'));
  assert.ok(!home.includes('T&amp;C') && !home.includes('T&C'));
  assert.match(
    home,
    /<li><a href="[^"]*terms[^"]*">Terms<\/a><\/li><li><a href="[^"]*privacy[^"]*">Privacy<\/a><\/li>/,
  );
});
