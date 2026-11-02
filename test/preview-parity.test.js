/**
 * The preview's core guarantee: `renderContentPreview`, `renderHomePreview`,
 * `renderProfilePreview` and `renderPolicyPreview`, given the inputs a build
 * used, return byte-for-byte the page the build wrote. Every content record of
 * each fixture (article, page, edition), its home page, each language section
 * home, its profile page and its Terms and Privacy pages are built with
 * `renderPublication`, then previewed from an input derived from the build
 * input and the media pipeline's results, with the preview options off (`===`)
 * and on (equal once exactly the five named differences are removed from both
 * sides, by `withoutDifferences`). The last test lists the route kinds covered.
 */

import { strict as assert } from 'node:assert';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { createHash } from 'node:crypto';
import { renderPublication } from '../src/core/index.js';
import { PREVIEW_RUNTIME_SOURCE } from '../src/core/internal/preview-runtime-source.js';
import { normalizeAuthoredMarkdown } from '../src/core/internal/content-security.js';
import { processMedia } from '../src/core/internal/media/pipeline.js';
import { resolveContentImages } from '../src/core/internal/media/content-images.js';
import {
  derivePublicBasePath,
  joinBasePathAndRoute,
  projectRouteToFilePath,
} from '../src/core/internal/route.js';
import {
  BASE_LAYER_CSS,
  loadMessagesFor,
  previewLanguages,
  renderArticlePreview,
  renderContactPreview,
  renderContentPreview,
  renderHomePreview,
  renderPolicyPreview,
  renderProfilePreview,
} from '../src/core/preview.js';
import { languageSegment } from '../src/core/internal/translations.js';
import {
  buildRichFixture,
  editionRecord,
} from './helpers/page-kind-fixtures.js';
import { buildTestPng, sha256Of } from './helpers/media-fixtures.js';
import {
  createRenderDirectories,
  testProvenance,
} from './helpers/render-fixtures.js';
import { applyCurrentRenderPolicy } from './helpers/schema-fixtures.js';

const THEME = fileURLToPath(
  new URL('./fixtures/theme-fixture-full', import.meta.url),
);
const PALETTE_VECTORS = JSON.parse(
  await readFile(
    path.join(
      path.dirname(
        fileURLToPath(
          import.meta.resolve('@rathnasgala2/schemas/package.json'),
        ),
      ),
      'parity',
      'palette',
      'golden-vectors.json',
    ),
    'utf8',
  ),
);
const CSP = "default-src 'none'; style-src 'unsafe-inline'; img-src data:";
const ALL_ON = {
  inlineStyles: true,
  omitScripts: true,
  contentSecurityPolicy: CSP,
  inertLinks: true,
  colorMode: /** @type {'dark'} */ ('dark'),
};

/**
 * The five named differences, removed from a document: the one strict
 * normalizer both sides pass through. Anything else that differs stays.
 *
 * @param {string} html a built or preview document
 * @returns {string} the document without (a)-(e)
 */
function withoutDifferences(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '') // (b)
    .replace(/<link rel="stylesheet"[^>]*>/g, '') // (a), built side
    .replace(
      /<style data-gala-preview-style="[^"]*"[^>]*>[\s\S]*?<\/style>/g,
      '',
    ) // (a), preview side
    .replace(
      /<meta http-equiv="Content-Security-Policy" content="[^"]*">/,
      '<meta csp>',
    ) // (c)
    .replace(/<a\b([^>]*)>/g, (_all, attributes) => {
      const rest = attributes
        .replace(/\shref="[^"]*"/, '')
        .replace(/\stabindex="-1"/, '');
      return `<a${rest}>`;
    }) // (d)
    .replace(/ data-gala-resolved-color-mode="[^"]*"/, ''); // (e)
}

const INTERACTIVE = {
  apiOrigin: 'https://api.galascribe.com',
  liveBaseUrl: 'https://live.example.com/',
  scrollY: 120,
};

/**
 * @param {string} html a document
 * @returns {{start: number, end: number, attrs: string, text: string}[]} its
 *   `<script>` elements, by position (their text may hold `<`)
 */
function scriptElements(html) {
  /** @type {{start: number, end: number, attrs: string, text: string}[]} */
  const found = [];
  let at = html.indexOf('<script');
  while (at >= 0) {
    const open = html.indexOf('>', at);
    const close = html.indexOf('</script>', open);
    found.push({
      start: at,
      end: close + '</script>'.length,
      attrs: html.slice(at + '<script'.length, open),
      text: html.slice(open + 1, close),
    });
    at = html.indexOf('<script', close);
  }
  return found;
}

/**
 * Remove the executable scripts (linked or inline) and the runtime's data, then
 * the other named differences except scripts and anchors, which interactive
 * mode leaves alone: the one strict normalizer for interactive parity.
 *
 * @param {string} html a built or interactive document
 * @returns {string} the document without the interactive differences
 */
