/**
 * Shared, template-owned presentational components used by the page kinds
 * (`internal/page-kinds.js`) and the site chrome (`internal/chrome.js`):
 * chips, meta lines, bylines, cards and the optional newsletter panel.
 *
 * Every component is a pure `(data) -> HTML string` function over already
 * validated build-input records. Every link is a real `href` (the pages read
 * completely with JavaScript off); the optional site script only enhances.
 *
 * Hook naming convention: every class this module emits is a `g-*` class.
 * Each distinct class is one published public theme hook, listed in
 * `internal/appearance/styling-contract.js`'s `COMPONENT_CLASSES`; the
 * contract drift test fails if a rendered `g-*` class is unpublished or a
 * published one is never rendered.
 */

import { RenderPolicyViolationError } from '../errors.js';
import { escapeHtml } from './skeleton.js';
import { icon } from './icons.js';
import { joinBasePathAndRoute } from './route.js';
import { resolveOriginalDerivativePath } from './seo.js';

/** Reading speed used for every reading-time estimate. */
export const WORDS_PER_MINUTE = 230;

/**
 * @param {string} html sanitized body HTML
 * @returns {string} its text content, whitespace-collapsed
 */
export function plainText(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(?:[a-z]+|#\d+|#x[0-9a-f]+);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Reading time in whole minutes: body words at 230 words per minute,
 * rounded up, never less than one minute.
 *
 * @param {string} bodyHtml sanitized body HTML
 * @returns {number} minutes (at least 1)
 */
export function readingMinutes(bodyHtml) {
  const text = plainText(bodyHtml);
  const words = text === '' ? 0 : text.split(' ').length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/**
 * Extract the `<h2 id="...">` entries of a sanitized body, in order, for the
 * article contents list.
 *
 * @param {string} bodyHtml sanitized body HTML
 * @returns {{id: string, text: string}[]} each h2's id and plain text
 */
export function extractH2Headings(bodyHtml) {
  /** @type {{id: string, text: string}[]} */
  const headings = [];
  for (const match of bodyHtml.matchAll(
    /<h2\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g,
  )) {
    headings.push({ id: match[1], text: plainText(match[2]) });
  }
  return headings;
}

/**
 * Up to two initials from a display name, uppercased (the monogram and the
 * image-less avatar fallback).
 *
 * @param {string} name a publication title or author display name
 * @returns {string} one or two characters
 */
export function monogram(name) {
  const words = name.split(/\s+/).filter(Boolean);
  const picked = words.length > 1 ? [words[0], words[1]] : [words[0] ?? ''];
  const letters = picked.map((word) => Array.from(word)[0] ?? '').join('');
  return (letters || '?').toUpperCase();
}

/**
 * Render the optional newsletter panel: a call-to-action link to the
 * sign-up page configured in `publication.newsletter` (validated by the
 * build-input schema: an `https:` URL, a title and a short text), never a
 * form. Renders nothing when the publication has no newsletter.
 *
 * @param {object} options rendering options
 * @param {{url: string, title: string, text: string} | undefined} options.newsletter
 *   `publication.newsletter`
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} options.messages
 *   the resolved message catalog
 * @returns {string} the panel markup, or an empty string
 */
export function renderNewsletterPanel({ newsletter, messages }) {
  if (!newsletter) return '';
  const { url, title, text } = newsletter;
  return (
    `<section class="g-wrap g-newsletter" aria-labelledby="newsletter-title">` +
    `<div class="g-panel">` +
    `<div class="g-panel-copy">` +
    `<p class="g-label">${icon('mail')}${escapeHtml(/** @type {string} */ (messages.newsletterLabel))}</p>` +
    `<h2 id="newsletter-title">${escapeHtml(title)}</h2>` +
    (text ? `<p>${escapeHtml(text)}</p>` : '') +
    `</div>` +
    `<a class="g-btn" href="${escapeHtml(url)}" rel="noopener">${escapeHtml(/** @type {string} */ (messages.newsletterActionLabel))}${icon('arrow')}</a>` +
    `</div></section>`
  );
}

/**
 * Build the resolver every component uses to turn an image reference into
 * its emitted URL (the media pipeline's processed original), or `undefined`
 * when the pipeline produced no derivative for it.
 *
 * @param {object} options
 * @param {readonly {path: string, mediaType: string}[]} options.mediaAssets
 *   the media pipeline's finished `assets` list
 * @param {string} options.publicBasePath the public base path
 * @returns {(ref: {path: string, sourceDigest: string} | undefined) => string | undefined}
 */
export function createMediaUrl({ mediaAssets, publicBasePath }) {
  return (ref) => {
    const derivative = resolveOriginalDerivativePath(mediaAssets, ref);
    return derivative
      ? joinBasePathAndRoute(publicBasePath, `/${derivative}`)
      : undefined;
  };
}

/**
 * Build the resolver for a processed image's URL plus its pixel dimensions
 * (from the media pipeline's own `dimensions` map), so every `<img>` can
 * carry `width`/`height` and reserve its space before the file loads.
 *
 * @param {object} options
 * @param {readonly {path: string, mediaType: string}[]} options.mediaAssets
 * @param {string} options.publicBasePath the public base path
 * @param {Readonly<Record<string, {width: number, height: number}>>} [options.mediaDimensions]
 *   the pipeline's dimensions, keyed by derivative path
 * @returns {(ref: {path: string, sourceDigest: string} | undefined) => ({url: string, width?: number, height?: number}) | undefined}
 */
export function createMediaImage({
  mediaAssets,
  publicBasePath,
  mediaDimensions = {},
}) {
  return (ref) => {
    const derivative = resolveOriginalDerivativePath(mediaAssets, ref);
    if (!derivative) return undefined;
    const size = mediaDimensions[derivative];
    return {
      url: joinBasePathAndRoute(publicBasePath, `/${derivative}`),
      width: size?.width,
      height: size?.height,
    };
  };
}

/**
 * Render one `<img>` with intrinsic `width`/`height` (when known) and the
 * right loading hints: a priority image (the page's largest above-the-fold
 * image) is `fetchpriority="high"` and never lazy; every other image is
 * `loading="lazy" decoding="async"`.
 *
 * @param {object} options
 * @param {{url: string, width?: number, height?: number}} options.image
 * @param {string} options.alt the alternative text (empty when decorative)
 * @param {string} [options.className]
 * @param {boolean} [options.priority]
 * @param {boolean} [options.eager] above-the-fold but not the page's main
 *   image (the header brand mark): no `loading="lazy"`
 * @param {{width: number, height: number}} [options.fallbackSize] used when
 *   the pipeline reported no dimensions
 * @returns {string} the `<img>` element
 */
export function renderImage({
  image,
  alt,
  className,
  priority = false,
  eager = false,
  fallbackSize,
}) {
  const width = image.width ?? fallbackSize?.width;
  const height = image.height ?? fallbackSize?.height;
  return (
    `<img${className ? ` class="${className}"` : ''} src="${escapeHtml(image.url)}" alt="${escapeHtml(alt)}"` +
    (width && height ? ` width="${width}" height="${height}"` : '') +
    (priority
      ? ' fetchpriority="high" decoding="async"'
      : eager
        ? ' decoding="async"'
        : ' loading="lazy" decoding="async"') +
    `>`
  );
}

/**
 * The widest slot a content image fills, in CSS pixels: the prose column
 * never exceeds it, so a content image's `src` is its largest output file
 * no wider than this.
 */
export const CONTENT_IMAGE_SLOT_WIDTH = 960;

/** The `sizes` value every content image carries (the slot above). */
export const CONTENT_IMAGE_SIZES = `(max-width: ${CONTENT_IMAGE_SLOT_WIDTH}px) 100vw, ${CONTENT_IMAGE_SLOT_WIDTH}px`;

/**
 * Build the two renderers for a content image (an image a body references,
 * already resolved by `media/content-images.js` and processed by the media
 * pipeline). The page form names every output file of the image in
 * `srcset`; its `src` is the largest output file no wider than
 * {@link CONTENT_IMAGE_SLOT_WIDTH}, or the original when the image has no
 * narrower file (a GIF, WebP or AVIF passes through as its original only).
 * Applied at render time only: the body's own digest is over the stored
 * bytes and is never recomputed.
 *
 * @param {object} options
 * @param {Readonly<Record<string, readonly {path: string, width: number, height: number}[]>>} options.mediaVariants
 *   the media pipeline's output files per source digest, ascending width
 * @param {string} options.publicBasePath the public base path
 * @returns {{page: (reference: {path: string, sourceDigest: string}, altAttribute: string) => string, feed: (reference: {path: string, sourceDigest: string}, altAttribute: string) => string}}
 *   the page form (responsive, lazy) and the feed form (one `src`, no
 *   loading hints); `altAttribute` is the body's own entity-encoded `alt`
 */
export function createContentImage({ mediaVariants, publicBasePath }) {
  /**
   * @param {{path: string, sourceDigest: string}} reference
   * @returns {{url: string, width: number, height: number}[]} every output
   *   file of the image, ascending width
   */
  const filesOf = (reference) => {
    const variants = mediaVariants[reference.sourceDigest] ?? [];
    if (variants.length === 0) {
      throw new RenderPolicyViolationError(
        `content image ${reference.path} has no media pipeline output; this is a renderer defect`,
      );
    }
    return variants.map((variant) => ({
      url: joinBasePathAndRoute(publicBasePath, `/${variant.path}`),
      width: variant.width,
      height: variant.height,
    }));
  };
  /**
   * @param {{url: string, width: number, height: number}[]} files
   * @returns {{url: string, width: number, height: number}} the `src` file
   */
  const fitting = (files) =>
    files.filter((file) => file.width <= CONTENT_IMAGE_SLOT_WIDTH).at(-1) ??
    files[0];
  return {
    page(reference, altAttribute) {
      const files = filesOf(reference);
      const source = fitting(files);
      const srcset = files
        .map((file) => `${file.url} ${file.width}w`)
        .join(', ');
      return (
        `<img src="${escapeHtml(source.url)}" srcset="${escapeHtml(srcset)}" sizes="${CONTENT_IMAGE_SIZES}"` +
        ` alt="${altAttribute}" width="${source.width}" height="${source.height}" loading="lazy" decoding="async">`
      );
    },
    feed(reference, altAttribute) {
      const source = fitting(filesOf(reference));
      return `<img src="${escapeHtml(source.url)}" alt="${altAttribute}" width="${source.width}" height="${source.height}">`;
    },
  };
}

/**
 * @typedef {object} ComponentContext
 * @property {Readonly<Record<string, string | ((...args: string[]) => string)>>} messages
 * @property {(route: string) => string} site joins a canonical route with
 *   the public base path
 * @property {(ref: {path: string, sourceDigest: string} | undefined) => ({url: string, width?: number, height?: number}) | undefined} mediaImage
 *   the emitted URL and dimensions of an image reference's processed derivative
 * @property {(author: import('../../../types/index.d.ts').AuthorNormalized) => string} authorHref
 *   the author page's joined route
 * @property {ReadonlyMap<string, import('../../../types/index.d.ts').AuthorNormalized>} authorsById
 * @property {(record: import('../../../types/index.d.ts').ContentBuildRecord) => string} recordHref
 *   the record's own joined route
 * @property {(tag: string) => string} tagHref
 */

/**
 * Build the component renderers bound to one build's context.
 *
 * @param {ComponentContext} context
 * @returns {{text: (key: string) => string, call: (key: string, ...args: string[]) => string, chip: (tag: string) => string, meta: (record: import('../../../types/index.d.ts').ContentBuildRecord, showUpdated?: boolean) => string, avatar: (author: import('../../../types/index.d.ts').AuthorNormalized | undefined) => string, byline: (record: import('../../../types/index.d.ts').ContentBuildRecord, showUpdated?: boolean) => string, card: (record: import('../../../types/index.d.ts').ContentBuildRecord, options?: {partLabel?: string, headingLevel?: number}, variant?: 'grid' | 'row') => string, recordAuthors: (record: import('../../../types/index.d.ts').ContentBuildRecord) => import('../../../types/index.d.ts').AuthorNormalized[]}}
 *   the bound renderers
 */
export function createComponents(context) {
  const { messages, mediaImage, authorsById, recordHref, tagHref } = context;
  /**
   * @param {string} key a plain message key
   * @returns {string} the escaped message text
   */
  const text = (key) => escapeHtml(/** @type {string} */ (messages[key]));
  /**
   * @param {string} key a function message key
   * @param {...string} args the message function's arguments
   * @returns {string} the escaped message text
   */
  const call = (key, ...args) =>
    escapeHtml(
      /** @type {(...a: string[]) => string} */ (messages[key])(...args),
    );

  /**
   * @param {string} tag
   * @returns {string}
   */
  const chip = (tag) =>
    `<a class="g-chip" href="${escapeHtml(tagHref(tag))}">${escapeHtml(tag)}</a>`;

  /**
   * @param {import('../../../types/index.d.ts').ContentBuildRecord} record
   * @param {boolean} [showUpdated] append the "Updated" date when the
   *   record was modified after publication
   * @returns {string}
   */
  const meta = (record, showUpdated = false) => {
    const { publishedAt, updatedAt } = record.frontmatter;
    const formatDate = /** @type {(iso: string) => string} */ (
      messages.formatDate
    );
    const updated =
      showUpdated && updatedAt && updatedAt !== publishedAt
        ? `<span class="g-dot" aria-hidden="true"></span><time datetime="${escapeHtml(updatedAt)}">` +
          `${call('updatedLabel', formatDate(updatedAt))}</time>`
        : '';
    return (
      `<span class="g-meta"><time datetime="${escapeHtml(publishedAt)}">` +
      `${call('formatDate', publishedAt)}</time>` +
      `<span class="g-dot" aria-hidden="true"></span>` +
      `<span>${icon('clock')}${call('readingTimeLabel', String(readingMinutes(record.body)))}</span>${updated}</span>`
    );
  };

  /**
   * @param {import('../../../types/index.d.ts').AuthorNormalized | undefined} author
   * @returns {string}
   */
  const avatar = (author) => {
    const image = mediaImage(author?.avatar);
    return image
      ? renderImage({
          image,
          alt: '',
          className: 'g-avatar',
          fallbackSize: { width: 40, height: 40 },
        })
      : `<span class="g-avatar" aria-hidden="true">${escapeHtml(monogram(author?.displayName ?? ''))}</span>`;
  };

  /**
   * @param {import('../../../types/index.d.ts').ContentBuildRecord} record
   * @returns {import('../../../types/index.d.ts').AuthorNormalized[]}
   */
  const recordAuthors = (record) =>
    record.frontmatter.authorIds.flatMap((id) => {
      const author = authorsById.get(id);
      return author ? [author] : [];
    });

  /**
   * @param {import('../../../types/index.d.ts').ContentBuildRecord} record
   * @param {boolean} [showUpdated] show the "Updated" date (article head)
   * @returns {string}
   */
  const byline = (record, showUpdated = false) => {
    const authors = recordAuthors(record);
    const names = authors
      .map(
        (author) =>
          `<a href="${escapeHtml(context.authorHref(author))}">${escapeHtml(author.displayName)}</a>`,
      )
      .join(', ');
    return (
      `<div class="g-byline">${avatar(authors[0])}` +
      `<div class="g-byline-text"><span>${names}</span>${meta(record, showUpdated)}</div></div>`
    );
  };

  /**
   * @param {import('../../../types/index.d.ts').ContentBuildRecord} record
   * @param {{partLabel?: string, headingLevel?: number}} [options] an
   *   optional series part label and the title's heading level (default 3)
   * @param {'grid' | 'row'} [variant]
   * @returns {string}
   */
  const card = (record, options = {}, variant = 'grid') => {
    const fm = record.frontmatter;
    const href = escapeHtml(recordHref(record));
    const hero = mediaImage(fm.hero?.file);
    const media = hero
      ? `<figure class="g-card-media">${renderImage({ image: hero, alt: fm.hero?.role === 'decorative' ? '' : (fm.hero?.alt ?? '') })}</figure>`
      : `<div class="g-card-placeholder" aria-hidden="true">${icon('sparkle')}</div>`;
    const seriesTag = options.partLabel
      ? `<span class="g-series-tag">${icon('book')}${escapeHtml(options.partLabel)}</span>`
      : '';
    const firstTag = fm.tags[0];
    return (
      `<article class="g-card${variant === 'row' ? ' g-card-row' : ''}">` +
      media +
      `<div class="g-card-body">` +
      `<div class="g-card-top">${firstTag ? chip(firstTag) : ''}${seriesTag}</div>` +
      `<h${options.headingLevel ?? 3}><a class="g-card-link" href="${href}">${escapeHtml(fm.title)}</a></h${options.headingLevel ?? 3}>` +
      (fm.description
        ? `<p class="g-card-excerpt">${escapeHtml(fm.description)}</p>`
        : '') +
      `<div class="g-card-foot">${meta(record)}<span aria-hidden="true">${icon('arrow')}</span></div>` +
      `</div></article>`
    );
  };

  return {
    text,
    call,
    chip,
    meta,
    avatar,
    byline,
    card,
    recordAuthors,
  };
}
