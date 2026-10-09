/**
 * Content images: the `<img>` elements a rendered body carries.
 *
 * A `renderableBody.body` is already render-policy-conformant HTML, so its
 * only image form is `<img src="..." alt="...">` with a repository-relative
 * `src` (`content-security.js` admits no scheme for `img[src]` and strips
 * the `src` of a remote image). This module resolves every such `src`
 * against the image assets `build-input` inventories for that document
 * (`content[].media[]`, each a digest-pinned repository file), before
 * anything is written, and fails closed on any reference that names no
 * inventoried image: a body image that cannot be resolved never reaches a
 * page as a broken `<img>`. The resolved references join the media
 * pipeline's own reference set (`pipeline.js`), and the pages and feeds
 * then replace each `<img>` with markup naming the pipeline's derivatives
 * (`components.js#createContentImage`); the source file itself is never
 * copied into the output.
 *
 * Resolution rule (a build-input producer inventories a document's images
 * by the same rule): the `src` attribute is entity-decoded;
 * a scheme, a protocol-relative `//`, a query or a fragment never resolves;
 * one leading `/` or `./` is dropped (the path is repository-root-relative
 * either way); the rest is percent-decoded and NFC-normalized; an empty,
 * `.` or `..` segment never resolves; the result must equal the `path` of an
 * image entry (`image/png`, `image/jpeg`, `image/webp`, `image/avif`,
 * `image/gif`) in the same document's `media[]`.
 */

import {
  BuildInputValidationError,
  RenderPolicyViolationError,
} from '../../errors.js';
import { unescapeHtml } from '../skeleton.js';

/** @typedef {{path: string, sourceDigest: string}} ImageReference */

/**
 * One body this module scans, with the image assets it may reference.
 *
 * @typedef {object} BodyScope
 * @property {string} pointer the body's JSON pointer inside `build-input`
 * @property {string} sourcePath the body's own repository source path
 * @property {string} body the body HTML
 * @property {ReadonlyMap<string, ImageReference>} inventory the image
 *   assets this body may reference, keyed by repository path
 */

/** The `media[]` media types a body image may resolve to. */
const IMAGE_MEDIA_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'image/gif',
]);

/** Every `<img>` element of a policy-conformant body. */
const IMG_ELEMENT = /<img\b[^>]*>/g;

/** One double-quoted attribute (the only form sanitized HTML carries). */
const ATTRIBUTE = /\s([a-zA-Z][a-zA-Z0-9-]*)="([^"]*)"/g;

/** Where a reader of an unresolved-reference diagnostic finds the rule. */
const DOCUMENTATION_URL =
  'https://github.com/rathnasgala2/template#content-images';

/**
 * @param {string} element one `<img ...>` element
 * @returns {{src?: string, alt?: string}} its raw `src` and `alt` values
 *   (still entity-encoded, exactly as they appear in the body)
 */
function attributesOf(element) {
  /** @type {{src?: string, alt?: string}} */
  const attributes = {};
  for (const [, name, value] of element.matchAll(ATTRIBUTE)) {
    if (name === 'src' || name === 'alt') attributes[name] = value;
  }
  return attributes;
}

/**
 * Turn a raw `src` attribute value into the repository-relative path it
 * names, or `undefined` when it is not a repository-relative reference.
 *
 * @param {string | undefined} rawSource the attribute value as it appears
 *   in the body
 * @returns {string | undefined} the NFC repository-relative path
 */
