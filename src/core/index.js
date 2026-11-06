/**
 * `@rathnasgala2/template` public entry point.
 *
 * This is the Eleventy-confined renderer adapter: it consumes one validated
 * `urn:gala:schema:build-input:2.0.0` instance and emits a candidate output
 * directory plus one `urn:gala:schema:artifact-manifest:2.0.0` instance.
 *
 * `renderPublication` is the only documented *rendering* entry point. It
 * fails closed: an invalid `build-input` is rejected with
 * {@link BuildInputValidationError} before anything is written, malformed
 * adapter options are rejected with {@link RenderOptionsError} before
 * Eleventy ever runs, a body image that names no inventoried image asset is
 * rejected with {@link BuildInputValidationError}
 * (`MEDIA_REFERENCE_UNRESOLVED`) before anything is written, an edition that
 * names no article in the build, repeats another edition or takes another
 * document's route is rejected the same way (`EDITION_ORIGINAL_UNRESOLVED`,
 * `EDITION_DUPLICATE`, `EDITION_ROUTE_CONFLICT`), a document or redirect on the
 * generated `/terms` or `/privacy` route is rejected the same way
 * (`POLICY_ROUTE_CONFLICT`), and a rejected image or font
 * is rejected with {@link MediaPipelineError} before anything is written.
 *
 * `normalizeAuthoredMarkdown` (re-exported here from
 * `internal/content-security.js`) is this package's second public entry
 * point: the upstream normalization step a `build-input:2.0.0` producer
 * (`publish-kernel`/`publish-action`) calls once per authored Markdown
 * source to produce the exact `renderableBody.body`/`bodyDigest` pair this
 * renderer expects to receive. `renderPublication` never calls it on a body
 * it receives — see `internal/content-security.js`'s module documentation for
 * why a `renderableBody.body` is already policy-conformant HTML by the time
 * it reaches this renderer, and how `renderPublication` verifies that instead
 * of re-deriving it. Its one call is on the shipped default policy Markdown
 * (`internal/policy-pages.js`), which is source, not a received body.
 *
 * `options.sourceDirectory` is the caller-mounted, read-only repository
 * source tree `build-input`'s `resolvedFile` references point into.
 * `processMedia` runs after the Eleventy route listing is already computed,
 * so generated derivative files under `assets/media/` are never mistaken for
 * an HTML route.
 *
 * Output-security (markdown/sanitizer/highlighter/CSP) and the media
 * pipeline are layered on the same adapter, alongside the core semantic
 * skeleton and navigation renderer (`internal/skeleton.js`) and every
 * generated page kind (`internal/page-kinds.js`): publication profile,
 * author, article/page, index, tag, series and archive pages, each composed
 * with one shared header/primary-navigation/footer chrome and, where
 * required, a breadcrumb trail. This adapter also emits every authored
 * static redirect and the feeds/search/sitemap outputs, shaped so that later
 * work can extend the page-body pipeline without touching the confinement,
 * route-projection or manifest-assembly mechanics here.
 *
 * The Light/Dark/System appearance controller (`internal/appearance/`) adds:
 * the server-rendered control in the header's `header-actions` slot
 * (`controller-markup.js`), the one deterministic pre-paint bootstrap script
 * this renderer ever emits, written into the candidate output directory and
 * entered into the manifest as an ordinary `manifestAsset` row exactly like a
 * media derivative (`bootstrap-script.js`), and the fixed `data-` attribute
 * names, mode values and storage key every one of those pieces shares
 * (`contract.js`) — the same contract the published theme styling catalog
 * targets.
 *
 * `src/core/` is the only admitted source root in this repository. No
 * `src/modules/` tree, module import edge, registration stub, module
 * configuration, module output or module runtime is ever added beside it
 */

import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { validateGalaDocument } from '@rathnasgala2/schemas';