function withoutInteractive(html) {
  let out = html;
  for (const el of scriptElements(html).reverse()) {
    if (
      /\stype="/.test(el.attrs) &&
      !el.attrs.includes('data-gala-preview-data')
    ) {
      continue;
    }
    out = out.slice(0, el.start) + out.slice(el.end);
  }
  return out
    .replace(/<link rel="stylesheet"[^>]*>/g, '')
    .replace(
      /<style data-gala-preview-style="[^"]*"[^>]*>[\s\S]*?<\/style>/g,
      '',
    )
    .replace(
      /<meta http-equiv="Content-Security-Policy" content="[^"]*">/,
      '<meta csp>',
    )
    .replace(/ data-gala-resolved-color-mode="[^"]*"/, '');
}

/** @type {any} the fixture being checked, for the built asset bytes */
let currentSite;

/**
 * Interactive parity: the document equals the built page once only the
 * inlined scripts (each text the built asset's exact bytes), the runtime and
 * its data, the CSP, the inline styles and the colour mode are removed; and
 * the CSP lists exactly those inline scripts by hash.
 *
 * @param {string} label the page
 * @param {string} built the built file
 * @param {string} html the interactive preview
 * @returns {Promise<void>}
 */
async function assertInteractiveParity(label, built, html) {
  const builtLinks = [
    ...built.matchAll(/<script src="([^"]*)"([^>]*)><\/script>/g),
  ];
  const all = scriptElements(html);
  const executable = all.filter((el) => !/\stype="/.test(el.attrs));
  const data = all.filter((el) => el.attrs.includes('data-gala-preview-data'));
  assert.equal(data.length, 1, `${label}: one data block`);
  assert.equal(executable[0].text, PREVIEW_RUNTIME_SOURCE, `${label}: runtime`);
  assert.ok(
    executable[0].start < data[0].end + 1000 &&
      data[0].start < executable[0].start,
    `${label}: data block then runtime`,
  );
  const first = html.indexOf('<script');
  assert.equal(
    first,
    data[0].start,
    `${label}: runtime data is the first script`,
  );
  const inlined = executable.slice(1);
  assert.equal(inlined.length, builtLinks.length, `${label}: script count`);
  const bodyAt = html.indexOf('<body');
  for (const [index, link] of builtLinks.entries()) {
    const el = inlined[index];
    const href = link[1];
    const bytes = await site().read(
      path.join(
        site().buildInput.basePath,
        href.slice(href.indexOf('assets/')),
      ),
    );
    assert.equal(el.text, bytes, `${label}: ${href} inline text is the asset`);
    assert.equal(
      el.attrs,
      link[2].replace(/\sdefer(?=\s|$)/, ''),
      `${label}: ${href} attributes`,
    );
    assert.equal(
      el.start > bodyAt,
      index > 0,
      `${label}: ${href} placed (bootstrap in head, the rest at the end of body)`,
    );
  }
  assert.equal(withoutInteractive(html), withoutInteractive(built), label);
  assert.notEqual(
    withoutInteractive(html.replace('<h1', '<h1 data-x="1"')),
    withoutInteractive(built),
    `${label}: strict`,
  );
  // The policy: exactly these inline scripts by hash, nothing broader.
  const meta =
    /<meta http-equiv="Content-Security-Policy" content="([^"]*)">/.exec(html);
  assert.ok(meta, `${label}: policy meta`);
  const policy = meta[1].replace(/&#39;/g, "'");
  const hashes = [...executable]
    .map(
      (el) =>
        `'sha256-${createHash('sha256').update(el.text, 'utf8').digest('base64')}'`,
    )
    .join(' ');
  assert.equal(
    policy,
    [
      "default-src 'none'",
      `script-src ${hashes}`,
      "style-src 'unsafe-inline'",
      'img-src data:',
      'media-src data: https://live.example.com',
      'connect-src https://api.galascribe.com',
      'font-src data:',
      "frame-src 'none'",
      "form-action 'none'",
      "base-uri 'none'",
    ].join('; '),
    `${label}: policy`,
  );
  assert.ok(!/unsafe-eval|unsafe-hashes/.test(policy));
  assert.ok(
    !/\son[a-z]+\s*=/i.test(html.replace(/<script[\s\S]*?<\/script>/g, '')),
    `${label}: no inline handler attribute`,
  );
  // Runtime-only message keys are never in a built page.
  for (const text of [
    'Preview only. Nothing was saved.',
    "isn't available in the preview",
    'Audio plays once this post is published',
  ]) {
    assert.ok(!built.includes(text), `${label}: built page has no ${text}`);
  }
}

