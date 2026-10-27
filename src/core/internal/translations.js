/**
 * Language variants (translations). An `article` may name the article it
 * translates with the optional front-matter key `translationOf: <slug>`. The
 * named document is the group's root; the group is the root plus every
 * published document naming its slug. The group's primary is the member in the
 * publication's default language, otherwise the root.
 *
 * Everything here is inert for a build in which no published article carries
 * `translationOf` ({@link TranslationResolution.active} is `false`): such a
 * build renders exactly as it did before translations existed.
 *
 * A `translationOf` whose root is not an article of the build is never an
 * error: the document renders as a standalone article and the resolution
 * lists it in `orphans` (the renderer has no warning channel).
 */

import { BuildInputValidationError } from '../errors.js';

const DOCUMENTATION_URL =
  'https://github.com/rathnasgala2/template#language-variants';

/**
 * @typedef {import('../../../types/index.d.ts').ContentBuildRecord} ContentBuildRecord
 */

/**
 * @typedef {object} TranslationGroup
 * @property {ContentBuildRecord} primary the member listings show
 * @property {ContentBuildRecord[]} members every published member, primary
 *   first, then by language tag
 */

/**
 * @typedef {object} TranslationResolution
 * @property {boolean} active whether any published article carries
 *   `translationOf`
 * @property {ReadonlyMap<ContentBuildRecord, TranslationGroup>} groupOf each
 *   grouped record's group
 * @property {{record: ContentBuildRecord, language: string}[]} duplicates
 *   group members repeating another member's language (a build error)
 * @property {ReadonlySet<string>} languages every lower-cased language tag of
 *   the published articles
 * @property {string[]} orphans source paths of published articles whose
 *   `translationOf` names no article of the build
 * @property {{language: string, segment: string}[]} sections one entry per
 *   non-default language with a published article, sorted by segment (empty
 *   when not active)
 * @property {(record: ContentBuildRecord) => boolean} isListed whether the
 *   record stands for its group in listings (every non-primary variant does
 *   not)
 * @property {(record: ContentBuildRecord) => ContentBuildRecord[]} variantsOf
 *   the record's group members, or the record alone
 */

/**
 * @param {string} tag a BCP-47 tag
 * @returns {string} the URL segment a language's pages live under
 */
export function languageSegment(tag) {
  return tag.toLowerCase();
}

/**
 * A language's own name ("தமிழ்" for `ta`), the raw tag when the runtime
 * does not know it.
 *
 * @param {string} tag a BCP-47 tag
 * @returns {string}
 */
export function languageName(tag) {
  try {
    return new Intl.DisplayNames([tag], { type: 'language' }).of(tag) ?? tag;
  } catch {
    return tag;
  }
}

/**
 * The label a language shows under: its own name for its primary subtag
 * ("English"), unless another language on the site shares that subtag, then
 * the full-tag name ("American English").
 *
 * @param {string} tag a BCP-47 tag
 * @param {ReadonlySet<string>} siteLanguages every lower-cased language tag
 *   of the site's published articles
 * @returns {string}
 */
export function languageLabel(tag, siteLanguages) {
  const primary = tag.split('-')[0] ?? tag;
  const lower = tag.toLowerCase();
  const shared = [...siteLanguages].some(
    (other) =>
      other !== lower &&
      (other.split('-')[0] ?? other) === primary.toLowerCase(),
  );
  return shared || primary === tag ? languageName(tag) : languageName(primary);
}

/**
 * The author as a page in `language` shows them: the matching `localized[]`
 * entry's display name and biography (exact lower-cased tag, else a unique
 * primary-subtag match), the author unchanged when none matches.
 *
 * @param {import('../../../types/index.d.ts').AuthorNormalized} author
 * @param {string} language a BCP-47 tag
 * @returns {import('../../../types/index.d.ts').AuthorNormalized}
 */
