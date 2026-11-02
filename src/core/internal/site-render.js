/**
 * Per-page assembly: every HTML page, redirect document and notice page of a
 * site, as complete documents, from a validated build input and the facts the
 * caller has already gathered (theme, media, translations). No file access and
 * no `node:` import, so it runs in a browser; `index.js` reads the inputs and
 * writes the outputs.
 */

import { appearanceBootstrapScriptHref } from './appearance/contract.js';
import {
  GALA_BASE_DEFAULT_TOKENS,
  GALA_BASE_STYLESHEET_PATH,
} from './appearance/base-layer.js';
import { renderAppearanceControl } from './appearance/controller-markup.js';
import { resolveColorModePresentation } from './appearance/contract.js';
import { RenderOptionsError } from '../errors.js';
import { contentSecurityPolicyMetaTag } from './content-security.js';
import { CONSENT_SCRIPT_PATH } from './analytics/consent-script.js';
import { renderConsentBanner } from './analytics/markup.js';
import { analyticsActive } from './analytics/module.js';
import {
  AUDIENCE_MARKER,
  AUDIENCE_SCRIPT_PATH,
  audienceOrigins,
  followsEnabled,
  serializeAudienceMessages,
} from './audience.js';
import {
  COUNTS_SCRIPT_PATH,
  COUNT_SLOT_MARKER,
  INTERACTIONS_SCRIPT_PATH,
  countKinds,
  interactionsActive,
} from './interactions.js';
import { RSS_FEED_ROUTE, buildFeeds } from './feeds.js';
import { languageLabel, localizeAuthor } from './translations.js';
import {
  LISTEN_SCRIPT_PATH,
  LISTEN_SECTION_ID,
  renderListenNav,
  renderListenPage,
  resolveListen,
} from './listen.js';
import { TEMPLATE_RENDERER_VERSION } from './package-version.js';
import { renderDocumentShell } from './document-shell.js';
import { rewriteBodyImages } from './media/content-images.js';
import {
  buildGeneratedPages,
  contentRoute,
  renderErrorPageBody,
  selectPublishedArticles,
} from './page-kinds.js';
import {
  deriveAuthorSlugs,
  deriveTagSegments,
  routeSegmentForLabel,
} from './route-labels.js';
import {
  derivePublicBasePath,
  errorDocumentPath,
  joinPublicRoute,
  joinBasePathAndRoute,
  projectRouteToFilePath,
  renderRedirectDocument,
} from './route.js';
import {
  hreflangAlternates,
  renderHreflangLinks,
  resolveOriginalDerivativePath,
  resolveSocialImage,
  twitterCardType,
} from './seo.js';
import { readAiPolicy, withTrainingOptOut } from './robots.js';
import { renderRemovedPostBody, renderVersionBody } from './notice-pages.js';
import { buildVersionInfo } from './static-outputs.js';
import { defaultThemeStylesheetLinksHtml } from './theme-paths.js';
import { EDITORIAL_COMPOSITION } from './template-composition.js';
import { resolveTextDirection } from './text-direction.js';
import {
  escapeHtml,
  renderPageBody,
  renderPrimaryNavigation,
} from './skeleton.js';
import { renderFooter, renderHeader } from './chrome.js';
import {
  createComponents,
  createContentImage,
  createMediaImage,
} from './components.js';

/** @type {string} the un-joined route the static search index is published at. */
export const SEARCH_INDEX_ROUTE = '/search-index.json';
/** What built the site, as a page; its JSON is `/version.json`. */
export const VERSION_PAGE_ROUTE = '/version';

/**
 * The site-wide facts one build decides once, from the build input alone.
 *
 * @param {import('../../../types/index.d.ts').NormalizedBuildInput} validatedInput the validated build input
 * @param {object} options
 * @param {(bcp47?: string) => import('./messages-core.js').MessageCatalog} options.getMessages the chrome-catalog lookup
 * @param {import('./route.js').RouteNormalizationProfile} options.routeProfile the route normalization profile
 * @returns {SiteContext} the site facts
 */
export function deriveSiteContext(
  validatedInput,
  { getMessages, routeProfile },
) {
  const siteMessages = getMessages(validatedInput.publication.defaultLanguage);
  // Every emitted URL carries the `baseUrl` path (for example `/g9/` on a
  // GitHub project site); output file paths keep using `basePath` alone.
  const publicBasePath = derivePublicBasePath(
    validatedInput.baseUrl,
    validatedInput.basePath,
  );
  const interactionsModule = validatedInput.modules.interactions;
  const interactionsOn = interactionsActive(interactionsModule);
  // The counts script: only when the site shows public counts on cards and
  // article headers (see `countKinds`).
  const countsOn = countKinds(interactionsModule) !== undefined;
  // The audience script: only when the site turns on the author Follow
  // control, the Galascribe newsletter signup or the contact form.
  const followsOn = followsEnabled(interactionsModule);
  const contactOn = validatedInput.publication.contactForm?.enabled === true;
  const audienceOn =
    followsOn ||
    contactOn ||
    validatedInput.publication.newsletter?.mode === 'galascribe';
  const { apiOrigin: audienceApiOrigin, appOrigin: audienceAppOrigin } =
    audienceOrigins(interactionsModule);
  // Listen: one decision for the whole build (`internal/listen.js`). It is
  // live when the site turns it on and a published article carries audio; a
  // build that is not live renders and emits nothing for it.
  const listen = resolveListen({
    publication: validatedInput.publication,
    articles: selectPublishedArticles(validatedInput.content),
    hrefOf: (filePath) =>
      joinPublicRoute(publicBasePath, `/${filePath}`, routeProfile),
  });

  return {
    siteMessages,
    publicBasePath,
    interactionsModule,
    interactionsOn,
    countsOn,
    followsOn,
    contactOn,
    audienceOn,
    audienceApiOrigin,
    audienceAppOrigin,
    listen,
  };
}