/** @returns {any} the fixture being checked */
function site() {
  return currentSite;
}

/**
 * @param {string} html a preview document
 * @returns {{role: string, css: string}[]} its inline preview styles
 */
function previewStyles(html) {
  return [
    ...html.matchAll(
      /<style data-gala-preview-style="([^"]*)"[^>]*>([\s\S]*?)<\/style>/g,
    ),
  ].map((match) => ({ role: match[1], css: match[2] }));
}

/**
 * Build a fixture with `renderPublication`.
 *
 * @param {object} options
 * @param {(input: any, sourceDirectory: string) => Promise<void>} [options.prepare]
 * @param {boolean} [options.theme] build with the full fixture theme
 * @param {any} [options.input] a ready build input (default: the rich fixture)
 * @returns {Promise<any>} the build input, manifest, readers and cleanup
 */
async function build({ prepare, theme = false, input } = {}) {
  const buildInput = input ?? (await buildRichFixture());
  const dirs = await createRenderDirectories();
  await prepare?.(buildInput, dirs.sourceDirectory);
  await applyCurrentRenderPolicy(buildInput);
  const { manifest } = await renderPublication(buildInput, {
    outputDirectory: dirs.outputDirectory,
    workDirectory: dirs.workDirectory,
    sourceDirectory: dirs.sourceDirectory,
    ...(theme ? { themeDirectory: THEME } : {}),
    provenance: testProvenance(),
  });
  return {
    buildInput,
    manifest,
    sourceDirectory: dirs.sourceDirectory,
    outputDirectory: dirs.outputDirectory,
    read: (/** @type {string} */ file) =>
      readFile(path.join(dirs.outputDirectory, file), 'utf8'),
    cleanup: dirs.cleanup,
  };
}

/**
 * The caller-side images for a build: what the media pipeline made of each
 * image the build input names, as `PreviewImage` rows keyed by repository path.
 *
 * @param {any} site a built fixture
 * @returns {Promise<Record<string, any>>} the media map
 */
async function mediaOf(site) {
  const input = site.buildInput;
  const refs = new Map();
  const add = (/** @type {any} */ ref) => ref && refs.set(ref.path, ref);
  for (const record of input.content) {
    for (const file of record.media ?? []) add(file);
    add(record.frontmatter.hero?.file);
    add(record.frontmatter.socialImage);
  }
  for (const author of input.authors) add(author.avatar);
  add(input.publication.defaultImage);
  add(input.appearance.brandMark);
  if (refs.size === 0) return {};
  const result = await processMedia(input, {
    sourceDirectory: site.sourceDirectory,
    contentImages: [...resolveContentImages(input).values()],
  });
  const publicBasePath = derivePublicBasePath(input.baseUrl, input.basePath);
  const urlOf = (/** @type {string} */ p) =>
    joinBasePathAndRoute(publicBasePath, `/${p}`);
  /** @type {Record<string, any>} */
  const media = {};
  for (const [imagePath, ref] of refs) {
    const hex = ref.sourceDigest.replace(/^sha256:/, '');
    const original = result.assets.find((asset) =>
      asset.path.includes(`assets/media/${hex}/original.`),
    );
    if (!original) continue;
    const size = result.dimensions[original.path];
    media[imagePath] = {
      url: urlOf(original.path),
      width: size.width,
      height: size.height,
      mediaType: original.mediaType,
      sourceDigest: ref.sourceDigest,
      variants: result.variants[ref.sourceDigest].map((variant) => ({
        url: urlOf(variant.path),
        width: variant.width,
        height: variant.height,
      })),
    };
  }
  return media;
}

/**
 * The site sections of a built fixture's preview input: the same sections the
 * build input holds, in the preview's own shape.
 *
 * @param {any} site a built fixture
 * @param {Record<string, any>} media the images
 * @returns {Promise<any>} the sections both preview inputs share
 */
async function siteInputOf(site, media) {
  const input = site.buildInput;
  const { footerCard, contactForm, ...publication } = input.publication;
  delete publication.profile;
  const themeJson = site.themeJson;
  return {
    publication: {
      ...publication,
      ...(footerCard
        ? {
            footerCard: { ...footerCard, body: { html: footerCard.body.body } },
          }
        : {}),
      ...(contactForm
        ? {
            contactForm: {
              enabled: contactForm.enabled,
              fields: contactForm.fields,
              ...(contactForm.intro
                ? { intro: { html: contactForm.intro.body } }
                : {}),
            },
          }
        : {}),
    },
    authors: input.authors,
    navigation: input.navigation,
    appearance: input.appearance,
    modules: input.modules,
    baseUrl: input.baseUrl,
    basePath: input.basePath,
    buildEpoch: input.buildEpoch,
    media,
    ...(themeJson
      ? {
          theme: {
            themeJson,
            stylesheets: await Promise.all(
              themeJson.stylesheets.map(async (/** @type {string} */ name) => ({
                filename: name,
                css: await readFile(path.join(THEME, name)),
              })),
            ),
          },
        }
      : {}),
  };
}