import {
  APPEARANCE_BOOTSTRAP_SCRIPT_MEDIA_TYPE,
  APPEARANCE_BOOTSTRAP_SCRIPT_PATH,
} from './internal/appearance/contract.js';
import { APPEARANCE_BOOTSTRAP_SCRIPT_SOURCE } from './internal/appearance/bootstrap-script.js';
import {
  GALA_BASE_STYLESHEET_MEDIA_TYPE,
  GALA_BASE_STYLESHEET_PATH,
  GALA_BASE_STYLESHEET_SOURCE,
} from './internal/appearance/base-layer.js';
import { TEMPLATE_RENDERER_VERSION } from './internal/package-version.js';
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
} from './internal/content-security.js';
import { computeRenderPolicyIdentity } from './internal/render-policy-identity-node.js';
import {
  CONSENT_SCRIPT_MEDIA_TYPE,
  CONSENT_SCRIPT_PATH,
  CONSENT_SCRIPT_SOURCE,
} from './internal/analytics/consent-script.js';
import {
  analyticsActive,
  validateAnalyticsModule,
} from './internal/analytics/module.js';
import { resolveEditions } from './internal/editions.js';
import {
  assertPolicyRoutesFree,
  validatePolicies,
} from './internal/policy-pages.js';
import { renderPagesWithEleventy } from './internal/eleventy-render.js';
import {
  buildEmailFragments,
  emailFragmentsOn,
} from './internal/email-fragment.js';
import {
  AUDIENCE_SCRIPT_MEDIA_TYPE,
  AUDIENCE_SCRIPT_PATH,
  CONTACT_ROUTE,
} from './internal/audience.js';
import {
  COUNTS_SCRIPT_MEDIA_TYPE,
  COUNTS_SCRIPT_PATH,
  INTERACTIONS_SCRIPT_MEDIA_TYPE,
  INTERACTIONS_SCRIPT_PATH,
  SIGNALS_SCRIPT_MEDIA_TYPE,
  SIGNALS_SCRIPT_PATH,
  validateInteractionsModule,
} from './internal/interactions.js';
import { ATOM_FEED_ROUTE, RSS_FEED_ROUTE } from './internal/feeds.js';
import {
  assertLanguageSegmentsFree,
  resolveTranslations,
} from './internal/translations.js';
import { loadSitePolicyDefaults } from './internal/policy-defaults-node.js';
import { loadAudienceScript } from './internal/audience-node.js';
import { loadVideoScript } from './internal/video-node.js';
import {
  VIDEO_SCRIPT_MEDIA_TYPE,
  VIDEO_SCRIPT_PATH,
} from './internal/content-blocks.js';
import { withoutForwardMembers } from './internal/forward-compat.js';
import { resolveContentFiles } from './internal/media/content-files.js';
import { processContentFiles } from './internal/media/files.js';
import {
  RECOMMENDATIONS_ROUTE,
  buildRecommendationsDocument,
  readRecommendations,
} from './internal/recommendations.js';
import {
  loadCountsScript,
  loadInteractionsScript,
  loadSignalsScript,
} from './internal/interactions-node.js';
import { loadListenScript } from './internal/listen-node.js';
import { listFilesSortedByUtf8Bytes } from './internal/fs-walk.js';
import {
  LISTEN_SCRIPT_MEDIA_TYPE,
  LISTEN_SCRIPT_PATH,
  audioDigestHex,
} from './internal/listen.js';
import { getMessages } from './internal/messages.js';
import { resolveContentImages } from './internal/media/content-images.js';
import { processListenAudio } from './internal/media/audio.js';
import { processMedia } from './internal/media/pipeline.js';
import {
  contentRoute,
  isSeoNoindex,
  selectPublishedArticles,
} from './internal/page-kinds.js';
import { assertProvenance } from './internal/provenance.js';
import { projectFixedAssetPath } from './internal/route.js';
import { buildSearchIndex } from './internal/search-index.js';
import { buildLlmsDocuments } from './internal/llms.js';
import { buildRobotsTxt, readAiCrawlerPolicy } from './internal/robots.js';
import { buildLicenseXml } from './internal/license-rsl.js';
import { splitLiveContent } from './internal/liveness.js';
import {
  buildArticleMarkdown,
  buildPostsJson,
  markdownRoute,
} from './internal/static-outputs.js';
import { readMarkdownBody } from './internal/static-outputs-node.js';
import { buildSitemap } from './internal/sitemap.js';
import { loadThemeAssets } from './internal/theme-assets.js';
import {
  collectIncludedSources,
  compareUtf8Bytes,
} from './internal/source-inventory.js';
import { generateUuidV7 } from './internal/uuid.js';
import { buildArtifactManifest } from './manifest.js';
import {
  SEARCH_INDEX_ROUTE,
  buildPageDocuments,
  deriveSiteContext,
} from './internal/site-render.js';

/** @type {string} the un-joined route `sitemap.xml` is published at. */
const SITEMAP_ROUTE = '/sitemap.xml';
/** @type {string} the output-root path of `robots.txt` (never `basePath`-
 * joined: only a host-root robots file is honoured by crawlers). */
