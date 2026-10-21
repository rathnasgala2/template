/**
 * Site chrome: the one `<header>` and the one `<footer>` landmark every page
 * is composed with (see `internal/skeleton.js`'s landmark contract). Markup
 * mirrors the approved design reference and reads completely with JavaScript
 * off; the optional site script only reveals the search button (rendered
 * `hidden`) and enhances the rest.
 */

import { escapeHtml, renderNavItem, renderSlot } from './skeleton.js';
import { joinPublicRoute } from './route.js';
import { icon } from './icons.js';
import { monogram, renderImage } from './components.js';
import { renderConsentOpenItem } from './analytics/markup.js';

/**
 * The "Made with Galascribe" referral link, naming the site's host so
 * Galascribe can see which site a visit came from.
 *
 * @param {string} baseUrl the build input's `baseUrl` (an https URL)
 * @returns {string} the unescaped `https://galascribe.com/` URL with
 *   `utm_source` set to the percent-encoded host of `baseUrl`
 */
export function madeWithGalascribeHref(baseUrl) {
  const host = encodeURIComponent(new URL(baseUrl).hostname);
  return `https://galascribe.com/?utm_source=${host}&utm_medium=referral&utm_campaign=made-with-galascribe&utm_content=footer`;
}

/** @type {Readonly<Record<string, string>>} */
const SOCIAL_ICONS = Object.freeze({
  email: 'mail',
  github: 'code',
  website: 'link',
});

/**
 * @param {string} name publication title
 * @param {{url: string, width?: number, height?: number} | undefined} mark
 *   the brand mark image, if any
 * @returns {string} the brand mark element
 */
function renderMark(name, mark) {
  return (
    `<span class="g-mark" aria-hidden="true">` +
    (mark
      ? renderImage({ image: mark, alt: '', eager: true })
      : escapeHtml(monogram(name))) +
    `</span>`
  );
}

/**
 * Render the one `<header>` landmark.
 *
 * @param {object} options rendering options
 * @param {string} options.homeRoute the publication's own home route
 * @param {string} options.publicationName the validated publication title
 * @param {string} options.tagline the publication description
 * @param {{url: string, width?: number, height?: number} | undefined} options.brandMark
 *   the appearance brand mark image; the monogram is used when absent
 * @param {string} options.navHtml the already-rendered primary navigation
 * @param {readonly import('../../../types/index.d.ts').NavigationItem[]} options.navItems
 *   the same items, rendered again as the mobile menu's link list
 * @param {string | undefined} options.currentRoute the page's joined route
 * @param {string} options.urlPrefix the `baseUrl` path prefix
 * @param {import('./route.js').RouteNormalizationProfile} [options.routeProfile]
 *   the route normalization profile (default `directory-index`)
 * @param {string} options.searchIndexHref the static search index URL, read
 *   by the site script
 * @param {string} [options.appearanceControlHtml] the already-rendered
 *   appearance control, inserted into the `header-actions` slot
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} options.messages
 * @param {string} options.profile the admitted composition profile
 * @param {string} options.headerLayout the admitted composition's header layout
 * @returns {string} the rendered header
 */