/**
 * The preview input for one post of a built fixture.
 *
 * @param {any} site a built fixture
 * @param {any} record the post
 * @param {Record<string, any>} media the images
 * @returns {Promise<any>} the `ArticlePreviewInput`
 */
async function previewInputOf(site, record, media) {
  return {
    ...(await siteInputOf(site, media)),
    post: { frontmatter: record.frontmatter, bodyHtml: record.body },
    siblings: site.buildInput.content
      .filter((/** @type {any} */ other) => other !== record)
      .map((/** @type {any} */ other) => ({
        frontmatter: other.frontmatter,
        bodyHtml: other.body,
      })),
  };
}

/** @type {Set<string>} the route kinds the parity tests covered, as `kind<TAB>fixture` */
const COVERED = new Set();

/**
 * Assert one page's parity, off and on: the built file equals the preview of
 * the same site, and the preview differences are the only ones.
 *
 * @param {string} label the page, for messages
 * @param {(preview?: Record<string, unknown>) => {html: string, title: string, route: string, warnings: string[]}} render
 *   renders the preview with these preview options
 * @param {string} built the built file
 * @param {string} expectedRoute the route the preview must report
 * @returns {void}
 */
async function assertPageParity(label, render, built, expectedRoute) {
  const off = render();
  assert.deepEqual(off.warnings, [], label);
  assert.equal(off.route, expectedRoute, label);
  assert.ok(off.html === built, `${label}: preview off equals the built page`);
  const on = render(ALL_ON);
  assert.notEqual(on.html, built, `${label}: the differences are applied`);
  assert.equal(withoutDifferences(on.html), withoutDifferences(built), label);
  assert.equal(on.title, off.title);
  assert.ok(!/<script\b/.test(on.html), `${label}: no script`);
  assert.ok(!/<a\b[^>]*\shref=/.test(on.html), `${label}: anchors inert`);
  for (const [key, value] of Object.entries(ALL_ON)) {
    assert.equal(
      withoutDifferences(render({ [key]: value }).html),
      withoutDifferences(built),
      `${label}: ${key} alone`,
    );
  }
  return assertInteractiveParity(
    label,
    built,
    render({ interactive: INTERACTIVE, colorMode: 'dark' }).html,
  );
}

/**
 * @param {any} site a built fixture
 * @param {string} route a route
 * @returns {Promise<string>} the built file of that route
 */
const builtAt = (site, route) =>
  site.read(
    projectRouteToFilePath(
      joinBasePathAndRoute(site.buildInput.basePath, route),
      'directory-index',
    ),
  );

/**
 * @param {any} site a built fixture
 * @param {Record<string, any>} media the images
 * @returns {Promise<any>} the site sections plus every post, as the home page,
 *   the profile page and the policy pages take them
 */
async function withPostsOf(site, media) {
  return {
    ...(await siteInputOf(site, media)),
    posts: site.buildInput.content.map((/** @type {any} */ record) => ({
      frontmatter: record.frontmatter,
      bodyHtml: record.body,
    })),
  };
}

/**
 * Assert the home page's parity, and that of every language section home.
 *
 * @param {string} name the fixture
 * @param {any} site a built fixture
 * @param {Record<string, any>} media the images
 * @returns {Promise<string>} the built home page
 */
async function assertHomeParity(name, site, media) {
  currentSite = site;
  const input = await withPostsOf(site, media);
  const getMessages = await loadMessagesFor(previewLanguages(input));
  const built = await builtAt(site, '/');
  await assertPageParity(
    `${name} / home`,
    (preview) => renderHomePreview(input, { getMessages, preview }),
    built,
    '/',
  );
  COVERED.add(`home\t${name}`);
  const defaultLanguage = site.buildInput.publication.defaultLanguage;
  for (const language of new Set(
    site.buildInput.content.map(
      (/** @type {any} */ r) => r.frontmatter.language,
    ),
  )) {
    if (language === defaultLanguage) continue;
    const route = `/${languageSegment(/** @type {string} */ (language))}`;
    await assertPageParity(
      `${name} / section ${language}`,
      (preview) => renderHomePreview(input, { language, getMessages, preview }),
      await builtAt(site, route),
      route,
    );
    COVERED.add(`section home ${language}\t${name}`);
  }
  return built;
}

/**
 * Assert the profile page's and the policy pages' parity (the latter with the
 * site's own text when the build input has it, else with the shipped defaults).
 *
 * @param {string} name the fixture
 * @param {any} site a built fixture
 * @param {Record<string, any>} media the images
 * @param {Record<string, string>} [markdownOf] policy Markdown by page, to
 *   preview from Markdown rather than the built HTML
 * @returns {Promise<void>}
 */
