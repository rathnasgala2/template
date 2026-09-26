/**
 * Core semantic HTML skeleton and navigation renderer.
 *
 * This module renders only inert, static, CSP-`script-src 'self'`-compatible
 * markup: no inline `on*` attribute, no inline `<script>`, no `javascript:`
 * URL. Every user-visible chrome string it emits comes from
 * `internal/messages.js`'s catalog, never an inline literal, so localization
 * can find every string in one place.
 *
 * Landmark contract every page kind in `internal/page-kinds.js` composes
 * through {@link renderPageBody}:
 *
 * - a skip link, the very first focusable element, targeting `#main-content`;
 * - exactly one `<header>` (home link with the validated publication name and
 *   an optional core logo carrying required alternative text, plus the
 *   always-present, currently-empty `header-actions` slot);
 * - exactly one primary `<nav>` built from `navigationNormalized.items`;
 * - exactly one `<main id="main-content">`, carrying an optional breadcrumb
 *   `<nav>` before the page's own single `<h1>`;
 * - exactly one `<footer>` with the publication name, resolved footer
 *   navigation, footer profile slot, copyright/license text and the
 *   template attribution line, plus the remaining always-present,
 *   currently-empty core slots (`footer-auxiliary`, `account-intent`,
 *   `conversation`, `newsletter`, `edition-selector`).
 *
 * Core owns nine versioned semantic slots plus the collapsed
 * `article-footer-ad` slot: `header-actions`, `article-preamble`,
 * `article-end`, `footer-profile`, `footer-auxiliary`, `account-intent`,
 * `conversation`, `newsletter` and `edition-selector`. This renderer has no
 * module system (`build-input.modules` is always `{}`), so every slot
 * renders empty except `footer-profile`, which always wraps the
 * publication's own always-rendered footer card/author-profile content
 * (there is no separate module content to distinguish it from here). Each
 * slot is one `data-gala-slot="<name>"` attribute on an otherwise plain,
 * non-landmark `<div>` — an empty element with no accessible name
 * contributes nothing to the accessibility tree, so an empty slot is
 * exactly as inert as one that does not exist. The collapsed
 * `article-footer-ad` slot additionally carries the `hidden` attribute, so
 * it produces no visible, accessibility, layout, network or telemetry
 * effect at all until a later module (not built here) removes `hidden` for
 * a selected placement — none exist here (`build-input.placements` is
 * always `[]`).
 *
 * `header-actions` is not always-empty: it is core's own home for the
 * Light/Dark/System appearance control (the three-mode appearance control
 * in the header-actions slot) — core content, not a module, so this slot's
 * earlier "every slot ... renders empty" description does not cover it.
 * Every other slot is unaffected.
 *
 * The exact `selectorAtom`/hook-naming decisions here (`data-gala-slot`
 * attribute, one slot name per value) are what
 * `contracts/theme-styling-contract.jcs` later locks into its published
 * catalog, so this module documents the decision here rather than
 * pre-authoring that contract file itself.
 */

/**
 * Every `data-gala-slot` value this renderer ever writes (the nine
 * versioned core slots plus the collapsed `article-footer-ad` slot), sorted
 * by UTF-8 bytes. `contracts/theme-styling-contract.jcs` exposes one public
 * theme hook per entry here, so this is the single source of truth both
 * `renderSlot` below and that contract builder read from — never a second
 * hand-typed literal list.
 *
 * @type {readonly string[]}
 */
export const SLOT_NAMES = Object.freeze(
  [
    'header-actions',
    'article-preamble',
    'article-end',
    'article-footer-ad',
    'footer-profile',
    'footer-auxiliary',
    'account-intent',
    'conversation',
    'newsletter',
    'edition-selector',
  ].sort(),
);

/** @type {Readonly<Record<string, string>>} */
const HTML_ESCAPES = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
});

/**
 * Escape a string for safe insertion into HTML text or a quoted attribute
 * value.
 *
 * @param {string} value raw text
 * @returns {string} HTML-escaped text
 */
export function escapeHtml(value) {
  let escaped = '';
  for (const character of value) {
    escaped += HTML_ESCAPES[character] ?? character;
  }
  return escaped;
}

/**
 * Render one always-present, currently-empty core semantic slot.
 *
 * @param {string} slotName one of the nine versioned slot names, or the
 *   collapsed `article-footer-ad` slot
 * @param {object} [options] rendering options
 * @param {boolean} [options.collapsed] when `true`, additionally sets
 *   `hidden` (the collapsed `article-footer-ad` slot)
 * @param {string} [options.html] already-rendered inner markup (the
 *   `header-actions` slot's appearance control); every other slot omits this
 *   and stays empty
 * @returns {string} the slot element
 */
export function renderSlot(slotName, options = {}) {
  const hiddenAttribute = options.collapsed ? ' hidden' : '';
  const inner = options.html ?? '';
  return `<div data-gala-slot="${escapeHtml(slotName)}"${hiddenAttribute}>${inner}</div>`;
}

/**
 * Render the mandatory skip link, the first focusable element on every page.
 *
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} messages
 *   the resolved message catalog
 * @returns {string} the skip link markup
 */
