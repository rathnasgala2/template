/**
 * Generation-4 template composition admission.
 *
 * A composition is one complete, immutable product direction. Admission is
 * deliberately by exact object equality so fields from different directions
 * cannot be combined into renderer states that were never designed or tested.
 */

/** The immutable generation-4 composition schema identity. */
export const TEMPLATE_COMPOSITION_SCHEMA_ID =
  'urn:gala:schema:template-composition:2.0.0';

const SCHEMA_FIELDS = Object.freeze({
  schemaId: TEMPLATE_COMPOSITION_SCHEMA_ID,
  schemaVersion: '2.0.0',
});

/** The complete Editorial composition. */
export const EDITORIAL_COMPOSITION = Object.freeze({
  ...SCHEMA_FIELDS,
  profile: 'editorial',
  homeLayout: 'magazine',
  articleLayout: 'editorial',
  authorLayout: 'portrait',
  listingLayout: 'rows',
  headerLayout: 'masthead',
  footerLayout: 'expanded',
  mediaRatio: 'landscape',
  density: 'comfortable',
});

/** The complete Newsletter composition. */
export const NEWSLETTER_COMPOSITION = Object.freeze({
  ...SCHEMA_FIELDS,
  profile: 'newsletter',
  homeLayout: 'newspaper',
  articleLayout: 'issue',
  authorLayout: 'profile',
  listingLayout: 'issues',
  headerLayout: 'publication',
  footerLayout: 'expanded',
  mediaRatio: 'landscape',
  density: 'comfortable',
});

/** The complete Visual composition. */
export const VISUAL_COMPOSITION = Object.freeze({
  ...SCHEMA_FIELDS,
  profile: 'visual',
  homeLayout: 'gallery',
  articleLayout: 'full-bleed',
  authorLayout: 'portfolio',
  listingLayout: 'image-grid',
  headerLayout: 'minimal',
  footerLayout: 'compact',
  mediaRatio: 'mixed',
  density: 'comfortable',
});

/** The complete Personal composition. */
export const PERSONAL_COMPOSITION = Object.freeze({
  ...SCHEMA_FIELDS,
  profile: 'personal',
  homeLayout: 'chronological',
  articleLayout: 'prose',
  authorLayout: 'biography',
  listingLayout: 'dated-rows',
  headerLayout: 'compact',
  footerLayout: 'compact',
  mediaRatio: 'landscape',
  density: 'spacious',
});

/** The complete Developer composition. */
export const DEVELOPER_COMPOSITION = Object.freeze({
  ...SCHEMA_FIELDS,
  profile: 'developer',
  homeLayout: 'topic-index',
  articleLayout: 'technical',
  authorLayout: 'biography',
  listingLayout: 'rows',
  headerLayout: 'utility',
  footerLayout: 'compact',
  mediaRatio: 'landscape',
  density: 'compact',
});

/** Every complete composition implemented by generation 4. */
export const SUPPORTED_COMPOSITIONS = Object.freeze([
  EDITORIAL_COMPOSITION,
  NEWSLETTER_COMPOSITION,
  VISUAL_COMPOSITION,
  PERSONAL_COMPOSITION,
  DEVELOPER_COMPOSITION,
]);

/** @type {Readonly<Record<string, (typeof SUPPORTED_COMPOSITIONS)[number]>>} */
const COMPOSITION_BY_PROFILE = Object.freeze(
  Object.fromEntries(
    SUPPORTED_COMPOSITIONS.map((composition) => [
      composition.profile,
      composition,
    ]),
  ),
);

const COMPOSITION_ATTRIBUTE_NAMES = Object.freeze({
  profile: 'data-gala-profile',
  homeLayout: 'data-gala-home-layout',
  articleLayout: 'data-gala-article-layout',
  authorLayout: 'data-gala-author-layout',
  listingLayout: 'data-gala-listing-layout',
  headerLayout: 'data-gala-header-layout',
  footerLayout: 'data-gala-footer-layout',
  mediaRatio: 'data-gala-media-ratio',
  density: 'data-gala-density',
});

/** @typedef {(typeof SUPPORTED_COMPOSITIONS)[number]} SupportedComposition */
/** @typedef {Exclude<keyof SupportedComposition, 'schemaId' | 'schemaVersion'>} CompositionField */

/** Public semantic attribute catalogs corresponding to composition fields. */
export const COMPOSITION_ATTRIBUTE_CATALOG = Object.freeze(
  /** @type {readonly [CompositionField, string][]} */ (
    Object.entries(COMPOSITION_ATTRIBUTE_NAMES)
  ).map(([field, name]) =>
    Object.freeze({
      field,
      name,
      values: Object.freeze([
        ...new Set(
          SUPPORTED_COMPOSITIONS.map((composition) => composition[field]),
        ),
      ]),
    }),
  ),
);

/** Every public semantic attribute/value pair themes may select. */
export const COMPOSITION_ATTRIBUTES = Object.freeze(
  COMPOSITION_ATTRIBUTE_CATALOG.flatMap(({ field, name, values }) =>
    values.map((value) => Object.freeze({ field, name, value })),
  ),
);

/**
 * Admit exactly one complete composition implemented by this renderer.
 *
 * @param {unknown} candidate a complete template-composition document
 * @returns {(typeof SUPPORTED_COMPOSITIONS)[number]} canonical composition
 */
export function assertSupportedComposition(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    throw new Error(
      `composition must be a complete ${TEMPLATE_COMPOSITION_SCHEMA_ID} document`,
    );
  }
  const composition = /** @type {Record<string, unknown>} */ (candidate);
  const selected =
    typeof composition.profile === 'string' &&
    Object.hasOwn(COMPOSITION_BY_PROFILE, composition.profile)
      ? COMPOSITION_BY_PROFILE[composition.profile]
      : undefined;
  if (!selected) {
    throw new Error(
      `composition.profile (${JSON.stringify(composition.profile)}) is not implemented by this renderer`,
    );
  }
  const expectedKeys = Object.keys(selected).sort();
  const actualKeys = Object.keys(composition).sort();
  if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
    throw new Error(
      `composition must contain exactly ${expectedKeys.join(', ')}`,
    );
  }
  for (const [key, expected] of Object.entries(selected)) {
    if (composition[key] !== expected) {
      throw new Error(
        `composition.${key} (${JSON.stringify(composition[key])}) is not ` +
          `implemented for ${selected.profile}; expected ${JSON.stringify(expected)}`,
      );
    }
  }
  return selected;
}
