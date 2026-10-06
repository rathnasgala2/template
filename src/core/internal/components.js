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
 * sign-up page the author configured in publication settings, never a form.
 * Reads `publication.newsletter` defensively: absent, or without an
 * `https:` `url`, renders nothing.
 *
 * @param {object} options rendering options
 * @param {unknown} options.newsletter `publication.newsletter` (may be
 *   undefined on a build input that predates the field)
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} options.messages
 *   the resolved message catalog
 * @returns {string} the panel markup, or an empty string
 */
export function renderNewsletterPanel({ newsletter, messages }) {
  const value = /** @type {Record<string, unknown> | undefined} */ (
    newsletter && typeof newsletter === 'object' ? newsletter : undefined
  );
  if (!value || typeof value.url !== 'string' || !/^https:\/\//.test(value.url))
    return '';
  const title =
    typeof value.title === 'string' && value.title !== ''
      ? value.title
      : /** @type {string} */ (messages.newsletterLabel);
  const text = typeof value.text === 'string' ? value.text : '';
  return (
    `<section class="g-wrap g-newsletter" aria-labelledby="newsletter-title">` +
    `<div class="g-panel">` +
    `<div class="g-panel-copy">` +
    `<p class="g-label">${icon('mail')}${escapeHtml(/** @type {string} */ (messages.newsletterLabel))}</p>` +
    `<h2 id="newsletter-title">${escapeHtml(title)}</h2>` +
    (text ? `<p>${escapeHtml(text)}</p>` : '') +
    `</div>` +
    `<a class="g-btn" href="${escapeHtml(value.url)}" rel="noopener">${escapeHtml(/** @type {string} */ (messages.newsletterActionLabel))}${icon('arrow')}</a>` +
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
 * @typedef {object} ComponentContext
 * @property {Readonly<Record<string, string | ((...args: string[]) => string)>>} messages
 * @property {(route: string) => string} site joins a canonical route with
 *   the public base path
 * @property {(ref: {path: string, sourceDigest: string} | undefined) => string | undefined} mediaUrl
 *   the emitted URL of an image reference's processed derivative
 * @property {ReadonlyMap<string, import('../../../types/index.d.ts').AuthorNormalized>} authorsById
 * @property {(record: import('../../../types/index.d.ts').ContentBuildRecord) => string} recordHref
 *   the record's own joined route
 * @property {(tag: string) => string} tagHref
 */

/**
 * Build the component renderers bound to one build's context.
 *
 * @param {ComponentContext} context
 * @returns {{text: (key: string) => string, call: (key: string, ...args: string[]) => string, chip: (tag: string) => string, meta: (record: import('../../../types/index.d.ts').ContentBuildRecord) => string, avatar: (author: import('../../../types/index.d.ts').AuthorNormalized | undefined) => string, byline: (record: import('../../../types/index.d.ts').ContentBuildRecord) => string, card: (record: import('../../../types/index.d.ts').ContentBuildRecord, options?: {partLabel?: string, headingLevel?: number}, variant?: 'grid' | 'row') => string, recordAuthors: (record: import('../../../types/index.d.ts').ContentBuildRecord) => import('../../../types/index.d.ts').AuthorNormalized[]}}
 *   the bound renderers
 */
export function createComponents(context) {
  const { messages, mediaUrl, authorsById, recordHref, tagHref } = context;
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
   * @returns {string}
   */
  const meta = (record) =>
    `<span class="g-meta"><time datetime="${escapeHtml(record.frontmatter.publishedAt)}">` +
    `${call('formatDate', record.frontmatter.publishedAt)}</time>` +
    `<span class="g-dot" aria-hidden="true"></span>` +
    `<span>${icon('clock')}${call('readingTimeLabel', String(readingMinutes(record.body)))}</span></span>`;

  /**
   * @param {import('../../../types/index.d.ts').AuthorNormalized | undefined} author
   * @returns {string}
   */
  const avatar = (author) => {
    const url = mediaUrl(author?.avatar);
    return url
      ? `<img class="g-avatar" src="${escapeHtml(url)}" alt="" width="40" height="40" loading="lazy">`
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
   * @returns {string}
   */
  const byline = (record) => {
    const authors = recordAuthors(record);
    const names = authors
      .map(
        (author) =>
          `<a href="${escapeHtml(context.site(`/authors/${author.id}`))}">${escapeHtml(author.displayName)}</a>`,
      )
      .join(', ');
    return (
      `<div class="g-byline">${avatar(authors[0])}` +
      `<div class="g-byline-text"><span>${names}</span>${meta(record)}</div></div>`
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
    const heroUrl = mediaUrl(fm.hero?.file);
    const media = heroUrl
      ? `<figure class="g-card-media"><img src="${escapeHtml(heroUrl)}" alt="${escapeHtml(fm.hero?.role === 'decorative' ? '' : (fm.hero?.alt ?? ''))}" loading="lazy"></figure>`
      : `<div class="g-card-placeholder" aria-hidden="true">${icon('sparkle')}</div>`;
    const seriesTag = options.partLabel
      ? `<span class="g-series-tag">${icon('book')}${escapeHtml(options.partLabel)}</span>`
      : '';
    const firstTag = fm.tags[0];
    return (
      `<article class="g-card${variant === 'row' ? ' g-card-row' : ''}">` +
      `<a class="g-card-link" href="${href}" aria-label="${escapeHtml(fm.title)}"></a>` +
      media +
      `<div class="g-card-body">` +
      `<div class="g-card-top">${firstTag ? chip(firstTag) : ''}${seriesTag}</div>` +
      `<h${options.headingLevel ?? 3}>${escapeHtml(fm.title)}</h${options.headingLevel ?? 3}>` +
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
