/**
 * The template's own fixed inline icon set. Chrome (header, footer, cards,
 * article furniture) is template-owned markup, never author content, so
 * these inline `<svg>` elements are emitted straight into the page and never
 * pass through the author-content sanitizer in `content-security.js`. Every
 * icon is decorative (`aria-hidden`, not focusable); a control that carries
 * only an icon always has its own accessible name from the message catalog.
 * No external icon file, font or network request is involved.
 *
 * Path data is the approved design reference's icon set (24x24 grid,
 * stroke-based; fill/stroke colours come from the base layer, never here).
 */

/** @type {Readonly<Record<string, string>>} */
export const ICONS = Object.freeze({
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  monitor:
    '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  moon: '<path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  upright: '<path d="M7 17 17 7M8 7h9v9"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  rss: '<path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1.2"/>',
  code: '<path d="m8 8-5 4 5 4M16 8l5 4-5 4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  hash: '<path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16"/>',
  book: '<path d="M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3zM21 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z"/>',
  sparkle:
    '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  heart:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/>',
});

/**
 * Render one inline icon.
 *
 * @param {string} name a key of {@link ICONS}
 * @returns {string} the `<svg>` markup, or an empty string for an unknown
 *   name (a defect the tests catch, never an author-reachable path)
 */
export function icon(name) {
  const paths = ICONS[name];
  if (paths === undefined) return '';
  return `<svg class="g-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`;
}
