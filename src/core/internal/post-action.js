/**
 * The end-of-post action block (schemas 3.56.0): one action under an article,
 * chosen for the whole site by `publication.postAction` and overridden or
 * hidden per post by the front matter's `action`. Every reference to the
 * members that arrive with schemas 3.56.0 (`postAction`, `action`,
 * `follows.publicCount`) is in this file, `site-render.js` and the places that
 * call it, so moving the lock to 3.56.0 is a search for `postAction`.
 *
 * The block adds no class: the template styling contract's catalog digest
 * covers every class a page renders, and a new class would invalidate every
 * published theme. The base layer styles it by its `data-gala-action`
 * attribute and its accessible-name id.
 */

import { escapeHtml } from './skeleton.js';
import { icon } from './icons.js';

/** @type {string} the id of the block's heading */
export const POST_ACTION_TITLE_ID = 'g-post-action-title';

/**
 * @typedef {import('../../../types/index.d.ts').PostAction} PostAction
 * @typedef {import('../../../types/index.d.ts').PostActionOverride} PostActionOverride
 */

/**
 * The action a post shows: its own `action` when it has one (`kind: "none"`
 * hides the block), else the site's.
 *
 * @param {object} options
 * @param {PostAction | undefined} options.siteAction `publication.postAction`
 * @param {PostActionOverride | undefined} options.postAction the post's
 *   front-matter `action`
 * @returns {PostAction | undefined} the action, or undefined for no block
 */
export function resolvePostAction({ siteAction, postAction }) {
  if (postAction === undefined) return siteAction;
  return postAction.kind === 'none' ? undefined : postAction;
}

/**
 * Whether the chosen kind can render on a page.
 *
 * @param {object} options
 * @param {PostAction} options.action the resolved action
 * @param {boolean} options.followsOn whether the site has the Follow control
 * @param {boolean} options.hasAuthor whether the post has an author to follow
 * @param {boolean} options.hasNewsletter whether the site has a newsletter
 * @returns {boolean} true when the block can show
 */
export function postActionAvailable({
  action,
  followsOn,
  hasAuthor,
  hasNewsletter,
}) {
  if (action.kind === 'follow') return followsOn && hasAuthor;
  if (action.kind === 'newsletter') return hasNewsletter;
  return true;
}

/** @type {import('../manifest.js').ManifestFinding} the manifest warning for a block that cannot show */
export const POST_ACTION_UNAVAILABLE_FINDING = Object.freeze({
  code: 'POST_ACTION_UNAVAILABLE',
  severity: /** @type {const} */ ('warning'),
  pointer: '/publication/postAction',
  messageKey: 'post-action-unavailable',
});

/**
 * The manifest warnings for the posts whose chosen action cannot show: one
 * finding, `POST_ACTION_UNAVAILABLE`, at the pointer of the setting that
 * chose it (the site's `/publication/postAction`, or the post's own
 * `/content/<index>/frontmatter/action`), once per pointer.
 *
 * @param {import('../../../types/index.d.ts').NormalizedBuildInput} input a
 *   validated build input
 * @param {readonly import('../../../types/index.d.ts').ContentBuildRecord[]} articles
 *   the published articles
 * @returns {import('../manifest.js').ManifestFinding[]} the findings
 */
export function postActionFindings(input, articles) {
  const followsOn =
    input.modules.interactions?.config.follows?.enabled === true;
  const hasNewsletter = input.publication.newsletter !== undefined;
  const authorIds = new Set(input.authors.map((author) => author.id));
  /** @type {Map<string, import('../manifest.js').ManifestFinding>} */
  const found = new Map();
  for (const record of articles) {
    const own = record.frontmatter.action;
    const action = resolvePostAction({
      siteAction: input.publication.postAction,
      postAction: own,
    });
    if (action === undefined) continue;
    const hasAuthor = record.frontmatter.authorIds.some((id) =>
      authorIds.has(id),
    );
    if (postActionAvailable({ action, followsOn, hasAuthor, hasNewsletter })) {
      continue;
    }
    // A missing author is the post's own matter; the rest is the setting's.
    const siteLevel =
      own === undefined && (action.kind !== 'follow' || followsOn === false);
    const pointer = siteLevel
      ? POST_ACTION_UNAVAILABLE_FINDING.pointer
      : `/content/${input.content.indexOf(record)}/frontmatter/${own === undefined ? 'authorIds' : 'action'}`;
    if (!found.has(pointer)) {
      found.set(pointer, { ...POST_ACTION_UNAVAILABLE_FINDING, pointer });
    }
  }
  return [...found.values()];
}