async function assertSystemPages(name, site, media, markdownOf = {}) {
  const input = await withPostsOf(site, media);
  const getMessages = await loadMessagesFor(previewLanguages(input));
  const { profile } = site.buildInput.publication;
  if (profile) {
    const withProfile = {
      ...input,
      profile: { route: profile.route, body: { html: profile.body.body } },
    };
    await assertPageParity(
      `${name} / profile`,
      (preview) => renderProfilePreview(withProfile, { getMessages, preview }),
      await builtAt(site, profile.route),
      profile.route,
    );
    COVERED.add(`profile\t${name}`);
  }
  if (site.buildInput.publication.contactForm?.enabled) {
    await assertPageParity(
      `${name} / contact`,
      (preview) => renderContactPreview(input, { getMessages, preview }),
      await builtAt(site, '/contact'),
      '/contact',
    );
    COVERED.add(`contact\t${name}`);
  }
  const authored = site.buildInput.policies;
  const policies = authored
    ? Object.fromEntries(
        Object.entries(authored).map(([page, entry]) => [
          page,
          {
            title: /** @type {any} */ (entry).title,
            body: markdownOf[page]
              ? { markdown: markdownOf[page] }
              : { html: /** @type {any} */ (entry).body.body },
          },
        ]),
      )
    : undefined;
  for (const page of /** @type {const} */ (['terms', 'privacy'])) {
    await assertPageParity(
      `${name} / ${page}`,
      (preview) =>
        renderPolicyPreview(
          { ...input, ...(policies ? { policies } : {}) },
          { page },
          { getMessages, preview },
        ),
      await builtAt(site, `/${page}`),
      `/${page}`,
    );
    COVERED.add(`${page} ${authored ? 'authored' : 'defaults'}\t${name}`);
  }
}

/**
 * Assert the parity of every article of a fixture, off and on, and of its
 * home page.
 *
 * @param {string} name the fixture
 * @param {any} site a built fixture
 * @param {object} [more]
 * @param {number} [more.minimumPosts] how many articles the fixture must hold
 * @param {Record<string, string>} [more.markdownOf] policy Markdown by page
 * @returns {Promise<string[]>} the slugs checked
 */
async function assertParity(
  name,
  site,
  { minimumPosts = 1, markdownOf = {} } = {},
) {
  if (site.theme) {
    site.themeJson = JSON.parse(
      await readFile(path.join(THEME, 'theme.json'), 'utf8'),
    );
  }
  currentSite = site;
  const media = await mediaOf(site);
  const posts = site.buildInput.content;
  const articles = posts.filter(
    (/** @type {any} */ r) => r.frontmatter.kind === 'article',
  );
  assert.ok(
    articles.length >= minimumPosts,
    `${name}: ${articles.length} articles`,
  );
  const routeProfile = 'directory-index';
  const slugs = [];
  for (const record of posts) {
    const input = await previewInputOf(site, record, media);
    const getMessages = await loadMessagesFor(previewLanguages(input));
    const label = `${name} / ${record.frontmatter.slug}`;
    const off = renderContentPreview(input, { getMessages });
    assert.deepEqual(off.warnings, [], label);
    COVERED.add(`${record.frontmatter.kind}\t${name}`);
    const file = projectRouteToFilePath(
      joinBasePathAndRoute(site.buildInput.basePath, off.route),
      routeProfile,
    );
    const built = await site.read(file);
    assert.ok(
      off.html === built,
      `${label}: preview off equals the built page`,
    );

    const on = renderContentPreview(input, {
      getMessages,
      preview: ALL_ON,
    });
    assert.notEqual(on.html, built, `${label}: the differences are applied`);
    assert.equal(withoutDifferences(on.html), withoutDifferences(built), label);
    assert.equal(on.title, off.title);
    await assertInteractiveParity(
      label,
      built,
      renderContentPreview(input, {
        getMessages,
        preview: { interactive: INTERACTIVE, colorMode: 'dark' },
      }).html,
    );
    // Each applied difference is exactly what was asked for.
    assert.ok(!/<script\b/.test(on.html), `${label}: no script`);
    assert.ok(
      !/<link rel="stylesheet"/.test(on.html),
      `${label}: no sheet link`,
    );
    assert.ok(
      !/<a\b[^>]*\shref=/.test(on.html) &&
        !/<a\b(?![^>]*tabindex="-1")/.test(on.html),
      `${label}: anchors inert`,
    );
    assert.ok(
      on.html.includes(
        `<meta http-equiv="Content-Security-Policy" content="${CSP.replace(/'/g, '&#39;')}">`,
      ),
    );
    assert.match(on.html, / data-gala-resolved-color-mode="dark"/);
    const styles = previewStyles(on.html);
    assert.equal(styles[0].css, BASE_LAYER_CSS, `${label}: base layer`);
    if (site.themeJson) {
      assert.deepEqual(
        styles.slice(1, -1).map((style) => style.role),
        site.themeJson.stylesheets,
      );
      for (const style of styles.slice(1, -1)) {
        assert.equal(
          style.css,
          await readFile(path.join(THEME, style.role), 'utf8'),
        );
      }
      const palette = (
        await readdir(
          path.join(site.outputDirectory, site.buildInput.basePath, 'assets'),
        )
      ).find((entry) => /^gala-palette-[0-9a-f]{12}\.css$/.test(entry));
      assert.ok(palette, `${label}: the build wrote a palette sheet`);
      assert.equal(
        styles.at(-1)?.css,
        await site.read(
          path.join(
            site.buildInput.basePath,
            'assets',
            /** @type {string} */ (palette),
          ),
        ),
        `${label}: palette sheet byte-identical to the built one`,
      );
    } else {
      assert.equal(styles.length, 1);
    }
    slugs.push(record.frontmatter.slug);

    if (slugs.length === 1) {
      // Each difference alone removes only itself.
      for (const [key, value] of Object.entries(ALL_ON)) {
        const one = renderContentPreview(input, {
          getMessages,
          preview: { [key]: value },
        });
        assert.equal(
          withoutDifferences(one.html),
          withoutDifferences(built),
          `${label}: ${key} alone`,
        );
      }
      // The normalizer is strict: a one-character change survives it.
      assert.notEqual(
        withoutDifferences(on.html.replace('<h1', '<h1 data-x="1"')),
        withoutDifferences(built),
      );
    }
  }
  // The article-only name stays an alias.
  assert.equal(renderArticlePreview, renderContentPreview);
  await assertHomeParity(name, site, media);
  await assertSystemPages(name, site, media, markdownOf);
  return slugs;
}