const ROBOTS_PATH = 'robots.txt';
/** @type {string} the un-joined route of the llmstxt.org index. */
const LLMS_ROUTE = '/llms.txt';
/** The author's AI-use terms (RSL), only when `publication.aiRights` is set. */
const LICENSE_ROUTE = '/license.xml';
/** Every live article as JSON. */
const POSTS_ROUTE = '/posts.json';
/** What built the site, as JSON; its page is `VERSION_PAGE_ROUTE`. */
const VERSION_JSON_ROUTE = '/version.json';
/** @type {string} the un-joined route of the full-text companion. */
const LLMS_FULL_ROUTE = '/llms-full.txt';

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
export const TEMPLATE_PACKAGE_VERSION = TEMPLATE_RENDERER_VERSION;

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
  // An optional caller-mounted, read-only extracted theme package directory
  // (`internal/theme-assets.js`). Absent entirely by default, so this
  // addition is purely additive.
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
 * footer card, policy pages and every content record byte-equals the currently published
 * render-policy identity, and that no module or placement value leaked
 * through (belt-and-suspenders on top of the `build-input` schema's module
 * closure: only a valid `interactions` module is admitted, `placements` stays
 * empty). Fails closed before any
 * directory is created or Eleventy ever runs: an absent policy file, wrong
 * path/name/version/digest, mixed identity between records, or body
 * produced under a different policy rejects before build.
 *
 * @param {import('../../types/index.d.ts').NormalizedBuildInput} validatedInput
 *   the schema-validated build input
 * @returns {Promise<void>} resolves once every reference is verified
 */