export function localizeAuthor(author, language) {
  const entries =
    /** @type {{language?: string, displayName?: string, biography?: string}[]} */ (
      author.localized ?? []
    ).filter(
      (entry) => typeof entry?.language === 'string' && entry.displayName,
    );
  const wanted = language.toLowerCase();
  const primary = wanted.split('-')[0];
  const match =
    entries.find((e) => e.language?.toLowerCase() === wanted) ??
    (() => {
      const same = entries.filter(
        (e) => e.language?.toLowerCase().split('-')[0] === primary,
      );
      return same.length === 1 ? same[0] : undefined;
    })();
  if (!match) return author;
  return {
    ...author,
    displayName: match.displayName ?? author.displayName,
    biography: match.biography || author.biography,
  };
}

/**
 * @param {readonly ContentBuildRecord[]} content the build input's `content[]`
 * @param {string} defaultLanguage `publication.defaultLanguage`
 * @returns {TranslationResolution}
 */
export function resolveTranslations(content, defaultLanguage) {
  const articles = content.filter((r) => r.frontmatter.kind === 'article');
  const published = articles.filter(
    (r) => r.frontmatter.status === 'published',
  );
  /** @type {Map<string, ContentBuildRecord>} */
  const rootsBySlug = new Map();
  for (const record of articles) {
    if (!record.frontmatter.translationOf) {
      rootsBySlug.set(record.frontmatter.slug, record);
    }
  }
  /** @type {Map<ContentBuildRecord, ContentBuildRecord[]>} */
  const translationsByRoot = new Map();
  /** @type {string[]} */
  const orphans = [];
  let active = false;
  for (const record of published) {
    const target = record.frontmatter.translationOf;
    if (!target) continue;
    active = true;
    const root = rootsBySlug.get(target);
    if (!root || root === record) {
      orphans.push(record.sourcePath);
      continue;
    }
    const bucket = translationsByRoot.get(root) ?? [];
    bucket.push(record);
    translationsByRoot.set(root, bucket);
  }

  const defaultFull = defaultLanguage.toLowerCase();
  /** @type {Map<ContentBuildRecord, TranslationGroup>} */
  const groupOf = new Map();
  /** @type {{record: ContentBuildRecord, language: string}[]} */
  const duplicates = [];
  /**
   * @param {ContentBuildRecord} a
   * @param {ContentBuildRecord} b
   * @returns {number}
   */
  const byLanguage = (a, b) =>
    a.frontmatter.language.toLowerCase() < b.frontmatter.language.toLowerCase()
      ? -1
      : a.frontmatter.language.toLowerCase() >
          b.frontmatter.language.toLowerCase()
        ? 1
        : a.frontmatter.id < b.frontmatter.id
          ? -1
          : 1;
  for (const [root, translations] of translationsByRoot) {
    const members = [
      ...(root.frontmatter.status === 'published' ? [root] : []),
      ...translations,
    ];
    const inDefault = (/** @type {ContentBuildRecord} */ r) =>
      r.frontmatter.language.toLowerCase() === defaultFull;
    const earliest = [...members].sort((a, b) =>
      a.frontmatter.publishedAt !== b.frontmatter.publishedAt
        ? a.frontmatter.publishedAt < b.frontmatter.publishedAt
          ? -1
          : 1
        : a.frontmatter.id < b.frontmatter.id
          ? -1
          : 1,
    )[0];
    const primary =
      members.find(inDefault) ??
      (root.frontmatter.status === 'published' ? root : undefined) ??
      earliest;
    /** @type {Set<string>} */
    const seen = new Set();
    for (const member of [primary, ...members.filter((r) => r !== primary)]) {
      const tag = languageSegment(member.frontmatter.language);
      if (seen.has(tag)) {
        duplicates.push({ record: member, language: tag });
      }
      seen.add(tag);
    }
    const ordered = [
      primary,
      ...members.filter((r) => r !== primary).sort(byLanguage),
    ];
    /** @type {TranslationGroup} */
    const group = { primary, members: ordered };
    for (const member of ordered) groupOf.set(member, group);
  }

  /** @type {Map<string, string>} */
  const sectionTags = new Map();
  if (active) {
    for (const record of published) {
      const tag = record.frontmatter.language;
      const segment = languageSegment(tag);
      if (segment !== defaultFull && !sectionTags.has(segment)) {
        sectionTags.set(segment, tag);
      }
    }
  }
  const sections = [...sectionTags.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([segment, language]) => ({ language, segment }));

  return {
    active,
    groupOf,
    languages: new Set(
      published.map((r) => languageSegment(r.frontmatter.language)),
    ),
    duplicates,
    orphans,
    sections,
    isListed: (record) => {
      const group = groupOf.get(record);
      return !group || group.primary === record;
    },
    variantsOf: (record) => groupOf.get(record)?.members ?? [record],
  };
}

