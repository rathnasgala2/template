/**
 * Two small generated pages, both `noindex`: the notice a removed post's route
 * renders, and the `/version/` page that shows `version.json` to a reader.
 * Both speak in the page's language through the message catalog.
 */

import { icon } from './icons.js';
import { escapeHtml } from './skeleton.js';

/**
 * @typedef {Readonly<Record<string, string | ((...args: string[]) => string)>>} Messages
 */

/**
 * The `<main>` content of a removed post's route: what happened, when, and the
 * way home. It names no title and carries no body.
 *
 * @param {object} options
 * @param {Messages} options.messages the page language's catalog
 * @param {string} options.deleteDate the removal day, `YYYY-MM-DD`
 * @param {string} options.homeRoute the joined home route
 * @returns {string}
 */
export function renderRemovedPostBody({ messages, deleteDate, homeRoute }) {
  const when = /** @type {(date: string) => string} */ (messages.formatDate)(
    deleteDate,
  );
  const sentence = /** @type {(date: string) => string} */ (
    messages.postRemovedBody
  )(when);
  return (
    `<section class="g-wrap g-topic-hero"><h1>${escapeHtml(/** @type {string} */ (messages.postRemovedHeading))}</h1>` +
    `<p class="g-dek">${escapeHtml(sentence)}</p>` +
    `<p><a class="g-btn" href="${escapeHtml(homeRoute)}">${escapeHtml(/** @type {string} */ (messages.postRemovedHomeLabel))}${icon('arrow')}</a></p></section>`
  );
}

/**
 * The `<main>` content of `/version/`: a definition list of what the build
 * knows, in the order of `version.json`.
 *
 * @param {object} options
 * @param {Messages} options.messages the page language's catalog
 * @param {ReturnType<import('./static-outputs.js').buildVersionInfo>} options.info
 * @returns {string}
 */
export function renderVersionBody({ messages, info }) {
  const label = (/** @type {string} */ key) =>
    escapeHtml(/** @type {string} */ (messages[key]));
  /**
   * @param {{package: string, version: string}} identity
   * @returns {string}
   */
  const nameVersion = (identity) => `${identity.package} ${identity.version}`;
  /** @type {{key: string, value: string}[]} */
  const rows = [
    { key: 'versionTemplateLabel', value: nameVersion(info.template) },
  ];
  if (info.schemas) {
    rows.push({ key: 'versionSchemasLabel', value: nameVersion(info.schemas) });
  }
  if (info.theme) {
    rows.push({ key: 'versionThemeLabel', value: nameVersion(info.theme) });
  }
  if (info.toolchain.length > 0) {
    rows.push({
      key: 'versionToolchainLabel',
      value: info.toolchain.map(nameVersion).join(', '),
    });
  }
  if (info.sourceCommit) {
    rows.push({ key: 'versionCommitLabel', value: info.sourceCommit });
  }
  rows.push({ key: 'versionBuiltAtLabel', value: info.builtAt });
  return (
    `<section class="g-wrap g-topic-hero"><h1>${label('versionPageHeading')}</h1>` +
    `${rows
      .map(
        ({ key, value }) =>
          `<p class="g-label">${label(key)}</p><p>${escapeHtml(value)}</p>`,
      )
      .join('')}</section>`
  );
}
