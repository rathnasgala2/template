/**
 * `/license.xml`: the site's AI-use terms in the Really Simple Licensing (RSL
 * 1.0) shape, emitted only when the author set `publication.aiRights`.
 *
 * `search` covers the AI search and answer bots (RSL usage `ai-input` and
 * `ai-index`), `training` the training crawlers (`ai-train`). Ordinary web
 * `search` is always permitted: `aiRights` never governs search engines. An
 * optional `licenseUrl` is where a licence for the writing can be obtained; it
 * rides in a `payment type="purchase"` element's `custom` terms, the way
 * Galascribe v1 published a commercial licence link.
 */

import { escapeHtml } from './skeleton.js';

/**
 * @param {import('./robots.js').AiPolicy} rights the author's AI choices
 * @param {string} contentScope the path the terms cover, with its trailing
 *   slash (`/`, or `/g9/` on a project site)
 * @returns {string} the exact `license.xml` text
 */
export function buildLicenseXml(rights, contentScope) {
  /** @type {string[]} */
  const permits = ['search'];
  /** @type {string[]} */
  const prohibits = [];
  (rights.search === 'allow' ? permits : prohibits).push(
    'ai-input',
    'ai-index',
  );
  (rights.training === 'allow' ? permits : prohibits).push('ai-train');
  const lines = [
    `      <permits type="usage">${permits.join(' ')}</permits>`,
    ...(prohibits.length > 0
      ? [`      <prohibits type="usage">${prohibits.join(' ')}</prohibits>`]
      : []),
    ...(rights.licenseUrl
      ? [
          '      <payment type="purchase">',
          `        <custom>${escapeHtml(rights.licenseUrl)}</custom>`,
          '      </payment>',
        ]
      : []),
  ];
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rsl xmlns="https://rslstandard.org/rsl">\n' +
    `  <content url="${escapeHtml(contentScope)}">\n` +
    '    <license>\n' +
    `${lines.join('\n')}\n` +
    '    </license>\n' +
    '  </content>\n' +
    '</rsl>\n'
  );
}