/**
 * Every HTML page, redirect document and notice page of a site, as complete
 * documents, plus the site-wide values the asset documents are built from.
 *
 * @param {import('../../../types/index.d.ts').NormalizedBuildInput} validatedInput the validated build input
 * @param {PageDocumentsContext} ctx what the caller has gathered
 * @returns {PageDocuments} the documents and derived values
 */
export function buildPageDocuments(validatedInput, ctx) {
  const {
    getMessages,
    routeProfile,
    liveSplit,
    contentImages,
    editions,
    translations,
    site,
    themeAssets: themeAssetsResult,
    media,
  } = ctx;
  const { mediaAssets, mediaDimensions, mediaVariants, urlOf } = media;
  const {
    only,
    home = false,
    profile = false,
    policy,
    section,
    renderDocument = renderDocumentShell,
  } = ctx;
  // A single-page build (one record's page, the home page, the profile page,
  // one policy page or one language section home).
  const single =
    only !== undefined ||
    home ||
    profile ||
    policy !== undefined ||
    section !== undefined;
  const {
    siteMessages,
    publicBasePath,
    interactionsModule,
    interactionsOn,
    countsOn,
    followsOn,
    contactOn,
    audienceOn,
    audienceApiOrigin,
    audienceAppOrigin,
    listen,
  } = site;
  // One CSP per build: the production policy, plus (local stack only) the
  // interactions module's differing API origin in `connect-src`.
  // Consent and analytics are a core privacy setting: when the analytics
  // module is on, its provider's sources join the CSP and the consent banner,
  // footer button and script render on every HTML page.
  const analyticsModule = validatedInput.modules.analytics;
  const analyticsOn = analyticsActive(analyticsModule);
  const cspMetaTag = contentSecurityPolicyMetaTag(
    interactionsModule?.apiOrigin,
    analyticsModule?.config.provider.kind,
  );
  const consentScriptHref = analyticsOn
    ? joinBasePathAndRoute(publicBasePath, `/${CONSENT_SCRIPT_PATH}`)
    : undefined;
  /**
   * The chrome a page of the given language renders with: its message
   * catalog (the site's own when the language has none), consent banner and
   * appearance control. One per distinct catalog.
   *
   * @type {Map<unknown, {messages: typeof siteMessages, consentHtml: string, appearanceControlHtml: string, listen?: ListenChrome}>}
   */
  const chromeByCatalog = new Map();
  /**
   * The Listen markup a page of one language renders with (live builds only):
   * the two top-bar buttons and the per-page fragment.
   *
   * @typedef {object} ListenChrome
   * @property {string} navLinkHtml the link to the home page playlist
   * @property {string} navButtonHtml the "Listen to this post" button
   * @property {(current: import('./listen.js').ListenTrack | undefined) => string} pageHtml
   *   the blobs and UI template, with the page's own track when it has one
   */
  /**
   * @param {string} language a BCP-47 tag
   * @returns {{messages: typeof siteMessages, consentHtml: string, appearanceControlHtml: string, listen?: ListenChrome}}
   */
  const chromeFor = (language) => {
    const messages = getMessages(
      translations.active ? language : defaultLanguage,
    );
    let chrome = chromeByCatalog.get(messages);
    if (!chrome) {
      chrome = {
        messages,
        consentHtml:
          analyticsOn && analyticsModule
            ? renderConsentBanner({
                module: analyticsModule,
                messages,
                publicBasePath,
                routeProfile,
              })
            : '',
        appearanceControlHtml: renderAppearanceControl({
          messages,
          toggle: colorMode.toggle,
        }),
        listen: listen.live
          ? {
              navLinkHtml: renderListenNav({
                messages,
                playlistUrl: listenPlaylistUrl,
                current: false,
              }),
              navButtonHtml: renderListenNav({
                messages,
                playlistUrl: listenPlaylistUrl,
                current: true,
              }),
              pageHtml: (current) =>
                renderListenPage({
                  messages,
                  config: {
                    siteTitle: validatedInput.publication.title,
                    playlistUrl: listenPlaylistUrl,
                    artwork: brandMark
                      ? new URL(
                          brandMark.url,
                          validatedInput.baseUrl,
                        ).toString()
                      : null,
                  },
                  current,
                }),
            }
          : undefined,
      };
      chromeByCatalog.set(messages, chrome);
    }
    return chrome;
  };
  const interactionsScriptHref = joinBasePathAndRoute(
    publicBasePath,
    `/${INTERACTIONS_SCRIPT_PATH}`,
  );
  const countsScriptHref = joinBasePathAndRoute(
    publicBasePath,
    `/${COUNTS_SCRIPT_PATH}`,
  );
  const audienceScriptHref = joinBasePathAndRoute(
    publicBasePath,
    `/${AUDIENCE_SCRIPT_PATH}`,
  );
  const listenScriptHref = joinBasePathAndRoute(
    publicBasePath,
    `/${LISTEN_SCRIPT_PATH}`,
  );
  const urlPrefix = derivePublicBasePath(validatedInput.baseUrl, '/');
  const homeRoute = joinPublicRoute(publicBasePath, '/', routeProfile);
  // Where the top-bar Listen link and the script go for the playlist.
  const listenPlaylistUrl = `${homeRoute}#${LISTEN_SECTION_ID}`;

  // "Visitors see": the author's colour-mode default and allowed modes.
  const colorMode = resolveColorModePresentation(
    /** @type {{default: string, allowed: readonly string[]} | undefined} */ (
      validatedInput.appearance.colorMode
    ),
  );
  const colorModeData = {
    resolvedColorMode: colorMode.resolvedMode,
    colorModeDefault: colorMode.defaultMode,
    colorModeAllowed: colorMode.allowedModes.join(' '),
    colorScheme: colorMode.colorScheme,
  };
  const themeStylesheetLinksHtml = themeAssetsResult
    ? themeAssetsResult.linkTagsHtml
    : defaultThemeStylesheetLinksHtml(publicBasePath);
  const composition = themeAssetsResult?.composition ?? EDITORIAL_COMPOSITION;

  const contentImage = createContentImage({
    mediaVariants,
    publicBasePath,
    urlOf,
  });
  /** @type {(body: string) => string} a body's page form */
  const pageBody = (body) =>
    rewriteBodyImages(body, contentImages, contentImage.page);
  /** @type {(body: string) => string} a body's feed form */
  const feedBody = (body) =>
    rewriteBodyImages(body, contentImages, contentImage.feed);
  /** @type {(body: string) => string} a body's email form (largest image) */
  const emailBody = (body) =>
    rewriteBodyImages(body, contentImages, contentImage.email);
  const mediaImage = createMediaImage({
    mediaAssets,
    publicBasePath,
    mediaDimensions,
    urlOf,
  });
  const brandMark = mediaImage(validatedInput.appearance.brandMark);
  // Site icon and browser chrome colour. The icon is the brand mark's original
  // derivative (already `basePath`-joined) and only exists with a brand mark.
  // The colour is on every page: the resolved page canvas of each mode the
  // site allows: the palette sheet's when a theme is supplied, else
  // the base layer's own default.
  const canvas = themeAssetsResult
    ? themeAssetsResult.canvas
    : {
        light: GALA_BASE_DEFAULT_TOKENS['color-canvas'][0],
        dark: GALA_BASE_DEFAULT_TOKENS['color-canvas'][1],
      };
  /** @type {{color: string, media?: string}[]} */
  const themeColors = [];
  if (canvas) {
    if (colorMode.colorScheme === 'dark') {
      themeColors.push({ color: canvas.dark });
    } else {
      themeColors.push({ color: canvas.light });
      if (colorMode.colorScheme !== 'light') {
        themeColors.push({
          color: canvas.dark,
          media: '(prefers-color-scheme: dark)',
        });
      }
    }
  }
  // `type` names the mark's media type. `apple-touch-icon` is only emitted for
  // a PNG or JPEG that the media pipeline measured as square: iOS rejects SVG
  // and distorts a non-square image, so such a mark gets `rel="icon"` alone.
  const markPath = resolveOriginalDerivativePath(
    mediaAssets,
    validatedInput.appearance.brandMark,
  );
  const markType = mediaAssets.find(
    (asset) => asset.path === markPath,
  )?.mediaType;
  const siteHeadData = {
    iconHref: brandMark?.url,
    iconType: markType,
    appleTouchIcon:
      (markType === 'image/png' || markType === 'image/jpeg') &&
      brandMark?.width !== undefined &&
      brandMark.width === brandMark.height,
    themeColors,
  };
  const searchIndexHref = joinBasePathAndRoute(
    publicBasePath,
    SEARCH_INDEX_ROUTE,
  );
  const rssHref = joinBasePathAndRoute(publicBasePath, RSS_FEED_ROUTE);
  const publication = validatedInput.publication;
  // The author's AI-use choices. Training blocked adds the `noai, noimageai`
  // robots directives to every HTML page.
  const aiPolicy = readAiPolicy(publication);
  const trainingBlocked = aiPolicy.granular && aiPolicy.training === 'block';
  const footerCard = publication.footerCard;
  // Already verified render-policy-conformant HTML by
  // assertRenderPolicyCompliance's assertPolicyConformantHtml call above —
  // inserted as-is, never re-parsed as Markdown.
  const footerProfileHtml = footerCard?.enabled
    ? pageBody(footerCard.body.body)
    : '';
  const authorsById = new Map(
    validatedInput.authors.map((author) => [author.id, author]),
  );
  const footerAuthor =
    authorsById.get(publication.contactAuthorId ?? '') ??
    validatedInput.authors[0];
  const authorSlugs = deriveAuthorSlugs(validatedInput.authors);
  const authorHref = (
    /** @type {import('../../../types/index.d.ts').AuthorNormalized} */ author,
  ) =>
    joinPublicRoute(
      publicBasePath,
      `/authors/${authorSlugs.get(author.id) ?? author.id}`,
      routeProfile,
    );
  const footerTagSegments = deriveTagSegments(validatedInput.content);
  const footerComponents = createComponents({
    messages: siteMessages,
    site: (route) => joinPublicRoute(publicBasePath, route, routeProfile),
    mediaImage,
    authorHref,
    authorsById,
    recordHref: (record) =>
      joinPublicRoute(
        publicBasePath,
        contentRoute(record.frontmatter),
        routeProfile,
      ),
    tagHref: (tag) =>
      joinPublicRoute(
        publicBasePath,
        `/tags/${footerTagSegments.get(tag) ?? routeSegmentForLabel(tag)}`,
        routeProfile,
      ),
  });
  const footerAuthorHtmlFor = (
    /** @type {string} */ language,
    /** @type {typeof siteMessages} */ pageMessages,
  ) => {
    if (!footerAuthor) return '';
    const shownAuthor = translations.active
      ? localizeAuthor(footerAuthor, language)
      : footerAuthor;
    return (
      `<p class="g-label">${escapeHtml(/** @type {string} */ (pageMessages.writtenByLabel))}</p>` +
      `<div class="g-byline">${footerComponents.avatar(shownAuthor)}<div class="g-byline-text">` +
      `<a href="${escapeHtml(authorHref(footerAuthor))}">${escapeHtml(shownAuthor.displayName)}</a>` +
      `</div></div>`
    );
  };
  const latestYear = validatedInput.content
    .filter((record) => record.frontmatter.kind !== 'edition')
    .map((record) => record.frontmatter.publishedAt.slice(0, 4))
    .sort()
    .at(-1);
  /** @type {Map<string, string>} */
  const footerCache = new Map();
  /**
   * The footer for a page carrying the given tags (the Galascribe link names
   * them), in the page's language; one render per distinct tag list,
   * language and language switcher.
   *
   * @param {readonly string[]} [pageTags] the page's tags
   * @param {string} [language] the page's language (default: the site's)
   * @param {string} [languageSwitcherHtml] the language switcher markup
   * @returns {string}
   */
  const footerFor = (
    pageTags = [],
    language = validatedInput.publication.defaultLanguage,
    languageSwitcherHtml = '',
  ) => {
    const pageMessages = chromeFor(language).messages;
    const key = JSON.stringify([
      pageTags,
      pageMessages === siteMessages && !translations.active ? '' : language,
      languageSwitcherHtml,
    ]);
    let html = footerCache.get(key);
    if (html === undefined) {
      html = renderFooterFor(
        pageTags,
        pageMessages,
        languageSwitcherHtml,
        language,
      );
      footerCache.set(key, html);
    }
    return html;
  };
  const renderFooterFor = (
    /** @type {readonly string[]} */ pageTags,
    /** @type {typeof siteMessages} */ pageMessages,
    /** @type {string} */ languageSwitcherHtml,
    /** @type {string} */ language,
  ) =>
    renderFooter({
      homeRoute,
      publicationName: publication.title,
      description: publication.description,
      brandMark,
      socialLinks: publication.socialLinks,
      rssHref,
      primaryItems: validatedInput.navigation.items,
      footerItems: validatedInput.navigation.footerItems,
      urlPrefix,
      routeProfile,
      authorHtml: footerAuthorHtmlFor(language, pageMessages),
      footerProfileHtml,
      copyrightText: `${pageMessages.footerCopyrightPrefix} ${latestYear ? `${latestYear} ` : ''}${publication.title}`,
      // The whitelabel switch: a core appearance setting, not a module.
      showAttribution:
        validatedInput.appearance.attribution?.showMadeWith !== false,
      messages: pageMessages,
      languageSwitcherHtml,
      profile: composition.profile,
      footerLayout: composition.footerLayout,
      baseUrl: validatedInput.baseUrl,
      publicBasePath,
      pageTags,
      consentOn: analyticsOn,
      contactOn,
    });

  /**
   * One page's `<header>`, with the primary navigation marking that page's
   * own route current.
   *
   * @param {string | undefined} currentRoute the page's joined route
   * @param {string} [language] the page's language (default: the site's)
   * @param {string} [languageSwitcherHtml] the language switcher markup
   * @param {boolean} [listenCurrent] whether the page is an article with
   *   audio (its Listen button opens the player instead of the playlist)
   * @returns {string}
   */
  const headerFor = (
    currentRoute,
    language = validatedInput.publication.defaultLanguage,
    languageSwitcherHtml = '',
    listenCurrent = false,
  ) => {
    const chrome = chromeFor(language);
    return renderHeader({
      homeRoute,
      publicationName: publication.title,
      tagline: publication.description,
      brandMark,
      navHtml: renderPrimaryNavigation({
        items: validatedInput.navigation.items,
        currentRoute,
        messages: chrome.messages,
        urlPrefix,
        routeProfile,
      }),
      navItems: validatedInput.navigation.items,
      currentRoute,
      urlPrefix,
      routeProfile,
      searchIndexHref,
      appearanceControlHtml: chrome.appearanceControlHtml,
      languageSwitcherHtml,
      listenNavHtml: chrome.listen
        ? listenCurrent
          ? chrome.listen.navButtonHtml
          : chrome.listen.navLinkHtml
        : '',
      messages: chrome.messages,
      headerLayout: composition.headerLayout,
    });
  };

  // The site-wide feeds, resolved once so every page's feed-discovery
  // `<link>` tags and the feed documents themselves agree on the exact same
  // self URLs.
  const siteName = validatedInput.publication.title;
  const feeds = buildFeeds(validatedInput, {
    feedBody,
    routeProfile,
    translations,
    selfUrlsOnly: single,
  });
  const absoluteSiteUrl = (/** @type {string} */ route) =>
    new URL(
      joinPublicRoute(publicBasePath, route, routeProfile),
      validatedInput.baseUrl,
    ).toString();
  // Per-language feeds, advertised in every page's `<head>` with `hreflang`.
  const languageFeedLinksHtml = feeds.languageFeeds
    .map(
      (feed) =>
        `<link rel="alternate" type="application/atom+xml" hreflang="${escapeHtml(feed.language)}" href="${escapeHtml(feed.atomSelfUrl)}" title="${escapeHtml(siteName)}">` +
        `<link rel="alternate" type="application/rss+xml" hreflang="${escapeHtml(feed.language)}" href="${escapeHtml(feed.rssSelfUrl)}" title="${escapeHtml(siteName)}">`,
    )
    .join('');
  const defaultLanguage = validatedInput.publication.defaultLanguage;
  /**
   * The compact language switcher of a page: the variants of its article
   * group, else the home page and each language's section. Empty unless the
   * site has more than one language.
   *
   * @param {import('./page-kinds.js').GeneratedPage} page
   * @returns {string}
   */
  const languageSwitcherFor = (page) => {
    if (!translations.active || translations.sections.length === 0) return '';
    const entries = page.variants ?? [
      { language: defaultLanguage, route: '/' },
      ...translations.sections.map((section) => ({
        language: section.language,
        route: `/${section.segment}`,
      })),
    ];
    const pageMessages = chromeFor(page.language).messages;
    const links = entries
      .map((entry) => {
        const current =
          entry.language.toLowerCase() === page.language.toLowerCase();
        const attrs = `class="g-chip g-lang-chip" lang="${escapeHtml(entry.language)}"`;
        const label = escapeHtml(
          languageLabel(entry.language, translations.languages),
        );
        return current
          ? `<span ${attrs} aria-current="true">${label}</span>`
          : `<a ${attrs} hreflang="${escapeHtml(entry.language)}" href="${escapeHtml(joinPublicRoute(publicBasePath, entry.route, routeProfile))}">${label}</a>`;
      })
      .join('');
    return `<nav class="g-lang-switch" aria-label="${escapeHtml(/** @type {string} */ (pageMessages.languageSwitcherLabel))}">${links}</nav>`;
  };
  const appearanceScriptHrefValue =
    appearanceBootstrapScriptHref(publicBasePath);
  // TPL-H3/TPL-M7: the template-owned gala-base stylesheet's own basePath-
  // joined href, computed the same way as the appearance script href above
  // so it can never drift from the physical file/manifest path written
  // below.
  const baseStylesheetHrefValue = joinBasePathAndRoute(
    publicBasePath,
    `/${GALA_BASE_STYLESHEET_PATH}`,
  );

  /** @type {{virtualPath: string, content: string, permalink: string, data: import('./document-shell.js').DocumentShellData}[]} */
  const contentPages = [];
  /** @type {{joinedSource: string, joinedTarget: string, publicTarget: string, filePath: string}[]} */
  const redirectProjections = [];

  const generatedPages = buildGeneratedPages(validatedInput, {
    getMessages,
    loadPolicyDefaults: ctx.loadPolicyDefaults,
    routeProfile,
    only,
    home,
    profile,
    policy,
    section,
    pageBody,
    editions,
    translations,
    mediaAssets,
    mediaDimensions,
    mediaUrlOf: urlOf,
    interactions: interactionsOn ? interactionsModule : undefined,
    analytics: analyticsOn ? analyticsModule : undefined,
    audience: { follows: followsOn, appOrigin: audienceAppOrigin },
    listen,
    composition,
  });
  /** @type {Set<string>} output paths of the interaction-bearing routes */
  const interactionBearingPaths = new Set();
  generatedPages.forEach((page, index) => {
    const joinedRoute = joinBasePathAndRoute(
      validatedInput.basePath,
      page.route,
    );
    const pageChrome = chromeFor(page.language);
    const switcherHtml = languageSwitcherFor(page);
    const bodyHtml = renderPageBody({
      messages: pageChrome.messages,
      headerHtml: headerFor(
        joinedRoute,
        page.language,
        switcherHtml,
        page.listenTrack !== undefined,
      ),
      footerHtml: footerFor(
        page.articleMeta?.tags,
        page.language,
        switcherHtml,
      ),
      mainHtml: page.bodyHtml,
      consentHtml: pageChrome.consentHtml,
      listenHtml: pageChrome.listen?.pageHtml(page.listenTrack) ?? '',
    });
    const ogImageInfo = resolveSocialImage({
      mediaAssets,
      mediaDimensions,
      reference: page.socialImageRef,
      baseUrl: validatedInput.baseUrl,
      basePath: publicBasePath,
      urlOf,
    });
    const ogImage = ogImageInfo?.url;
    const pagePermalink = projectRouteToFilePath(joinedRoute, routeProfile);
    if (page.interactionBearing) interactionBearingPaths.add(pagePermalink);
    contentPages.push({
      virtualPath: `pages/${page.kind}-${index}.html`,
      content: bodyHtml,
      permalink: pagePermalink,
      data: {
        title: page.documentTitle ?? page.title,
        ogTitle: page.socialTitle ?? page.title,
        lang: page.language,
        dir: page.direction,
        pageKind: page.kind,
        description: page.description,
        robotsContent: withTrainingOptOut(page.robotsContent, trainingBlocked),
        canonicalUrl:
          page.canonicalUrl ??
          new URL(
            joinPublicRoute(
              publicBasePath,
              page.canonicalRoute ?? page.route,
              routeProfile,
            ),
            validatedInput.baseUrl,
          ).toString(),
        siteName,
        ogType: page.ogType ?? 'website',
        ogImage,
        ogImageWidth: ogImageInfo?.width,
        ogImageHeight: ogImageInfo?.height,
        ogImageAlt: ogImage ? page.socialImageAlt : undefined,
        articlePublished: page.articleMeta?.publishedTime,
        articleModified: page.articleMeta?.modifiedTime,
        articleAuthors: page.articleMeta?.authorUrls ?? [],
        articleTags: page.articleMeta?.tags ?? [],
        jsonLd: page.jsonLd,
        twitterCard: twitterCardType(Boolean(ogImage)),
        atomFeedUrl: feeds.atomSelfUrl,
        rssFeedUrl: feeds.rssSelfUrl,
        languageFeedLinksHtml,
        hreflangLinksHtml: renderHreflangLinks(
          hreflangAlternates(page, absoluteSiteUrl),
        ),
        appearanceScriptHref: appearanceScriptHrefValue,
        interactionsScriptHref: page.interactionBearing
          ? interactionsScriptHref
          : undefined,
        // The counts script rides on exactly the pages that carry a count
        // slot, and reads its API origin and publication id from its own tag.
        ...(countsOn && page.bodyHtml.includes(COUNT_SLOT_MARKER)
          ? {
              countsScriptHref,
              countsApiOrigin: interactionsModule?.apiOrigin,
              countsPublicationId: validatedInput.publication.id,
            }
          : {}),
        // The audience script rides on exactly the pages that carry an
        // audience element; it reads its origins, publication id and return
        // address from its own tag and its sentences from a JSON data block.
        ...(audienceOn && page.bodyHtml.includes(AUDIENCE_MARKER)
          ? {
              audienceScriptHref,
              audienceApiOrigin,
              audienceAppOrigin,
              audiencePublicationId: validatedInput.publication.id,
              audienceReturnUrl: absoluteSiteUrl(page.route),
              audienceMessages: serializeAudienceMessages(pageChrome.messages),
            }
          : {}),
        // The Listen script rides on every page of a live build; its blobs and
        // UI template are at the end of the body.
        ...(listen.live ? { listenScriptHref } : {}),
        consentScriptHref,
        cspMetaTag,
        baseStylesheetHref: baseStylesheetHrefValue,
        themeStylesheetLinksHtml,
        composition,
        ...siteHeadData,
        ...colorModeData,
      },
    });
  });

  // One record's page only (`only`): no redirects, notices or site-wide
  // documents; the caller wants that page's complete document and nothing
  // else.
  if (single) {
    if (contentPages.length === 0) {
      throw new RenderOptionsError(
        home
          ? 'no home page was generated'
          : only === undefined
            ? 'no page was generated for the selected page'
            : `no page was generated for content id ${JSON.stringify(only)}`,
      );
    }
    return /** @type {PageDocuments} */ (
      /** @type {unknown} */ ({
        contentPages: contentPages.map((page) => ({
          virtualPath: page.virtualPath,
          permalink: page.permalink,
          content: renderDocument(page.data, page.content),
        })),
        redirectPages: [],
        redirectProjections: [],
        generatedPages,
        interactionBearingPaths,
        takenPermalinks: new Set(contentPages.map((page) => page.permalink)),
        feeds,
        absoluteSiteUrl,
        emailBody,
        aiPolicy,
      })
    );
  }

  // A removed post's old addresses still lead to its notice.
  for (const record of [...validatedInput.content, ...liveSplit.removed]) {
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
        publicTarget: joinPublicRoute(
          publicBasePath,
          contentRoute(record.frontmatter),
          routeProfile,
        ),
        filePath: projectRouteToFilePath(joinedSource, routeProfile),
      });
    }
  }

  const redirectPages = redirectProjections.map((projection, index) => ({
    virtualPath: `redirects/${index}.html`,
    content: renderRedirectDocument(projection.publicTarget),
    permalink: projection.filePath,
  }));

  if (contentPages.length === 0 && redirectPages.length === 0) {
    throw new RenderOptionsError(
      'build input selects no publication profile and no content; there is nothing to render',
    );
  }

  /**
   * One generated notice page (the 404, a removed post's route, `/version/`):
   * the site chrome around a single `<main>` section, `noindex, follow`, with
   * no canonical URL or image of its own.
   *
   * @param {object} notice
   * @param {string} notice.virtualPath the page's input path
   * @param {string} notice.permalink its output path
   * @param {string} notice.language its language
   * @param {string | undefined} notice.currentRoute its joined route
   * @param {string} notice.heading its heading (and title before the site name)
   * @param {string} notice.pageKind the `data-gala-page-kind` value
   * @param {(messages: typeof siteMessages) => string} notice.main the
   *   `<main>` inner HTML, given the page language's catalog
   */
  const pushNoticePage = ({
    virtualPath,
    permalink,
    language,
    currentRoute,
    heading,
    pageKind,
    main,
  }) => {
    const chrome = chromeFor(language);
    contentPages.push({
      virtualPath,
      content: renderPageBody({
        messages: chrome.messages,
        headerHtml: headerFor(currentRoute, language),
        footerHtml: footerFor([], language),
        mainHtml: main(chrome.messages),
        consentHtml: chrome.consentHtml,
        listenHtml: chrome.listen?.pageHtml(undefined) ?? '',
      }),
      permalink,
      data: {
        title: `${heading} | ${siteName}`,
        ogTitle: heading,
        lang: language,
        dir: resolveTextDirection(language),
        pageKind,
        // No `canonicalUrl`/`ogImage`: a notice has no real resource to
        // canonicalize or illustrate.
        robotsContent: withTrainingOptOut('noindex, follow', trainingBlocked),
        siteName,
        ogType: 'website',
        twitterCard: twitterCardType(false),
        atomFeedUrl: feeds.atomSelfUrl,
        rssFeedUrl: feeds.rssSelfUrl,
        languageFeedLinksHtml,
        hreflangLinksHtml: '',
        appearanceScriptHref: appearanceScriptHrefValue,
        ...(listen.live ? { listenScriptHref } : {}),
        consentScriptHref,
        cspMetaTag,
        baseStylesheetHref: baseStylesheetHrefValue,
        themeStylesheetLinksHtml,
        composition,
        ...siteHeadData,
        ...colorModeData,
      },
    });
  };

  // The one ordinary generated `404.html` error page, using the `error`
  // page kind's own pure body function. Pushed after the guard above so the
  // guard's own "is there anything authored to render" check is unaffected
  // by this always-present synthetic page.
  const errorFilePath = errorDocumentPath(validatedInput.basePath);
  pushNoticePage({
    virtualPath: 'pages/error-404.html',
    permalink: errorFilePath,
    language: defaultLanguage,
    currentRoute: undefined,
    heading: /** @type {string} */ (siteMessages.errorPageHeading),
    pageKind: 'error',
    main: (messages) => renderErrorPageBody({ messages, homeRoute }),
  });

  // A removed post's route (and any other address it had) renders a notice,
  // noindex, with no body. A route a live document also takes keeps the live
  // document.
  /** @type {Set<string>} */
  const takenPermalinks = new Set(
    [...contentPages, ...redirectPages].map((page) => page.permalink),
  );
  liveSplit.removed.forEach((record, index) => {
    const { frontmatter } = record;
    const joined = joinBasePathAndRoute(
      validatedInput.basePath,
      contentRoute(frontmatter),
    );
    const permalink = projectRouteToFilePath(joined, routeProfile);
    if (takenPermalinks.has(permalink) || !frontmatter.deleteDate) return;
    takenPermalinks.add(permalink);
    const deleteDate = frontmatter.deleteDate;
    const language = chromeFor(frontmatter.language);
    pushNoticePage({
      virtualPath: `pages/removed-${index}.html`,
      permalink,
      language: frontmatter.language,
      currentRoute: undefined,
      heading: /** @type {string} */ (language.messages.postRemovedHeading),
      pageKind: 'error',
      main: (messages) =>
        renderRemovedPostBody({ messages, deleteDate, homeRoute }),
    });
  });

  // `/version/`: what built the site, for a reader; `/version.json` is the
  // same facts for a program. A live document on the same route keeps it.
  const versionInfo = buildVersionInfo(
    validatedInput,
    TEMPLATE_RENDERER_VERSION,
  );
  const versionPagePath = projectRouteToFilePath(
    joinBasePathAndRoute(validatedInput.basePath, VERSION_PAGE_ROUTE),
    routeProfile,
  );
  if (!takenPermalinks.has(versionPagePath)) {
    pushNoticePage({
      virtualPath: 'pages/version.html',
      permalink: versionPagePath,
      language: defaultLanguage,
      currentRoute: undefined,
      heading: /** @type {string} */ (siteMessages.versionPageHeading),
      pageKind: 'policy',
      main: (messages) => renderVersionBody({ messages, info: versionInfo }),
    });
  }

  return {
    contentPages: contentPages.map((page) => ({
      virtualPath: page.virtualPath,
      permalink: page.permalink,
      content: renderDocument(page.data, page.content),
    })),
    redirectPages,
    redirectProjections,
    generatedPages,
    interactionBearingPaths,
    takenPermalinks,
    feeds,
    absoluteSiteUrl,
    versionInfo,
    errorFilePath,
    emailBody,
    aiPolicy,
  };
}