/**
 * @param {string} name the fixture
 * @param {Parameters<typeof build>[0]} options how to build it
 * @param {Parameters<typeof assertParity>[2]} [expect] expectations
 * @param {(site: any) => void} [mark] adjusts the built fixture
 * @returns {void}
 */
function fixture(name, options, expect, mark) {
  test(`parity: ${name}`, async () => {
    const site = await build(options);
    try {
      mark?.(site);
      const slugs = await assertParity(name, site, expect);
      console.log(`  ${name}: ${slugs.join(', ')}`);
    } finally {
      await site.cleanup();
    }
  });
}

/**
 * @param {string} markdown a policy's authored Markdown
 * @param {string} sourcePath where it stands in the repository
 * @returns {any} the normalized body (render policy set by `build`)
 */
const authoredBody = (markdown, sourcePath) => ({
  sourcePath,
  sourceDigest: sha256Of(Buffer.from(markdown, 'utf8')),
  bodyMediaType: 'text/html',
  body: normalizeAuthoredMarkdown(markdown).html,
  bodyDigest: `sha256:${'0'.repeat(64)}`,
  renderPolicy: { name: 'x', version: '0', digest: `sha256:${'0'.repeat(64)}` },
});

/**
 * @param {any} input a build input
 * @param {string} slug a slug
 * @returns {any} the record
 */
const recordOf = (input, slug) =>
  input.content.find((/** @type {any} */ r) => r.frontmatter.slug === slug);

fixture(
  'rich fixture (articles, series, tags, two authors)',
  {},
  { minimumPosts: 3 },
);

const AUTHORED = {
  terms:
    '# Reader Terms\n\nBe kind & careful with every <comment>.\n\n## Contact\n\nWrite to the editor.\n',
  privacy: 'We keep **no** reader accounts.\n\n- Logs\n- Nothing else\n',
};

fixture(
  'authored Terms and Privacy (previewed from Markdown), analytics off',
  {
    async prepare(input) {
      input.policies = {
        terms: {
          title: 'Reader Terms',
          body: authoredBody(AUTHORED.terms, 'gala/policies/terms.md'),
        },
        privacy: {
          title: 'Data Notice',
          body: authoredBody(AUTHORED.privacy, 'gala/policies/privacy.md'),
        },
      };
    },
  },
  { markdownOf: AUTHORED },
);

fixture('base URL with a path', {
  async prepare(input) {
    input.baseUrl = 'https://example.github.io/g9/';
    input.basePath = '/';
    for (const record of input.content) {
      record.frontmatter.route = `/${record.frontmatter.slug}`;
    }
  },
});

