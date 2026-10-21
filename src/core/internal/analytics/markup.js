/**
 * Server-rendered consent markup: the banner `<aside>`, the footer "Privacy
 * choices" button and the analytics paragraph of the policy pages' Galascribe
 * section. The browser script
 * (`consent-script.js`) reveals and drives them; with JavaScript off the
 * banner stays hidden and nothing from the provider ever loads.
 */

import { escapeHtml } from '../skeleton.js';
import { joinPublicRoute } from '../route.js';
import { analyticsProvider } from './providers.js';

/**
 * @param {import('../../../../types/index.d.ts').AnalyticsModule} module
 * @returns {Readonly<import('./providers.js').AnalyticsProvider>} the provider
 */
function providerOf(module) {
  const provider = analyticsProvider(module.config.provider.kind);
  if (provider === undefined) {
    throw new Error(
      `unknown analytics provider ${module.config.provider.kind}`,
    );
  }
  return provider;
}

/**
 * @param {object} input render input
 * @param {import('../../../../types/index.d.ts').AnalyticsModule} input.module
 *   the validated module
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} input.messages
 *   the chrome message catalog
 * @param {string} input.publicBasePath the public base path
 * @param {import('../route.js').RouteNormalizationProfile} input.routeProfile
 * @returns {string} the banner `<aside>`
 */
export function renderConsentBanner({
  module,
  messages,
  publicBasePath,
  routeProfile,
}) {
  const text = (/** @type {string} */ key) =>
    escapeHtml(/** @type {string} */ (messages[key]));
  const privacyHref = escapeHtml(
    joinPublicRoute(publicBasePath, '/privacy', routeProfile),
  );
  const bannerText = /** @type {(name: string) => string} */ (
    messages.consentText
  )(providerOf(module).name);
  return (
    `<aside class="g-consent" data-gala-consent data-provider-kind="${escapeHtml(module.config.provider.kind)}" ` +
    `data-measurement-id="${escapeHtml(module.config.provider.measurementId)}" data-privacy-href="${privacyHref}" ` +
    `tabindex="-1" hidden aria-label="${text('consentRegionLabel')}">` +
    `<p class="g-consent-text">${escapeHtml(bannerText)}</p>` +
    `<div class="g-consent-actions">` +
    `<button type="button" class="g-consent-accept">${text('consentAcceptLabel')}</button>` +
    `<button type="button" class="g-consent-decline">${text('consentDeclineLabel')}</button>` +
    `<a href="${privacyHref}">${text('privacyLinkLabel')}</a>` +
    `</div></aside>`
  );
}

/**
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} messages
 *   the chrome message catalog
 * @returns {string} the script-revealed footer list item
 */
export function renderConsentOpenItem(messages) {
  return `<li><button type="button" class="g-consent-open" hidden>${escapeHtml(/** @type {string} */ (messages.consentOpenLabel))}</button></li>`;
}

/**
 * @param {import('../../../../types/index.d.ts').AnalyticsModule} module
 *   the validated module
 * @returns {string} the trusted analytics paragraph of the Galascribe section
 */
export function renderAnalyticsPrivacyParagraph(module) {
  const provider = providerOf(module);
  return (
    `<p>With your consent this site uses ${escapeHtml(provider.name)} to understand how it is read. ` +
    `Nothing is loaded before you accept. After you accept, Google Analytics sets <code>_ga</code> and <code>_ga_*</code> cookies. ` +
    `Your choice itself is kept in <code>localStorage</code> under <code>gala.consent.v1</code>; ` +
    `change it any time with "Privacy choices" in the footer. ` +
    `Declining removes those cookies and stops the script on the next page load. ` +
    `If your browser sends the Global Privacy Control signal and you have made no choice, this site treats it as a decline and does not show the banner. ` +
    `See <a href="${escapeHtml(provider.privacyPolicyUrl)}" rel="noopener">${escapeHtml(provider.privacyPolicyLabel)}</a>.</p>`
  );
}
