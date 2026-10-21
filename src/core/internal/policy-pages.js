/**
 * Policy pages: the two generated legal pages every site carries, `/terms` and
 * `/privacy` (page kind `policy`). Each page is the site's own text followed by
 * the template-owned "Galascribe" section.
 *
 * The site's own text is `build-input.policies` when present: a title and a
 * `renderableBody` per page, produced upstream and verified here exactly as a
 * content record's body is (`index.js` checks `renderPolicy` and
 * `assertPolicyConformantHtml`). When `policies` is absent the text is the
 * default Markdown the schemas package publishes
 * (`@rathnasgala2/schemas/site-policy-defaults`), rendered through the render
 * policy's own `normalizeAuthoredMarkdown`: shipped Markdown source, not a
 * received body, and the only Markdown this renderer renders itself.
 *
 * The Galascribe section (design D4) is hardcoded English, trusted markup that
 * the author's text never replaces. Every fact in it is computed from the build
 * input; the only author-supplied value is the publication name, passed
 * through `escapeHtml`. Both pages are ordinary indexable pages in the
 * sitemap, and never enter the search index, the feeds or the `llms` documents
 * (each of those selects authored content records only).
 *
 * A content record or redirect that already uses `/terms` or `/privacy` fails
 * the build closed (`POLICY_ROUTE_CONFLICT`), the same way an edition route
 * conflict does.
 */

import { BuildInputValidationError } from '../errors.js';
import { renderAnalyticsPrivacyParagraph } from './analytics/markup.js';
import { normalizeAuthoredMarkdown } from './content-security.js';
import { boundedText, exactObject } from './module-shape.js';
import { loadSitePolicyDefaults } from './policy-defaults.js';
import { escapeHtml } from './skeleton.js';

/** @type {string} */
export const TERMS_ROUTE = '/terms';
/** @type {string} */
export const PRIVACY_ROUTE = '/privacy';

/** The longest policy title, in grapheme clusters (`policyPageNormalized`). */
const TITLE_MAXIMUM_GRAPHEMES = 80;

const GALASCRIBE_TERMS_URL = 'https://galascribe.com/terms';
const GALASCRIBE_PRIVACY_URL = 'https://galascribe.com/privacy';
const DOCUMENTATION_URL =
  'https://github.com/rathnasgala2/template#policy-pages';

/**
 * @typedef {object} PolicyFacts
 * @property {string} publicationName the publication's title (escaped here)
 * @property {boolean} interactionsOn whether reactions and comments are on
 * @property {import('../../../types/index.d.ts').AnalyticsModule} [analytics]
 *   the validated analytics module, when consent and analytics are on
 */

/**
 * @typedef {object} PolicyPage
 * @property {string} route the page's un-joined route
 * @property {string} title the page title and `<h1>` text
 * @property {string} body policy-conformant HTML: the site's own text
 */

/**
 * @param {string} href an absolute URL
 * @param {string} text link text
 * @returns {string} an external link
 */
const link = (href, text) =>
  `<a href="${escapeHtml(href)}" rel="noopener">${escapeHtml(text)}</a>`;

/**
 * Validate `build-input.policies`: both pages, each a bounded title and a
 * `renderableBody`-shaped body. The body's `renderPolicy` and conformance are
 * verified by the caller, as for every other body.
 *
 * @param {unknown} candidate the `policies` value
 * @returns {import('../../../types/index.d.ts').PoliciesNormalized} the
 *   validated value
 */
export function validatePolicies(candidate) {
  const where = 'build-input.policies';
  const policies = exactObject(candidate, ['terms', 'privacy'], where);
  for (const key of ['terms', 'privacy']) {
    const page = exactObject(
      policies[key],
      ['title', 'body'],
      `${where}.${key}`,
    );
    boundedText(page.title, TITLE_MAXIMUM_GRAPHEMES, `${where}.${key}.title`);
    exactObject(
      page.body,
      [
        'sourcePath',
        'sourceDigest',
        'bodyMediaType',
        'body',
        'bodyDigest',
        'renderPolicy',
      ],
      `${where}.${key}.body`,
    );
  }
  return /** @type {import('../../../types/index.d.ts').PoliciesNormalized} */ (
    /** @type {unknown} */ (policies)
  );
}

/**
 * The two pages' own text: the authored `policies` when present, else the
 * default Markdown rendered through the render policy's pipeline.
 *
 * @param {import('../../../types/index.d.ts').PoliciesNormalized | undefined} policies
 *   the build input's `policies`
 * @returns {PolicyPage[]} the Terms page, then the Privacy page
 */
export function resolvePolicyPages(policies) {
  if (policies !== undefined) {
    return [
      {
        route: TERMS_ROUTE,
        title: policies.terms.title,
        body: policies.terms.body.body,
      },
      {
        route: PRIVACY_ROUTE,
        title: policies.privacy.title,
        body: policies.privacy.body.body,
      },
    ];
  }
  const defaults = loadSitePolicyDefaults();
  return [
    {
      route: TERMS_ROUTE,
      title: defaults.terms.title,
      body: normalizeAuthoredMarkdown(defaults.terms.markdown).html,
    },
    {
      route: PRIVACY_ROUTE,
      title: defaults.privacy.title,
      body: normalizeAuthoredMarkdown(defaults.privacy.markdown).html,
    },
  ];
}

/**
 * The template-owned Galascribe section appended to both pages (design D4).
 *
 * @param {PolicyFacts} facts what the build input switches on
 * @returns {string} the section's trusted markup
 */
export function renderGalascribeSection({
  publicationName,
  interactionsOn,
  analytics,
}) {
  const name = escapeHtml(publicationName);
  return (
    `<section><h2>Galascribe</h2>` +
    `<p>This site is published by ${name} with Galascribe, a service of Rathnas LLC. ` +
    `The text above is written by the site's author. This section is added by Galascribe to every site it publishes and cannot be changed by the author.</p>` +
    `<p>Use of this site is also subject to ${link(GALASCRIBE_TERMS_URL, "Galascribe's Terms of Service")}, ` +
    `and the handling of your data is described in ${link(GALASCRIBE_PRIVACY_URL, "Galascribe's Privacy Policy")}. ` +
    `Both apply in full and are incorporated here.</p>` +
    (interactionsOn
      ? `<p>Reactions and comments on this site are provided by Galascribe. ` +
        `When you take part you agree to Galascribe's Terms of Service, ` +
        `Galascribe (Rathnas LLC) processes the data you submit under its Privacy Policy, ` +
        `and a reader session is kept in your browser's storage.</p>`
      : '') +
    (analytics
      ? renderAnalyticsPrivacyParagraph(analytics)
      : `<p>This site loads no analytics or advertising trackers.</p>`) +
    `<p>Questions about this site go to its author. ` +
    `Questions about Galascribe go to <a href="mailto:support@galascribe.com">support@galascribe.com</a>.</p>` +
    `</section>`
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
