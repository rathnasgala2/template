/**
 * The picture a post shows where the post is summarised (cards, the home
 * hero, `og:image`) when its frontmatter carries no `hero`.
 *
 * A content record's `body` is already render-policy-conformant HTML (the
 * authored Markdown after `normalizeAuthoredMarkdown`), so inline images
 * (`![alt](assets/x.png)`), `./`-prefixed paths and reference-style images
 * (`![alt][ref]` with a `[ref]: assets/x.png` definition) have all become
 * `<img src alt>` elements by the time this module sees them; code samples
 * are `<pre>`/`<code>` text whose `<` is entity-encoded. The scan is
 * therefore over `<img>` elements, with the same path rule the prose
 * renderer resolves them by (`media/content-images.js`).
 */

import { unescapeHtml } from './skeleton.js';
import { repositoryPathOfImageSource } from './media/content-images.js';

/** Code regions, removed before the scan so an image shown as code is skipped. */
const CODE_REGION = /<pre\b[\s\S]*?<\/pre>|<code\b[\s\S]*?<\/code>/g;

const IMG_ELEMENT = /<img\b[^>]*>/g;
const ATTRIBUTE = /\s([a-zA-Z][a-zA-Z0-9-]*)="([^"]*)"/g;

/** The media types a card picture may be (same set as body images). */
const IMAGE_MEDIA_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'image/gif',
]);

/**
 * @param {string} body a content record's policy-conformant HTML body
 * @returns {{path: string, alt: string} | undefined} the first image whose
 *   source is a repository-relative `assets/` path (remote, `data:` and
 *   code-region images are skipped), with its decoded alt text
 */
export function firstBodyImage(body) {
  for (const element of body.replace(CODE_REGION, '').match(IMG_ELEMENT) ??
    []) {
    /** @type {{src?: string, alt?: string}} */
    const attributes = {};
    for (const [, name, value] of element.matchAll(ATTRIBUTE)) {
      if (name === 'src' || name === 'alt') attributes[name] = value;
    }
    const path = repositoryPathOfImageSource(attributes.src);
    if (path?.startsWith('assets/')) {
      return { path, alt: unescapeHtml(attributes.alt ?? '') };
    }
  }
  return undefined;
}

/** @type {WeakMap<object, unknown>} */
const cache = new WeakMap();

/**
 * The picture a record shows on cards, the home hero and as its social
 * image: `frontmatter.hero` when present, else the first body image that the
 * record's own `media[]` inventories (so it carries the `sourceDigest` the
 * media pipeline processed it by). Computed once per record.
 *
 * @param {import('../../../types/index.d.ts').ContentBuildRecord} record
 * @returns {{file: {path: string, sourceDigest: string}, alt?: string, role: 'informative' | 'decorative'} | undefined}
 */
export function cardMediaOf(record) {
  if (cache.has(record)) {
    return /** @type {ReturnType<typeof cardMediaOf>} */ (cache.get(record));
  }
  /** @type {ReturnType<typeof cardMediaOf>} */
  let media = /** @type {any} */ (record.frontmatter.hero);
  if (!media) {
    const image = firstBodyImage(record.body);
    const entry = image
      ? record.media?.find(
          (file) =>
            file.path === image.path && IMAGE_MEDIA_TYPES.has(file.mediaType),
        )
      : undefined;
    if (image && entry) {
      media = {
        file: { path: entry.path, sourceDigest: entry.sourceDigest },
        alt: image.alt,
        role: 'informative',
      };
    }
  }
  cache.set(record, media);
  return media;
}
