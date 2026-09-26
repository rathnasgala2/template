/**
 * The one module in this repository permitted to import `@11ty/eleventy`.
 * Every other module reaches rendered output only through
 * {@link renderPagesWithEleventy}'s plain-data return value: no Eleventy
 * instance, plug-in API, config object or Nunjucks environment crosses back
 * out of this module: no Eleventy object, plug-in API, config object or
 * Nunjucks environment may cross the adapter boundary in either direction.
 *
 * Confinement enforced here:
 * - `configPath: false` on the `Eleventy` constructor disables discovery of
 *   any `.eleventy.js`/`eleventy.config.*` file entirely (`TemplateConfig`
 *   treats an explicit falsy `configPath` as "skip config files" rather
 *   than searching `process.cwd()`), so nothing from an author repository
 *   or an ambient host directory is ever read as configuration.
 * - The only filesystem paths this module touches are the caller-supplied
 *   `inputDirectory` and `outputDirectory`, both required to be absolute
 *   paths under the caller's declared work/output roots.
 * - `eleventyConfig.setUseGitIgnore(false)` stops Eleventy from walking
 *   parent directories looking for a `.gitignore` to exclude files by.
 * - Every page is supplied as an in-memory virtual template
 *   (`eleventyConfig.addTemplate`) with `templateEngineOverride: false`, so
 *   author-authority body content is written verbatim and is never
 *   interpreted as Nunjucks/Liquid template syntax.
 * - `elev.write()` runs exactly one full build; this module never calls
 *   `.watch()` or constructs an incremental build, and never sets
 *   `runMode: "watch"`: incremental and watch mode cannot produce a
 *   releasable artifact.
 * - No plugin that performs network access is registered, and Eleventy's
 *   own default plugins (`HtmlBasePlugin`, `BundlePlugin`) perform no
 *   network access.
 */

import Eleventy from '@11ty/eleventy';

import {
  APPEARANCE_RESOLVED_MODE_ATTRIBUTE,
  APPEARANCE_ROOT_ATTRIBUTE,
  APPEARANCE_SERVER_DEFAULT_RESOLVED_MODE,
  COLOR_SCHEME_META_CONTENT,
} from './appearance/contract.js';
import { contentSecurityPolicyMetaTag } from './content-security.js';
import { PAGE_KIND_ATTRIBUTE } from './page-kinds.js';

/**
 * @typedef {object} EleventyPage
 * @property {string} virtualPath a unique virtual input path (arbitrary,
 *   never read from any real filesystem location)
 * @property {string} content the exact output bytes for this page (raw
 *   HTML, or a fragment inserted into `layout` when one is supplied)
 * @property {string} permalink the output-directory-relative file path,
 *   already normalized (no leading slash)
 * @property {string} [layout] a layout file name relative to the layouts
 *   directory this module writes; omitted pages are written byte-for-byte
 *   with no wrapping
 * @property {Record<string, unknown>} [data] extra front-matter data made
 *   available to the layout (e.g. `title`, `lang`)
 */