export function renderHeader({
  homeRoute,
  publicationName,
  tagline,
  brandMark,
  navHtml,
  navItems,
  currentRoute,
  urlPrefix,
  routeProfile = 'directory-index',
  searchIndexHref,
  appearanceControlHtml,
  messages,
  profile,
  headerLayout,
}) {
  const label = (/** @type {string} */ key) =>
    escapeHtml(/** @type {string} */ (messages[key]));
  const menu =
    navItems.length > 0
      ? `<details class="g-menu"><summary>${icon('menu')}<span class="g-sr">${label('menuSummaryLabel')}</span></summary>` +
        `<ul>${navItems.map((item) => renderNavItem(item, currentRoute, urlPrefix, routeProfile)).join('')}</ul></details>`
      : '';
  const brand =
    `<a class="g-brand" href="${escapeHtml(homeRoute)}">${renderMark(publicationName, brandMark)}` +
    `<span class="g-brand-text"><span class="g-brand-name">${escapeHtml(publicationName)}</span>` +
    `<span class="g-brand-tag">${escapeHtml(tagline)}</span></span></a>`;
  const actions =
    `<div class="g-actions">` +
    `<button class="g-search-btn" type="button" hidden data-action="search" data-search-index="${escapeHtml(searchIndexHref)}" aria-label="${label('searchButtonAriaLabel')}">` +
    `${icon('search')}<span>${label('searchButtonLabel')}</span></button>` +
    renderSlot('header-actions', { html: appearanceControlHtml }) +
    menu +
    `</div>`;
  const content =
    profile === 'newsletter'
      ? actions + brand + navHtml
      : profile === 'visual'
        ? brand + actions + navHtml
        : profile === 'personal'
          ? navHtml + brand + actions
          : profile === 'developer'
            ? navHtml + actions + brand
            : brand + navHtml + actions;
  return `<header class="g-header" data-gala-header-layout="${escapeHtml(headerLayout)}"><div class="g-wrap g-header-row">${content}</div></header>`;
}

/**
 * @param {readonly unknown[]} socialLinks `publication.socialLinks`
 * @param {string} rssHref the RSS feed URL
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} messages
 * @returns {string} the `<ul>` of icon links
 */
function renderSocialLinks(socialLinks, rssHref, messages) {
  const items = socialLinks.flatMap((entry) => {
    const link = /** @type {Record<string, unknown>} */ (entry);
    if (typeof link?.uri !== 'string') return [];
    const type = typeof link.type === 'string' ? link.type : 'other';
    const text = typeof link.label === 'string' ? link.label : type;
    return [
      { href: link.uri, text, iconName: SOCIAL_ICONS[type] ?? 'upright' },
    ];
  });
  items.push({
    href: rssHref,
    text: /** @type {string} */ (messages.rssFeedLabel),
    iconName: 'rss',
  });
  return (
    `<ul class="g-social">` +
    items
      .map(
        (item) =>
          `<li><a class="g-icon-btn" href="${escapeHtml(item.href)}" aria-label="${escapeHtml(item.text)}" title="${escapeHtml(item.text)}">${icon(item.iconName)}</a></li>`,
      )
      .join('') +
    `</ul>`
  );
}

/**
 * Render the one `<footer>` landmark.
 *
 * @param {object} options rendering options
 * @param {string} options.homeRoute the publication's own home route
 * @param {string} options.publicationName the validated publication title
 * @param {string} options.description the publication description
 * @param {{url: string, width?: number, height?: number} | undefined} options.brandMark the brand mark image
 * @param {readonly unknown[]} options.socialLinks `publication.socialLinks`
 * @param {string} options.rssHref the RSS feed URL
 * @param {readonly import('../../../types/index.d.ts').NavigationItem[]} options.primaryItems
 *   the primary navigation items, repeated as the "Explore" column
 * @param {readonly import('../../../types/index.d.ts').NavigationItem[]} options.footerItems
 *   `navigationNormalized.footerItems`
 * @param {string} options.urlPrefix the `baseUrl` path prefix
 * @param {import('./route.js').RouteNormalizationProfile} [options.routeProfile]
 *   the route normalization profile (default `directory-index`)
 * @param {string} options.authorHtml the already-rendered author mini
 *   profile (may be empty)
 * @param {string} options.footerProfileHtml the already-rendered footer card
 *   body (may be empty)
 * @param {string | undefined} options.copyrightText the copyright line
 * @param {boolean} options.showAttribution whether the Galascribe
 *   attribution line renders: the build input's
 *   `appearance.attribution.showMadeWith`, shown when absent
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} options.messages
 * @param {string} options.profile the admitted composition profile
 * @param {string} options.footerLayout the admitted composition's footer layout
 * @param {string} options.publicBasePath the public base path
 *   (`route.js#derivePublicBasePath`) the generated legal pages sit under
 * @param {string} options.baseUrl the build input's `baseUrl` (https URL), whose
 *   host the "Made with Galascribe" referral link names
 * @param {boolean} [options.consentOn] whether the analytics module is on, which
 *   adds the script-revealed "Privacy choices" item to the legal navigation
 * @returns {string} the rendered footer
 */
