/**
 * `robots.txt` generation.
 *
 * Every site allows all crawlers and names its sitemap by absolute URL. The
 * publication may additionally opt out of AI training and AI-assistant
 * crawlers through `publication.crawlers.ai` (`"allow"` | `"block"`, absent
 * means allow). The field is read defensively, exactly like
 * `publication.newsletter`: a build input that predates it, or carries any
 * other value, is treated as `"allow"`.
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
 * @param {unknown} publication `publication` (may predate `crawlers`)
 * @returns {'allow' | 'block'} the AI crawler policy
 */
export function readAiCrawlerPolicy(publication) {
  const crawlers = /** @type {{crawlers?: unknown} | undefined} */ (
    publication && typeof publication === 'object' ? publication : undefined
  )?.crawlers;
  const ai =
    crawlers && typeof crawlers === 'object'
      ? /** @type {{ai?: unknown}} */ (crawlers).ai
      : undefined;
  return ai === 'block' ? 'block' : 'allow';
}

/**
 * @param {object} options
 * @param {'allow' | 'block'} options.aiPolicy
 * @param {string} options.sitemapUrl the absolute sitemap URL
 * @returns {string} the exact `robots.txt` text
 */
export function buildRobotsTxt({ aiPolicy, sitemapUrl }) {
  /** @type {string[]} */
  const groups = ['User-agent: *\nAllow: /'];
  if (aiPolicy === 'block') {
    for (const agent of AI_CRAWLER_USER_AGENTS) {
      groups.push(`User-agent: ${agent}\nDisallow: /`);
    }
  }
  groups.push(`Sitemap: ${sitemapUrl}`);
  return `${groups.join('\n\n')}\n`;
}