/**
 * The one skeleton layout this repository ships. It is core-owned static
 * markup, not discovered from or influenced by the author repository.
 * `{{ content | safe }}` is the page's *complete* body content (skip link,
 * header, primary navigation, main, footer — see `internal/skeleton.js`'s
 * `renderPageBody`), so this layout only supplies the outer document shell,
 * the per-page `lang`/`dir` attributes, the CSP baseline, the
 * appearance-controller wiring and the SEO/localization `<head>` metadata
 * below; it does not itself wrap anything in `<main>`.
 *
 * On top of that minimal layout is the byte-exact per-artifact CSP
 * `<meta>` baseline: this renderer materializes no module package,
 * configuration, output or runtime, so the same constant tag is correct on
 * every route.
 *
 * Appearance-controller additions, all fixed literals from
 * `internal/appearance/contract.js` (never re-typed here), each
 * byte-identical on every route exactly like the CSP tag above:
 *
 * - the `data-gala-publication-root` presence attribute on `<html>`, always
 *   rendered independent of JavaScript, so a theme's own no-JS
 *   `prefers-color-scheme` fallback CSS has a stable root scope to key off;
 * - (TPL-C1 fix) `data-gala-resolved-color-mode`, server-rendered as
 *   {@link APPEARANCE_SERVER_DEFAULT_RESOLVED_MODE} (`"light"`) on the same
 *   `<html>` element, so `RESOLVED_PALETTE_SELECTORS.light` already matches
 *   before any script runs and a page is never unstyled UA-default HTML for
 *   a no-JS reader, a text-mode/archival crawler, or a load where the
 *   blocking bootstrap `<script src>` fails. The bootstrap script's phase 1
 *   ({@link ../appearance/bootstrap-script.js}) unconditionally overwrites
 *   this attribute with the resolved value for the reader's actual stored
 *   selection/system preference the instant it runs, so a scripted reader's
 *   experience is unchanged;
 * - `<meta name="color-scheme" content="light dark">`, so user-agent styling
 *   (form controls, scrollbars) and the initial paint already follow
 *   `prefers-color-scheme` before any script runs;
 * - the one `<script src>` this renderer ever emits (the appearance
 *   controller is the only browser bootstrap it ever ships): a plain,
 *   same-origin, non-`defer`/non-`async`/non-`module` classic script, placed
 *   after the CSP `<meta>` so it is governed by the policy it declares.
 *   Being a blocking `<script src>` in `<head>`, it always finishes running
 *   — synchronously resolving and applying the appearance state — before
 *   `<body>` (and so any themed paint) is even parsed, satisfying the
 *   pre-paint requirement with no visibility-hiding trick of any kind (see
 *   `internal/appearance/bootstrap-script.js`'s own module documentation).
 *   Its `href` is supplied per-page as `data.appearanceScriptHref`, already
 *   `basePath`-joined by the caller
 *   (`internal/appearance/contract.js`'s `appearanceBootstrapScriptHref`),
 *   never a literal embedded in this fixed layout source.
 *
 * Every other `<head>` element is added on top of that: a viewport meta, an
 * optional plain-text description, an optional `robots` directive
 * (`internal/page-kinds.js`'s per-page-kind `robotsContent`), an optional
 * canonical link, Open Graph and Twitter Card meta tags and the Atom/RSS
 * feed discovery links (present on every page, unconditionally — the feeds
 * themselves are site-wide, not per-page). The theme stylesheet `<link>`
 * elements (`internal/theme-assets.js`, in `cssLayers` order, including the
 * print stylesheet hookup) are added as one already-rendered
 * `data.themeStylesheetLinksHtml` fragment, along with the
 * `data-gala-page-kind` attribute on `<body>`
 * (`internal/page-kinds.js`'s `PAGE_KIND_ATTRIBUTE`). Every interpolated
 * `{{ variable }}`
 * below relies on Nunjucks' own default `autoescape: true` (verified: no
 * `nunjucksEnvironmentOptions.autoescape` override exists anywhere in this
 * repository or in `@11ty/eleventy`'s own source, so Nunjucks' own
 * documented default stands) for HTML-entity escaping — the same implicit
 * contract `{{ title }}` already relied on; only `{{ content | safe }}` is
 * deliberately exempted, because that value is already sanitized HTML
 * markup, not plain text.
 *
 * @type {string}
 */