export function renderSkipLink(messages) {
  const label = escapeHtml(/** @type {string} */ (messages.skipToContent));
  return `<a href="#main-content">${label}</a>`;
}

/**
 * Render one navigation item and its bounded (at most one level of)
 * children as an `<li>`.
 *
 * @param {import('../../../types/index.d.ts').NavigationItem} item a validated
 *   `navigationItem` (or `navigationLeaf`, which never has children)
 * @param {string | undefined} currentRoute the current page's own joined
 *   route, so the matching link can carry `aria-current="page"`
 * @returns {string} the rendered `<li>`
 */
function renderNavItem(item, currentRoute) {
  const label = escapeHtml(item.label);
  const href = escapeHtml(
    /** @type {string} */ (item.type === 'internal' ? item.route : item.url),
  );
  const isCurrent = item.type === 'internal' && item.route === currentRoute;
  const currentAttribute = isCurrent ? ' aria-current="page"' : '';
  const children = item.children ?? [];
  const childList =
    children.length > 0
      ? `<ul>${children.map((child) => renderNavItem(child, currentRoute)).join('')}</ul>`
      : '';
  return `<li><a href="${href}"${currentAttribute}>${label}</a>${childList}</li>`;
}

/**
 * Render the one primary `<nav>` from `navigationNormalized.items`.
 *
 * @param {object} options rendering options
 * @param {readonly import('../../../types/index.d.ts').NavigationItem[]} options.items
 *   `navigationNormalized.items` (0..100 root items, each with at most one
 *   level of children per the `navigation:2.0.0` schema)
 * @param {string | undefined} options.currentRoute the current page's joined
 *   route
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} options.messages
 *   the resolved message catalog
 * @returns {string} the rendered primary navigation `<nav>`, always present
 *   even when `items` is empty (TPL-M3): every page kind renders exactly
 *   one primary-navigation landmark unconditionally
 *   (`internal/page-kinds.js`'s own module documentation), so a reader
 *   navigating by landmark list sees the same, predictable chrome structure
 *   on every page regardless of whether that publication has authored any
 *   navigation items yet.
 */
export function renderPrimaryNavigation({ items, currentRoute, messages }) {
  const label = escapeHtml(
    /** @type {string} */ (messages.primaryNavigationLabel),
  );
  const itemsHtml = items
    .map((item) => renderNavItem(item, currentRoute))
    .join('');
  return `<nav aria-label="${label}"><ul>${itemsHtml}</ul></nav>`;
}

/**
 * Render the footer `<nav>` from `navigationNormalized.footerItems`.
 *
 * @param {object} options rendering options
 * @param {readonly import('../../../types/index.d.ts').NavigationItem[]} options.items
 *   `navigationNormalized.footerItems` (0..50 root items)
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} options.messages
 *   the resolved message catalog
 * @returns {string} the rendered footer navigation
 */
export function renderFooterNavigation({ items, messages }) {
  const label = escapeHtml(
    /** @type {string} */ (messages.footerNavigationLabel),
  );
  const itemsHtml = items
    .map((item) => renderNavItem(item, undefined))
    .join('');
  return `<nav aria-label="${label}"><ul>${itemsHtml}</ul></nav>`;
}

/**
 * @typedef {object} BreadcrumbStep
 * @property {string} label the visible crumb text
 * @property {string} [route] the crumb's joined route; omitted for the
 *   current (last) step, which is rendered as plain text with
 *   `aria-current="page"`
 */

/**
 * Render an ordered breadcrumb trail. Required on every generated listing
 * page (index, tag, series, archive) and author page; the publication
 * profile and the top-level index carry no breadcrumb, as there is nothing
 * above them to show.
 *
 * @param {object} options rendering options
 * @param {readonly BreadcrumbStep[]} options.trail one or more steps, in
 *   display order, always starting with the home step
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} options.messages
 *   the resolved message catalog
 * @returns {string} the rendered breadcrumb `<nav>`
 */
export function renderBreadcrumbs({ trail, messages }) {
  const label = escapeHtml(
    /** @type {string} */ (messages.breadcrumbNavigationLabel),
  );
  const items = trail
    .map((step, index) => {
      const isLast = index === trail.length - 1;
      const text = escapeHtml(step.label);
      if (isLast) {
        return `<li aria-current="page">${text}</li>`;
      }
      if (!step.route) {
        return `<li>${text}</li>`;
      }
      return `<li><a href="${escapeHtml(step.route)}">${text}</a></li>`;
    })
    .join('');
  return `<nav aria-label="${label}"><ol>${items}</ol></nav>`;
}

/**
 * Render deterministic pagination controls for a listing page (index or
 * archive kind).
 *
 * @param {object} options rendering options
 * @param {number} options.currentPage the current 1-based page number
 * @param {number} options.totalPages the total page count (at least 1)
 * @param {(pageNumber: number) => string} options.routeForPage maps a
 *   1-based page number to its joined route
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} options.messages
 *   the resolved message catalog
 * @returns {string} the rendered pagination `<nav>`, or an empty string when
 *   there is exactly one page
 */
