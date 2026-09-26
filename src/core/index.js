/**
 * `@rathnasgala2/template` public entry point.
 *
 * This is S2-T03's Eleventy-confined renderer adapter, extended by S2-T05's
 * media pipeline: it consumes one validated
 * `urn:gala:schema:build-input:2.0.0` instance and emits a candidate output
 * directory plus one `urn:gala:schema:artifact-manifest:2.0.0` instance
 * (brief S2 section 3).
 *
 * `renderPublication` is the only documented *rendering* entry point. It
 * fails closed: an invalid `build-input` is rejected with
 * {@link BuildInputValidationError} before anything is written, malformed
 * adapter options are rejected with {@link RenderOptionsError} before
 * Eleventy ever runs, and a rejected image or font is rejected with
 * {@link MediaPipelineError} before the manifest is assembled.
 *
 * `normalizeAuthoredMarkdown` (re-exported here from S2-T04's
 * `internal/content-security.js`) is this package's second public entry
 * point: the upstream normalization step a `build-input:2.0.0` producer
 * (`publish-kernel`/`publish-action`) calls once per authored Markdown
 * source to produce the exact `renderableBody.body`/`bodyDigest` pair this
 * renderer expects to receive. `renderPublication` never calls it itself —
 * see `internal/content-security.js`'s module documentation for why a
 * `renderableBody.body` is already policy-conformant HTML by the time it
 * reaches this renderer, and how `renderPublication` verifies that instead
 * of re-deriving it.
 *
 * S2-T05 adds `options.sourceDirectory` (the caller-mounted, read-only
 * repository source tree `build-input`'s `resolvedFile` references point
 * into) and runs `processMedia` after the Eleventy route listing is already
 * computed, so generated derivative files under `assets/media/` are never
 * mistaken for an HTML route.
 *
 * Output-security (markdown/sanitizer/highlighter/CSP; S2-T04) and the media
 * pipeline (S2-T05) are layered on the same adapter. S2-T06 adds the core
 * semantic skeleton and navigation renderer (`internal/skeleton.js`) and
 * every generated page kind (`internal/page-kinds.js`): publication profile,
 * author, article/page, index, tag, series and archive pages, each composed
 * with one shared header/primary-navigation/footer chrome and, where the
 * brief requires it, a breadcrumb trail. Feeds/search/sitemap remain
 * S2-T08. This adapter also emits every authored static redirect, shaped so
 * that later task extends the page-body pipeline without touching the
 * confinement, route-projection or manifest-assembly mechanics here.
 *
 * S2-T07 adds the Light/Dark/System appearance controller
 * (`internal/appearance/`): the server-rendered control in the header's
 * `header-actions` slot (`controller-markup.js`), the one deterministic
 * pre-paint bootstrap script this renderer ever emits, written into the
 * candidate output directory and entered into the manifest as an ordinary
 * `manifestAsset` row exactly like an S2-T05 media derivative
 * (`bootstrap-script.js`), and the fixed `data-` attribute names, mode
 * values and storage key every one of those pieces shares
 * (`contract.js`) — the contract S2-T12's published theme styling catalog
 * targets.
 *
 * `src/core/` is the only admitted source root in this repository. No
 * `src/modules/` tree, module import edge, registration stub, module
 * configuration, module output or module runtime is ever added beside it
 * (brief S2 section 3; DEC-097 sections 2 and 5).
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { validateGalaDocument } from '@rathnasgala2/schemas';

import {
  APPEARANCE_BOOTSTRAP_SCRIPT_MEDIA_TYPE,
  APPEARANCE_BOOTSTRAP_SCRIPT_PATH,
  appearanceBootstrapScriptHref,
} from './internal/appearance/contract.js';
import { APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE } from './internal/appearance/bootstrap-script.js';
import {
  GALA_BASE_STYLESHEET_MEDIA_TYPE,
  GALA_BASE_STYLESHEET_PATH,
  GALA_BASE_STYLESHEET_SOURCE,
} from './internal/appearance/base-layer.js';
import { renderAppearanceControl } from './internal/appearance/controller-markup.js';
import {
  ArtifactManifestValidationError,
  BuildInputValidationError,
  RenderOptionsError,
  RenderPolicyViolationError,
} from './errors.js';
import { digestBytes } from './internal/canonical-jcs.js';
import {
  assertPolicyConformantHtml,
  assertRenderPolicyIdentity,
  computeRenderPolicyIdentity,
} from './internal/content-security.js';
import { renderPagesWithEleventy } from './internal/eleventy-render.js';
import {
  ATOM_FEED_ROUTE,
  RSS_FEED_ROUTE,
  buildFeeds,
} from './internal/feeds.js';
import { listFilesSortedByUtf8Bytes } from './internal/fs-walk.js';
import { getMessages } from './internal/messages.js';
import { processMedia } from './internal/media/pipeline.js';
import {
  buildGeneratedPages,
  contentRoute,
  renderErrorPageBody,
} from './internal/page-kinds.js';
import { assertProvenance } from './internal/provenance.js';
import {
  errorDocumentPath,
  joinBasePathAndRoute,
  projectFixedAssetPath,
  projectRouteToFilePath,
  renderRedirectDocument,
} from './internal/route.js';
import { buildSearchIndex } from './internal/search-index.js';
import { resolveSocialImageUrl, twitterCardType } from './internal/seo.js';
import { buildSitemap } from './internal/sitemap.js';
import {
  defaultThemeStylesheetLinksHtml,
  loadThemeAssets,
} from './internal/theme-assets.js';
import { resolveTextDirection } from './internal/text-direction.js';
import {
  renderFooter,
  renderFooterNavigation,
  renderHeader,
  renderPageBody,
  renderPrimaryNavigation,
} from './internal/skeleton.js';
import {
  collectIncludedSources,
  compareUtf8Bytes,
} from './internal/source-inventory.js';
import { generateUuidV7 } from './internal/uuid.js';
import { buildArtifactManifest } from './manifest.js';

/** @type {string} the un-joined route `sitemap.xml` is published at. */
const SITEMAP_ROUTE = '/sitemap.xml';
/** @type {string} the un-joined route the static search index is published
 * at. */
