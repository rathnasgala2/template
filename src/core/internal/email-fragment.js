/**
 * Email fragments: the full-post body of each published post as email-safe
 * HTML, at `/_gala/email/<content id>.html`. They exist only when the site's
 * newsletter is in Galascribe mode with `emailContent: "full"`; the API
 * fetches one after the generation that carries the post is certified live and
 * puts it into the newsletter email. (`emailContent: "card"` mails the title,
 * description, image and a Read the post button, and needs no fragment.)
 *
 * A fragment is not a page of the site:
 *
 * - it is not a {@link import('./page-kinds.js').GeneratedPage}, so it is in no
 *   sitemap, feed, search index or `llms` file by construction, and it carries
 *   `<meta name="robots" content="noindex">` for any crawler that finds it;
 * - it is a plain document (no theme, no site script, no stylesheet link, no
 *   CSP tag): `<html>`, a `<head>` of charset, robots and title, and a `<body>`
 *   holding one `<div data-gala-email-body lang dir>` with the post's body;
 * - the body is the post's sanitized HTML (no script, form, iframe or event
 *   attribute can be in it), with a leading heading that repeats the title
 *   dropped, every link and image `src` absolute, every image the largest
 *   responsive derivative of its source, the class, id and `<span>` wrappers
 *   that only a stylesheet needs removed (code blocks stay `<pre><code>` text),
 *   and a style attribute only on the elements an email client would otherwise
 *   draw bare: `<pre>`, `<code>`, `<blockquote>`, tables, `<hr>`, `<figure>`
 *   and `<img>`. Rewriting is tag by tag: text, code samples that show markup
 *   included, is never touched.
 *
 * Every post in the build gets one, in its own language, whatever the
 * newsletter flag of its front matter says; the API decides what to send.
 */

import {
  contentRoute,
  dropLeadingTitleHeading,
  selectPublishedArticles,
} from './page-kinds.js';
import { escapeHtml, unescapeHtml } from './skeleton.js';
import { resolveTextDirection } from './text-direction.js';

/** @type {string} the un-joined directory of the fragments */
export const EMAIL_FRAGMENT_DIRECTORY = '/_gala/email';

/**
 * @param {string} contentId a post's front-matter id
 * @returns {string} the fragment's un-joined route
 */
export function emailFragmentRoute(contentId) {
  return `${EMAIL_FRAGMENT_DIRECTORY}/${contentId}.html`;
}

/**
 * @param {import('../../../types/index.d.ts').PublicationNormalized} publication
 * @returns {boolean} whether the site mails full posts through Galascribe
 */
export function emailFragmentsOn(publication) {
  const newsletter = publication.newsletter;
  return (
    newsletter?.mode === 'galascribe' && newsletter.emailContent === 'full'
  );
}

const MONO = "Menlo,Consolas,'Courier New',monospace";
const RULE = '1px solid #d0d7de';

/**
 * The inline styles, by the bare tag an email client would otherwise draw
 * without them.
 *
 * @type {Readonly<Record<string, string>>}
 */
const TAG_STYLES = Object.freeze({
  pre: `margin:16px 0;padding:12px;background:#f6f8fa;border:${RULE};border-radius:6px;overflow:auto;white-space:pre-wrap;word-wrap:break-word;font-family:${MONO};font-size:13px;line-height:1.45`,
  code: `font-family:${MONO};font-size:0.9em`,
  blockquote: `margin:16px 0;padding:0 0 0 16px;border-left:4px solid #d0d7de;color:#57606a`,
  table: 'border-collapse:collapse;margin:16px 0',
  th: `border:${RULE};padding:6px 12px;text-align:left;background:#f6f8fa`,
  td: `border:${RULE};padding:6px 12px;text-align:left`,
  hr: `border:0;border-top:${RULE};margin:24px 0`,
  figure: 'margin:16px 0',
});

