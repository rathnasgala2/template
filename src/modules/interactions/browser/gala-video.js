/**
 * The click-to-play video script, emitted by the renderer as
 * `assets/gala-video-v1.js` on pages that carry a video card. A same-origin
 * external file (CSP `script-src 'self'`), loaded with `defer`. Plain ES2020,
 * no dependencies, one IIFE.
 *
 * A video card is a server-rendered link to the provider's watch page
 * (`figure[data-gala-video="<provider>:<id>"]`), so the page reads and works
 * without this script and no third party is contacted until a reader taps.
 * On a plain tap the card is replaced by one `<iframe>` from
 * `https://www.youtube-nocookie.com/embed/<id>` or
 * `https://player.vimeo.com/video/<id>` (the two hosts the page's CSP
 * `frame-src` admits). A modified click (new tab, new window, download) and a
 * value that is not a well-formed provider reference keep the link.
 *
 * Security: the frame address is built here from a provider-and-id pair that
 * is checked against a fixed pattern per provider; page text never becomes
 * markup, only `textContent` and attributes.
 */

(function () {
  'use strict';

  /** @type {Record<string, {id: RegExp, embed: string}>} */
  const PROVIDERS = {
    youtube: {
      id: /^[A-Za-z0-9_-]{11}$/,
      embed: 'https://www.youtube-nocookie.com/embed/',
    },
    vimeo: {
      id: /^[0-9]{1,12}$/,
      embed: 'https://player.vimeo.com/video/',
    },
  };

  /**
   * @param {string} reference `<provider>:<id>`
   * @returns {string | null} the embed address, or `null` when malformed
   */
  function embedAddress(reference) {
    const at = reference.indexOf(':');
    if (at < 1) return null;
    const provider = Object.prototype.hasOwnProperty.call(
      PROVIDERS,
      reference.slice(0, at),
    )
      ? PROVIDERS[reference.slice(0, at)]
      : null;
    const id = reference.slice(at + 1);
    if (!provider || !provider.id.test(id)) return null;
    return provider.embed + id + '?autoplay=1';
  }

  /**
   * @param {HTMLElement} card the `figure`
   * @param {string} address the embed address
   */
  function play(card, address) {
    const title = card.querySelector('.g-block__title');
    let label = '';
    if (title) {
      // The title without its screen-reader prefix ("Play video").
      title.childNodes.forEach(function (node) {
        const element = /** @type {Element} */ (node);
        if (!(element.classList && element.classList.contains('g-sr'))) {
          label += node.textContent || '';
        }
      });
    }
    label = label.trim();
    const frame = document.createElement('iframe');
    frame.setAttribute('src', address);
    frame.setAttribute('title', label || 'Video');
    frame.setAttribute('loading', 'lazy');
    frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    frame.setAttribute('allowfullscreen', '');
    frame.setAttribute('allow', 'autoplay; fullscreen');
    const box = document.createElement('div');
    box.className = 'g-video__frame';
    box.appendChild(frame);
    while (card.firstChild) card.removeChild(card.firstChild);
    card.appendChild(box);
    frame.focus();
  }

  document.addEventListener('click', function (event) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const target = /** @type {Element | null} */ (event.target);
    const link = target && target.closest ? target.closest('a') : null;
    const card = link ? link.closest('figure[data-gala-video]') : null;
    if (!card) return;
    const address = embedAddress(card.getAttribute('data-gala-video') || '');
    if (!address) return;
    event.preventDefault();
    play(/** @type {HTMLElement} */ (card), address);
  });
})();
