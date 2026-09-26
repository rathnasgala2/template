/**
 * Route-to-output-path projection and the byte-exact generated redirect
 * document.
 *
 * This module implements the `directory-index` and `explicit-file` cases of
 * route projection only for routes that are already valid `canonicalRoute`
 * strings (schema-enforced before this module ever runs). A full Unicode
 * percent-encoding/collision engine for arbitrary repository-relative
 * source paths is out of scope here: this renderer never derives routes
 * from source paths — every route it projects comes from an
 * already-schema-validated `canonicalRoute` field in `build-input`.
 */

/**
 * @typedef {'directory-index' | 'explicit-file'} RouteNormalizationProfile
 */

/**
 * Join a base path and a route into one absolute public route, exactly
 * once, with no double slash.
 *
 * @param {string} basePath the build input's `basePath` (`canonicalRoute`,
 *   always starts with `/`)
 * @param {string} route a `canonicalRoute` (always starts with `/`)
 * @returns {string} the joined absolute route, starting with `/`
 */
export function joinBasePathAndRoute(basePath, route) {
  const baseSegment = basePath.replace(/^\/+|\/+$/g, '');
  const routeSegment = route.replace(/^\/+|\/+$/g, '');
  const segments = [baseSegment, routeSegment].filter(
    (segment) => segment.length > 0,
  );
  return `/${segments.join('/')}`;
}

/**
 * Project one already-joined absolute route to its candidate-directory-
 * relative output file path.
 *
 * @param {string} joinedRoute the base-path-joined absolute route
 * @param {RouteNormalizationProfile} profile the selected route
 *   normalization profile
 * @returns {string} a repository-relative-style output path with no leading
 *   slash
 */
export function projectRouteToFilePath(joinedRoute, profile) {
  const trimmed = joinedRoute.replace(/^\/+/, '');
  if (profile === 'explicit-file') {
    return trimmed.length === 0 ? 'index.html' : trimmed;
  }
  if (trimmed.length === 0) return 'index.html';
  return `${trimmed.replace(/\/+$/, '')}/index.html`;
}

/**
 * Recover the public route an output file path was projected from, the
 * exact inverse of {@link projectRouteToFilePath} for the `directory-index`
 * profile. Used only to prove the manifest's redirect
 * `backingPath`-to-`sourceRoute` equality invariant by construction.
 *
 * @param {string} filePath a candidate-directory-relative output path
 * @param {RouteNormalizationProfile} profile the selected route
 *   normalization profile
 * @returns {string} the absolute route that projects to `filePath`
 */
export function projectFilePathToRoute(filePath, profile) {
  if (profile === 'explicit-file') {
    return filePath === 'index.html' ? '/' : `/${filePath}`;
  }
  if (filePath === 'index.html') return '/';
  const withoutIndex = filePath.replace(/\/index\.html$/, '');
  return `/${withoutIndex}`;
}

/**
 * Project a `basePath` to the one fixed generated error-document output
 * path: exactly `404.html` when `basePath` is `/`; otherwise the base path
 * with its one leading and terminal slash removed, followed by
 * `/404.html`. This is deliberately independent of the selected
 * `RouteNormalizationProfile` (`directory-index` vs `explicit-file`): the
 * generated error document is always this one literal filename, never
 * route-normalized like an ordinary content route — this fixed key is what
 * each hosting adapter's provider error-document configuration binds to.
 *
 * @param {string} basePath the build input's `basePath` (`canonicalRoute`,
 *   always starts with `/`)
 * @returns {string} the candidate-directory-relative error document path,
 *   with no leading slash
 */
export function errorDocumentPath(basePath) {
  const trimmed = basePath.replace(/^\/+|\/+$/g, '');
  return trimmed.length === 0 ? '404.html' : `${trimmed}/404.html`;
}

/**
 * Project a `basePath` and a fixed-name public asset route (a route that is
 * always this one literal file, never subject to `directory-index`
 * normalization: the generated feeds, sitemap and static search index) to
 * its candidate-directory-relative output path. Equivalent to
 * {@link projectRouteToFilePath} under the `explicit-file` profile, exposed
 * under its own name so a call site never has to spell out
 * `'explicit-file'` to mean "this is a literal file, not a route".
 *
 * @param {string} basePath the build input's `basePath`
 * @param {string} route a `canonicalRoute` ending in a real file extension
 *   (e.g. `/feed/atom.xml`)
 * @returns {string} the candidate-directory-relative output path, with no
 *   leading slash
 */
export function projectFixedAssetPath(basePath, route) {
  return projectRouteToFilePath(
    joinBasePathAndRoute(basePath, route),
    'explicit-file',
  );
}

const REDIRECT_TARGET_ESCAPES =
  /** @type {Readonly<Record<string, string>>} */ ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  });

/**
 * Apply the redirect document's one-pass HTML escape to a target route.
 *
 * @param {string} targetRoute the route the redirect points to
 * @returns {string} the escaped bytes used for every `T` occurrence
 */
export function escapeRedirectTarget(targetRoute) {
  let escaped = '';
  for (const character of targetRoute) {
    escaped += REDIRECT_TARGET_ESCAPES[character] ?? character;
  }
  return escaped;
}

/**
 * Render the exact UTF-8, no-BOM, LF-terminated generated redirect document
 * this renderer must produce byte-for-byte.
 *
 * @param {string} targetRoute the route this redirect document points to
 * @returns {string} the complete document text
 */
export function renderRedirectDocument(targetRoute) {
  const escapedTarget = escapeRedirectTarget(targetRoute);
  return (
    '<!doctype html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '<meta charset="utf-8">\n' +
    `<meta http-equiv="refresh" content="0;url=${escapedTarget}">\n` +
    `<link rel="canonical" href="${escapedTarget}">\n` +
    '<title>Redirecting...</title>\n' +
    '</head>\n' +
    '<body>\n' +
    `<p>This page has moved to <a href="${escapedTarget}">${escapedTarget}</a>.</p>\n` +
    '</body>\n' +
    '</html>\n'
  );
}
