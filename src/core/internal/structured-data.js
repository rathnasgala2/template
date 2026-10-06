/**
 * schema.org structured data (JSON-LD) for every generated page. One
 * `<script type="application/ld+json">` carrying one `@graph` per page:
 *
 * - home: `WebSite` + `Blog` (no `SearchAction`: the site search is a
 *   client-side dialog over a static index, there is no search-results URL
 *   a crawler could call, and an invented one would be a false claim);
 * - article: `BlogPosting` + `BreadcrumbList`;
 * - tag / series / archive / paginated index: `CollectionPage` +
 *   `BreadcrumbList`;
 * - author: `ProfilePage` whose `mainEntity` is the `Person`;
 * - authored page / publication profile: `WebPage` (+ `BreadcrumbList`).
 *
 * The block is data, never executed: a browser does not run a script whose
 * `type` is not a JavaScript type, and the page CSP (`script-src 'self'`)
 * does not govern it. The "exactly one executable script per page" rule
 * therefore stays true: the one executable script is the `<script src>`; the
 * data block is distinguished by its `type`.
 */

/** @type {number} Google's recommended maximum `headline` length. */
const HEADLINE_MAX = 110;

/**
 * Serialize a JSON-LD document for safe embedding inside a `<script>`
 * element: `<`, `>`, `&`, U+2028 and U+2029 become `\uXXXX` escapes, so the
 * text can never close the element or start a comment, and stays valid
 * JSON.
 *
 * @param {unknown} document the JSON-LD value
 * @returns {string} compact, embed-safe JSON
 */
export function serializeJsonLd(document) {
  return JSON.stringify(document).replace(
    /[<>&\u2028\u2029]/g,
    (character) =>
      `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );
}

/**
 * @typedef {{url: string, width?: number, height?: number}} ImageInfo
 * @typedef {{label: string, route?: string}} CrumbStep
 */

/**
 * @param {ImageInfo | undefined} image
 * @returns {Record<string, unknown> | undefined}
 */
function imageObject(image) {
  return image
    ? {
        '@type': 'ImageObject',
        url: image.url,
        width: image.width,
        height: image.height,
      }
    : undefined;
}

/**
 * @param {string} text
 * @param {number} max
 * @returns {string}
 */
function bound(text, max) {
  const characters = Array.from(text);
  return characters.length > max
    ? `${characters
        .slice(0, max - 1)
        .join('')
        .trimEnd()}…`
    : text;
}

/**
 * Bind the JSON-LD builders to one build.
 *
 * @param {object} context
 * @param {{title: string, description: string, defaultLanguage: string}} context.publication
 * @param {(route: string) => string} context.absolute the absolute URL of a
 *   `basePath`-joined route
 * @param {ImageInfo | undefined} context.brandMark the appearance brand mark
 * @returns {{
 *   serialize: (graph: readonly unknown[]) => string,
 *   home: (input: {posts: readonly {url: string, headline: string, datePublished: string}[]}) => unknown[],
 *   article: (input: ArticleInput) => unknown[],
 *   collection: (input: {name: string, description?: string, url: string, language: string, trail: readonly CrumbStep[], image?: ImageInfo}) => unknown[],
 *   profile: (input: {name: string, description?: string, url: string, language: string, image?: ImageInfo, sameAs: readonly string[]}) => unknown[],
 *   webPage: (input: {name: string, description?: string, url: string, language: string, trail: readonly CrumbStep[], dateModified?: string}) => unknown[],
 * }}
 */
export function createStructuredData({ publication, absolute, brandMark }) {
  const origin = absolute('/');
  const organization = {
    '@type': 'Organization',
    '@id': `${origin}#organization`,
    name: publication.title,
    url: origin,
    logo: imageObject(brandMark),
  };

  /**
   * @param {readonly CrumbStep[]} trail
   * @returns {Record<string, unknown>}
   */
  const breadcrumbs = (trail) => ({
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: step.label,
      item: step.route ? absolute(step.route) : undefined,
    })),
  });

  return {
    serialize: (graph) =>
      serializeJsonLd({ '@context': 'https://schema.org', '@graph': graph }),

    home: ({ posts }) => [
      {
        '@type': 'WebSite',
        '@id': `${origin}#website`,
        url: origin,
        name: publication.title,
        description: publication.description,
        inLanguage: publication.defaultLanguage,
        publisher: { '@id': organization['@id'] },
        // No SearchAction: this site has no search-results URL (see module
        // documentation).
      },
      {
        '@type': 'Blog',
        '@id': `${origin}#blog`,
        url: origin,
        name: publication.title,
        description: publication.description,
        inLanguage: publication.defaultLanguage,
        publisher: { '@id': organization['@id'] },
        blogPost: posts.map((post) => ({
          '@type': 'BlogPosting',
          headline: bound(post.headline, HEADLINE_MAX),
          url: post.url,
          datePublished: post.datePublished,
        })),
      },
      organization,
    ],

    article: (input) => {
      const authors = input.authors.map((author) => ({
        '@type': 'Person',
        name: author.name,
        url: author.url,
        sameAs: author.sameAs.length > 0 ? [...author.sameAs] : undefined,
      }));
      return [
        {
          '@type': 'BlogPosting',
          '@id': `${input.url}#article`,
          mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
          url: input.url,
          headline: bound(input.headline, HEADLINE_MAX),
          description: input.description,
          image: imageObject(input.image),
          datePublished: input.datePublished,
          dateModified: input.dateModified,
          inLanguage: input.language,
          author: authors.length === 1 ? authors[0] : authors,
          publisher: organization,
          keywords: input.tags.length > 0 ? input.tags.join(', ') : undefined,
          isPartOf: input.series
            ? {
                '@type': 'CreativeWorkSeries',
                name: input.series.name,
                url: input.series.url,
              }
            : undefined,
        },
        breadcrumbs(input.trail),
      ];
    },

    collection: ({ name, description, url, language, trail, image }) => [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        url,
        name,
        description,
        inLanguage: language,
        primaryImageOfPage: imageObject(image),
        isPartOf: { '@id': `${origin}#website` },
      },
      breadcrumbs(trail),
    ],

    profile: ({ name, description, url, language, image, sameAs }) => [
      {
        '@type': 'ProfilePage',
        '@id': `${url}#page`,
        url,
        name,
        inLanguage: language,
        mainEntity: {
          '@type': 'Person',
          '@id': `${url}#person`,
          name,
          url,
          description,
          image: imageObject(image),
          sameAs: sameAs.length > 0 ? [...sameAs] : undefined,
        },
      },
    ],

    webPage: ({ name, description, url, language, trail, dateModified }) => [
      {
        '@type': 'WebPage',
        '@id': `${url}#page`,
        url,
        name,
        description,
        inLanguage: language,
        dateModified,
        isPartOf: { '@id': `${origin}#website` },
      },
      ...(trail.length > 0 ? [breadcrumbs(trail)] : []),
    ],
  };
}

/**
 * @typedef {object} ArticleInput
 * @property {string} url the article's absolute URL
 * @property {string} headline
 * @property {string} [description]
 * @property {ImageInfo} [image]
 * @property {string} datePublished
 * @property {string} dateModified
 * @property {string} language
 * @property {readonly {name: string, url: string, sameAs: readonly string[]}[]} authors
 * @property {readonly string[]} tags
 * @property {{name: string, url: string}} [series]
 * @property {readonly CrumbStep[]} trail
 */
