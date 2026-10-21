/**
 * Policy pages: the two generated legal pages every site carries, `/terms` and
 * `/privacy` (page kind `policy`). The wording is template-owned, hardcoded
 * English, trusted markup: the only author-supplied value is the publication
 * name, passed through `escapeHtml`. They are ordinary indexable pages in the
 * sitemap, and never enter the search index, the feeds or the `llms` documents
 * (each of those selects authored content records only).
 *
 * A content record or redirect that already uses `/terms` or `/privacy` fails
 * the build closed (`POLICY_ROUTE_CONFLICT`), the same way an edition route
 * conflict does.
 */

import { BuildInputValidationError } from '../errors.js';
import { escapeHtml } from './skeleton.js';

/** @type {string} */
export const TERMS_ROUTE = '/terms';
/** @type {string} */
export const PRIVACY_ROUTE = '/privacy';

const GALASCRIBE_TERMS_URL = 'https://galascribe.com/terms';
const GALASCRIBE_PRIVACY_URL = 'https://galascribe.com/privacy';
const DOCUMENTATION_URL =
  'https://github.com/rathnasgala2/template#policy-pages';

/**
 * @typedef {object} PolicyFacts
 * @property {string} publicationName the publication's title (escaped here)
 * @property {boolean} interactionsOn whether reactions and comments are on
 */

/**
 * @param {string} href an absolute URL
 * @param {string} text link text
 * @returns {string} an external link
 */
const link = (href, text) =>
  `<a href="${escapeHtml(href)}" rel="noopener">${escapeHtml(text)}</a>`;

/**
 * @param {PolicyFacts} facts
 * @returns {string} the Terms page `<h1>` and prose body
 */
export function renderTermsBody({ publicationName, interactionsOn }) {
  const name = escapeHtml(publicationName);
  return (
    `<h1>Terms</h1>` +
    `<p>This site is published by ${name} with Galascribe. The content of this site belongs to its author.</p>` +
    `<p>Use of this site is also subject to ${link(GALASCRIBE_TERMS_URL, "Galascribe's Terms of Service")}, which apply in full and are incorporated here.</p>` +
    (interactionsOn
      ? `<p>Where reactions and comments are enabled, readers who take part agree to Galascribe's Terms.</p>`
      : '') +
    `<p>Questions about this site go to its author. Questions about Galascribe go to <a href="mailto:support@galascribe.com">support@galascribe.com</a>.</p>`
  );
}

/**
 * @param {PolicyFacts} facts
 * @param {string} [analyticsHtml] an optional trusted paragraph about
 *   analytics and consent, inserted after the storage list; callers pass an
 *   empty string today, a later change supplies the paragraph
 * @returns {string} the Privacy page `<h1>` and prose body
 */
export function renderPrivacyBody(
  { publicationName, interactionsOn },
  analyticsHtml = '',
) {
  const name = escapeHtml(publicationName);
  return (
    `<h1>Privacy</h1>` +
    `<p>This is what happens to your data when you read ${name}.</p>` +
    `<ul>` +
    `<li>The hosting provider processes ordinary request logs when you load a page.</li>` +
    (analyticsHtml === ''
      ? `<li>Your browser storage is used only for colour mode, saved posts` +
        (interactionsOn
          ? ` and the reader session for reactions and comments`
          : '') +
        `.</li>`
      : `<li>Your browser storage is used for colour mode, saved posts` +
        (interactionsOn
          ? `, the reader session for reactions and comments`
          : '') +
        ` and your analytics choice.</li>`) +
    `</ul>` +
    analyticsHtml +
    (interactionsOn
      ? `<p>Reaction and comment data is processed by Galascribe (Rathnas LLC) under ${link(GALASCRIBE_PRIVACY_URL, "Galascribe's Privacy Policy")}, which is incorporated here.</p>`
      : '') +
    `<p>No advertising or analytics tracking is loaded by default.</p>` +
    `<p>For your rights and for contact, see ${link(GALASCRIBE_PRIVACY_URL, "Galascribe's Privacy Policy")}.</p>`
  );
}

/**
 * Fail closed when an authored document already uses a policy route.
 *
 * @param {readonly import('../../../types/index.d.ts').ContentBuildRecord[]} content
 *   the build input's `content[]`
 * @param {(frontmatter: import('../../../types/index.d.ts').ContentFrontmatterNormalized) => string} routeOf
 *   a document's own un-joined route
 * @returns {void}
 * @throws {BuildInputValidationError} `POLICY_ROUTE_CONFLICT`, one
 *   diagnostic per conflicting document
 */
export function assertPolicyRoutesFree(content, routeOf) {
  const reserved = new Set([TERMS_ROUTE, PRIVACY_ROUTE]);
  // A trailing slash and letter case never make a route a different page.
  const normalise = (/** @type {string} */ route) =>
    (route.length > 1 && route.endsWith('/')
      ? route.slice(0, -1)
      : route
    ).toLowerCase();
  /** @type {Record<string, string>[]} */
  const diagnostics = [];
  content.forEach((record, index) => {
    const routes = [
      routeOf(record.frontmatter),
      ...(record.frontmatter.redirects ?? []),
    ];
    for (const route of routes) {
      if (!reserved.has(normalise(route))) continue;
      diagnostics.push({
        code: 'POLICY_ROUTE_CONFLICT',
        severity: 'ERROR',
        instancePointer: `/content/${index}`,
        actualValueClass: 'object',
        rule: 'template:policy',
        sourcePath: record.sourcePath,
        remediation: `The document ${record.sourcePath} uses ${route}, which the generated policy pages own. Rename or move it.`,
        documentationUrl: DOCUMENTATION_URL,
      });
    }
  });
  if (diagnostics.length > 0) throw new BuildInputValidationError(diagnostics);
}
