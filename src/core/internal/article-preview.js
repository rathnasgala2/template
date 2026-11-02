/**
 * The browser preview: the complete document of ONE page (any content kind,
 * the home page or a language section home, the profile page, a policy page),
 * built by the code `renderPublication` builds that page with
 * (`site-render.js#buildPageDocuments` with a one-page selector, which runs
 * `page-kinds.js#buildGeneratedPages`, `skeleton.js#renderPageBody` and
 * `document-shell.js#renderDocumentShell`). This module only turns a
 * friendlier input into the structures that code reads, synthesizes the media
 * the page needs from caller-supplied images (no media pipeline runs), and
 * applies the five named preview differences, each only when asked.
 *
 * Browser-safe: it imports no `node:` module, no Eleventy and no schema
 * validator (`test/browser-safe-imports.test.js` and the dependency rules keep
 * that true).
 */

import { deriveSiteContext, buildPageDocuments } from './site-render.js';
import { GALA_BASE_STYLESHEET_SOURCE } from './appearance/base-layer.js';
import { derivePaletteSheet } from './appearance/palette-derive.js';
import {
  computeBodyDigest,
  normalizeAuthoredMarkdown,
} from './content-security.js';
import { contentRoute } from './page-kinds.js';
import { sha256HexOfText } from './sha256.js';
import { escapeHtml } from './skeleton.js';
import { assembleThemeLinks } from './theme-links.js';
import {
  EDITORIAL_COMPOSITION,
  assertSupportedComposition,
} from './template-composition.js';
import { resolveContentImages } from './media/content-images.js';
import { resolveEditions } from './editions.js';
import { splitLiveContent } from './liveness.js';
import { renderDocumentShell } from './document-shell.js';
import { makeInteractive, validateInteractive } from './interactive-preview.js';
import { buildSearchIndex } from './search-index.js';
import { readSitePolicyDefaults } from './policy-defaults.js';
import { SITE_POLICY_DEFAULTS_JSON } from './policy-defaults-data.js';
import { resolveTranslations } from './translations.js';
import { utf8Bytes } from './utf8.js';
import { BuildInputValidationError } from '../errors.js';

/**
 * The input was malformed or incomplete; nothing was rendered. `issues` lists
 * every problem found, each naming the field.
 */
export class PreviewInputError extends Error {
  /** @param {readonly string[]} issues what was wrong */
  constructor(issues) {
    super(
      `the preview input is invalid: ${issues.slice(0, 5).join('; ')}${issues.length > 5 ? `; and ${issues.length - 5} more` : ''}`,
    );
    this.name = 'PreviewInputError';
    /** @type {readonly string[]} */
    this.issues = issues;
  }
}

/** The template's base layer stylesheet, exactly as a built site serves it. */
export const BASE_LAYER_CSS = GALA_BASE_STYLESHEET_SOURCE;

/** @typedef {'content' | 'home' | 'profile' | 'policy' | 'contact'} PreviewKind */

const PREVIEW_KEYS = new Set([
  'inlineStyles',
  'omitScripts',
  'contentSecurityPolicy',
  'inertLinks',
  'colorMode',
  'interactive',
]);
const IMAGE_TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};

/**
 * @param {unknown} value any value
 * @returns {value is Record<string, any>} whether it is a plain object
 */
function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The address rules of the build's schemas, mirrored so the preview refuses
 * what a build would refuse to publish. Navigation `route` is the navigation
 * schema's `canonicalRoute` pattern; `url` is `urlHttps` (`^https://` with no
 * credentials); a social or author link `uri` is `^mailto:` for type "email"
 * and `urlHttps` for every other type (navigation 2.0.0, publication and
 * author schemas); `uri` is also at most 2048 characters.
 */