const SEARCH_INDEX_ROUTE = '/search-index.json';

/** @type {string} */
const BUILD_INPUT_SCHEMA_ID = 'urn:gala:schema:build-input:2.0.0';
/** @type {string} */
const ARTIFACT_MANIFEST_SCHEMA_ID = 'urn:gala:schema:artifact-manifest:2.0.0';

/**
 * The published npm package name for this renderer.
 *
 * @type {string}
 */
export const TEMPLATE_PACKAGE_NAME = '@rathnasgala2/template';

/**
 * The renderer's published major.minor.patch version, kept in sync with
 * `package.json` by the packaging test in `test/pinned-versions.test.js`.
 *
 * @type {string}
 */
export const TEMPLATE_PACKAGE_VERSION = '2.0.0';

/**
 * Validate the caller-supplied render options, independent of build-input
 * validity. Directories must be supplied as absolute paths and must be
 * distinct, so this renderer never has to guess where "outside the
 * declared input/output/work directories" begins.
 *
 * @param {import('../../types/index.d.ts').RenderOptions} options caller
 *   options
 * @returns {void}
 */
function assertOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new RenderOptionsError('render options are required');
  }
  for (const key of /** @type {const} */ ([
    'outputDirectory',
    'workDirectory',
    'sourceDirectory',
  ])) {
    const value = options[key];
    if (typeof value !== 'string' || value.length === 0) {
      throw new RenderOptionsError(`options.${key} must be a non-empty string`);
    }
    if (!path.isAbsolute(value)) {
      throw new RenderOptionsError(`options.${key} must be an absolute path`);
    }
  }
  // S2-T12: an optional caller-mounted, read-only extracted theme package
  // directory (`internal/theme-assets.js`). Absent entirely by default
  // (every pre-S2-T12 caller, including this repository's own test suite)
  // so this addition is purely additive.
  if (options.themeDirectory !== undefined) {
    if (
      typeof options.themeDirectory !== 'string' ||
      options.themeDirectory.length === 0 ||
      !path.isAbsolute(options.themeDirectory)
    ) {
      throw new RenderOptionsError(
        'options.themeDirectory, when supplied, must be a non-empty absolute path',
      );
    }
  }
  const resolvedDirectories = [
    path.resolve(options.outputDirectory),
    path.resolve(options.workDirectory),
    path.resolve(options.sourceDirectory),
    ...(options.themeDirectory ? [path.resolve(options.themeDirectory)] : []),
  ];
  if (new Set(resolvedDirectories).size !== resolvedDirectories.length) {
    throw new RenderOptionsError(
      'options.outputDirectory, options.workDirectory, options.sourceDirectory ' +
        'and (when supplied) options.themeDirectory must all be distinct',
    );
  }
  if (
    options.routeNormalizationProfile !== undefined &&
    options.routeNormalizationProfile !== 'directory-index' &&
    options.routeNormalizationProfile !== 'explicit-file'
  ) {
    throw new RenderOptionsError(
      "options.routeNormalizationProfile must be 'directory-index' or 'explicit-file'",
    );
  }
  // Checked in full here, before any directory is created or Eleventy ever
  // runs, so an incomplete provenance bundle fails closed exactly like an
  // invalid build-input does: nothing is written.
  assertProvenance(options.provenance);
}