export function renderPagination({
  currentPage,
  totalPages,
  routeForPage,
  messages,
}) {
  if (totalPages <= 1) return '';
  const label = escapeHtml(
    /** @type {string} */ (messages.paginationNavigationLabel),
  );
  const previousLabel = escapeHtml(
    /** @type {string} */ (messages.previousPageLabel),
  );
  const nextLabel = escapeHtml(/** @type {string} */ (messages.nextPageLabel));
  const statusLabel = escapeHtml(
    /** @type {(current: string, total: string) => string} */ (
      messages.pageStatusLabel
    )(String(currentPage), String(totalPages)),
  );
  const previous =
    currentPage > 1
      ? `<a rel="prev" href="${escapeHtml(routeForPage(currentPage - 1))}">${previousLabel}</a>`
      : `<span>${previousLabel}</span>`;
  const next =
    currentPage < totalPages
      ? `<a rel="next" href="${escapeHtml(routeForPage(currentPage + 1))}">${nextLabel}</a>`
      : `<span>${nextLabel}</span>`;
  return (
    `<nav aria-label="${label}"><ul>` +
    `<li>${previous}</li>` +
    `<li aria-current="page">${statusLabel}</li>` +
    `<li>${next}</li>` +
    `</ul></nav>`
  );
}

/**
 * Render the one `<header>` landmark.
 *
 * @param {object} options rendering options
 * @param {string} options.homeRoute the publication's own home route
 *   (`basePath`, joined)
 * @param {string} options.publicationName the validated publication title
 * @param {{route: string, alt: string} | undefined} options.logo an optional
 *   core logo image, always carrying alternative text
 * @param {string} [options.appearanceControlHtml] the already-rendered
 *   Light/Dark/System appearance control
 *   (`internal/appearance/controller-markup.js`'s `renderAppearanceControl`),
 *   inserted into the `header-actions` slot
 * @returns {string} the rendered header
 */
export function renderHeader({
  homeRoute,
  publicationName,
  logo,
  appearanceControlHtml,
}) {
  const name = escapeHtml(publicationName);
  const href = escapeHtml(homeRoute);
  const logoHtml = logo
    ? `<img src="${escapeHtml(logo.route)}" alt="${escapeHtml(logo.alt)}">`
    : '';
  return (
    '<header>' +
    `<a href="${href}">${logoHtml}<span>${name}</span></a>` +
    renderSlot('header-actions', { html: appearanceControlHtml }) +
    '</header>'
  );
}

/**
 * Render the one `<footer>` landmark.
 *
 * @param {object} options rendering options
 * @param {string} options.publicationName the validated publication title
 * @param {string} options.footerNavHtml the already-rendered footer
 *   navigation (see {@link renderFooterNavigation})
 * @param {string} options.footerProfileHtml the already-rendered
 *   `footer-profile` slot content (footer card and/or author cards; may be
 *   empty when the publication authored neither)
 * @param {string | undefined} options.copyrightText an optional
 *   already-resolved copyright/license text line
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} options.messages
 *   the resolved message catalog
 * @returns {string} the rendered footer
 */
export function renderFooter({
  publicationName,
  footerNavHtml,
  footerProfileHtml,
  copyrightText,
  messages,
}) {
  const name = escapeHtml(publicationName);
  const copyrightHtml = copyrightText
    ? `<p>${escapeHtml(copyrightText)}</p>`
    : '';
  const attribution = escapeHtml(
    /** @type {string} */ (messages.footerAttributionLabel),
  );
  return (
    '<footer>' +
    `<p>${name}</p>` +
    footerNavHtml +
    `<div data-gala-slot="footer-profile">${footerProfileHtml}</div>` +
    renderSlot('footer-auxiliary') +
    renderSlot('account-intent') +
    renderSlot('conversation') +
    renderSlot('newsletter') +
    renderSlot('edition-selector') +
    copyrightHtml +
    `<p>${attribution}</p>` +
    '</footer>'
  );
}

/**
 * Compose one complete page body (everything inside `<body>`) from its
 * pre-rendered landmark parts. Every page kind in `internal/page-kinds.js`
 * funnels through this one function, so the landmark order and count (one
 * skip link, one header, one primary nav, one main, one footer) can never
 * drift between page kinds.
 *
 * @param {object} options rendering options
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} options.messages
 *   the resolved message catalog
 * @param {string} options.headerHtml the already-rendered header
 * @param {string} options.navHtml the already-rendered primary navigation
 * @param {string} options.footerHtml the already-rendered footer
 * @param {string} [options.breadcrumbHtml] an optional already-rendered
 *   breadcrumb, inserted before the page's own `<h1>`
 * @param {string} options.mainHtml the page kind's own inner markup, always
 *   starting with exactly one `<h1>`
 * @returns {string} the complete `<body>` inner HTML
 */
export function renderPageBody({
  messages,
  headerHtml,
  navHtml,
  footerHtml,
  breadcrumbHtml,
  mainHtml,
}) {
  return (
    renderSkipLink(messages) +
    headerHtml +
    navHtml +
    `<main id="main-content">${breadcrumbHtml ?? ''}${mainHtml}</main>` +
    footerHtml
  );
}