fixture('editions beside an article', {
  async prepare(input) {
    const article = recordOf(input, 'first-article');
    input.content.push(
      editionRecord(article, 'STANDARD'),
      editionRecord(article, 'QUICK_READ'),
    );
    for (const record of input.content) {
      record.resolvedAuthorIds = record.frontmatter.authorIds;
    }
  },
});

fixture('interactions with public counts', {
  async prepare(input) {
    input.modules = {
      interactions: {
        config: {
          schemaId: 'urn:gala:schema:interactions-config:2.0.0',
          schemaVersion: '2.0.0',
          reactions: { enabled: true, definitions: [] },
          comments: { enabled: true, allowReplies: true, maxDepth: 3 },
          publicCounts: { reactions: true, comments: true },
          follows: { enabled: true },
        },
        apiOrigin: 'https://api.galascribe.com',
        appOrigin: 'https://app.galascribe.com',
      },
    };
  },
});

fixture('contact form with an authored intro, newsletter and follows', {
  async prepare(input) {
    input.content = input.content.filter(
      (/** @type {any} */ r) => r.frontmatter.slug !== 'contact',
    );
    input.publication.contactForm = {
      enabled: true,
      fields: { website: true, phone: true },
      intro: authoredBody(
        'Write to **us** any time.',
        'gala/theme-pages/contact.md',
      ),
    };
    input.publication.newsletter = {
      mode: 'galascribe',
      title: 'The Weekly',
      text: 'One email a week.',
      emailContent: 'card',
      replyToOwner: false,
    };
    input.modules = {
      interactions: {
        config: {
          schemaId: 'urn:gala:schema:interactions-config:2.0.0',
          schemaVersion: '2.0.0',
          reactions: { enabled: true, definitions: [] },
          comments: { enabled: true, allowReplies: true, maxDepth: 3 },
          publicCounts: { reactions: true, comments: true },
          follows: { enabled: true },
        },
        apiOrigin: 'https://api.galascribe.com',
        appOrigin: 'https://app.galascribe.com',
      },
    };
  },
});

fixture('contact form with the default intro', {
  async prepare(input) {
    input.content = input.content.filter(
      (/** @type {any} */ r) => r.frontmatter.slug !== 'contact',
    );
    input.publication.contactForm = {
      enabled: true,
      fields: { website: false, phone: false },
    };
  },
});

fixture('analytics: consent banner and script', {
  async prepare(input) {
    input.modules = {
      analytics: {
        config: {
          schemaId: 'urn:gala:schema:analytics-config:2.0.0',
          schemaVersion: '2.0.0',
          provider: {
            kind: 'google-analytics-4',
            measurementId: 'G-ABC123XYZ',
          },
          consent: { policy: 'opt-in' },
        },
      },
    };
  },
});

fixture('language variants (bilingual pair and a standalone Tamil article)', {
  async prepare(input) {
    const first = recordOf(input, 'first-article');
    const clone = (
      /** @type {number} */ n,
      /** @type {any} */ front,
      /** @type {string} */ body,
    ) => {
      const record = JSON.parse(JSON.stringify(first));
      record.frontmatter = {
        ...record.frontmatter,
        id: `019c0000-0000-7000-8000-${String(n).padStart(12, '0')}`,
        series: undefined,
        seriesOrder: undefined,
        route: undefined,
        hero: undefined,
        socialImage: undefined,
        redirects: [],
        ...front,
      };
      record.body = body;
      delete record.media;
      return record;
    };
    input.content.push(
      clone(
        601,
        {
          title: 'முதல் கட்டுரை',
          slug: 'first-article-ta',
          language: 'ta',
          translationOf: 'first-article',
          tags: ['alpha'],
          publishedAt: '2025-01-11T09:00:00.000Z',
          createdAt: '2025-01-11T09:00:00.000Z',
        },
        '<p>தமிழ் உள்ளடக்கம்</p>',
      ),
      clone(
        602,
        {
          title: 'தனி கட்டுரை',
          slug: 'solo-ta',
          language: 'ta',
          tags: [],
          publishedAt: '2025-03-01T09:00:00.000Z',
          createdAt: '2025-03-01T09:00:00.000Z',
        },
        '<p>தனிக் கட்டுரை</p>',
      ),
    );
    for (const record of input.content) {
      record.resolvedAuthorIds = record.frontmatter.authorIds;
    }
  },
});

fixture('listen: audio on three articles', {
  async prepare(input, sourceDirectory) {
    input.publication.listen = { enabled: true };
    const files = [
      ['first-article', 'assets/listen/first.mp3', 'a', 424],
      ['second-article', 'assets/listen/second.mp3', 'b', 600],
    ];
    for (const [slug, file, seed, durationSeconds] of files) {
      const bytes = Buffer.concat([
        Buffer.from('ID3'),
        Buffer.alloc(1497, String(seed).charCodeAt(0)),
      ]);
      const absolute = path.join(sourceDirectory, String(file));
      await mkdir(path.dirname(absolute), { recursive: true });
      await writeFile(absolute, bytes);
      recordOf(input, String(slug)).frontmatter.listen = {
        audio: {
          sourcePath: file,
          mediaType: 'audio/mpeg',
          bytes: bytes.byteLength,
          sha256: sha256Of(bytes),
        },
        durationSeconds,
        format: 'narration',
      };
    }
  },
});

