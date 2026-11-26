/**
 * Shared fixtures for the end-of-post action block (schemas 3.56.0): build
 * inputs that carry `publication.postAction`, a post's `action` and the
 * interactions config's `follows.publicCount`, and a probe for whether the
 * installed build-input schema accepts them yet.
 *
 * Re-pin to 3.56.0: delete {@link schemaAcceptsPostAction}, {@link SKIP_REASON}
 * and every `{skip: ...}` that uses them (search `schemaAcceptsPostAction`).
 */

import { buildRichFixture } from './page-kind-fixtures.js';
import { renderSite } from './render-fixtures.js';

/** The hostile label and heading every kind is tried with. */
export const LABEL = 'Read the <b>"book"</b> & more';
export const HEADING = 'Start <here> & now';
export const TEXT = 'Why "this" <i>matters</i> & more.';

/** @type {Readonly<Record<string, any>>} */
export const ACTIONS = Object.freeze({
  follow: { kind: 'follow' },
  newsletter: { kind: 'newsletter' },
  link: { kind: 'link', label: LABEL, url: 'https://example.com/book?a=1&b=2' },
  path: { kind: 'link', label: 'Read the guide', url: '/guide/' },
});

export const GALASCRIBE_NEWSLETTER = Object.freeze({
  mode: 'galascribe',
  title: 'Letters from the desk',
  text: 'One email a week.',
  emailContent: 'card',
  replyToOwner: false,
});

/**
 * @param {boolean} follows whether the Follow control is on
 * @param {boolean} [publicCount] whether its count is public
 * @returns {any} the interactions module
 */
export function interactionsModule(follows, publicCount) {
  return {
    config: {
      schemaId: 'urn:gala:schema:interactions-config:2.0.0',
      schemaVersion: '2.0.0',
      reactions: { enabled: false, definitions: [] },
      comments: { enabled: false, allowReplies: false, maxDepth: 1 },
      publicCounts: { reactions: false, comments: false },
      follows:
        publicCount === undefined
          ? { enabled: follows }
          : { enabled: follows, publicCount },
    },
    apiOrigin: 'https://api.galascribe.com',
    appOrigin: 'https://app.galascribe.com',
  };
}

/**
 * @param {object} [options]
 * @param {any} [options.action] `publication.postAction`
 * @param {Record<string, any>} [options.own] each article slug's `action`
 * @param {boolean} [options.follows] Follow control on (default true)
 * @param {boolean} [options.publicCount] `follows.publicCount`
 * @param {boolean} [options.newsletter] a Galascribe newsletter (default true)
 * @returns {Promise<any>} the rich fixture with those settings
 */
export async function postActionInput(options = {}) {
  const input = /** @type {any} */ (await buildRichFixture());
  if (options.action !== undefined)
    input.publication.postAction = options.action;
  for (const [slug, action] of Object.entries(options.own ?? {})) {
    const record = input.content.find(
      (/** @type {any} */ r) => r.frontmatter.slug === slug,
    );
    record.frontmatter.action = action;
  }
  if (options.newsletter !== false) {
    input.publication.newsletter = { ...GALASCRIBE_NEWSLETTER };
  }
  input.modules.interactions = interactionsModule(
    options.follows !== false,
    options.publicCount,
  );
  return input;
}

/** @type {Promise<boolean> | undefined} */
let supported;

/**
 * Whether the installed `@rathnasgala2/schemas` accepts `postAction`, a
 * front-matter `action` and `follows.publicCount`. It does from 3.56.0; until
 * the lock moves, the tests that build with them skip with {@link SKIP_REASON}.
 *
 * @returns {Promise<boolean>} true when a build input carrying them validates
 */
export function schemaAcceptsPostAction() {
  supported ??= (async () => {
    try {
      const site = await renderSite(
        await postActionInput({
          action: ACTIONS.link,
          own: { 'second-article': { kind: 'none' } },
          publicCount: true,
        }),
      );
      await site.cleanup();
      return true;
    } catch {
      return false;
    }
  })();
  return supported;
}

export const SKIP_REASON =
  'needs @rathnasgala2/schemas 3.56.0 (postAction, action and follows.publicCount in build-input)';

/** @type {string} the article the tests read */
export const FIRST_ARTICLE = 'fixture-1/first-article/index.html';

/**
 * @param {string} html a page
 * @returns {number} how many end-of-post action blocks it carries
 */
export function actionBlocks(html) {
  return html.split(' data-gala-action="').length - 1;
}
