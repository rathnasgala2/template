/**
 * The article share group (`publication.sharing.targets`): which buttons it
 * holds, in which order, and the markup of each.
 *
 * Every target except `copy-link` and `native` is a plain `<a>` built from the
 * network's documented share URL with the post title and canonical URL
 * encoded into it, so it works with JavaScript off (`target="_blank"`,
 * `rel="noopener noreferrer"`, an accessible name such as "Share on X"). The
 * `email` target is a `mailto:` link and opens no tab: it has neither
 * attribute.
 * `copy-link`, `native` and the always-present Bookmark need the site script;
 * the script (`appearance/bootstrap-script.js`, `enhanceShare`) reveals them.
 *
 * Markup rules:
 *
 * - No `sharing` (or exactly `["copy-link"]`) renders the original group
 *   byte for byte: `hidden` on the group, which the script removes.
 * - With at least one link target the group itself is visible without
 *   JavaScript and every script-dependent button carries its own `hidden`;
 *   the script removes it (`native` only where `navigator.share` exists).
 * - An empty target list leaves the Bookmark button alone in the group.
 *
 * Only classes the published styling contract already lists are used
 * (`g-share`, `g-icon-btn`), so no hook is added.
 */

import { RenderPolicyViolationError } from '../errors.js';
import { escapeHtml } from './skeleton.js';
import { icon } from './icons.js';

/**
 * Every admitted target, in the order the schema lists them.
 *
 * @type {readonly string[]}
 */
export const SHARE_TARGETS = Object.freeze([
  'copy-link',
  'native',
  'x',
  'bluesky',
  'linkedin',
  'facebook',
  'hacker-news',
  'whatsapp',
  'telegram',
  'reddit',
  'email',
]);

/**
 * The targets of a publication that never chose any: today's group.
 *
 * @type {readonly string[]}
 */
export const DEFAULT_SHARE_TARGETS = Object.freeze(['copy-link']);

/**
 * @typedef {object} ShareContent
 * @property {string} title the post title
 * @property {string} url the post's absolute canonical URL
 * @property {string} text the share text: the title, a space, the URL
 */

/**
 * The network targets: the brand name (never localized), the icon key and the
 * documented share URL. `source` cites where each URL shape is documented;
 * the first six repeat `v1/site-template/lib/provider-fixtures/share-intents.v1.json`
 * (verified 2026-08-13/14).
 *
 * @type {Readonly<Record<string, {name: string, icon: string, source: string, href: (content: ShareContent) => string}>>}
 */