fixture('media: body image, hero, avatar, brand mark, default image', {
  async prepare(input, sourceDirectory) {
    const png = buildTestPng(1400, 700);
    const small = buildTestPng(64, 64);
    for (const [file, bytes] of [
      ['images/body.png', png],
      ['images/avatar.png', small],
      ['images/mark.png', small],
      ['images/cover.png', png],
    ]) {
      const absolute = path.join(sourceDirectory, String(file));
      await mkdir(path.dirname(absolute), { recursive: true });
      await writeFile(absolute, /** @type {Buffer} */ (bytes));
    }
    const ref = (/** @type {string} */ file, /** @type {Buffer} */ bytes) => ({
      path: file,
      sourceDigest: sha256Of(bytes),
    });
    const first = recordOf(input, 'first-article');
    first.body = normalizeAuthoredMarkdown(
      'Intro.\n\n![A wide picture](images/body.png)\n\nOutro.',
    ).html;
    first.media = [
      {
        ...ref('images/body.png', png),
        mediaType: 'image/png',
        byteLength: png.byteLength,
      },
    ];
    recordOf(input, 'second-article').frontmatter.hero = {
      file: ref('images/cover.png', png),
      alt: 'Cover',
      role: 'informative',
    };
    input.authors[0].avatar = ref('images/avatar.png', small);
    input.appearance.brandMark = ref('images/mark.png', small);
    input.publication.defaultImage = ref('images/cover.png', png);
  },
});

fixture(
  'theme and the default palette',
  { theme: true },
  { minimumPosts: 3 },
  (site) => {
    site.theme = true;
  },
);

for (const id of ['midnight']) {
  fixture(
    `theme with the ${id} palette picks`,
    {
      theme: true,
      async prepare(input) {
        const vector = PALETTE_VECTORS.cases.find(
          (/** @type {{id: string}} */ c) => c.id === id,
        );
        assert.ok(vector, `golden vector ${id}`);
        input.appearance.tokens = vector.tokens;
      },
    },
    undefined,
    (site) => {
      site.theme = true;
    },
  );
}

test('parity: home page 1 only, with more posts than the page size', async () => {
  const site = await build({
    async prepare(input) {
      input.publication.listing = { pageSize: 2 };
      const first = recordOf(input, 'first-article');
      for (let n = 0; n < 8; n += 1) {
        const record = JSON.parse(JSON.stringify(first));
        record.frontmatter = {
          ...record.frontmatter,
          id: `019c0000-0000-7000-8000-${String(700 + n).padStart(12, '0')}`,
          title: `Extra article ${n}`,
          slug: `extra-${n}`,
          series: undefined,
          seriesOrder: undefined,
          route: undefined,
          hero: undefined,
          socialImage: undefined,
          redirects: [],
          publishedAt: `2024-0${n + 1}-01T09:00:00.000Z`,
          createdAt: `2024-0${n + 1}-01T09:00:00.000Z`,
        };
        delete record.media;
        record.resolvedAuthorIds = record.frontmatter.authorIds;
        input.content.push(record);
      }
    },
  });
  try {
    const built = await assertHomeParity('pagination', site, {});
    // Page 2 exists in the build, and the home preview is page 1 alone.
    const second = await site.read(
      projectRouteToFilePath(
        joinBasePathAndRoute(site.buildInput.basePath, '/page/2'),
        'directory-index',
      ),
    );
    assert.ok(second.length > 0);
    assert.match(built, /\/page\/2\//, 'page 1 links page 2');
    const shown = built.replace(/<script\b[\s\S]*?<\/script>/g, '');
    assert.ok(!shown.includes('Extra article 0'), 'the oldest post is later');
    assert.ok(second.includes('Extra article'), 'page 2 lists older posts');
  } finally {
    await site.cleanup();
  }
});

test('parity: every route kind the preview renders is covered', () => {
  const kinds = [...COVERED].map((entry) => entry.split('\t')[0]);
  for (const required of [
    'article',
    'page',
    'edition',
    'home',
    'profile',
    'terms defaults',
    'privacy defaults',
    'terms authored',
    'privacy authored',
    'section home ta',
    'contact',
  ]) {
    assert.ok(kinds.includes(required), `${required} is covered`);
  }
  console.log(
    `  route kinds covered: ${[...new Set(kinds)].sort().join(', ')}`,
  );
});
