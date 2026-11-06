/**
 * The outer HTML document every page is wrapped in: `<head>` metadata, the
 * appearance wiring and the `<body>` attributes around a page's complete body
 * markup (`skeleton.js#renderPageBody`). Pure string assembly, byte-for-byte
 * what the Nunjucks layout this replaced produced: interpolated values are
 * escaped as Nunjucks' autoescape did (`& " ' < > \` become entities), an
 * absent value renders as nothing, and only the values the layout marked
 * `| safe` go in as markup.
 */

import {
  APPEARANCE_ALLOWED_ATTRIBUTE,
  APPEARANCE_DEFAULT_ATTRIBUTE,
  APPEARANCE_RESOLVED_MODE_ATTRIBUTE,
  APPEARANCE_ROOT_ATTRIBUTE,
} from './appearance/contract.js';
import { PAGE_KIND_ATTRIBUTE } from './page-kinds.js';

/** @type {Readonly<Record<string, string>>} */
const ESCAPES = Object.freeze({
  '&': '&amp;',
  '"': '&quot;',
  "'": '&#39;',
  '<': '&lt;',
  '>': '&gt;',
  '\\': '&#92;',
});

/**
 * Escape a value for an HTML text or attribute position; null and undefined
 * render as nothing.
 *
 * @param {unknown} value the value
 * @returns {string} the escaped text
 */
function esc(value) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/[&"'<>\\]/g, (ch) => ESCAPES[ch]);
}

/**
 * A value inserted as markup, unescaped; null and undefined render as nothing.
 *
 * @param {unknown} value the value
 * @returns {string} the text
 */
function raw(value) {
  return value === undefined || value === null ? '' : String(value);
}

/**
 * @typedef {object} DocumentShellData
 * @property {string} lang the page language
 * @property {string} [dir] `ltr` or `rtl`
 * @property {string} resolvedColorMode the server-rendered colour mode
 * @property {string} colorModeDefault the author's default mode
 * @property {string} colorModeAllowed the allowed modes, space separated
 * @property {string} colorScheme the `color-scheme` meta value
 * @property {string} cspMetaTag the CSP `<meta>` element
 * @property {string} [iconHref] the site icon
 * @property {string} [iconType] the site icon's media type
 * @property {boolean} [appleTouchIcon] whether to add the touch icon
 * @property {readonly {color: string, media?: string}[]} [themeColors] browser chrome colours
 * @property {string} appearanceScriptHref the appearance bootstrap script
 * @property {string} [interactionsScriptHref] the interactions script
 * @property {string} [countsScriptHref] the counts script
 * @property {string} [signalsScriptHref] the reading-signals script (Today), only on article pages with the interactions root
 * @property {string} [countsApiOrigin] the counts API origin
 * @property {string} [countsPublicationId] the publication id for counts
 * @property {string} [audienceScriptHref] the audience script
 * @property {string} [audienceMessages] the audience sentences, as JSON
 * @property {string} [audienceApiOrigin] the audience API origin
 * @property {string} [audienceAppOrigin] the audience App origin
 * @property {string} [audiencePublicationId] the publication id for the audience script
 * @property {string} [audienceReturnUrl] the return address
 * @property {string} [videoScriptHref] the click-to-play video script, only on a page with a video card
 * @property {string} [listenScriptHref] the Listen script
 * @property {string} [consentScriptHref] the consent script
 * @property {string} title the document title
 * @property {string} [description] the plain-text description
 * @property {string} [robotsContent] the robots directive
 * @property {string} [canonicalUrl] the canonical URL
 * @property {string} siteName the publication title
 * @property {string} ogType the Open Graph type
 * @property {string} ogTitle the Open Graph and Twitter title
 * @property {string} [ogImage] the social image URL
 * @property {number | string} [ogImageWidth] its width
 * @property {number | string} [ogImageHeight] its height
 * @property {string} [ogImageAlt] its alt text
 * @property {string} [articlePublished] the article's published time
 * @property {string} [articleModified] the article's modified time
 * @property {readonly string[]} [articleAuthors] the article's author URLs
 * @property {readonly string[]} [articleTags] the article's tags
 * @property {string} twitterCard the Twitter card type
 * @property {string} [jsonLd] the page's JSON-LD, already escaped for embedding
 * @property {string} atomFeedUrl the Atom feed URL
 * @property {string} rssFeedUrl the RSS feed URL
 * @property {string} languageFeedLinksHtml the per-language feed links
 * @property {string} hreflangLinksHtml the hreflang alternates
 * @property {string} baseStylesheetHref the template base stylesheet
 * @property {string} themeStylesheetLinksHtml the theme `<link>` elements
 * @property {string} pageKind the `data-gala-page-kind` value
 * @property {Record<string, string>} composition the structural composition
 */