export function repositoryPathOfImageSource(rawSource) {
  if (rawSource === undefined) return undefined;
  const source = unescapeHtml(rawSource);
  if (
    source === '' ||
    source.startsWith('//') ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(source) ||
    /[?#\\]/.test(source)
  ) {
    return undefined;
  }
  const relative = source.startsWith('/')
    ? source.slice(1)
    : source.startsWith('./')
      ? source.slice(2)
      : source;
  let decoded;
  try {
    decoded = decodeURIComponent(relative).normalize('NFC');
  } catch {
    return undefined;
  }
  const segments = decoded.split('/');
  if (
    decoded.includes('\\') ||
    decoded.includes('\u0000') ||
    segments.some((segment) => ['', '.', '..'].includes(segment))
  ) {
    return undefined;
  }
  return decoded;
}

/**
 * @param {readonly {path: string, sourceDigest: string, mediaType: string}[] | undefined} media
 *   one document's `media[]`
 * @returns {Map<string, ImageReference>} its image entries, keyed by path
 */
function inventoryOf(media) {
  /** @type {Map<string, ImageReference>} */
  const inventory = new Map();
  for (const entry of media ?? []) {
    if (IMAGE_MEDIA_TYPES.has(entry.mediaType)) {
      inventory.set(entry.path, {
        path: entry.path,
        sourceDigest: entry.sourceDigest,
      });
    }
  }
  return inventory;
}

/**
 * Every body this renderer renders, with the image assets each may
 * reference: the publication profile, the footer card when enabled, and
 * every content record. The profile and footer card have no media inventory
 * of their own, so an image in either never resolves.
 *
 * @param {import('../../../../types/index.d.ts').NormalizedBuildInput} buildInput
 *   the validated build input
 * @returns {BodyScope[]} every body, in document order
 */
function bodyScopes(buildInput) {
  const { profile, footerCard } = buildInput.publication;
  /** @type {BodyScope[]} */
  const scopes = [];
  if (profile) {
    scopes.push({
      pointer: '/publication/profile/body/body',
      sourcePath: profile.body.sourcePath,
      body: profile.body.body,
      inventory: new Map(),
    });
  }
  if (footerCard?.enabled) {
    scopes.push({
      pointer: '/publication/footerCard/body/body',
      sourcePath: footerCard.body.sourcePath,
      body: footerCard.body.body,
      inventory: new Map(),
    });
  }
  buildInput.content.forEach((record, index) => {
    scopes.push({
      pointer: `/content/${index}/body`,
      sourcePath: record.sourcePath,
      body: record.body,
      inventory: inventoryOf(record.media),
    });
  });
  return scopes;
}

/**
 * @param {BodyScope} scope the body the reference sits in
 * @param {string | undefined} rawSource the reference's raw `src` value
 * @returns {Record<string, string>} one `MEDIA_REFERENCE_UNRESOLVED`
 *   diagnostic, shaped like a schema validation diagnostic
 */
function unresolvedDiagnostic(scope, rawSource) {
  const reference = rawSource === undefined ? '' : unescapeHtml(rawSource);
  return {
    code: 'MEDIA_REFERENCE_UNRESOLVED',
    severity: 'ERROR',
    instancePointer: scope.pointer,
    actualValueClass: 'string',
    rule: 'template:content-image-reference',
    reference,
    remediation:
      reference === ''
        ? `An image in ${scope.sourcePath} has no repository source (remote images are not published). Commit the image and reference it by its repository-relative path, or remove it.`
        : `The image "${reference}" in ${scope.sourcePath} names no image file inventoried for that document. Commit the image and reference it by its repository-relative path, or remove it.`,
    documentationUrl: DOCUMENTATION_URL,
  };
}

/**
 * Resolve every image every body references, before anything is written.
 * Fails closed with one `MEDIA_REFERENCE_UNRESOLVED` diagnostic per image
 * that names no inventoried image asset.
 *
 * @param {import('../../../../types/index.d.ts').NormalizedBuildInput} buildInput
 *   the validated, render-policy-verified build input
 * @returns {Map<string, ImageReference>} each distinct raw `src` value to
 *   the asset it resolves to
 * @throws {BuildInputValidationError} when any body image is unresolved
 */
export function resolveContentImages(buildInput) {
  /** @type {Map<string, ImageReference>} */
  const resolved = new Map();
  /** @type {Record<string, string>[]} */
  const diagnostics = [];
  for (const scope of bodyScopes(buildInput)) {
    for (const element of scope.body.match(IMG_ELEMENT) ?? []) {
      const { src } = attributesOf(element);
      const path = repositoryPathOfImageSource(src);
      const reference =
        path === undefined ? undefined : scope.inventory.get(path);
      if (src === undefined || reference === undefined) {
        diagnostics.push(unresolvedDiagnostic(scope, src));
      } else if (!resolved.has(src)) {
        resolved.set(src, reference);
      }
    }
  }
  if (diagnostics.length > 0) {
    throw new BuildInputValidationError(diagnostics);
  }
  return resolved;
}

/**
 * Replace every `<img>` in a body with the markup `render` produces for the
 * asset its `src` resolved to.
 *
 * @param {string} body a policy-conformant body
 * @param {ReadonlyMap<string, ImageReference>} resolved the result of
 *   {@link resolveContentImages} for the same build input
 * @param {(reference: ImageReference, altAttribute: string) => string} render
 *   the replacement markup for one image, given its raw (still
 *   entity-encoded) `alt` value
 * @returns {string} the body with every image replaced
 */
export function rewriteBodyImages(body, resolved, render) {
  return body.replace(IMG_ELEMENT, (element) => {
    const { src, alt } = attributesOf(element);
    const reference = src === undefined ? undefined : resolved.get(src);
    if (reference === undefined) {
      throw new RenderPolicyViolationError(
        `a body image (${src ?? 'no src'}) reached rendering unresolved; this is a renderer defect`,
      );
    }
    return render(reference, alt ?? '');
  });
}
