/**
 * Site chrome: the one `<header>` and the one `<footer>` landmark every page
 * is composed with (see `internal/skeleton.js`'s landmark contract). Markup
 * mirrors the approved design reference and reads completely with JavaScript
 * off; the optional site script only reveals the search button (rendered
 * `hidden`) and enhances the rest.
 */

import { escapeHtml, renderNavItem, renderSlot } from './skeleton.js';
import { icon } from './icons.js';
import { monogram, renderImage } from './components.js';

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
 * @param {string} options.searchIndexHref the static search index URL, read
 *   by the site script
 * @param {string} [options.appearanceControlHtml] the already-rendered
 *   appearance control, inserted into the `header-actions` slot
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} options.messages
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
  searchIndexHref,
  appearanceControlHtml,
  messages,
}) {
  const label = (/** @type {string} */ key) =>
    escapeHtml(/** @type {string} */ (messages[key]));
  const menu =
    navItems.length > 0
      ? `<details class="g-menu"><summary>${icon('menu')}<span class="g-sr">${label('menuSummaryLabel')}</span></summary>` +
        `<ul>${navItems.map((item) => renderNavItem(item, currentRoute, urlPrefix)).join('')}</ul></details>`
      : '';
  return (
    `<header class="g-header"><div class="g-wrap g-header-row">` +
    `<a class="g-brand" href="${escapeHtml(homeRoute)}">${renderMark(publicationName, brandMark)}` +
    `<span class="g-brand-text"><span class="g-brand-name">${escapeHtml(publicationName)}</span>` +
    `<span class="g-brand-tag">${escapeHtml(tagline)}</span></span></a>` +
    navHtml +
    `<div class="g-actions">` +
    `<button class="g-search-btn" type="button" hidden data-action="search" data-search-index="${escapeHtml(searchIndexHref)}" aria-label="${label('searchButtonAriaLabel')}">` +
    `${icon('search')}<span>${label('searchButtonLabel')}</span></button>` +
    renderSlot('header-actions', { html: appearanceControlHtml }) +
    menu +
    `</div></div></header>`
  );
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
 * @param {string} options.authorHtml the already-rendered author mini
 *   profile (may be empty)
 * @param {string} options.footerProfileHtml the already-rendered footer card
 *   body (may be empty)
 * @param {string | undefined} options.copyrightText the copyright line
 * @param {boolean} options.showAttribution whether the Galascribe
 *   attribution line renders: the build input's
 *   `appearance.attribution.showMadeWith`, shown when absent
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} options.messages
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
  authorHtml,
  footerProfileHtml,
  copyrightText,
  showAttribution,
  messages,
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
        `<ul>${items.map((item) => renderNavItem(item, undefined, urlPrefix)).join('')}</ul></nav>`;
  return (
    `<footer class="g-footer"><div class="g-wrap g-footer-grid">` +
    `<div class="g-footer-brand">` +
    `<a class="g-brand" href="${escapeHtml(homeRoute)}">${renderMark(publicationName, brandMark)}` +
    `<span class="g-brand-name">${escapeHtml(publicationName)}</span></a>` +
    `<p class="g-footer-about">${escapeHtml(description)}</p>` +
    renderSocialLinks(socialLinks, rssHref, messages) +
    `</div>` +
    column('exploreColumnLabel', primaryItems) +
    column('footerNavigationLabel', footerItems) +
    `<div class="g-footer-col">` +
    renderSlot('footer-profile', { html: authorHtml + footerProfileHtml }) +
    `</div>` +
    `</div>` +
    renderSlot('footer-auxiliary') +
    renderSlot('account-intent') +
    renderSlot('conversation') +
    renderSlot('newsletter') +
    `<div class="g-wrap g-footer-base">` +
    (copyrightText ? `<span>${escapeHtml(copyrightText)}</span>` : '') +
    (showAttribution ? `<span>${label('footerAttributionLabel')}</span>` : '') +
    `</div></footer>`
  );
}