/**
 * Wrap a page's body markup in the document shell.
 *
 * @param {DocumentShellData} data the per-page values
 * @param {string} content the page's complete body markup
 * @returns {string} the complete document, ending in a newline
 */
export function renderDocumentShell(data, content) {
  const d = data;
  const composition = d.composition;
  let colour = `<meta name="color-scheme" content="${esc(d.colorScheme)}">`;
  if (d.iconHref) {
    colour += `<link rel="icon" href="${esc(d.iconHref)}"${d.iconType ? ` type="${esc(d.iconType)}"` : ''}>`;
    if (d.appleTouchIcon) {
      colour += `<link rel="apple-touch-icon" href="${esc(d.iconHref)}">`;
    }
  }
  for (const themeColor of d.themeColors ?? []) {
    colour += `<meta name="theme-color" content="${esc(themeColor.color)}"${themeColor.media ? ` media="${esc(themeColor.media)}"` : ''}>`;
  }

  let scripts = `<script src="${esc(d.appearanceScriptHref)}"></script>`;
  if (d.interactionsScriptHref) {
    scripts += `<script src="${esc(d.interactionsScriptHref)}" defer></script>`;
  }
  if (d.countsScriptHref) {
    scripts += `<script src="${esc(d.countsScriptHref)}" defer data-api-origin="${esc(d.countsApiOrigin)}" data-publication-id="${esc(d.countsPublicationId)}"></script>`;
  }
  if (d.signalsScriptHref) {
    scripts += `<script src="${esc(d.signalsScriptHref)}" defer data-gala-signals-script></script>`;
  }
  if (d.audienceScriptHref) {
    scripts += `<script type="application/json" data-gala-audience-messages>${raw(d.audienceMessages)}</script><script src="${esc(d.audienceScriptHref)}" defer data-gala-audience-script data-api-origin="${esc(d.audienceApiOrigin)}" data-app-origin="${esc(d.audienceAppOrigin)}" data-publication-id="${esc(d.audiencePublicationId)}" data-canonical-url="${esc(d.audienceReturnUrl)}"></script>`;
  }
  if (d.videoScriptHref) {
    scripts += `<script src="${esc(d.videoScriptHref)}" defer data-gala-video-script></script>`;
  }
  if (d.listenScriptHref) {
    scripts += `<script src="${esc(d.listenScriptHref)}" defer data-gala-listen-script></script>`;
  }
  if (d.consentScriptHref) {
    scripts += `<script src="${esc(d.consentScriptHref)}" defer></script>`;
  }

  let image = '';
  if (d.ogImage) {
    image += `<meta property="og:image" content="${esc(d.ogImage)}">`;
    if (d.ogImageWidth) {
      image += `<meta property="og:image:width" content="${esc(d.ogImageWidth)}">`;
    }
    if (d.ogImageHeight) {
      image += `<meta property="og:image:height" content="${esc(d.ogImageHeight)}">`;
    }
    if (d.ogImageAlt) {
      image += `<meta property="og:image:alt" content="${esc(d.ogImageAlt)}">`;
    }
  }
  let twitterImage = '';
  if (d.ogImage) {
    twitterImage += `<meta name="twitter:image" content="${esc(d.ogImage)}">`;
    if (d.ogImageAlt) {
      twitterImage += `<meta name="twitter:image:alt" content="${esc(d.ogImageAlt)}">`;
    }
  }
  let authors = '';
  for (const authorUrl of d.articleAuthors ?? []) {
    authors += `<meta property="article:author" content="${esc(authorUrl)}">`;
  }
  let tags = '';
  for (const articleTag of d.articleTags ?? []) {
    tags += `<meta property="article:tag" content="${esc(articleTag)}">`;
  }

  return [
    '<!doctype html>',
    `<html lang="${esc(d.lang)}" dir="${esc(d.dir)}" ${APPEARANCE_ROOT_ATTRIBUTE} ${APPEARANCE_RESOLVED_MODE_ATTRIBUTE}="${esc(d.resolvedColorMode)}" ${APPEARANCE_DEFAULT_ATTRIBUTE}="${esc(d.colorModeDefault)}" ${APPEARANCE_ALLOWED_ATTRIBUTE}="${esc(d.colorModeAllowed)}">`,
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    raw(d.cspMetaTag),
    colour,
    scripts,
    `<title>${esc(d.title)}</title>`,
    d.description
      ? `<meta name="description" content="${esc(d.description)}">`
      : '',
    d.robotsContent
      ? `<meta name="robots" content="${esc(d.robotsContent)}">`
      : '',
    d.canonicalUrl
      ? `<link rel="canonical" href="${esc(d.canonicalUrl)}">`
      : '',
    `<meta property="og:site_name" content="${esc(d.siteName)}">`,
    d.canonicalUrl
      ? `<meta property="og:url" content="${esc(d.canonicalUrl)}">`
      : '',
    `<meta property="og:type" content="${esc(d.ogType)}">`,
    `<meta property="og:title" content="${esc(d.ogTitle)}">`,
    d.description
      ? `<meta property="og:description" content="${esc(d.description)}">`
      : '',
    image,
    d.articlePublished
      ? `<meta property="article:published_time" content="${esc(d.articlePublished)}">`
      : '',
    d.articleModified
      ? `<meta property="article:modified_time" content="${esc(d.articleModified)}">`
      : '',
    authors,
    tags,
    `<meta name="twitter:card" content="${esc(d.twitterCard)}">`,
    `<meta name="twitter:title" content="${esc(d.ogTitle)}">`,
    d.description
      ? `<meta name="twitter:description" content="${esc(d.description)}">`
      : '',
    twitterImage,
    d.jsonLd
      ? `<script type="application/ld+json">${raw(d.jsonLd)}</script>`
      : '',
    `<link rel="alternate" type="application/atom+xml" href="${esc(d.atomFeedUrl)}" title="${esc(d.siteName)}">`,
    `<link rel="alternate" type="application/rss+xml" href="${esc(d.rssFeedUrl)}" title="${esc(d.siteName)}">${raw(d.languageFeedLinksHtml)}${raw(d.hreflangLinksHtml)}`,
    `<link rel="stylesheet" href="${esc(d.baseStylesheetHref)}">`,
    raw(d.themeStylesheetLinksHtml),
    '</head>',
    `<body ${PAGE_KIND_ATTRIBUTE}="${esc(d.pageKind)}" data-gala-profile="${esc(composition?.profile)}" data-gala-home-layout="${esc(composition?.homeLayout)}" data-gala-article-layout="${esc(composition?.articleLayout)}" data-gala-author-layout="${esc(composition?.authorLayout)}" data-gala-listing-layout="${esc(composition?.listingLayout)}" data-gala-header-layout="${esc(composition?.headerLayout)}" data-gala-footer-layout="${esc(composition?.footerLayout)}" data-gala-media-ratio="${esc(composition?.mediaRatio)}" data-gala-density="${esc(composition?.density)}">`,
    raw(content),
    '</body>',
    '</html>',
    '',
  ].join('\n');
}