const NETWORKS = Object.freeze({
  x: {
    name: 'X',
    icon: 'x',
    // https://developer.x.com/en/docs/twitter-for-websites/tweet-button/guides/web-intent
    source: 'developer.x.com web intent',
    href: ({ title, url }) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  bluesky: {
    name: 'Bluesky',
    icon: 'bluesky',
    // https://docs.bsky.app/docs/advanced-guides/intent-links
    source: 'docs.bsky.app intent links',
    href: ({ text }) =>
      `https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`,
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'linkedin',
    // https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/plugins/share-plugin
    source: 'LinkedIn share plugin',
    href: ({ url }) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  facebook: {
    name: 'Facebook',
    icon: 'facebook',
    // The Share Button plugin documents this URL as the plain-link fallback
    // of its embed code: https://developers.facebook.com/docs/plugins/share-button/
    // (the page is script-rendered, so the URL was not re-fetched here).
    source: 'Facebook Share Button plugin fallback link',
    href: ({ url }) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  'hacker-news': {
    name: 'Hacker News',
    icon: 'hacker-news',
    // https://news.ycombinator.com/bookmarklet.html
    source: 'Hacker News submit bookmarklet',
    href: ({ title, url }) =>
      `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}`,
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: 'whatsapp',
    // https://faq.whatsapp.com/5913398998672934 ("Use click to chat")
    source: 'WhatsApp click to chat',
    href: ({ text }) => `https://wa.me/?text=${encodeURIComponent(text)}`,
  },
  telegram: {
    name: 'Telegram',
    icon: 'telegram',
    // https://core.telegram.org/widgets/share ("Share Button": url and text;
    // checked 2026-10-27)
    source: 'Telegram share widget',
    href: ({ title, url }) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  reddit: {
    name: 'Reddit',
    icon: 'reddit',
    // Reddit's submit page with `url` and `title`. The provider fixture marks
    // the desktop prefill "blocked-public-intent-contract-unverified" (source
    // https://www.reddit.com/r/bugs/comments/1cobgwm/simple_reddit_share_links_on_external_sites_no/):
    // the link always opens Reddit's submit page, and the prefill is Reddit's
    // to honor.
    source: 'Reddit submit link (prefill not a stable contract)',
    href: ({ title, url }) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
});

/**
 * The email target: a `mailto:` link, RFC 6068 (https://www.rfc-editor.org/rfc/rfc6068),
 * subject = the title, body = the share text.
 *
 * @param {ShareContent} content
 * @returns {string} the `mailto:` URL
 */
const emailHref = ({ title, text }) =>
  `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`;

/**
 * Whether a target is a plain link (works without JavaScript).
 *
 * @param {string} target an admitted target
 * @returns {boolean} true for everything except `copy-link` and `native`
 */
const isLinkTarget = (target) => target !== 'copy-link' && target !== 'native';

/**
 * The publication's targets: its own list when it set one (an empty list
 * included), else today's `["copy-link"]`.
 *
 * @param {{targets: readonly string[]} | undefined} sharing `publication.sharing`
 * @returns {string[]} the ordered, de-duplicated targets
 * @throws {RenderPolicyViolationError} for a target this renderer does not know
 */
export function resolveShareTargets(sharing) {
  const requested = sharing?.targets ?? DEFAULT_SHARE_TARGETS;
  /** @type {string[]} */
  const targets = [];
  for (const target of requested) {
    if (!SHARE_TARGETS.includes(target)) {
      throw new RenderPolicyViolationError(
        `publication.sharing.targets names an unknown share target ${JSON.stringify(target)}`,
      );
    }
    if (!targets.includes(target)) targets.push(target);
  }
  return targets;
}

/**
 * Render the article's share group.
 *
 * @param {object} options
 * @param {{targets: readonly string[]} | undefined} options.sharing
 *   `publication.sharing`
 * @param {string} options.title the post title
 * @param {string} options.url the post's absolute canonical URL
 * @param {Readonly<Record<string, string | ((...args: string[]) => string)>>} options.messages
 *   the resolved message catalog
 * @returns {string} the `<div class="g-share">` markup
 */
export function renderShareGroup({ sharing, title, url, messages }) {
  const targets = resolveShareTargets(sharing);
  /** @type {ShareContent} */
  const content = { title, url, text: `${title} ${url}` };
  const text = (/** @type {string} */ key) =>
    escapeHtml(/** @type {string} */ (messages[key]));
  const call = (/** @type {string} */ key, /** @type {string} */ arg) =>
    escapeHtml(/** @type {(a: string) => string} */ (messages[key])(arg));
  // With a link target the group is useful before the script runs, so it is
  // visible and the script-only buttons hide themselves; otherwise the whole
  // group waits for the script, exactly as the original group did.
  const linked = targets.some(isLinkTarget);
  const hidden = linked ? ' hidden' : '';

  /**
   * @param {string} target
   * @returns {string}
   */
  const render = (target) => {
    if (target === 'copy-link') {
      return `<button class="g-icon-btn" type="button" data-action="copy-link" aria-label="${text('copyLinkLabel')}" title="${text('copyLinkLabel')}"${hidden}>${icon('link')}</button>`;
    }
    if (target === 'native') {
      // Always hidden here: the script shows it only where the Web Share API
      // exists.
      return `<button class="g-icon-btn" type="button" data-action="native-share" data-share-title="${escapeHtml(title)}" data-share-url="${escapeHtml(url)}" aria-label="${text('shareNativeLabel')}" title="${text('shareNativeLabel')}" hidden>${icon('share')}</button>`;
    }
    if (target === 'email') {
      return anchor(
        target,
        emailHref(content),
        text('shareByEmailLabel'),
        'mail',
        false,
      );
    }
    const network = NETWORKS[target];
    return anchor(
      target,
      network.href(content),
      call('shareOnLabel', network.name),
      network.icon,
    );
  };

  return (
    `<div class="g-share" role="group" aria-label="${text('shareLabel')}"${linked ? '' : ' hidden'}>` +
    targets.map(render).join('') +
    `<button class="g-icon-btn" type="button" data-action="bookmark" aria-pressed="false" aria-label="${text('saveForLaterLabel')}" title="${text('saveForLaterLabel')}"${hidden}>${icon('bookmark')}</button>` +
    `</div>`
  );
}

/**
 * One link target.
 *
 * @param {string} target the target key
 * @param {string} href the intent URL (raw, escaped here)
 * @param {string} label the already-escaped accessible name
 * @param {string} iconName a key of the icon set
 * @param {boolean} [newTab] open in a new tab (default); a `mailto:` link
 *   passes `false`, because a new tab for it is left blank once the mail
 *   client takes over
 * @returns {string} the `<a>` markup
 */
function anchor(target, href, label, iconName, newTab = true) {
  const opening = newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a class="g-icon-btn" href="${escapeHtml(href)}"${opening} data-share="${target}" aria-label="${label}" title="${label}">${icon(iconName)}</a>`;
}