/**
 * The heading and optional text shared by every kind.
 *
 * @param {object} options
 * @param {string | undefined} options.heading the heading, escaped
 * @param {string | undefined} options.text the paragraph, plain
 * @returns {string} the markup
 */
function copyOf({ heading, text }) {
  return (
    (heading
      ? `<h2 id="${POST_ACTION_TITLE_ID}">${escapeHtml(heading)}</h2>`
      : '') + (text ? `<p>${escapeHtml(text)}</p>` : '')
  );
}

/**
 * The block for the `follow` and `link` kinds.
 *
 * @param {object} options
 * @param {PostAction} options.action the resolved action (`follow` or `link`)
 * @param {string} options.followHeading the default heading of a follow block
 *   ("Follow" and the author's name, in the page's language)
 * @param {string} options.followControl the Follow control's markup
 * @param {(path: string) => string} options.sitePath a site path as the page
 *   links it
 * @returns {string} the `aside`
 */
export function renderPostAction({
  action,
  followHeading,
  followControl,
  sitePath,
}) {
  if (action.kind === 'follow') {
    const heading = action.heading ?? followHeading;
    return (
      `<aside aria-labelledby="${POST_ACTION_TITLE_ID}" data-gala-action="follow">` +
      `${copyOf({ heading, text: action.text })}${followControl}</aside>`
    );
  }
  if (action.kind !== 'link') return '';
  const external = action.url.startsWith('https://');
  const href = external ? action.url : sitePath(action.url);
  const named = action.heading
    ? `aria-labelledby="${POST_ACTION_TITLE_ID}"`
    : `aria-label="${escapeHtml(action.label)}"`;
  return (
    `<aside ${named} data-gala-action="link">` +
    `${copyOf({ heading: action.heading, text: action.text })}` +
    `<a class="g-btn" href="${escapeHtml(href)}"${external ? ' rel="noopener"' : ''}>${escapeHtml(action.label)}${icon('arrow')}</a>` +
    `</aside>`
  );
}

/**
 * The block for the `newsletter` kind: the newsletter panel itself, inside
 * the block's `aside`.
 *
 * @param {string} panel the newsletter panel's markup
 * @returns {string} the `aside`
 */
export function renderNewsletterAction(panel) {
  return `<aside aria-labelledby="newsletter-title" data-gala-action="newsletter">${panel}</aside>`;
}

/**
 * The newsletter email's closing button for a `link` action: the one kind the
 * email carries (a subscriber already has the newsletter, and following needs
 * the site). Inline styles only; no class.
 *
 * @param {PostAction | undefined} action the resolved action
 * @param {(route: string) => string} absoluteUrl a site path's absolute public
 *   URL
 * @returns {string} the paragraph holding the link, or an empty string
 */
export function renderEmailAction(action, absoluteUrl) {
  if (action === undefined || action.kind !== 'link') return '';
  const href = action.url.startsWith('https://')
    ? action.url
    : absoluteUrl(action.url);
  return (
    `<p style="margin:24px 0"><a href="${escapeHtml(href)}" ` +
    `style="display:inline-block;padding:10px 20px;border-radius:6px;background:#1f2328;color:#ffffff;text-decoration:none;font-weight:600">` +
    `${escapeHtml(action.label)}</a></p>`
  );
}