/**
 * Verify every `renderableBody.renderPolicy` in the publication profile,
 * footer card and every content record byte-equals the currently published
 * render-policy identity, and that no module or placement value leaked
 * through (belt-and-suspenders on top of the `build-input:2.0.0` schema's
 * own `modules: {}` / `placements: []` closure). Fails closed before any
 * directory is created or Eleventy ever runs (DEC-097 section 5: "An absent
 * policy file, wrong path/name/version/digest, mixed identity between
 * records or body produced under a different policy rejects before build").
 *
 * @param {import('../../types/index.d.ts').NormalizedBuildInput} validatedInput
 *   the schema-validated build input
 * @returns {Promise<void>} resolves once every reference is verified
 */
async function assertRenderPolicyCompliance(validatedInput) {
  if (
    Object.keys(validatedInput.modules).length !== 0 ||
    validatedInput.placements.length !== 0
  ) {
    throw new RenderPolicyViolationError(
      'build-input.modules and build-input.placements must both be empty in S2',
    );
  }

  const identity = await computeRenderPolicyIdentity();

  if (validatedInput.publication.profile) {
    const { body } = validatedInput.publication.profile;
    assertRenderPolicyIdentity(
      body.renderPolicy,
      identity,
      'publication.profile.body',
    );
    assertPolicyConformantHtml(
      body.body,
      body.bodyDigest,
      'publication.profile.body',
    );
  }
  if (validatedInput.publication.footerCard) {
    const { body } = validatedInput.publication.footerCard;
    assertRenderPolicyIdentity(
      body.renderPolicy,
      identity,
      'publication.footerCard.body',
    );
    assertPolicyConformantHtml(
      body.body,
      body.bodyDigest,
      'publication.footerCard.body',
    );
  }
  for (const record of validatedInput.content) {
    const location = `content[${record.frontmatter.id}]`;
    assertRenderPolicyIdentity(record.renderPolicy, identity, location);
    assertPolicyConformantHtml(record.body, record.bodyDigest, location);
  }
}

/**
 * Render one validated `build-input:2.0.0` instance into a candidate output
 * directory plus a closed `artifact-manifest:2.0.0` instance.
 *
 * @param {unknown} buildInput a candidate `build-input:2.0.0` document
 * @param {import('../../types/index.d.ts').RenderOptions} options adapter
 *   options: output/work directories, route normalization profile and the
 *   provenance facts this renderer cannot derive from `build-input` alone
 * @returns {Promise<{outputDirectory: string, manifest: Record<string, unknown>}>}
 *   the absolute candidate output directory and the assembled manifest
 */