const SKELETON_LAYOUT_SOURCE = [
  '<!doctype html>',
  `<html lang="{{ lang }}" dir="{{ dir }}" ${APPEARANCE_ROOT_ATTRIBUTE} ${APPEARANCE_RESOLVED_MODE_ATTRIBUTE}="${APPEARANCE_SERVER_DEFAULT_RESOLVED_MODE}">`,
  '<head>',
  '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1">',
  contentSecurityPolicyMetaTag(),
  `<meta name="color-scheme" content="${COLOR_SCHEME_META_CONTENT}">`,
  '<script src="{{ appearanceScriptHref }}"></script>',
  '<title>{{ title }}</title>',
  '{% if description %}<meta name="description" content="{{ description }}">{% endif %}',
  '{% if robotsContent %}<meta name="robots" content="{{ robotsContent }}">{% endif %}',
  '{% if canonicalUrl %}<link rel="canonical" href="{{ canonicalUrl }}">{% endif %}',
  '<meta property="og:site_name" content="{{ siteName }}">',
  '{% if canonicalUrl %}<meta property="og:url" content="{{ canonicalUrl }}">{% endif %}',
  '<meta property="og:type" content="{{ ogType }}">',
  '<meta property="og:title" content="{{ title }}">',
  '{% if description %}<meta property="og:description" content="{{ description }}">{% endif %}',
  '{% if ogImage %}<meta property="og:image" content="{{ ogImage }}">{% endif %}',
  '<meta name="twitter:card" content="{{ twitterCard }}">',
  '<meta name="twitter:title" content="{{ title }}">',
  '{% if description %}<meta name="twitter:description" content="{{ description }}">{% endif %}',
  '{% if ogImage %}<meta name="twitter:image" content="{{ ogImage }}">{% endif %}',
  '<link rel="alternate" type="application/atom+xml" href="{{ atomFeedUrl }}" title="{{ siteName }}">',
  '<link rel="alternate" type="application/rss+xml" href="{{ rssFeedUrl }}" title="{{ siteName }}">',
  // TPL-H3/TPL-M7: the template-owned gala-base layer's own `<link>`,
  // always first among the stylesheets — before any theme `<link>` — so its
  // own first-line `@layer` order statement (`internal/appearance/
  // base-layer.js`) is the one every browser sees first, and so a theme's
  // later-loaded gala-tokens/gala-components/gala-utilities layers can
  // always override its defaults.
  '<link rel="stylesheet" href="{{ baseStylesheetHref }}">',
  '{{ themeStylesheetLinksHtml | safe }}',
  '</head>',
  `<body ${PAGE_KIND_ATTRIBUTE}="{{ pageKind }}">`,
  '{{ content | safe }}',
  '</body>',
  '</html>',
  '',
].join('\n');

const LAYOUT_FILE_NAME = 'skeleton.njk';

/**
 * Render every supplied page through a fully confined, single-pass,
 * programmatic Eleventy 3.1.6 build.
 *
 * @param {object} options render options
 * @param {readonly EleventyPage[]} options.pages pages to emit, already
 *   carrying their final output-relative permalink
 * @param {string} options.inputDirectory an absolute, empty-or-caller-owned
 *   directory Eleventy may treat as its input root (only
 *   `${inputDirectory}/_includes/skeleton.njk` is written into it)
 * @param {string} options.outputDirectory an absolute directory Eleventy
 *   writes the candidate publication into
 * @returns {Promise<void>} resolves once the single build pass completes
 */
export async function renderPagesWithEleventy({
  pages,
  inputDirectory,
  outputDirectory,
}) {
  const { mkdir, writeFile } = await import('node:fs/promises');
  const path = await import('node:path');

  const includesDirectory = path.join(inputDirectory, '_includes');
  await mkdir(includesDirectory, { recursive: true });
  await writeFile(
    path.join(includesDirectory, LAYOUT_FILE_NAME),
    SKELETON_LAYOUT_SOURCE,
    'utf8',
  );

  const eleventy = new Eleventy(inputDirectory, outputDirectory, {
    source: 'script',
    runMode: 'build',
    dryRun: false,
    quietMode: true,
    // Explicit falsy configPath: skip .eleventy.js/eleventy.config.*
    // discovery entirely rather than searching process.cwd().
    configPath: false,
    config(eleventyConfig) {
      eleventyConfig.setUseGitIgnore(false);
      eleventyConfig.setLayoutsDirectory('_includes');
      eleventyConfig.setQuietMode(true);
      eleventyConfig.setDataDeepMerge(false);

      for (const page of pages) {
        eleventyConfig.addTemplate(page.virtualPath, page.content, {
          permalink: page.permalink,
          layout: page.layout,
          templateEngineOverride: false,
          ...page.data,
        });
      }
    },
  });

  // Eleventy's "Wrote N files" summary is logged with `force: true`
  // regardless of quiet mode (its own `logFinished()` caller intentionally
  // bypasses verbosity). `disableLogger()` is Eleventy's own documented
  // escape hatch for that: it marks the console logger disabled so this
  // library call produces no stdout/stderr output of its own; the caller
  // decides what, if anything, to report.
  eleventy.disableLogger();

  await eleventy.write();
}
