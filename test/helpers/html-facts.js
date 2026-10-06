/**
 * Small, dependency-free fact extractors over rendered HTML, shared by the
 * structure tests. The JSON-LD block (`<script type="application/ld+json">`)
 * is data, never executed, so it is counted apart from executable scripts.
 */

const LD_JSON_PATTERN =
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;

/**
 * @param {string} html a rendered page
 * @returns {string[]} the raw text of every JSON-LD block
 */
export function ldJsonBlocks(html) {
  return [...html.matchAll(LD_JSON_PATTERN)].map((match) => match[1]);
}

/**
 * @param {string} html a rendered page
 * @returns {number} the number of `<script>` elements that are not JSON-LD
 *   data blocks (the executable ones)
 */
export function executableScriptCount(html) {
  return (html.match(/<script\b/g)?.length ?? 0) - ldJsonBlocks(html).length;
}

/**
 * @param {string} html a rendered page
 * @returns {Record<string, unknown>[]} the parsed `@graph` entries of the
 *   page's single JSON-LD block
 */
export function ldGraph(html) {
  const blocks = ldJsonBlocks(html);
  if (blocks.length !== 1) {
    throw new Error(
      `expected exactly one JSON-LD block, found ${blocks.length}`,
    );
  }
  return JSON.parse(blocks[0])['@graph'];
}

/**
 * @param {string} html a rendered page
 * @param {string} name the `name`/`property` of a `<meta>` tag
 * @returns {string[]} every content value of that meta tag, unescaped for
 *   the five predefined entities
 */
export function metaContents(html, name) {
  const found = [];
  for (const match of html.matchAll(/<meta\b([^>]*)>/g)) {
    const attributes = match[1];
    const key = /\b(?:name|property)="([^"]*)"/.exec(attributes)?.[1];
    if (key !== name) continue;
    const content = /\bcontent="([^"]*)"/.exec(attributes)?.[1] ?? '';
    found.push(
      content
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&'),
    );
  }
  return found;
}
