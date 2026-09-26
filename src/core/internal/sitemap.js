/**
 * Sitemap generation: published routes only, deterministic order, with
 * `lastmod` derived from content timestamps rather than build time.
 *
 * Every entry comes from `internal/page-kinds.js`'s own
 * {@link import('./page-kinds.js').GeneratedPage} list — the single source
 * of truth for which page kinds exist and what each one's own
 * `robotsContent`/`lastModified` is — filtered to exclude any page this
 * renderer itself marked `noindex` (robots handling for unlisted content:
 * `status: "unlisted"` content is exactly the case
 * `internal/page-kinds.js` sets `robotsContent` for). The generated `404`
 * error page, the feeds, the sitemap document itself and the static search
 * index are never `GeneratedPage` entries, so they are structurally excluded
 * without a second exclusion list. A `manifestRedirect` route is likewise
 * never in this list; a redirect's fixed byte-for-byte document already
 * carries its own `<link rel="canonical">` to the real content page, which
 * is what a crawler should index instead.
 */

import { escapeHtml } from './skeleton.js';
import { joinBasePathAndRoute } from './route.js';
import { compareUtf8Bytes } from './source-inventory.js';

/**
 * @param {import('./page-kinds.js').GeneratedPage} page a generated page
 * @returns {boolean} `true` when this page must be excluded from the
 *   sitemap (its `robotsContent` includes `noindex`)
 */
function isNoindex(page) {
  return (page.robotsContent ?? '').includes('noindex');
}

/**
 * Build the deterministic `sitemap.xml` document (Sitemaps 0.9) for every
 * indexable generated page.
 *
 * @param {object} options build options
 * @param {readonly import('./page-kinds.js').GeneratedPage[]} options.generatedPages
 *   every page `internal/page-kinds.js` produced
 * @param {string} options.basePath the build input's `basePath`
 * @param {string} options.baseUrl the build input's origin-only `baseUrl`
 * @returns {string} the exact UTF-8 `sitemap.xml` text
 */
export function buildSitemap({ generatedPages, basePath, baseUrl }) {
  /**
   * @param {string} route an un-joined route
   * @returns {string} the absolute `https://` URL
   */
  const absoluteUrl = (route) =>
    new URL(joinBasePathAndRoute(basePath, route), baseUrl).toString();

  const entries = generatedPages
    .filter((page) => !isNoindex(page))
    .map((page) => ({
      loc: absoluteUrl(page.route),
      lastmod: page.lastModified,
    }))
    .sort((a, b) => compareUtf8Bytes(a.loc, b.loc));

  const urlXml = entries
    .map((entry) => {
      const lastmodTag = entry.lastmod
        ? `<lastmod>${escapeHtml(entry.lastmod)}</lastmod>`
        : '';
      return `<url><loc>${escapeHtml(entry.loc)}</loc>${lastmodTag}</url>`;
    })
    .join('');

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urlXml +
    '</urlset>\n'
  );
}