/**
 * Fail closed when a group repeats a language, or when a language's
 * `/<lang>/` segment is already taken: any document whose slug, route or
 * redirect equals `/<segment>` or sits under `/<segment>/`. A language is its
 * whole BCP-47 tag, lower-cased (`ta` and `ta-in` are two languages).
 *
 * @param {readonly ContentBuildRecord[]} content
 * @param {string} defaultLanguage
 * @param {(frontmatter: import('../../../types/index.d.ts').ContentFrontmatterNormalized) => string} routeOf
 * @param {TranslationResolution} resolution
 * @throws {BuildInputValidationError}
 */
export function assertLanguageSegmentsFree(
  content,
  defaultLanguage,
  routeOf,
  resolution,
) {
  if (!resolution.active) return;
  /** @type {Record<string, string>[]} */
  const diagnostics = [];
  const indexOf = new Map(content.map((record, index) => [record, index]));
  for (const { record, language } of resolution.duplicates) {
    diagnostics.push({
      code: 'LANGUAGE_VARIANT_DUPLICATE',
      severity: 'ERROR',
      instancePointer: `/content/${indexOf.get(record)}`,
      actualValueClass: 'object',
      rule: 'template:translation',
      sourcePath: record.sourcePath,
      remediation: `The document ${record.sourcePath} is a second "${language}" variant of "${record.frontmatter.translationOf ?? record.frontmatter.slug}". Keep one document per language in a translation group.`,
      documentationUrl: DOCUMENTATION_URL,
    });
  }
  const segments = new Set(resolution.sections.map((s) => s.segment));
  for (const record of resolution.groupOf.keys()) {
    const segment = languageSegment(record.frontmatter.language);
    if (segment !== defaultLanguage.toLowerCase()) segments.add(segment);
  }
  /**
   * @param {string} value a slug, route or redirect
   * @returns {string} the lower-cased, slash-led, slash-trimmed path
   */
  const normalise = (value) =>
    `/${value.replace(/^\/+/, '').replace(/\/+$/, '')}`.toLowerCase();
  content.forEach((record, index) => {
    const { frontmatter } = record;
    // A translation's derived route legitimately sits under its segment.
    const derived = !frontmatter.route && frontmatter.translationOf;
    const claims = [
      frontmatter.slug,
      ...(derived ? [] : [routeOf(frontmatter)]),
      ...(frontmatter.redirects ?? []),
    ].map(normalise);
    for (const segment of segments) {
      const taken = claims.find(
        (claim) => claim === `/${segment}` || claim.startsWith(`/${segment}/`),
      );
      if (taken === undefined) continue;
      diagnostics.push({
        code: 'LANGUAGE_SEGMENT_CONFLICT',
        severity: 'ERROR',
        instancePointer: `/content/${index}`,
        actualValueClass: 'object',
        rule: 'template:translation',
        sourcePath: record.sourcePath,
        remediation: `The document ${record.sourcePath} uses ${taken}, which the generated "${segment}" language pages own. Rename its slug, route or redirect.`,
        documentationUrl: DOCUMENTATION_URL,
      });
    }
  });
  if (diagnostics.length > 0) throw new BuildInputValidationError(diagnostics);
}