export async function renderPublication(buildInput, options) {
  const inputValidation = validateGalaDocument(
    BUILD_INPUT_SCHEMA_ID,
    buildInput,
  );
  if (!inputValidation.valid) {
    throw new BuildInputValidationError(inputValidation.diagnostics);
  }
  const validatedInput =
    /** @type {import('../../types/index.d.ts').NormalizedBuildInput} */ (
      buildInput
    );

  await assertRenderPolicyCompliance(validatedInput);
  assertOptions(options);
  const routeProfile = options.routeNormalizationProfile ?? 'directory-index';

  const outputDirectory = path.resolve(options.outputDirectory);
  const workDirectory = path.resolve(options.workDirectory);
  await mkdir(outputDirectory, { recursive: true });
  await mkdir(workDirectory, { recursive: true });

  // The site-wide message catalog for core chrome (skip link, navigation,
  // breadcrumb, pagination and footer labels). Every page's own <html lang>
  // attribute still reflects that individual page's own language (see
  // `page.language` below); only the *chrome strings surrounding it* are
  // rendered in one consistent language, matching a reader's expectation
  // that navigation/footer text does not flip language from page to page
  // (task packet S2-T06 scoped decision; see `internal/messages.js`).
  const siteMessages = getMessages(validatedInput.publication.defaultLanguage);
  const homeRoute = joinBasePathAndRoute(validatedInput.basePath, '/');

  const appearanceControlHtml = renderAppearanceControl({
    messages: siteMessages,
  });
  const headerHtml = renderHeader({
    homeRoute,
    publicationName: validatedInput.publication.title,
    logo: undefined,
    appearanceControlHtml,
  });
  const footerNavHtml = renderFooterNavigation({
    items: validatedInput.navigation.footerItems,
    messages: siteMessages,
  });
  const footerCard = validatedInput.publication.footerCard;
  // Already verified render-policy-conformant HTML by
  // assertRenderPolicyCompliance's assertPolicyConformantHtml call above —
  // inserted as-is, never re-parsed as Markdown.
  const footerProfileHtml = footerCard?.enabled ? footerCard.body.body : '';
  const footerHtml = renderFooter({
    publicationName: validatedInput.publication.title,
    footerNavHtml,
    footerProfileHtml,
    copyrightText: undefined,
    messages: siteMessages,
  });

  // Run before page assembly, not after (task packet S2-T08): resolving
  // each page's own `og:image`/`twitter:image` needs the S2-T05 media
  // pipeline's own finished `assets` list (only it knows which derivative
  // file extension a given source image's `sourceDigest` produced — see
  // `internal/seo.js`). This only moves the in-memory computation earlier;
  // `mediaFiles`' actual bytes are still written to `outputDirectory` only
  // after the route listing below (unchanged from S2-T05), so
  // `outputDirectory/assets/media/` still can never be mistaken for an
  // Eleventy-rendered HTML route.
  const { assets: mediaAssets, files: mediaFiles } = await processMedia(
    validatedInput,
    { sourceDirectory: path.resolve(options.sourceDirectory) },
  );

  // S2-T08: the site-wide feeds, resolved once so every page's feed-
  // discovery `<link>` tags and the feed documents themselves agree on the
  // exact same self URLs.
  const feeds = buildFeeds(validatedInput);
  const siteName = validatedInput.publication.title;
  const appearanceScriptHrefValue = appearanceBootstrapScriptHref(
    validatedInput.basePath,
  );
  // TPL-H3/TPL-M7: the template-owned gala-base stylesheet's own basePath-
  // joined href, computed the same way as the appearance script href above
  // so it can never drift from the physical file/manifest path written
  // below.
  const baseStylesheetHrefValue = `/${projectFixedAssetPath(
    validatedInput.basePath,
    `/${GALA_BASE_STYLESHEET_PATH}`,
  )}`;

  // S2-T12: the selected theme package's copied stylesheets/passive assets
  // and the ordered `<link>` markup every generated page's `<head>` inserts.
  // Run before page assembly (same reasoning as the media pipeline above):
  // every page's `data.themeStylesheetLinksHtml` needs the same one
  // already-rendered fragment.
  const themeAssetsResult = options.themeDirectory
    ? await loadThemeAssets({
        themeDirectory: path.resolve(options.themeDirectory),
        basePath: validatedInput.basePath,
      })
    : undefined;
  const themeStylesheetLinksHtml = themeAssetsResult
    ? themeAssetsResult.linkTagsHtml
    : defaultThemeStylesheetLinksHtml(validatedInput.basePath);

  /** @type {{virtualPath: string, content: string, permalink: string, layout?: string, data?: Record<string, unknown>}[]} */
  const contentPages = [];
  /** @type {{joinedSource: string, joinedTarget: string, filePath: string}[]} */
  const redirectProjections = [];

  const generatedPages = buildGeneratedPages(validatedInput);
  generatedPages.forEach((page, index) => {
    const joinedRoute = joinBasePathAndRoute(
      validatedInput.basePath,
      page.route,
    );
    const navHtml = renderPrimaryNavigation({
      items: validatedInput.navigation.items,
      currentRoute: joinedRoute,
      messages: siteMessages,
    });
    const bodyHtml = renderPageBody({
      messages: siteMessages,
      headerHtml,
      navHtml,
      footerHtml,
      breadcrumbHtml: page.breadcrumbHtml,
      mainHtml: page.bodyHtml,
    });
    const ogImage = resolveSocialImageUrl({
      mediaAssets,
      reference: page.socialImageRef,
      baseUrl: validatedInput.baseUrl,
      basePath: validatedInput.basePath,
    });
    contentPages.push({
      virtualPath: `pages/${page.kind}-${index}.html`,
      content: bodyHtml,
      permalink: projectRouteToFilePath(joinedRoute, routeProfile),
      layout: 'skeleton.njk',
      data: {
        title: page.title,
        lang: page.language,
        dir: page.direction,
        pageKind: page.kind,
        description: page.description,
        robotsContent: page.robotsContent,
        canonicalUrl: new URL(joinedRoute, validatedInput.baseUrl).toString(),
        siteName,
        ogType: page.ogType ?? 'website',
        ogImage,
        twitterCard: twitterCardType(Boolean(ogImage)),
        atomFeedUrl: feeds.atomSelfUrl,
        rssFeedUrl: feeds.rssSelfUrl,
        appearanceScriptHref: appearanceScriptHrefValue,
        baseStylesheetHref: baseStylesheetHrefValue,
        themeStylesheetLinksHtml,
      },
    });
  });

  for (const record of validatedInput.content) {
    const joined = joinBasePathAndRoute(
      validatedInput.basePath,
      contentRoute(record.frontmatter),
    );
    for (const sourceRoute of record.frontmatter.redirects ?? []) {
      const joinedSource = joinBasePathAndRoute(
        validatedInput.basePath,
        sourceRoute,
      );
      redirectProjections.push({
        joinedSource,
        joinedTarget: joined,
        filePath: projectRouteToFilePath(joinedSource, routeProfile),
      });
    }
  }

  const redirectPages = redirectProjections.map((projection, index) => ({
    virtualPath: `redirects/${index}.html`,
    content: renderRedirectDocument(projection.joinedTarget),
    permalink: projection.filePath,
  }));

  if (contentPages.length === 0 && redirectPages.length === 0) {
    throw new RenderOptionsError(
      'build input selects no publication profile and no content; there is nothing to render',
    );
  }

  // S2-T08: the one ordinary generated `404.html` error page, using the
  // S2-T06 `error` page kind's own pure body function. Pushed after the
  // guard above so the guard's own "is there anything authored to render"
  // check is unaffected by this always-present synthetic page.
  const errorNavHtml = renderPrimaryNavigation({
    items: validatedInput.navigation.items,
    currentRoute: undefined,
    messages: siteMessages,
  });
  const errorBodyHtml = renderPageBody({
    messages: siteMessages,
    headerHtml,
    navHtml: errorNavHtml,
    footerHtml,
    mainHtml: renderErrorPageBody({ messages: siteMessages, homeRoute }),
  });
  const errorFilePath = errorDocumentPath(validatedInput.basePath);
  contentPages.push({
    virtualPath: 'pages/error-404.html',
    content: errorBodyHtml,
    permalink: errorFilePath,
    layout: 'skeleton.njk',
    data: {
      title: /** @type {string} */ (siteMessages.errorPageHeading),
      lang: validatedInput.publication.defaultLanguage,
      dir: resolveTextDirection(validatedInput.publication.defaultLanguage),
      pageKind: 'error',
      // No `canonicalUrl`/`ogImage`: an error page has no real resource to
      // canonicalize or illustrate.
      robotsContent: 'noindex, follow',
      siteName,
      ogType: 'website',
      twitterCard: twitterCardType(false),
      atomFeedUrl: feeds.atomSelfUrl,
      rssFeedUrl: feeds.rssSelfUrl,
      appearanceScriptHref: appearanceScriptHrefValue,
      baseStylesheetHref: baseStylesheetHrefValue,
      themeStylesheetLinksHtml,
    },
  });

  // S2-T08: feeds, sitemap and the static search index. Each is a fixed,
  // literal-extension file — never route-normalized like an ordinary
  // content route (`internal/route.js#projectFixedAssetPath`) — and each
  // bypasses the shared HTML skeleton layout entirely (no `layout` field,
  // exactly like a generated redirect document above): these are raw
  // XML/JSON bytes, not HTML pages.
  const atomFilePath = projectFixedAssetPath(
    validatedInput.basePath,
    ATOM_FEED_ROUTE,
  );
  const rssFilePath = projectFixedAssetPath(
    validatedInput.basePath,
    RSS_FEED_ROUTE,
  );
  const sitemapFilePath = projectFixedAssetPath(
    validatedInput.basePath,
    SITEMAP_ROUTE,
  );
  const searchIndexFilePath = projectFixedAssetPath(
    validatedInput.basePath,
    SEARCH_INDEX_ROUTE,
  );
  const sitemapXml = buildSitemap({
    generatedPages,
    basePath: validatedInput.basePath,
    baseUrl: validatedInput.baseUrl,
  });
  const searchIndexJson = buildSearchIndex(validatedInput);
  const assetPages = [
    {
      virtualPath: 'feeds/atom.html',
      content: feeds.atomXml,
      permalink: atomFilePath,
    },
    {
      virtualPath: 'feeds/rss.html',
      content: feeds.rssXml,
      permalink: rssFilePath,
    },
    {
      virtualPath: 'sitemap.html',
      content: sitemapXml,
      permalink: sitemapFilePath,
    },
    {
      virtualPath: 'search-index.html',
      content: searchIndexJson,
      permalink: searchIndexFilePath,
    },
  ];

  await renderPagesWithEleventy({
    pages: [...contentPages, ...redirectPages, ...assetPages],
    inputDirectory: path.join(workDirectory, 'input'),
    outputDirectory,
  });

  // S2-T08: the exact `routeClass`/`mediaType` this renderer's own generated
  // non-HTML routes carry, keyed by their fixed output path. Every other
  // route defaults to `'html'`/`text/html; charset=utf-8`, unchanged from
  // S2-T03.
  /** @type {Map<string, {routeClass: import('../../types/index.d.ts').ManifestRouteEntry['routeClass'], mediaType: string}>} */
  const specialRoutes = new Map([
    [
      errorFilePath,
      { routeClass: 'error', mediaType: 'text/html; charset=utf-8' },
    ],
    [
      atomFilePath,
      { routeClass: 'feed', mediaType: 'application/atom+xml; charset=utf-8' },
    ],
    [
      rssFilePath,
      { routeClass: 'feed', mediaType: 'application/rss+xml; charset=utf-8' },
    ],
    [
      sitemapFilePath,
      { routeClass: 'sitemap', mediaType: 'application/xml; charset=utf-8' },
    ],
    [
      searchIndexFilePath,
      { routeClass: 'asset', mediaType: 'application/json; charset=utf-8' },
    ],
  ]);

  const outputFilePaths = await listFilesSortedByUtf8Bytes(outputDirectory);
  /** @type {import('../../types/index.d.ts').ManifestRouteEntry[]} */
  const routes = [];
  for (const filePath of outputFilePaths) {
    const bytes = await readFile(path.join(outputDirectory, filePath));
    const special = specialRoutes.get(filePath);
    routes.push({
      path: filePath,
      mediaType: special?.mediaType ?? 'text/html; charset=utf-8',
      byteLength: String(bytes.byteLength),
      sha256: digestBytes(bytes),
      routeClass: special?.routeClass ?? 'html',
      interactionBearing: false,
    });
  }
  routes.sort((a, b) => compareUtf8Bytes(a.path, b.path));

  const routeByPath = new Map(routes.map((route) => [route.path, route]));
  const redirects = redirectProjections
    .map((projection) => {
      const backingRoute = routeByPath.get(projection.filePath);
      if (!backingRoute) {
        throw new RenderOptionsError(
          `internal: no rendered file at redirect backing path ${projection.filePath}`,
        );
      }
      return /** @type {import('../../types/index.d.ts').ManifestRedirectEntry} */ ({
        sourceRoute: projection.joinedSource,
        targetRoute: projection.joinedTarget,
        status: /** @type {200} */ (200),
        backingPath: projection.filePath,
        sha256: backingRoute.sha256,
      });
    })
    .sort((a, b) => compareUtf8Bytes(a.sourceRoute, b.sourceRoute));

  // The media pipeline itself ran earlier (see `mediaAssets` above, needed
  // for SEO image resolution, which matches against these same *unprefixed*
  // paths); only its actual output *bytes* are written here, after the
  // routes listing above and never before, so
  // `outputDirectory/<basePath>/assets/media/` still can never be mistaken
  // for an Eleventy-rendered HTML route.
  //
  // basePath fix (independent-review finding B2, LOCAL-7 follow-up): the
  // physical file and its manifest `path` are now joined with `basePath`
  // through the same `projectFixedAssetPath` every other fixed-name
  // generated asset (404, feeds, sitemap, search index) already uses, so
  // the local-directory adapter — which serves a manifest `path` verbatim —
  // finds this file at exactly the `<basePath>`-prefixed location
  // `internal/seo.js`'s already-`basePath`-joined `og:image`/`twitter:image`
  // href points at.
  const joinedMediaAssets = mediaAssets.map((asset) => ({
    ...asset,
    path: projectFixedAssetPath(validatedInput.basePath, `/${asset.path}`),
  }));
  for (const file of mediaFiles) {
    const joinedPath = projectFixedAssetPath(
      validatedInput.basePath,
      `/${file.path}`,
    );
    const destination = path.join(outputDirectory, joinedPath);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, file.bytes);
  }

  // S2-T12: the selected theme package's stylesheet/passive-asset bytes,
  // written for the same reason and at the same point as the media pipeline
  // output immediately above (`themeAssetsResult` is `undefined` when no
  // `options.themeDirectory` was supplied, in which case there is nothing to
  // write — the fallback `defaultThemeStylesheetLinksHtml` link above points
  // at a file this renderer does not itself produce).
  if (themeAssetsResult) {
    for (const file of themeAssetsResult.files) {
      const destination = path.join(outputDirectory, file.path);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, file.bytes);
    }
  }

  // S2-T07's one deterministic pre-paint appearance-controller bootstrap
  // script (brief S2 section 3: "the appearance controller is the only
  // browser bootstrap"). Written after the routes listing above for the same
  // reason as the media pipeline output immediately above: it must never be
  // mistaken for an Eleventy-rendered HTML route. Its bytes are a pure
  // function of `internal/appearance/contract.js`'s own fixed constants, so
  // this asset row is identical on every build regardless of build input.
  const appearanceScriptBytes = Buffer.from(
    APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE,
    'utf8',
  );
  // basePath fix (independent-review finding B2): joined the exact same way
  // `appearanceScriptHrefValue` above was, so the `<script src>` this
  // renderer emits and the physical file/manifest path it writes can never
  // drift apart.
  const joinedAppearanceScriptPath = projectFixedAssetPath(
    validatedInput.basePath,
    `/${APPEARANCE_BOOTSTRAP_SCRIPT_PATH}`,
  );
  const appearanceScriptDestination = path.join(
    outputDirectory,
    joinedAppearanceScriptPath,
  );
  await mkdir(path.dirname(appearanceScriptDestination), { recursive: true });
  await writeFile(appearanceScriptDestination, appearanceScriptBytes);
  /** @type {import('../../types/index.d.ts').ManifestAssetEntry} */
  const appearanceScriptAsset = {
    path: joinedAppearanceScriptPath,
    mediaType: APPEARANCE_BOOTSTRAP_SCRIPT_MEDIA_TYPE,
    byteLength: String(appearanceScriptBytes.byteLength),
    sha256: digestBytes(appearanceScriptBytes),
    // Not content-addressed (a fixed, non-digest-bearing path), unlike the
    // media pipeline's derivative paths above: `immutable` here documents
    // cacheability, not path-collision safety.
    immutable: false,
  };

  // TPL-H3/TPL-M7: the template-owned gala-base stylesheet, written and
  // manifested for the same reason and at the same point as the appearance
  // bootstrap script immediately above. Always emitted, independent of
  // whether a theme was selected (`baseStylesheetHrefValue` above is
  // likewise unconditional), because it is what makes contract-mandated
  // chrome presentable even with no theme at all.
  const baseStylesheetBytes = Buffer.from(GALA_BASE_STYLESHEET_SOURCE, 'utf8');
  const joinedBaseStylesheetPath = projectFixedAssetPath(
    validatedInput.basePath,
    `/${GALA_BASE_STYLESHEET_PATH}`,
  );
  const baseStylesheetDestination = path.join(
    outputDirectory,
    joinedBaseStylesheetPath,
  );
  await mkdir(path.dirname(baseStylesheetDestination), { recursive: true });
  await writeFile(baseStylesheetDestination, baseStylesheetBytes);
  /** @type {import('../../types/index.d.ts').ManifestAssetEntry} */
  const baseStylesheetAsset = {
    path: joinedBaseStylesheetPath,
    mediaType: GALA_BASE_STYLESHEET_MEDIA_TYPE,
    byteLength: String(baseStylesheetBytes.byteLength),
    sha256: digestBytes(baseStylesheetBytes),
    immutable: false,
  };

  const assets = [
    ...joinedMediaAssets,
    appearanceScriptAsset,
    baseStylesheetAsset,
    ...(themeAssetsResult ? themeAssetsResult.assets : []),
  ].sort((a, b) => compareUtf8Bytes(a.path, b.path));

  const includedSources = collectIncludedSources(validatedInput);

  const manifest = buildArtifactManifest({
    buildInput: validatedInput,
    routes,
    assets,
    redirects,
    includedSources,
    excludedInputs: options.provenance.additionalExcludedInputs ?? [],
    provenance: options.provenance,
    generateArtifactId: generateUuidV7,
  });

  const manifestValidation = validateGalaDocument(
    ARTIFACT_MANIFEST_SCHEMA_ID,
    manifest,
  );
  if (!manifestValidation.valid) {
    throw new ArtifactManifestValidationError(manifestValidation.diagnostics);
  }

  return { outputDirectory, manifest };
}

export {
  BuildInputValidationError,
  RenderOptionsError,
  ArtifactManifestValidationError,
  MediaPipelineError,
  RenderPolicyViolationError,
} from './errors.js';

export {
  computeBodyDigest,
  computeRenderPolicyIdentity,
  normalizeAuthoredMarkdown,
} from './internal/content-security.js';