async function assertRenderPolicyCompliance(validatedInput) {
  const moduleKeys = Object.keys(validatedInput.modules);
  if (moduleKeys.some((key) => key !== 'interactions' && key !== 'analytics')) {
    throw new RenderPolicyViolationError(
      'build-input.modules may only carry interactions and analytics',
    );
  }
  if (validatedInput.placements.length !== 0) {
    throw new RenderPolicyViolationError(
      'build-input.placements must be empty',
    );
  }
  if (validatedInput.modules.interactions !== undefined) {
    validateInteractionsModule(validatedInput.modules.interactions);
  }
  if (validatedInput.modules.analytics !== undefined) {
    validateAnalyticsModule(validatedInput.modules.analytics);
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
  if (validatedInput.publication.contactForm?.intro) {
    const { intro } = validatedInput.publication.contactForm;
    assertRenderPolicyIdentity(
      intro.renderPolicy,
      identity,
      'publication.contactForm.intro',
    );
    assertPolicyConformantHtml(
      intro.body,
      intro.bodyDigest,
      'publication.contactForm.intro',
    );
  }
  if (validatedInput.policies !== undefined) {
    const policies = validatePolicies(validatedInput.policies);
    for (const key of /** @type {const} */ (['terms', 'privacy'])) {
      const { body } = policies[key];
      const location = `policies.${key}.body`;
      assertRenderPolicyIdentity(body.renderPolicy, identity, location);
      assertPolicyConformantHtml(body.body, body.bodyDigest, location);
    }
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
  // The members a newer schema adds are checked here, then left out of the
  // schema validation (`internal/forward-compat.js`).
  const inputValidation = validateGalaDocument(
    BUILD_INPUT_SCHEMA_ID,
    withoutForwardMembers(buildInput),
  );
  if (!inputValidation.valid) {
    throw new BuildInputValidationError(inputValidation.diagnostics);
  }
  const authoredInput =
    /** @type {import('../../types/index.d.ts').NormalizedBuildInput} */ (
      buildInput
    );

  await assertRenderPolicyCompliance(authoredInput);
  // One "is it live" decision for the whole build (`internal/liveness.js`):
  // everything below sees only the records whose `deleteDate` has not come.
  // The removed ones are rendered as notices further down.
  const liveSplit = splitLiveContent(
    authoredInput.content,
    authoredInput.buildEpoch,
  );
  const validatedInput = { ...authoredInput, content: liveSplit.live };
  // Every body image must name an image asset the build input inventories
  // for its document; resolved here, from the verified bodies alone, so an
  // unresolved one fails closed before anything is written.
  const contentImages = resolveContentImages(validatedInput);
  // The same for the PDFs the `file` blocks link.
  const contentFiles = resolveContentFiles(validatedInput);
  // No document may take a route the generated policy pages own.
  // The Contact page owns `/contact` while the site's contact form is on.
  assertPolicyRoutesFree(
    validatedInput.content,
    contentRoute,
    validatedInput.publication.contactForm?.enabled ? [CONTACT_ROUTE] : [],
  );
  // Every edition must sit beside an article of this build; placed here for the
  // same reason.
  const editions = resolveEditions(validatedInput.content, contentRoute);
  // Language variants: groups of `translationOf` articles, and the language
  // segments (`/ta/`) no document may take.
  const translations = resolveTranslations(
    validatedInput.content,
    validatedInput.publication.defaultLanguage,
    liveSplit.removedRoots,
  );
  assertLanguageSegmentsFree(
    validatedInput.content,
    validatedInput.publication.defaultLanguage,
    contentRoute,
    translations,
  );
  assertOptions(options);
  const routeProfile = options.routeNormalizationProfile ?? 'directory-index';

  const outputDirectory = path.resolve(options.outputDirectory);
  const workDirectory = path.resolve(options.workDirectory);

  // The site-wide message catalog for core chrome (skip link, navigation,
  // breadcrumb, pagination and footer labels). Every page's own <html lang>
  // attribute still reflects that individual page's own language (see
  // `page.language` below); only the *chrome strings surrounding it* are
  // rendered in one consistent language, matching a reader's expectation
  // that navigation/footer text does not flip language from page to page
  // (see `internal/messages.js`).
  const site = deriveSiteContext(validatedInput, { getMessages, routeProfile });
  const { publicBasePath, interactionsOn, countsOn, audienceOn, listen } = site;
  // Admit the selected generation-4 theme and its complete structural
  // composition before any output directory is created. Theme-less calls
  // use the renderer's Editorial composition and the conventional print
  // stylesheet link; a supplied theme never receives that fallback.
  const themeAssetsResult = options.themeDirectory
    ? await loadThemeAssets({
        themeDirectory: path.resolve(options.themeDirectory),
        basePath: validatedInput.basePath,
        publicBasePath,
        appearanceTokens: validatedInput.appearance.tokens,
      })
    : undefined;
  // Run before page assembly, not after: resolving each page's own images
  // (`og:image`, hero, avatar, brand mark) needs the media pipeline's own
  // finished `assets` list (only it knows which derivative file extension a
  // given source image's `sourceDigest` produced — see `internal/seo.js`).
  // This only moves the in-memory computation earlier; `mediaFiles`' actual
  // bytes are still written to `outputDirectory` only after the route
  // listing below, so `outputDirectory/assets/media/` still can never be
  // mistaken for an Eleventy-rendered HTML route.
  const {
    assets: mediaAssets,
    files: mediaFiles,
    dimensions: mediaDimensions,
    variants: mediaVariants,
  } = await processMedia(validatedInput, {
    sourceDirectory: path.resolve(options.sourceDirectory),
    contentImages: [...contentImages.values()],
  });
  // Each linked PDF, verified the same way.
  const contentFileOutput = await processContentFiles(
    [...contentFiles.values()],
    { sourceDirectory: path.resolve(options.sourceDirectory) },
  );
  // Each published article's audio (Listen live), verified like the media
  // above and before anything is written.
  const listenAudio = listen.live
    ? await processListenAudio(listen.entries, {
        sourceDirectory: path.resolve(options.sourceDirectory),
      })
    : { assets: [], files: [] };
  // Created only now, after every input and media check has passed, so a
  // rejected build input or media reference leaves nothing behind.
  await mkdir(outputDirectory, { recursive: true });
  await mkdir(workDirectory, { recursive: true });
  const {
    contentPages,
    redirectPages,
    redirectProjections,
    generatedPages,
    interactionBearingPaths,
    feeds,
    absoluteSiteUrl,
    versionInfo,
    errorFilePath,
    emailBody,
    aiPolicy,
  } = buildPageDocuments(validatedInput, {
    getMessages,
    loadPolicyDefaults: loadSitePolicyDefaults,
    routeProfile,
    liveSplit,
    contentImages,
    contentFiles,
    editions,
    translations,
    site,
    themeAssets: themeAssetsResult,
    media: { mediaAssets, mediaDimensions, mediaVariants },
  });

  // The click-to-play script is emitted exactly when a page links it.
  const videoOn = [...contentPages, ...redirectPages].some((page) =>
    page.content.includes('data-gala-video-script'),
  );

  // Feeds, sitemap and the static search index. Each is a fixed,
  // literal-extension file — never route-normalized like an ordinary
  // content route (`internal/route.js#projectFixedAssetPath`) — and each
  // bypasses the shared HTML document shell entirely (exactly like a
  // generated redirect document above): these are raw
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
    basePath: publicBasePath,
    baseUrl: validatedInput.baseUrl,
    routeProfile,
  });
  const searchIndexJson = buildSearchIndex(validatedInput, routeProfile);
  const licenseFilePath = projectFixedAssetPath(
    validatedInput.basePath,
    LICENSE_ROUTE,
  );
  const robotsTxt = buildRobotsTxt({
    aiPolicy: readAiCrawlerPolicy(validatedInput.publication),
    sitemapUrl: absoluteSiteUrl(SITEMAP_ROUTE),
    ...(aiPolicy.granular
      ? { rights: aiPolicy, licenseFileUrl: absoluteSiteUrl(LICENSE_ROUTE) }
      : {}),
  });
  const llmsFilePath = projectFixedAssetPath(
    validatedInput.basePath,
    LLMS_ROUTE,
  );
  const llmsFullFilePath = projectFixedAssetPath(
    validatedInput.basePath,
    LLMS_FULL_ROUTE,
  );
  const { llmsTxt, llmsFullTxt } = buildLlmsDocuments(validatedInput, {
    getMessages,
    rss: feeds.rssSelfUrl,
    atom: feeds.atomSelfUrl,
    sitemap: absoluteSiteUrl(SITEMAP_ROUTE),
    searchIndex: absoluteSiteUrl(SEARCH_INDEX_ROUTE),
    full: absoluteSiteUrl(LLMS_FULL_ROUTE),
    posts: absoluteSiteUrl(POSTS_ROUTE),
    ...(aiPolicy.granular ? { license: absoluteSiteUrl(LICENSE_ROUTE) } : {}),
    routeProfile,
  });
  // `/.well-known/recommendations.json`, only when the author recommends
  // sites (Ghost's shape: a bare array of `{url, created_at, updated_at}`).
  const recommendationsFilePath = projectFixedAssetPath(
    validatedInput.basePath,
    RECOMMENDATIONS_ROUTE,
  );
  const recommendationsJson = buildRecommendationsDocument(
    readRecommendations(validatedInput.publication.recommendations),
    validatedInput.buildEpoch,
  );
  // Each live, indexable article's Markdown twin, read from the repository
  // file the build input digested (see `internal/static-outputs.js`). An
  // article whose file is not there, or is not that file, has no twin.
  const sourceDirectory = path.resolve(options.sourceDirectory);
  /** @type {Set<import('../../types/index.d.ts').ContentBuildRecord>} */
  const withMarkdown = new Set();
  /** @type {{virtualPath: string, content: string, permalink: string}[]} */
  const markdownPages = [];
  for (const record of selectPublishedArticles(validatedInput.content)) {
    if (isSeoNoindex(record.frontmatter)) continue;
    const markdown = await readMarkdownBody(sourceDirectory, record);
    if (markdown === undefined) continue;
    const route = contentRoute(record.frontmatter);
    withMarkdown.add(record);
    markdownPages.push({
      virtualPath: `markdown/${markdownPages.length}.html`,
      content: buildArticleMarkdown(
        record,
        record.frontmatter.seo?.canonicalUrl || absoluteSiteUrl(route),
        markdown,
      ),
      permalink: projectFixedAssetPath(
        validatedInput.basePath,
        markdownRoute(route, routeProfile),
      ),
    });
  }
  const postsJson = buildPostsJson(validatedInput.content, {
    absoluteUrl: absoluteSiteUrl,
    withMarkdown,
    routeProfile,
    buildEpoch: validatedInput.buildEpoch,
  });
  const postsFilePath = projectFixedAssetPath(
    validatedInput.basePath,
    POSTS_ROUTE,
  );
  const versionFilePath = projectFixedAssetPath(
    validatedInput.basePath,
    VERSION_JSON_ROUTE,
  );
  // The full-post email fragments, only for a Galascribe newsletter that mails
  // full posts. Raw documents like the files below, so they are in no sitemap,
  // feed, search index or `llms` file.
  const emailFragments = emailFragmentsOn(validatedInput.publication)
    ? buildEmailFragments(validatedInput, {
        emailBody,
        absoluteUrl: absoluteSiteUrl,
      }).map((fragment) => ({
        virtualPath: `email/${fragment.contentId}.html`,
        content: fragment.content,
        permalink: projectFixedAssetPath(
          validatedInput.basePath,
          fragment.route,
        ),
      }))
    : [];
  const assetPages = [
    ...emailFragments,
    ...markdownPages,
    ...(aiPolicy.granular
      ? [
          {
            virtualPath: 'license.html',
            content: buildLicenseXml(aiPolicy, absoluteSiteUrl('/')),
            permalink: licenseFilePath,
          },
        ]
      : []),
    {
      virtualPath: 'posts.html',
      content: postsJson,
      permalink: postsFilePath,
    },
    {
      virtualPath: 'version-json.html',
      content: `${JSON.stringify(versionInfo)}\n`,
      permalink: versionFilePath,
    },
    { virtualPath: 'robots.html', content: robotsTxt, permalink: ROBOTS_PATH },
    ...(recommendationsJson === undefined
      ? []
      : [
          {
            virtualPath: 'recommendations.html',
            content: recommendationsJson,
            permalink: recommendationsFilePath,
          },
        ]),
    { virtualPath: 'llms.html', content: llmsTxt, permalink: llmsFilePath },
    {
      virtualPath: 'llms-full.html',
      content: llmsFullTxt,
      permalink: llmsFullFilePath,
    },
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
    ...feeds.languageFeeds.flatMap((feed, feedIndex) => [
      {
        virtualPath: `feeds/language-${feedIndex}-atom.html`,
        content: feed.atomXml,
        permalink: projectFixedAssetPath(
          validatedInput.basePath,
          feed.atomRoute,
        ),
      },
      {
        virtualPath: `feeds/language-${feedIndex}-rss.html`,
        content: feed.rssXml,
        permalink: projectFixedAssetPath(
          validatedInput.basePath,
          feed.rssRoute,
        ),
      },
    ]),
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

  // The exact `routeClass`/`mediaType` this renderer's own generated
  // non-HTML routes carry, keyed by their fixed output path. Every other
  // route defaults to `'html'`/`text/html; charset=utf-8`.
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
    [
      postsFilePath,
      { routeClass: 'asset', mediaType: 'application/json; charset=utf-8' },
    ],
    [
      versionFilePath,
      { routeClass: 'asset', mediaType: 'application/json; charset=utf-8' },
    ],
    [
      licenseFilePath,
      { routeClass: 'asset', mediaType: 'application/xml; charset=utf-8' },
    ],
    [
      ROBOTS_PATH,
      { routeClass: 'asset', mediaType: 'text/plain; charset=utf-8' },
    ],
    [
      recommendationsFilePath,
      { routeClass: 'asset', mediaType: 'application/json; charset=utf-8' },
    ],
    [
      llmsFilePath,
      { routeClass: 'asset', mediaType: 'text/plain; charset=utf-8' },
    ],
    [
      llmsFullFilePath,
      { routeClass: 'asset', mediaType: 'text/plain; charset=utf-8' },
    ],
  ]);
  // The manifest's media types have no `text/markdown`; plain text is the
  // closest it admits, and hosts serve a `.md` file by its extension.
  for (const page of markdownPages) {
    specialRoutes.set(page.permalink, {
      routeClass: 'asset',
      mediaType: 'text/plain; charset=utf-8',
    });
  }
  for (const fragment of emailFragments) {
    specialRoutes.set(fragment.permalink, {
      routeClass: 'asset',
      mediaType: 'text/html; charset=utf-8',
    });
  }
  for (const feed of feeds.languageFeeds) {
    specialRoutes.set(
      projectFixedAssetPath(validatedInput.basePath, feed.atomRoute),
      {
        routeClass: 'feed',
        mediaType: 'application/atom+xml; charset=utf-8',
      },
    );
    specialRoutes.set(
      projectFixedAssetPath(validatedInput.basePath, feed.rssRoute),
      {
        routeClass: 'feed',
        mediaType: 'application/rss+xml; charset=utf-8',
      },
    );
  }

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
      interactionBearing: interactionBearingPaths.has(filePath),
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

  // Each linked PDF, copied as-is at its content-hashed path.
  const joinedFileAssets = contentFileOutput.assets.map((asset) => ({
    ...asset,
    path: projectFixedAssetPath(validatedInput.basePath, `/${asset.path}`),
  }));
  for (const file of contentFileOutput.files) {
    const destination = path.join(
      outputDirectory,
      projectFixedAssetPath(validatedInput.basePath, `/${file.path}`),
    );
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(file.source, destination);
  }

  // Each published article's audio (Listen live), copied as-is from the source
  // tree at its content-addressed path, joined with `basePath` like every
  // other fixed-name asset.
  const joinedListenAssets = listenAudio.assets.map((asset) => ({
    ...asset,
    path: projectFixedAssetPath(validatedInput.basePath, `/${asset.path}`),
  }));
  for (const file of listenAudio.files) {
    const destination = path.join(
      outputDirectory,
      projectFixedAssetPath(validatedInput.basePath, `/${file.path}`),
    );
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(file.source, destination);
  }

  // The selected theme package's stylesheet/passive-asset bytes, written
  // for the same reason and at the same point as the media pipeline
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

  // The one deterministic pre-paint appearance-controller bootstrap script:
  // the appearance controller is the only browser bootstrap this renderer
  // ever emits. Written after the routes listing above for the same reason
  // as the media pipeline output immediately above: it must never be
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

  // The reader-interactions browser script, only when the module is on. Its
  // bytes are the template package's own file, so the asset row is a pure
  // function of the template version.
  /** @type {import('../../types/index.d.ts').ManifestAssetEntry[]} */
  const interactionsAssets = [];
  if (interactionsOn) {
    const interactionsScriptBytes = await loadInteractionsScript();
    const joinedInteractionsScriptPath = projectFixedAssetPath(
      validatedInput.basePath,
      `/${INTERACTIONS_SCRIPT_PATH}`,
    );
    const interactionsScriptDestination = path.join(
      outputDirectory,
      joinedInteractionsScriptPath,
    );
    await mkdir(path.dirname(interactionsScriptDestination), {
      recursive: true,
    });
    await writeFile(interactionsScriptDestination, interactionsScriptBytes);
    interactionsAssets.push({
      path: joinedInteractionsScriptPath,
      mediaType: INTERACTIONS_SCRIPT_MEDIA_TYPE,
      byteLength: String(interactionsScriptBytes.byteLength),
      sha256: digestBytes(interactionsScriptBytes),
      immutable: false,
    });
  }

  // The reading-signals script (Today), beside the interactions script: the
  // template package's own file, so the asset row is a pure function of the
  // template version.
  /** @type {import('../../types/index.d.ts').ManifestAssetEntry[]} */
  const signalsAssets = [];
  if (interactionsOn) {
    const signalsScriptBytes = await loadSignalsScript();
    const joinedSignalsScriptPath = projectFixedAssetPath(
      validatedInput.basePath,
      `/${SIGNALS_SCRIPT_PATH}`,
    );
    const signalsScriptDestination = path.join(
      outputDirectory,
      joinedSignalsScriptPath,
    );
    await mkdir(path.dirname(signalsScriptDestination), { recursive: true });
    await writeFile(signalsScriptDestination, signalsScriptBytes);
    signalsAssets.push({
      path: joinedSignalsScriptPath,
      mediaType: SIGNALS_SCRIPT_MEDIA_TYPE,
      byteLength: String(signalsScriptBytes.byteLength),
      sha256: digestBytes(signalsScriptBytes),
      immutable: false,
    });
  }

  // The counts script, only when public counts are shown on cards and article
  // headers: the template package's own file, like the interactions script.
  /** @type {import('../../types/index.d.ts').ManifestAssetEntry[]} */
  const countsAssets = [];
  if (countsOn) {
    const countsScriptBytes = await loadCountsScript();
    const joinedCountsScriptPath = projectFixedAssetPath(
      validatedInput.basePath,
      `/${COUNTS_SCRIPT_PATH}`,
    );
    const countsScriptDestination = path.join(
      outputDirectory,
      joinedCountsScriptPath,
    );
    await mkdir(path.dirname(countsScriptDestination), { recursive: true });
    await writeFile(countsScriptDestination, countsScriptBytes);
    countsAssets.push({
      path: joinedCountsScriptPath,
      mediaType: COUNTS_SCRIPT_MEDIA_TYPE,
      byteLength: String(countsScriptBytes.byteLength),
      sha256: digestBytes(countsScriptBytes),
      immutable: false,
    });
  }

  // The audience script, only when the Follow control, the Galascribe
  // newsletter or the contact form is on: the template package's own file.
  /** @type {import('../../types/index.d.ts').ManifestAssetEntry[]} */
  const audienceAssets = [];
  if (audienceOn) {
    const audienceScriptBytes = await loadAudienceScript();
    const joinedAudienceScriptPath = projectFixedAssetPath(
      validatedInput.basePath,
      `/${AUDIENCE_SCRIPT_PATH}`,
    );
    const audienceScriptDestination = path.join(
      outputDirectory,
      joinedAudienceScriptPath,
    );
    await mkdir(path.dirname(audienceScriptDestination), { recursive: true });
    await writeFile(audienceScriptDestination, audienceScriptBytes);
    audienceAssets.push({
      path: joinedAudienceScriptPath,
      mediaType: AUDIENCE_SCRIPT_MEDIA_TYPE,
      byteLength: String(audienceScriptBytes.byteLength),
      sha256: digestBytes(audienceScriptBytes),
      immutable: false,
    });
  }

  // The click-to-play video script, only when some page carries a video card.
  /** @type {import('../../types/index.d.ts').ManifestAssetEntry[]} */
  const videoAssets = [];
  if (videoOn) {
    const videoScriptBytes = await loadVideoScript();
    const joinedVideoScriptPath = projectFixedAssetPath(
      validatedInput.basePath,
      `/${VIDEO_SCRIPT_PATH}`,
    );
    const videoScriptDestination = path.join(
      outputDirectory,
      joinedVideoScriptPath,
    );
    await mkdir(path.dirname(videoScriptDestination), { recursive: true });
    await writeFile(videoScriptDestination, videoScriptBytes);
    videoAssets.push({
      path: joinedVideoScriptPath,
      mediaType: VIDEO_SCRIPT_MEDIA_TYPE,
      byteLength: String(videoScriptBytes.byteLength),
      sha256: digestBytes(videoScriptBytes),
      immutable: false,
    });
  }

  // The Listen script, only when Listen is live: the template package's own
  // file, like the audience script.
  /** @type {import('../../types/index.d.ts').ManifestAssetEntry[]} */
  const listenAssets = [];
  if (listen.live) {
    const listenScriptBytes = await loadListenScript();
    const joinedListenScriptPath = projectFixedAssetPath(
      validatedInput.basePath,
      `/${LISTEN_SCRIPT_PATH}`,
    );
    const listenScriptDestination = path.join(
      outputDirectory,
      joinedListenScriptPath,
    );
    await mkdir(path.dirname(listenScriptDestination), { recursive: true });
    await writeFile(listenScriptDestination, listenScriptBytes);
    listenAssets.push({
      path: joinedListenScriptPath,
      mediaType: LISTEN_SCRIPT_MEDIA_TYPE,
      byteLength: String(listenScriptBytes.byteLength),
      sha256: digestBytes(listenScriptBytes),
      immutable: false,
    });
  }

  // The consent script, only when the analytics module is on: the template's
  // own constant source, so the row is a pure function of the template version.
  /** @type {import('../../types/index.d.ts').ManifestAssetEntry[]} */
  const consentAssets = [];
  if (analyticsActive(validatedInput.modules.analytics)) {
    const consentScriptBytes = Buffer.from(CONSENT_SCRIPT_SOURCE, 'utf8');
    const joinedConsentScriptPath = projectFixedAssetPath(
      validatedInput.basePath,
      `/${CONSENT_SCRIPT_PATH}`,
    );
    const consentScriptDestination = path.join(
      outputDirectory,
      joinedConsentScriptPath,
    );
    await mkdir(path.dirname(consentScriptDestination), { recursive: true });
    await writeFile(consentScriptDestination, consentScriptBytes);
    consentAssets.push({
      path: joinedConsentScriptPath,
      mediaType: CONSENT_SCRIPT_MEDIA_TYPE,
      byteLength: String(consentScriptBytes.byteLength),
      sha256: digestBytes(consentScriptBytes),
      immutable: false,
    });
  }

  const assets = [
    ...joinedMediaAssets,
    ...joinedListenAssets,
    ...joinedFileAssets,
    ...videoAssets,
    appearanceScriptAsset,
    baseStylesheetAsset,
    ...interactionsAssets,
    ...signalsAssets,
    ...countsAssets,
    ...audienceAssets,
    ...listenAssets,
    ...consentAssets,
    ...(themeAssetsResult ? themeAssetsResult.assets : []),
  ].sort((a, b) => compareUtf8Bytes(a.path, b.path));

  // The audio the renderer copied is a consumed source file like an image.
  const includedSources = collectIncludedSources(
    validatedInput,
    listen.entries.map((entry) => ({
      path: entry.listen.audio.sourcePath,
      sha256: `sha256:${audioDigestHex(entry.listen.audio.sha256)}`,
      sourceRevision: entry.record.sourceRevision,
    })),
  );

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
  normalizeAuthoredMarkdown,
} from './internal/content-security.js';
export { computeRenderPolicyIdentity } from './internal/render-policy-identity-node.js';
