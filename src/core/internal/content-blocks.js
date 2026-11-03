/**
 * Render-time forms of a body's blocks and galleries.
 *
 * A stored body is language-neutral policy output. The fenced blocks it holds
 * (`fenced-blocks.js`: `video`, `bookmark`, `file` cards) are therefore plain
 * `<figure>` markup with the author's own text; this module gives each its
 * page form (icons, the sentences of the page's language, a file's size and
 * emitted address) and its lean feed/email form, and wraps runs of image-only
 * paragraphs in a gallery. It works on exactly the markup the sanitizer
 * produces and leaves anything that does not match untouched, so a body it
 * does not recognise renders as stored. Pure string functions; no Node API.
 *
 * Images (a video's poster, a gallery's pictures) stay `<img src alt>` here;
 * `rewriteBodyImages` replaces them afterwards, so the media pipeline still
 * decides every image file.
 */

import { icon } from './icons.js';
import { VIDEO_PROVIDERS } from './render-policy-content.js';
import { escapeHtml, unescapeHtml } from './skeleton.js';

/** @typedef {Readonly<Record<string, string | ((...args: string[]) => string)>>} Messages */
/** @typedef {(rawHref: string) => {url: string, bytes?: number} | undefined} FileResolver */

/** The exact opening of the attribute a video card carries: its page marker. */
export const VIDEO_MARKER = ' data-gala-video="';

/** @type {string} the click-to-play script's output-relative path */
export const VIDEO_SCRIPT_PATH = 'assets/gala-video-v1.js';

/** @type {string} */
export const VIDEO_SCRIPT_MEDIA_TYPE = 'application/javascript; charset=utf-8';

const VIDEO =
  /<figure class="g-video" data-gala-block="video" data-gala-video="(youtube|vimeo):([^"]+)"><a href="([^"]*)" rel="noopener noreferrer">(<img [^>]*>)?<strong>(.*?)<\/strong><\/a><\/figure>/g;
const BOOKMARK =
  /<figure class="g-bookmark" data-gala-block="bookmark"><a href="([^"]*)" rel="noopener noreferrer"><strong>(.*?)<\/strong>(?:<small>(.*?)<\/small>)?<em>(.*?)<\/em><\/a><\/figure>/g;
const FILE =
  /<figure class="g-file" data-gala-block="file"><a href="([^"]*)"><strong>(.*?)<\/strong>(?:<small>(.*?)<\/small>)?<\/a><\/figure>/g;

const GALLERY_PARAGRAPH = '<p>(?:\\s*<img\\b[^>]*>)+\\s*</p>';
const GALLERY_RUN = new RegExp(
  `${GALLERY_PARAGRAPH}(?:\\s*${GALLERY_PARAGRAPH})+`,
  'g',
);

/**
 * @param {Messages} messages a chrome catalog
 * @param {string} key the message key
 * @param {...string} args the message's arguments
 * @returns {string} the sentence, HTML-escaped
 */
function say(messages, key, ...args) {
  const value = messages[key];
  return escapeHtml(
    typeof value === 'function' ? value(...args) : String(value),
  );
}

/**
 * @param {number} bytes a file's length
 * @returns {string} `812 B`, `340 KB` or `1.2 MB` (units are not translated)
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, '')} MB`;
}

/**
 * Wrap every run of two or more adjacent image-only paragraphs in a
 * `<div class="g-gallery" data-count="N">` (N is the number of images). The
 * paragraphs stay as they are inside it.
 *
 * @param {string} body a policy-conformant body
 * @returns {string} the body with its galleries wrapped
 */
export function wrapGalleries(body) {
  return body.replace(GALLERY_RUN, (run) => {
    const count = run.match(/<img\b/g)?.length ?? 0;
    return `<div class="g-gallery" data-count="${count}">${run}</div>`;
  });
}

/**
 * @param {string} title the card's escaped title
 * @param {string | undefined} description the escaped description
 * @param {string} meta the card's last line (markup)
 * @returns {string} the text column of a card
 */
function cardText(title, description, meta) {
  return (
    `<span class="g-block__text"><strong class="g-block__title">${title}</strong>` +
    (description === undefined
      ? ''
      : `<span class="g-block__desc">${description}</span>`) +
    `<span class="g-block__meta">${meta}</span></span>`
  );
}

/**
 * The page form of a body's blocks: link cards with icons and the page
 * language's sentences.
 *
 * @param {string} body a policy-conformant body
 * @param {object} options
 * @param {Messages} options.messages the page's chrome catalog
 * @param {FileResolver} options.resolveFile a file block's emitted address
 * @returns {string} the body with its blocks drawn
 */
export function decorateBlocks(body, { messages, resolveFile }) {
  return body
    .replace(VIDEO, (_all, provider, id, href, image, title) => {
      const watch = say(
        messages,
        'videoOpenOnLabel',
        VIDEO_PROVIDERS[provider].name,
      );
      return (
        `<figure class="g-video" data-gala-block="video" data-gala-video="${provider}:${id}">` +
        `<a class="g-block g-block--video" href="${href}" rel="noopener noreferrer">` +
        `<span class="g-block__media">${image ?? ''}<span class="g-block__play" aria-hidden="true">${icon('play')}</span></span>` +
        cardText(
          `<span class="g-sr">${say(messages, 'videoPlayLabel')} </span>${title}`,
          undefined,
          watch,
        ) +
        `</a></figure>`
      );
    })
    .replace(BOOKMARK, (_all, href, title, description, site) => {
      const read = say(messages, 'bookmarkReadOnLabel', unescapeHtml(site));
      return (
        `<figure class="g-bookmark" data-gala-block="bookmark">` +
        `<a class="g-block g-block--bookmark" href="${href}" rel="noopener noreferrer">` +
        cardText(title, description, `${icon('upright')}${read}`) +
        `</a></figure>`
      );
    })
    .replace(FILE, (_all, href, title, description) => {
      const file = resolveFile(href);
      const label =
        file?.bytes === undefined
          ? 'PDF'
          : say(messages, 'fileDownloadLabel', formatFileSize(file.bytes));
      return (
        `<figure class="g-file" data-gala-block="file">` +
        `<a class="g-block g-block--file" href="${escapeHtml(file?.url ?? unescapeHtml(href))}" download>` +
        `<span class="g-block__media g-block__media--icon" aria-hidden="true">${icon('file')}</span>` +
        cardText(title, description, `${icon('download')}${label}`) +
        `</a></figure>`
      );
    });
}

/**
 * The feed and email form of a body's blocks: the stored cards, with a file's
 * link pointed at the emitted file (the feed or email then makes it absolute
 * like every other link).
 *
 * @param {string} body a policy-conformant body
 * @param {FileResolver} resolveFile a file block's emitted address
 * @returns {string} the body with its file links resolved
 */
export function leanBlocks(body, resolveFile) {
  return body.replace(FILE, (all, href) => {
    const file = resolveFile(href);
    return file === undefined
      ? all
      : all.replace(`<a href="${href}">`, `<a href="${escapeHtml(file.url)}">`);
  });
}