export function renderFooter({
  homeRoute,
  publicationName,
  description,
  brandMark,
  socialLinks,
  rssHref,
  primaryItems,
  footerItems,
  urlPrefix,
  routeProfile = 'directory-index',
  authorHtml,
  footerProfileHtml,
  copyrightText,
  showAttribution,
  messages,
  profile,
  footerLayout,
  baseUrl,
  publicBasePath,
  consentOn = false,
}) {
  const label = (/** @type {string} */ key) =>
    escapeHtml(/** @type {string} */ (messages[key]));
  /**
   * @param {string} labelKey
   * @param {readonly import('../../../types/index.d.ts').NavigationItem[]} items
   * @returns {string}
   */
  const column = (labelKey, items) =>
    items.length === 0
      ? ''
      : `<nav class="g-footer-col" aria-label="${label(labelKey)}"><p class="g-label">${label(labelKey)}</p>` +
        `<ul>${items.map((item) => renderNavItem(item, undefined, urlPrefix, routeProfile)).join('')}</ul></nav>`;
  const brand =
    `<div class="g-footer-brand">` +
    `<a class="g-brand" href="${escapeHtml(homeRoute)}">${renderMark(publicationName, brandMark)}` +
    `<span class="g-brand-name">${escapeHtml(publicationName)}</span></a>` +
    `<p class="g-footer-about">${escapeHtml(description)}</p>` +
    renderSocialLinks(socialLinks, rssHref, messages) +
    `</div>`;
  const primary = column('exploreColumnLabel', primaryItems);
  const secondary = column('footerNavigationLabel', footerItems);
  const profileCard =
    `<div class="g-footer-col">` +
    renderSlot('footer-profile', { html: authorHtml + footerProfileHtml }) +
    `</div>`;
  const legalItem = (/** @type {string} */ route, /** @type {string} */ key) =>
    `<li><a href="${escapeHtml(joinPublicRoute(publicBasePath, route, routeProfile))}">${label(key)}</a></li>`;
  const legalItems =
    legalItem('/terms', 'termsLinkLabel') +
    legalItem('/privacy', 'privacyLinkLabel') +
    (showAttribution
      ? `<li><a href="${escapeHtml(madeWithGalascribeHref(baseUrl))}" target="_blank" rel="noopener">${label('footerAttributionLabel')}</a></li>`
      : '') +
    (consentOn ? renderConsentOpenItem(messages) : '');
  const grid =
    profile === 'newsletter'
      ? brand + profileCard + primary + secondary
      : profile === 'visual'
        ? brand + primary + profileCard + secondary
        : profile === 'personal'
          ? profileCard + brand + primary + secondary
          : profile === 'developer'
            ? primary + secondary + brand + profileCard
            : brand + primary + secondary + profileCard;
  return (
    `<footer class="g-footer" data-gala-footer-layout="${escapeHtml(footerLayout)}"><div class="g-wrap g-footer-grid">${grid}</div>` +
    renderSlot('footer-auxiliary') +
    renderSlot('account-intent') +
    renderSlot('conversation') +
    renderSlot('newsletter') +
    `<div class="g-wrap g-footer-base">` +
    (copyrightText ? `<span>${escapeHtml(copyrightText)}</span>` : '') +
    `<nav class="g-footer-legal" aria-label="${label('footerLegalLabel')}"><ul>` +
    legalItems +
    `</ul></nav></div></footer>`
  );
}