/**
 * A start or end tag of sanitizer output: attribute values are entity-encoded
 * and a literal `<` in text is `&lt;`, so a `<` that starts a tag always ends
 * at the next `>`. Text, including code samples that show markup, is never
 * touched.
 */
const TAG = /<(\/?)([a-z][a-z0-9]*)((?:\s[^<>]*?)?)(\s*\/)?>/gi;
const ATTRIBUTE = /\s([a-z][a-z-]*)="([^"]*)"/gi;

/**
 * Make a body email-safe, tag by tag: drop `<span>` wrappers and the `class`
 * and `id` attributes only a stylesheet or an in-page anchor could use, make
 * every link and image address absolute against the post's URL, and add the
 * inline styles above. The input is the render policy's sanitizer output (plus
 * the images already rewritten), whose tag forms are fixed.
 *
 * @param {string} html sanitized body HTML, images already rewritten
 * @param {string} pageUrl the post's absolute URL, which relative addresses
 *   resolve against
 * @returns {string} the email-safe HTML
 */
export function toEmailSafeHtml(html, pageUrl) {
  /** @param {string} value an entity-decoded address */
  const absolute = (value) => {
    try {
      return new URL(value, pageUrl).toString();
    } catch {
      return value;
    }
  };
  return html.replace(TAG, (tag, closing, rawName, attributes, slash) => {
    const name = rawName.toLowerCase();
    if (name === 'span') return '';
    if (closing) return tag;
    let kept = '';
    for (const match of attributes.matchAll(ATTRIBUTE)) {
      const attribute = match[1].toLowerCase();
      if (attribute === 'class' || attribute === 'id') continue;
      kept +=
        (name === 'a' && attribute === 'href') ||
        (name === 'img' && attribute === 'src')
          ? ` ${attribute}="${escapeHtml(absolute(unescapeHtml(match[2])))}"`
          : match[0];
    }
    const style = TAG_STYLES[name];
    return `<${name}${kept}${style ? ` style="${style}"` : ''}${slash ? ' /' : ''}>`;
  });
}

/**
 * One fragment document.
 *
 * @param {object} options
 * @param {string} options.title the post title
 * @param {string} options.language the post's BCP-47 language
 * @param {string} options.bodyHtml the email-safe body
 * @returns {string} the document
 */
export function renderEmailFragment({ title, language, bodyHtml }) {
  const lang = escapeHtml(language);
  const dir = resolveTextDirection(language);
  return (
    `<!doctype html>\n<html lang="${lang}" dir="${dir}"><head><meta charset="utf-8">` +
    `<meta name="robots" content="noindex"><title>${escapeHtml(title)}</title></head>` +
    `<body><div data-gala-email-body lang="${lang}" dir="${dir}">${bodyHtml}</div></body></html>\n`
  );
}

/**
 * Every published post's fragment.
 *
 * @param {import('../../../types/index.d.ts').NormalizedBuildInput} validatedInput
 * @param {object} options
 * @param {(body: string) => string} options.emailBody turns a body into its
 *   email form (every image naming its largest derivative)
 * @param {(route: string) => string} options.absoluteUrl a post route's
 *   absolute public URL
 * @returns {{contentId: string, route: string, content: string}[]} one per
 *   published post, in the page order (newest first)
 */
export function buildEmailFragments(
  validatedInput,
  { emailBody, absoluteUrl },
) {
  return selectPublishedArticles(validatedInput.content).map((record) => {
    const { frontmatter } = record;
    const bodyHtml = toEmailSafeHtml(
      emailBody(dropLeadingTitleHeading(record.body, frontmatter.title)),
      absoluteUrl(contentRoute(frontmatter)),
    );
    return {
      contentId: frontmatter.id,
      route: emailFragmentRoute(frontmatter.id),
      content: renderEmailFragment({
        title: frontmatter.title,
        language: frontmatter.language,
        bodyHtml,
      }),
    };
  });
}
