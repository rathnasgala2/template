/**
 * `robots.txt` generation.
 *
 * Every site allows all crawlers and names its sitemap by absolute URL. The
 * publication may additionally opt out of AI training and AI-assistant
 * crawlers through the validated `publication.crawlers.ai` (`"allow"` |
 * `"block"`; absent means allow), or, finer, through `publication.aiRights`
 * (schemas 3.25.0): `search` covers the search and answer bots, `training` the
 * training crawlers, each `"allow"` | `"block"`. `aiRights` wins over
 * `crawlers.ai`; without it `crawlers.ai` is the old single switch and the
 * file is unchanged byte for byte.
 *
 * Unlisted (`noindex`) pages are deliberately not disallowed here: a
 * crawler can only honour a `noindex` directive on a page it is allowed to
 * fetch.
 *
 * Only a `robots.txt` at the host root is honoured by crawlers. This file is
 * always written at the output root; when the site is served from a path
 * (for example a GitHub project site), the host's own root `robots.txt` is
 * what crawlers read, and the `Sitemap:` line here still names the absolute
 * sitemap URL so it can be copied there.
 */

/**
 * The AI crawler and assistant user agents blocked by `crawlers.ai:
 * "block"`: training crawlers, search crawlers and user-initiated fetchers
 * of the major AI providers.
 *
 * @type {readonly string[]}
 */
export const AI_CRAWLER_USER_AGENTS = Object.freeze([
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'Google-Extended',
  'PerplexityBot',
  'Perplexity-User',
  'CCBot',
  'Applebot-Extended',
  'Bytespider',
  'Meta-ExternalAgent',
  'Amazonbot',
]);

/**
 * The search and answer bots: they fetch a page to index it for an AI search
 * product or to answer a reader's question right now.
 *
 * @type {readonly string[]}
 */
export const AI_SEARCH_USER_AGENTS = Object.freeze([
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
]);

/**
 * The training crawlers: they collect text to train or improve models.
 *
 * @type {readonly string[]}
 */
export const AI_TRAINING_USER_AGENTS = Object.freeze([
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'Applebot-Extended',
  'CCBot',
  'Bytespider',
  'Meta-ExternalAgent',
  'Amazonbot',
  'cohere-ai',
]);

/**
 * `Google-Extended` governs both Gemini training and the use of a page to
 * ground Gemini answers, so it belongs to neither group alone: it is blocked
 * when either `search` or `training` is blocked (the rule Galascribe v1 used).
 */
const GOOGLE_EXTENDED = 'Google-Extended';

/**
 * @typedef {object} AiPolicy
 * @property {'allow' | 'block'} search the search and answer bots
 * @property {'allow' | 'block'} training the training crawlers
 * @property {string} [licenseUrl] where a licence for the writing is offered
 * @property {boolean} granular whether the author set `aiRights` (the finer
 *   control) rather than the single `crawlers.ai` switch
 */

/**
 * @param {{crawlers?: {ai: 'allow' | 'block'}, aiRights?: {search: 'allow' | 'block', training: 'allow' | 'block', licenseUrl?: string}}} publication
 *   the validated `publication` (both members optional; absent means allow)
 * @returns {AiPolicy} the AI policy: `aiRights` when present, else
 *   `crawlers.ai` for both groups
 */
export function readAiPolicy(publication) {
  const rights = publication.aiRights;
  if (rights) {
    return {
      search: rights.search,
      training: rights.training,
      ...(rights.licenseUrl ? { licenseUrl: rights.licenseUrl } : {}),
      granular: true,
    };
  }
  const ai = publication.crawlers?.ai ?? 'allow';
  return { search: ai, training: ai, granular: false };
}

/**
 * @param {{crawlers?: {ai: 'allow' | 'block'}}} publication the validated
 *   `publication` (`crawlers` is optional; absent means allow)
 * @returns {'allow' | 'block'} the AI crawler policy
 */
export function readAiCrawlerPolicy(publication) {
  return publication.crawlers?.ai ?? 'allow';
}

/**
 * Add `noai, noimageai` (the training opt-out robots directives) to a page's
 * robots meta content, keeping every directive already there.
 *
 * @param {string | undefined} existing the page's own robots content
 * @param {boolean} trainingBlocked whether `aiRights.training` is `block`
 * @returns {string | undefined} the content to render; `existing` untouched
 *   when training is not blocked
 */
export function withTrainingOptOut(existing, trainingBlocked) {
  if (!trainingBlocked) return existing;
  const tokens = (existing ?? '')
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);
  for (const token of ['noai', 'noimageai']) {
    if (!tokens.includes(token)) tokens.push(token);
  }
  return tokens.join(', ');
}

/**
 * @param {object} options
 * @param {'allow' | 'block'} options.aiPolicy the single `crawlers.ai` switch
 * @param {string} options.sitemapUrl the absolute sitemap URL
 * @param {AiPolicy} [options.rights] the author's `aiRights` choices; when
 *   given (and `granular`) they replace `aiPolicy`: one group of user agents
 *   per class, blocked classes only, and a `License:` line naming
 *   `licenseFileUrl`
 * @param {string} [options.licenseFileUrl] the absolute `/license.xml` URL
 * @returns {string} the exact `robots.txt` text
 */
export function buildRobotsTxt({
  aiPolicy,
  sitemapUrl,
  rights,
  licenseFileUrl,
}) {
  /** @type {string[]} */
  const groups = ['User-agent: *\nAllow: /'];
  if (rights?.granular) {
    const searchBlocked = rights.search === 'block';
    const trainingBlocked = rights.training === 'block';
    /**
     * @param {string} heading a comment naming the class
     * @param {readonly string[]} agents the user agents it blocks
     */
    const blockGroup = (heading, agents) => {
      groups.push(
        `# ${heading}\n${agents.map((agent) => `User-agent: ${agent}`).join('\n')}\nDisallow: /`,
      );
    };
    if (searchBlocked) {
      blockGroup('AI search and answer bots', AI_SEARCH_USER_AGENTS);
    }
    if (trainingBlocked) {
      blockGroup('AI training crawlers', AI_TRAINING_USER_AGENTS);
    }
    if (searchBlocked || trainingBlocked) {
      blockGroup('Gemini training and grounding', [GOOGLE_EXTENDED]);
    }
    groups.push(
      `Sitemap: ${sitemapUrl}` +
        (licenseFileUrl ? `\nLicense: ${licenseFileUrl}` : ''),
    );
    return `${groups.join('\n\n')}\n`;
  }
  if (aiPolicy === 'block') {
    for (const agent of AI_CRAWLER_USER_AGENTS) {
      groups.push(`User-agent: ${agent}\nDisallow: /`);
    }
  }
  groups.push(`Sitemap: ${sitemapUrl}`);
  return `${groups.join('\n\n')}\n`;
}