/**
 * @typedef {object} SiteContext
 * @property {Readonly<Record<string, string | ((...args: string[]) => string)>>} siteMessages the default-language catalog
 * @property {string} publicBasePath the base path emitted URLs carry
 * @property {import('../../../types/index.d.ts').InteractionsModule | undefined} interactionsModule the interactions module
 * @property {boolean} interactionsOn whether the interactions script ships
 * @property {boolean} countsOn whether the counts script ships
 * @property {boolean} followsOn whether the Follow control is on
 * @property {boolean} contactOn whether the contact form is on
 * @property {boolean} audienceOn whether the audience script ships
 * @property {string} audienceApiOrigin the audience API origin
 * @property {string} audienceAppOrigin the audience App origin
 * @property {ReturnType<typeof resolveListen>} listen the Listen decision
 */

/**
 * @typedef {object} PageDocumentsContext
 * @property {(bcp47?: string) => import('./messages-core.js').MessageCatalog} getMessages the chrome-catalog lookup
 * @property {() => import('./policy-defaults.js').SitePolicyDefaults} [loadPolicyDefaults] returns the default Terms and Privacy text, needed when the build input carries no policies
 * @property {import('./route.js').RouteNormalizationProfile} routeProfile the route normalization profile
 * @property {ReturnType<typeof import('./liveness.js').splitLiveContent>} liveSplit the live and removed records
 * @property {ReturnType<typeof import('./media/content-images.js').resolveContentImages>} contentImages the resolved body images
 * @property {import('./editions.js').EditionResolution} editions the resolved editions
 * @property {import('./translations.js').TranslationResolution} translations the resolved language variants
 * @property {SiteContext} site the site-wide facts
 * @property {{linkTagsHtml: string, composition: import('./template-composition.js').EDITORIAL_COMPOSITION, canvas: {light: string, dark: string} | undefined} | undefined} themeAssets the loaded theme, absent for the default styling
 * @property {{mediaAssets: any[], mediaDimensions: any, mediaVariants: any, urlOf?: (derivativePath: string) => string}} media the media pipeline's results; `urlOf` overrides the emitted URL of a derivative
 * @property {string} [only] a content id: build that record's page only (no
 *   redirects, notices, version page or site-wide documents; the result then
 *   carries `contentPages`, `generatedPages`, `interactionBearingPaths`,
 *   `takenPermalinks`, `feeds`, `absoluteSiteUrl`, `emailBody` and `aiPolicy`)
 * @property {boolean} [home] build the home page (route `/`, page 1 of the
 *   listing) only, with the same result shape as `only`
 * @property {boolean} [profile] build the publication's profile page only (same result shape)
 * @property {'terms' | 'privacy'} [policy] build that policy page only (same result shape)
 * @property {string} [section] a language segment: build that language section's home only (same result shape)
 * @property {(data: import('./document-shell.js').DocumentShellData, content: string) => string} [renderDocument]
 *   wraps a page's body markup in its document (default: `renderDocumentShell`)
 */

/**
 * @typedef {object} PageDocuments
 * @property {{virtualPath: string, content: string, permalink: string}[]} contentPages every HTML page as a complete document
 * @property {{virtualPath: string, content: string, permalink: string}[]} redirectPages the redirect documents
 * @property {{joinedSource: string, joinedTarget: string, publicTarget: string, filePath: string}[]} redirectProjections where each redirect points
 * @property {import('./page-kinds.js').GeneratedPage[]} generatedPages the generated pages, before the shell
 * @property {Set<string>} interactionBearingPaths output paths of the interaction-bearing routes
 * @property {Set<string>} takenPermalinks output paths the pages and redirects occupy
 * @property {ReturnType<typeof buildFeeds>} feeds the site-wide feeds
 * @property {(route: string) => string} absoluteSiteUrl a route's absolute URL
 * @property {ReturnType<typeof buildVersionInfo>} versionInfo what built the site
 * @property {string} errorFilePath the 404 page's output path
 * @property {(body: string) => string} emailBody a body's email form
 * @property {ReturnType<typeof readAiPolicy>} aiPolicy the author's AI-use choices
 */