const CANONICAL_ROUTE = /^\/(?!\/)(?!.*\/\/)(?!.*[?#]).*$/s;
const URL_HTTPS = /^https:\/\/(?![^/?#]*@)/;
const MAILTO = /^mailto:/;

/**
 * @param {unknown} value a rejected address
 * @returns {string} its scheme (`javascript:`) or, without one, the text
 */
function describeAddress(value) {
  const text = String(value);
  const scheme = /^\s*([a-z][a-z0-9+.-]*:)/i.exec(text);
  if (scheme) return scheme[1].toLowerCase();
  return JSON.stringify(text.length > 60 ? `${text.slice(0, 60)}...` : text);
}

/**
 * @param {unknown} value the candidate address
 * @param {RegExp} rule the schema pattern it must match
 * @param {string} field its field path in messages
 * @param {(ok: boolean, what: string) => void} need records a failed check
 * @returns {void}
 */
function checkAddress(value, rule, field, need) {
  if (value === undefined) return;
  need(
    typeof value === 'string' && rule.test(value),
    `${field} uses an address the site can't publish (${describeAddress(value)})`,
  );
}

/**
 * @param {unknown} items a navigation `items` or `footerItems` list
 * @param {string} label its field path
 * @param {(ok: boolean, what: string) => void} need records a failed check
 * @returns {void}
 */
function checkNavigation(items, label, need) {
  if (!Array.isArray(items)) return;
  for (const [index, item] of items.entries()) {
    if (!isObject(item)) continue;
    const at = `${label}[${index}]`;
    checkAddress(item.route, CANONICAL_ROUTE, `${at}.route`, need);
    checkAddress(item.url, URL_HTTPS, `${at}.url`, need);
    checkNavigation(item.children, `${at}.children`, need);
  }
}

/**
 * @param {unknown} links a `socialLinks` or author `links` list
 * @param {string} label its field path
 * @param {(ok: boolean, what: string) => void} need records a failed check
 * @returns {void}
 */
function checkSocialLinks(links, label, need) {
  if (!Array.isArray(links)) return;
  for (const [index, link] of links.entries()) {
    if (!isObject(link)) continue;
    const field = `${label}[${index}].uri`;
    checkAddress(
      link.uri,
      link.type === 'email' ? MAILTO : URL_HTTPS,
      field,
      need,
    );
    need(
      typeof link.uri !== 'string' || link.uri.length <= 2048,
      `${field} is longer than the site can publish (2048 characters)`,
    );
  }
}

/**
 * Check one post of the input (the article, or an entry of a home page's
 * `posts`), each failure naming its field under `label`.
 *
 * @param {any} post the candidate post
 * @param {string} label its field path in messages
 * @param {any} input the whole input (for its authors)
 * @param {(ok: boolean, what: string) => void} need records a failed check
 * @param {(v: unknown) => boolean} str whether a value is a non-empty string
 * @param {readonly string[]} kinds the content kinds the entry may have
 * @returns {void}
 */
function checkPost(post, label, input, need, str, kinds) {
  need(isObject(post), `${label} must be an object`);
  if (isObject(post)) {
    const front = post.frontmatter;
    need(isObject(front), `${label}.frontmatter must be an object`);
    if (isObject(front)) {
      for (const key of ['id', 'title', 'language', 'slug', 'publishedAt']) {
        need(str(front[key]), `${label}.frontmatter.${key} must be a string`);
      }
      need(
        Array.isArray(front.authorIds) && front.authorIds.length > 0,
        `${label}.frontmatter.authorIds must list at least one author id`,
      );
      need(
        front.kind === undefined || kinds.includes(front.kind),
        `${label}.frontmatter.kind must be ${kinds.map((k) => `"${k}"`).join(' or ')}`,
      );
      const known = new Set(
        (input.authors ?? []).map((/** @type {any} */ a) => a?.id),
      );
      for (const id of front.authorIds ?? []) {
        need(known.has(id), `${label} author ${id} is not in authors`);
      }
    }
    need(
      typeof post.markdown === 'string' || typeof post.bodyHtml === 'string',
      `${label} needs markdown or bodyHtml`,
    );
  }
}

/**
 * @param {any} body a `{markdown}` or `{html}` body
 * @param {string} label its field path in messages
 * @param {(ok: boolean, what: string) => void} need records a failed check
 * @returns {void}
 */
function checkBody(body, label, need) {
  need(
    isObject(body) &&
      (typeof body.markdown === 'string' || typeof body.html === 'string'),
    `${label} must be {markdown} or {html}`,
  );
}

/**
 * Cheap structural validation: the fields the article page cannot render
 * without, each failure naming its field. (The full schema validator is not
 * part of the preview.)
 *
 * @param {any} input the candidate input
 * @param {any} options the candidate options
 * @param {PreviewKind} kind which renderer the input is for
 * @returns {void}
 * @throws {PreviewInputError} listing every problem
 */
function validate(input, options, kind) {
  /** @type {string[]} */
  const issues = [];
  const need = (/** @type {boolean} */ ok, /** @type {string} */ what) => {
    if (!ok) issues.push(what);
  };
  const str = (/** @type {unknown} */ v) => typeof v === 'string' && v !== '';
  need(isObject(input), 'input must be an object');
  if (!isObject(input)) throw new PreviewInputError(issues);
  const { publication, post, baseUrl } = input;
  need(isObject(publication), 'publication must be an object');
  if (isObject(publication)) {
    need(str(publication.title), 'publication.title must be a string');
    need(
      str(publication.defaultLanguage),
      'publication.defaultLanguage must be a BCP-47 tag',
    );
    need(str(publication.id), 'publication.id must be a string');
  }
  need(
    Array.isArray(input.authors) && input.authors.length > 0,
    'authors must list at least one author',
  );
  for (const [index, author] of (input.authors ?? []).entries()) {
    need(
      isObject(author) && str(author.id) && str(author.displayName),
      `authors[${index}] needs id and displayName`,
    );
  }
  need(isObject(input.navigation), 'navigation must be an object');
  if (isObject(input.navigation)) {
    checkNavigation(input.navigation.items, 'navigation.items', need);
    checkNavigation(
      input.navigation.footerItems,
      'navigation.footerItems',
      need,
    );
  }
  if (isObject(publication)) {
    checkSocialLinks(publication.socialLinks, 'publication.socialLinks', need);
    if (
      isObject(publication.newsletter) &&
      publication.newsletter.mode !== 'galascribe'
    ) {
      checkAddress(
        publication.newsletter.url,
        URL_HTTPS,
        'publication.newsletter.url',
        need,
      );
    }
  }
  for (const [index, author] of (input.authors ?? []).entries()) {
    if (isObject(author)) {
      checkSocialLinks(author.links, `authors[${index}].links`, need);
    }
  }
  need(
    isObject(input.appearance) &&
      isObject(input.appearance.colorMode) &&
      str(input.appearance.colorMode.default) &&
      Array.isArray(input.appearance.colorMode.allowed),
    'appearance.colorMode must be {default, allowed}',
  );
  const allKinds = ['article', 'edition', 'page'];
  if (kind === 'content') {
    checkPost(post, 'post', input, need, str, allKinds);
  } else {
    // The home page lists the posts; the system pages take them only for the
    // language variants and the navigation they show.
    need(
      kind === 'home'
        ? Array.isArray(input.posts)
        : input.posts === undefined || Array.isArray(input.posts),
      'posts must be an array',
    );
    for (const [index, entry] of (input.posts ?? []).entries()) {
      checkPost(entry, `posts[${index}]`, input, need, str, allKinds);
    }
  }
  if (kind === 'profile') {
    const profile = input.profile;
    need(isObject(profile), 'profile must be an object');
    if (isObject(profile)) {
      need(
        str(profile.route) && profile.route.startsWith('/'),
        'profile.route must be a route starting with "/"',
      );
      checkBody(profile.body, 'profile.body', need);
    }
  }
  if (kind === 'contact') {
    const form = isObject(publication) ? publication.contactForm : undefined;
    need(
      isObject(form) && form.enabled === true,
      'publication.contactForm.enabled must be true for the contact page',
    );
    if (isObject(form) && form.intro !== undefined) {
      checkBody(form.intro, 'publication.contactForm.intro', need);
    }
  }
  if (kind === 'policy') {
    need(
      input.policies === undefined || isObject(input.policies),
      'policies must be an object',
    );
    for (const page of ['terms', 'privacy']) {
      const entry = input.policies?.[page];
      if (input.policies === undefined) break;
      need(
        isObject(entry) && str(entry.title),
        `policies.${page}.title must be a string`,
      );
      checkBody(entry?.body, `policies.${page}.body`, need);
    }
  }
  need(
    typeof baseUrl === 'string' && /^https?:\/\//.test(baseUrl),
    'baseUrl must be an absolute http(s) URL',
  );
  need(
    typeof input.basePath === 'string' && input.basePath.startsWith('/'),
    'basePath must start with "/"',
  );
  need(
    input.siblings === undefined || Array.isArray(input.siblings),
    'siblings must be an array',
  );
  need(
    input.media === undefined || isObject(input.media),
    'media must be an object keyed by repository path',
  );
  for (const [path, image] of Object.entries(input.media ?? {})) {
    const im = /** @type {any} */ (image);
    need(
      isObject(im) &&
        str(im.url) &&
        Number.isInteger(im.width) &&
        im.width > 0 &&
        Number.isInteger(im.height) &&
        im.height > 0,
      `media["${path}"] needs url, width and height`,
    );
  }
  need(
    isObject(options) && typeof options.getMessages === 'function',
    'options.getMessages is required (see loadMessagesFor and previewLanguages)',
  );
  if (isObject(options) && options.preview !== undefined) {
    need(isObject(options.preview), 'options.preview must be an object');
    for (const key of Object.keys(options.preview ?? {})) {
      need(
        PREVIEW_KEYS.has(key),
        `options.preview.${key} is not a preview option`,
      );
    }
    const mode = options.preview?.colorMode;
    need(
      mode === undefined || mode === 'light' || mode === 'dark',
      'options.preview.colorMode must be "light" or "dark"',
    );
    validateInteractive(options.preview ?? {}, need);
    const csp = options.preview?.contentSecurityPolicy;
    need(
      csp === undefined || (typeof csp === 'string' && !/["<>]/.test(csp)),
      'options.preview.contentSecurityPolicy must be a policy string without quotes or angle brackets',
    );
  }
  if (issues.length > 0) throw new PreviewInputError(issues);
}

/**
 * @param {any} input the preview input (article or home)
 * @returns {string[]} every BCP-47 tag the render may ask the message lookup
 *   for: pass it to `loadMessagesFor`
 */
export function previewLanguages(input) {
  const tags = new Set([input.publication.defaultLanguage]);
  for (const entry of [
    ...(input.post ? [input.post] : []),
    ...(input.siblings ?? []),
    ...(input.posts ?? []),
  ]) {
    if (entry.frontmatter?.language) tags.add(entry.frontmatter.language);
  }
  return [...tags];
}

/**
 * @param {string} path a repository path
 * @param {Record<string, any>} media the caller's images
 * @returns {string} the image's source digest: its own when supplied, else a
 *   stable digest of its path
 */
function digestOf(path, media) {
  return media[path]?.sourceDigest ?? `sha256:${sha256HexOfText(path)}`;
}

/**
 * Turn the caller's images into what the renderer reads of a media pipeline
 * run: derivative asset rows (one `original`), pixel dimensions, output files
 * per source digest, and the URL each synthetic derivative path stands for.
 *
 * @param {Record<string, any>} media images by repository path
 * @returns {{
 *   mediaAssets: {path: string, mediaType: string}[],
 *   mediaDimensions: Record<string, {width: number, height: number}>,
 *   mediaVariants: Record<string, {path: string, width: number, height: number}[]>,
 *   urlOf: (derivativePath: string) => string,
 *   inventory: {path: string, sourceDigest: string, mediaType: string, byteLength: number}[],
 * }} the synthesized results
 */
function synthesizeMedia(media) {
  /** @type {{path: string, mediaType: string}[]} */
  const mediaAssets = [];
  /** @type {Record<string, {width: number, height: number}>} */
  const mediaDimensions = {};
  /** @type {Record<string, {path: string, width: number, height: number}[]>} */
  const mediaVariants = {};
  /** @type {Map<string, string>} */
  const urls = new Map();
  /** @type {{path: string, sourceDigest: string, mediaType: string, byteLength: number}[]} */
  const inventory = [];
  const seen = new Set();
  for (const [path, image] of Object.entries(media)) {
    const sourceDigest = digestOf(path, media);
    const mediaType = image.mediaType ?? 'image/png';
    inventory.push({ path, sourceDigest, mediaType, byteLength: 0 });
    if (seen.has(sourceDigest)) continue;
    seen.add(sourceDigest);
    const hex = sourceDigest.replace(/^sha256:/, '');
    const extension =
      /** @type {Record<string, string>} */ (IMAGE_TYPES)[mediaType] ?? 'png';
    const original = `assets/media/${hex}/original.${extension}`;
    mediaAssets.push({ path: original, mediaType });
    mediaDimensions[original] = { width: image.width, height: image.height };
    urls.set(original, image.url);
    mediaVariants[sourceDigest] = (
      image.variants ?? [
        { url: image.url, width: image.width, height: image.height },
      ]
    ).map(
      (
        /** @type {{url: string, width: number, height: number}} */ v,
        /** @type {number} */ index,
      ) => {
        const variantPath = `assets/media/${hex}/v${index}.${extension}`;
        urls.set(variantPath, v.url);
        return { path: variantPath, width: v.width, height: v.height };
      },
    );
  }
  return {
    mediaAssets,
    mediaDimensions,
    mediaVariants,
    urlOf: (derivativePath) => urls.get(derivativePath) ?? derivativePath,
    inventory,
  };
}

/**
 * @param {{path: string} | undefined} ref a file reference
 * @param {Record<string, any>} media the caller's images
 * @param {string} where the field, for the warning
 * @param {string[]} warnings collects missing images
 * @returns {{path: string, sourceDigest: string} | undefined} the reference
 *   with its digest set, or undefined when absent
 */
function fileRef(ref, media, where, warnings) {
  if (!ref) return undefined;
  if (!media[ref.path]) {
    warnings.push(
      `${where} names ${ref.path}, which has no entry in media; the page shows its fallback`,
    );
  }
  return { path: ref.path, sourceDigest: digestOf(ref.path, media) };
}

/**
 * @param {any} supplied a post's front matter as supplied
 * @param {Record<string, any>} media the caller's images
 * @param {string[]} warnings collects missing images
 * @returns {any} front matter in the build-input shape
 */
function normalizeFrontmatter(supplied, media, warnings) {
  // Absent and `undefined` mean the same: an `undefined` must not shadow a default.
  const frontmatter = Object.fromEntries(
    Object.entries(supplied).filter(([, value]) => value !== undefined),
  );
  const where = `${frontmatter.slug}`;
  return {
    kind: 'article',
    status: 'published',
    tags: [],
    redirects: [],
    createdAt: frontmatter.publishedAt,
    ...frontmatter,
    ...(frontmatter.hero
      ? {
          hero: {
            ...frontmatter.hero,
            file: fileRef(
              frontmatter.hero.file,
              media,
              `${where} hero`,
              warnings,
            ),
          },
        }
      : {}),
    ...(frontmatter.socialImage
      ? {
          socialImage: fileRef(
            frontmatter.socialImage,
            media,
            `${where} socialImage`,
            warnings,
          ),
        }
      : {}),
  };
}

/**
 * @param {any} entry a post or sibling as supplied
 * @param {Record<string, any>} media the caller's images
 * @param {ReturnType<typeof synthesizeMedia>['inventory']} inventory the
 *   image inventory every record shares
 * @param {string[]} warnings collects missing images
 * @param {boolean} full whether to compute the body digest
 * @returns {import('../../../types/index.d.ts').ContentBuildRecord} the record
 */
function toRecord(entry, media, inventory, warnings, full) {
  const frontmatter = normalizeFrontmatter(entry.frontmatter, media, warnings);
  const body =
    typeof entry.bodyHtml === 'string'
      ? entry.bodyHtml
      : typeof entry.markdown === 'string'
        ? normalizeAuthoredMarkdown(entry.markdown).html
        : '';
  return {
    frontmatter,
    body,
    bodyMediaType: 'text/html',
    bodyDigest: full ? computeBodyDigest(body) : '',
    renderPolicy: { name: 'preview', version: '0', digest: '' },
    sourcePath: `content/${frontmatter.slug}.md`,
    sourceRevision: '',
    sourceDigest: '',
    resolvedAuthorIds: frontmatter.authorIds,
    media: inventory,
  };
}

/**
 * @param {{markdown?: string, html?: string} | undefined} body an authored body
 * @param {string} sourcePath where it stands in the repository
 * @returns {import('../../../types/index.d.ts').RenderableBody} the body in
 *   the build-input shape (normalized HTML)
 */
function renderableBody(body, sourcePath) {
  return {
    sourcePath,
    sourceDigest: '',
    bodyMediaType: 'text/html',
    bodyDigest: '',
    renderPolicy: { name: 'preview', version: '0', digest: '' },
    body:
      typeof body?.html === 'string'
        ? body.html
        : normalizeAuthoredMarkdown(String(body?.markdown ?? '')).html,
  };
}

/** @type {Readonly<import('./policy-defaults.js').SitePolicyDefaults> | undefined} */
let policyDefaults;

/**
 * The shipped Terms and Privacy text, from the generated module (the browser
 * reads no file); the same document the build reads from the schemas package.
 *
 * @returns {Readonly<import('./policy-defaults.js').SitePolicyDefaults>} the defaults
 */
function loadPolicyDefaults() {
  policyDefaults ??= readSitePolicyDefaults(() => SITE_POLICY_DEFAULTS_JSON);
  return policyDefaults;
}

/**
 * Inline `<style>` elements for a preview, replacing `<link rel="stylesheet">`.
 *
 * @param {string} css the stylesheet text
 * @param {string} role what it is (`base`, a theme file name, `palette`)
 * @param {string} [media] a media attribute (a print stylesheet)
 * @returns {string} the element
 */
function inlineStyle(css, role, media) {
  if (/<\/style/i.test(css)) {
    throw new PreviewInputError([`stylesheet ${role} contains "</style"`]);
  }
  return `<style data-gala-preview-style="${escapeHtml(role)}"${media ? ` media="${escapeHtml(media)}"` : ''}>${css}</style>`;
}

/**
 * Make every anchor in a fragment inert: its `href` removed and kept out of
 * the tab order.
 *
 * @param {string} html markup
 * @returns {string} the markup with inert anchors
 */
function makeLinksInert(html) {
  return html.replace(/<a\b([^>]*)>/g, (_whole, attributes) => {
    const rest = attributes.replace(/\shref="[^"]*"/, '');
    return `<a${rest} tabindex="-1">`;
  });
}

/**
 * Build the theme's `<link>` rows and palette sheet from the caller's theme.
 *
 * @param {any} theme the caller's theme
 * @param {any} input the preview input
 * @param {string} publicBasePath the public base path
 * @returns {{
 *   linkTagsHtml: string,
 *   canvas: {light: string, dark: string} | undefined,
 *   composition: ReturnType<typeof assertSupportedComposition>,
 *   sheets: {role: string, css: string, media?: string}[],
 * }} what the page assembly reads, and the sheets as text
 */
function buildTheme(theme, input, publicBasePath) {
  if (!isObject(theme) || !isObject(theme.themeJson)) {
    throw new PreviewInputError([
      'theme.themeJson must be the parsed theme.json',
    ]);
  }
  const stylesheets = (theme.stylesheets ?? []).map(
    (/** @type {any} */ sheet, /** @type {number} */ index) => {
      if (
        !isObject(sheet) ||
        typeof sheet.filename !== 'string' ||
        (typeof sheet.css !== 'string' && !(sheet.css instanceof Uint8Array))
      ) {
        throw new PreviewInputError([
          `theme.stylesheets[${index}] needs filename and css`,
        ]);
      }
      const bytes =
        typeof sheet.css === 'string' ? utf8Bytes(sheet.css) : sheet.css;
      return {
        filename: sheet.filename,
        relativePath: sheet.relativePath ?? sheet.filename,
        bytes,
      };
    },
  );
  /** @type {ReturnType<typeof assertSupportedComposition>} */
  let composition;
  try {
    composition = assertSupportedComposition(theme.themeJson.composition);
  } catch (error) {
    throw new PreviewInputError([
      `theme.themeJson.composition: ${/** @type {Error} */ (error).message}`,
    ]);
  }
  const links = assembleThemeLinks({
    themeJson: theme.themeJson,
    stylesheets,
    basePath: input.basePath,
    publicBasePath,
    appearanceTokens: input.appearance.tokens ?? {},
  });
  const decoder = new TextDecoder();
  const sheets = stylesheets.map(
    (
      /** @type {{filename: string, relativePath: string, bytes: Uint8Array}} */ sheet,
    ) => ({
      role: sheet.relativePath,
      css: decoder.decode(sheet.bytes),
      media: sheet.filename === 'print.css' ? 'print' : undefined,
    }),
  );
  const palette = /** @type {{bytes: Uint8Array}} */ (links.files.at(-1));
  sheets.push({
    role: 'palette',
    css: decoder.decode(palette.bytes),
    media: undefined,
  });
  return {
    linkTagsHtml: links.linkTagsHtml,
    canvas: links.canvas,
    composition,
    sheets,
  };
}

/**
 * Derive the publication palette stylesheet of a theme and the author's
 * `appearance.tokens`, byte-identical to the `assets/gala-palette-*.css` a
 * built site serves for the same inputs (the one check not made is the
 * derived values against the theme-contract token grammar, which needs the
 * schema validator).
 *
 * @param {Record<string, unknown>} themeJson the parsed `theme.json`
 * @param {unknown} [appearanceTokens] `appearance.tokens` (default `{}`)
 * @returns {{css: string, fileName: string, canvas: {light: string, dark: string} | undefined}}
 *   the sheet text, its content-addressed file name and the page canvas colour
 *   per mode
 * @throws {import('../errors.js').ThemeAssetError} `APPEARANCE_PALETTE_INVALID`
 *   or `APPEARANCE_PALETTE_CONTRAST`
 */
export function buildPaletteCss(themeJson, appearanceTokens = {}) {
  const sheet = derivePaletteSheet(themeJson, appearanceTokens);
  return {
    css: sheet.text,
    fileName: sheet.fileName,
    canvas: sheet.canvas,
  };
}

/**
 * Everything a preview render needs, derived from the input: the structures
 * `buildPageDocuments` reads, with the five preview differences folded into
 * `renderDocument`. Shared by the article and the home renderers.
 *
 * @param {any} input the preview input
 * @param {any} options the render options
 * @param {PreviewKind} kind which renderer the input is for
 * @returns {{
 *   warnings: string[],
 *   post: import('../../../types/index.d.ts').ContentBuildRecord | undefined,
 *   pageContext: Omit<Parameters<typeof buildPageDocuments>[1], 'only' | 'home' | 'profile' | 'policy' | 'section'>,
 *   validatedInput: import('../../../types/index.d.ts').NormalizedBuildInput,
 *   translations: import('./translations.js').TranslationResolution,
 * }} the pieces the two renderers finish with
 */
function prepare(input, options, kind) {
  validate(input, options, kind);
  const preview = options.preview ?? {};
  const getMessages = options.getMessages;
  const routeProfile = options.routeNormalizationProfile ?? 'directory-index';
  /** @type {string[]} */
  const warnings = [];
  const media = input.media ?? {};
  const synthesized = synthesizeMedia(media);

  const authors = input.authors.map((/** @type {any} */ author) => ({
    biography: '',
    links: [],
    localized: [],
    sourcePath: `content/authors/${author.id}.md`,
    sourceDigest: '',
    ...author,
    ...(author.avatar
      ? {
          avatar: fileRef(
            author.avatar,
            media,
            `author ${author.displayName} avatar`,
            warnings,
          ),
        }
      : {}),
  }));
  const publication = {
    authorIds: authors.map((/** @type {any} */ a) => a.id),
    socialLinks: [],
    canonicalBase: input.baseUrl,
    slug: 'preview',
    description: '',
    sourcePath: 'content/publication.md',
    sourceDigest: '',
    ...input.publication,
    ...(input.publication.defaultImage
      ? {
          defaultImage: fileRef(
            input.publication.defaultImage,
            media,
            'publication.defaultImage',
            warnings,
          ),
        }
      : {}),
    ...(input.publication.footerCard
      ? {
          footerCard: {
            authorIds: [],
            ...input.publication.footerCard,
            body: renderableBody(
              input.publication.footerCard.body,
              'content/footer.md',
            ),
          },
        }
      : {}),
    ...(input.publication.contactForm?.intro
      ? {
          contactForm: {
            ...input.publication.contactForm,
            intro: renderableBody(
              input.publication.contactForm.intro,
              'gala/theme-pages/contact.md',
            ),
          },
        }
      : {}),
    ...(input.profile
      ? {
          profile: {
            route: input.profile.route,
            body: renderableBody(input.profile.body, 'content/about.md'),
          },
        }
      : {}),
  };
  const policies = input.policies
    ? Object.fromEntries(
        ['terms', 'privacy'].map((page) => [
          page,
          {
            title: input.policies[page].title,
            body: renderableBody(
              input.policies[page].body,
              `content/${page}.md`,
            ),
          },
        ]),
      )
    : undefined;
  const appearance = {
    theme: '',
    headerComposition: 'mark-and-name',
    footerComposition: 'profile',
    typeScale: 'compact',
    fontAssets: [],
    tokens: {},
    source: { kind: 'authored', sourcePath: '', sourceDigest: '' },
    ...input.appearance,
    ...(input.appearance.brandMark
      ? {
          brandMark: fileRef(
            input.appearance.brandMark,
            media,
            'appearance.brandMark',
            warnings,
          ),
        }
      : {}),
  };
  const article = kind === 'content';
  const toRecords = (
    /** @type {any[]} */ entries,
    /** @type {boolean} */ full,
  ) =>
    entries.map((entry) =>
      toRecord(entry, media, synthesized.inventory, warnings, full),
    );
  // The article page needs its own body digest; a listing never shows one.
  const [post] = article ? toRecords([input.post], true) : [undefined];
  const siblings = toRecords(
    article ? (input.siblings ?? []) : (input.posts ?? []),
    false,
  );
  const buildEpoch = input.buildEpoch ?? new Date().toISOString();
  const liveSplit = splitLiveContent(
    post ? [post, ...siblings] : siblings,
    buildEpoch,
  );
  if (post && !liveSplit.live.includes(post)) {
    throw new PreviewInputError([
      `post.frontmatter.deleteDate (${post.frontmatter.deleteDate}) has passed; the page is not live`,
    ]);
  }
  /** @type {import('../../../types/index.d.ts').NormalizedBuildInput} */
  const validatedInput = /** @type {any} */ ({
    publication,
    authors,
    content: liveSplit.live,
    navigation: {
      items: [],
      footerItems: [],
      source: { kind: 'authored', sourcePath: '', sourceDigest: '' },
      ...input.navigation,
    },
    appearance,
    modules: input.modules ?? {},
    buildEpoch,
    baseUrl: input.baseUrl,
    basePath: input.basePath,
    placements: [],
    ...(policies ? { policies } : {}),
  });

  // Only the article page shows body images; a listing card shows none.
  /** @type {ReturnType<typeof resolveContentImages>} */
  let contentImages;
  try {
    contentImages = resolveContentImages(
      /** @type {any} */ ({ ...validatedInput, content: post ? [post] : [] }),
    );
  } catch (error) {
    if (error instanceof BuildInputValidationError) {
      throw new PreviewInputError(
        error.diagnostics.map((d) => String(d.remediation ?? d.code)),
      );
    }
    throw error;
  }
  const editions = resolveEditions(validatedInput.content, contentRoute);
  const translations = resolveTranslations(
    validatedInput.content,
    publication.defaultLanguage,
    liveSplit.removedRoots,
  );
  const site = deriveSiteContext(validatedInput, { getMessages, routeProfile });

  const theme = input.theme
    ? buildTheme(input.theme, input, site.publicBasePath)
    : undefined;
  const themeAssets = theme
    ? {
        linkTagsHtml: theme.linkTagsHtml,
        composition: theme.composition,
        canvas: theme.canvas,
      }
    : undefined;

  /** @type {string | undefined} */
  let searchIndexJson;
  /**
   * @param {import('./document-shell.js').DocumentShellData} data the page values
   * @param {string} content the page's body markup
   * @returns {string} the document
   */
  const renderDocument = (data, content) => {
    /** @type {import('./document-shell.js').DocumentShellData} */
    let shellData = data;
    let body = content;
    if (preview.colorMode !== undefined) {
      shellData = { ...shellData, resolvedColorMode: preview.colorMode };
    }
    const inlineStyles = preview.inlineStyles || preview.interactive;
    if (preview.contentSecurityPolicy !== undefined) {
      shellData = {
        ...shellData,
        cspMetaTag: `<meta http-equiv="Content-Security-Policy" content="${escapeHtml(preview.contentSecurityPolicy)}">`,
      };
    }
    if (preview.inertLinks) body = makeLinksInert(body);
    if (inlineStyles) {
      const sheets = (theme?.sheets ?? []).map((sheet) =>
        inlineStyle(sheet.css, sheet.role, sheet.media),
      );
      shellData = { ...shellData, themeStylesheetLinksHtml: sheets.join('') };
    }
    let html = renderDocumentShell(shellData, body);
    if (inlineStyles) {
      const baseLink = `<link rel="stylesheet" href="${escapeHtml(data.baseStylesheetHref)}">`;
      if (!html.includes(baseLink)) {
        throw new Error('the document shell no longer links the base layer');
      }
      html = html.replace(baseLink, () => inlineStyle(BASE_LAYER_CSS, 'base'));
    }
    if (preview.omitScripts) {
      html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
    }
    if (preview.interactive) {
      const catalog = getMessages(data.lang);
      searchIndexJson ??= buildSearchIndex(validatedInput, routeProfile);
      html = makeInteractive({
        html,
        cspMetaTag: data.cspMetaTag,
        interactive: preview.interactive,
        siteBase: input.baseUrl,
        searchIndex: searchIndexJson,
        colorMode: preview.colorMode,
        messages: {
          notSaved: String(catalog.previewNotSavedLabel),
          signInUnavailable: String(catalog.previewSignInUnavailableLabel),
          notPublished: String(catalog.previewNotPublishedLabel),
          audioUnavailable: String(catalog.previewAudioUnavailableLabel),
        },
      });
    }
    return html;
  };

  return {
    warnings,
    post,
    validatedInput,
    translations,
    pageContext: {
      getMessages,
      loadPolicyDefaults,
      routeProfile,
      liveSplit,
      contentImages,
      editions,
      translations,
      site,
      themeAssets,
      media: {
        mediaAssets: synthesized.mediaAssets,
        mediaDimensions: synthesized.mediaDimensions,
        mediaVariants: synthesized.mediaVariants,
        urlOf: synthesized.urlOf,
      },
      renderDocument,
    },
  };
}

/**
 * Build the one page a selector names and shape the result.
 *
 * @param {any} input the preview input
 * @param {any} options the render options
 * @param {PreviewKind} kind which renderer the input is for
 * @param {(prepared: ReturnType<typeof prepare>) => Record<string, unknown>} selector
 *   the one-page selector `buildPageDocuments` reads
 * @returns {{html: string, title: string, route: string, warnings: string[]}}
 *   the document, its title, its public route and what could not be shown
 */
function renderOne(input, options, kind, selector) {
  const prepared = prepare(input, options, kind);
  const documents = buildPageDocuments(prepared.validatedInput, {
    ...prepared.pageContext,
    ...selector(prepared),
  });
  const page = documents.generatedPages[0];
  return {
    html: documents.contentPages[0].content,
    title: page.documentTitle ?? page.title,
    route: page.route,
    warnings: prepared.warnings,
  };
}

/**
 * Render one content record of any kind (article, page or edition) as a
 * complete HTML document; the record's own kind picks the layout, as in the
 * build.
 *
 * @param {any} input the record and the publication around it
 *   (`ContentPreviewInput` in `types/preview.d.ts`)
 * @param {any} options the render options (`ArticlePreviewOptions`)
 * @returns {{html: string, title: string, route: string, warnings: string[]}}
 *   the document, its title, its public route and what could not be shown
 * @throws {PreviewInputError} the input is malformed or incomplete
 */
export function renderContentPreview(input, options) {
  return renderOne(input, options, 'content', ({ post }) => ({
    only: /** @type {any} */ (post).frontmatter.id,
  }));
}

/**
 * The article-only name of {@link renderContentPreview}, kept as an alias: an
 * `article` input renders exactly as before, and other kinds now render
 * with their own layout.
 *
 * @param {any} input the record and the publication around it
 * @param {any} options the render options
 * @returns {{html: string, title: string, route: string, warnings: string[]}}
 *   the document
 * @throws {PreviewInputError} the input is malformed or incomplete
 */
export const renderArticlePreview = renderContentPreview;

/**
 * Render the home page (route `/`, page 1 of the listing) of a publication,
 * or, with `options.language`, the section home of that non-default language
 * (page 1, at `/<segment>`), by the code the build renders it with.
 *
 * @param {any} input the publication and the posts its home page lists
 *   (`HomePreviewInput` in `types/preview.d.ts`)
 * @param {any} options the render options (`HomePreviewOptions`)
 * @returns {{html: string, title: string, route: string, warnings: string[]}}
 *   the document, its title, its public route and what could not be shown
 * @throws {PreviewInputError} the input is malformed or incomplete, or the
 *   language has no section home
 */
export function renderHomePreview(input, options) {
  return renderOne(input, options, 'home', ({ translations }) => {
    const wanted = options.language;
    if (wanted === undefined) return { home: true };
    const section = translations.sections.find(
      (candidate) =>
        candidate.language.toLowerCase() === String(wanted).toLowerCase(),
    );
    if (section === undefined) {
      throw new PreviewInputError([
        `options.language ${JSON.stringify(wanted)} has no section home: it needs a published article in that language other than the default`,
      ]);
    }
    return { section: section.segment };
  });
}

/**
 * Render the publication's profile (About) page.
 *
 * @param {any} input the site sections and `profile` (`ProfilePreviewInput`)
 * @param {any} options the render options (`ArticlePreviewOptions`)
 * @returns {{html: string, title: string, route: string, warnings: string[]}}
 *   the document, its title, its public route and what could not be shown
 * @throws {PreviewInputError} the input is malformed or incomplete
 */
export function renderProfilePreview(input, options) {
  return renderOne(input, options, 'profile', () => ({ profile: true }));
}

/**
 * Render the Contact page: the optional `contact.md` intro and the form,
 * shown only while `publication.contactForm.enabled` is true.
 *
 * @param {any} input the site sections with `publication.contactForm`
 *   (`ContactPreviewInput`)
 * @param {any} options the render options (`ArticlePreviewOptions`)
 * @returns {{html: string, title: string, route: string, warnings: string[]}}
 *   the document, its title, its public route and what could not be shown
 * @throws {PreviewInputError} the input is malformed or incomplete
 */
export function renderContactPreview(input, options) {
  return renderOne(input, options, 'contact', () => ({ contact: true }));
}

/**
 * Render the Terms or the Privacy page: the site's own text (`input.policies`)
 * or, with none, the shipped default, then the template-owned Galascribe
 * section.
 *
 * @param {any} input the site sections and optional `policies` (`PolicyPreviewInput`)
 * @param {{page: 'terms' | 'privacy'}} which the page to render
 * @param {any} options the render options (`ArticlePreviewOptions`)
 * @returns {{html: string, title: string, route: string, warnings: string[]}}
 *   the document, its title, its public route and what could not be shown
 * @throws {PreviewInputError} the input is malformed or incomplete
 */
export function renderPolicyPreview(input, which, options) {
  if (
    !isObject(which) ||
    (which.page !== 'terms' && which.page !== 'privacy')
  ) {
    throw new PreviewInputError(['page must be "terms" or "privacy"']);
  }
  return renderOne(input, options, 'policy', () => ({ policy: which.page }));
}

export { EDITORIAL_COMPOSITION };
