/**
 * `contracts/theme-styling-contract.jcs` builder and structural validator
 * (task packet S2-T12; DEC-097 section 4 "Closed theme-package and
 * stylesheet admission": the `templateStylingContract` closed object).
 *
 * This is the one reviewed source module `scripts/generate-contracts.mjs`
 * reads from to emit the published contract file, and the one module
 * `test/theme-styling-contract.test.js` reads from to drift-check the
 * contract against what this renderer actually renders. Every catalog leaf
 * below is drawn from (or, for the two new S2-T12 hooks documented inline,
 * wired into) the actual rendering modules — `internal/skeleton.js`,
 * `internal/page-kinds.js`, `internal/render-policy-content.js` and
 * `internal/appearance/contract.js` — never a hand-typed literal
 * independent of what those modules emit.
 *
 * Public-hook budget (DEC-097: `publicThemeSlotHooks:[1..64] set`): every
 * catalog leaf below (28 type + 15 class + 2 id + 19 attribute-value) has
 * exactly one corresponding public hook, for exactly 64 entries — this
 * renderer's complete public theming surface for S2. A leaf with no
 * matching hook would be a catalog member no theme could ever validly
 * select (DEC-097: "a used-but-undeclared public slot hook rejects"), so
 * catalogs and hooks are generated from one shared list rather than two
 * independently maintained ones.
 *
 * Deliberately out of the S2 public hook surface (documented scope
 * decisions, not omissions):
 * - fine-grained Prism token-class hooks (`.keyword`, `.string`, ...): only
 *   the base `.token` class and one hook per admitted highlight grammar's
 *   `.language-<grammar>` class are public, so a theme can style a
 *   highlighted code block's overall presentation but not recolor
 *   individual token kinds in S2;
 * - `html`/`body` type selectors and interactive pseudo-classes
 *   (`:hover`, `:focus`, `:visited`, ...): themes reach the document root
 *   only through {@link PUBLICATION_ROOT_SELECTOR}/
 *   {@link RESOLVED_PALETTE_SELECTORS}, and no pseudo-class hook is
 *   published in S2 (an empty `pseudoClasses` catalog is schema-valid: `[0..64]`).
 *
 * Every tag in `internal/render-policy-content.js`'s `ALLOWED_TAGS` that
 * markdown-it's own CommonMark grammar (with `html:false`) never actually
 * produces — `b`, `i`, `u`, `s`, `del`, `ins`, `sub`, `sup`, `mark`, `small`,
 * `wbr`, `table`, `thead`, `tbody`, `tr`, `th`, `td`, `dl`, `dt`, `dd`,
 * `figure`, `figcaption` — is likewise excluded from `typeSelectors`: this
 * catalog is "every hook the template actually renders" (task packet
 * S2-T12), not the sanitizer's own defence-in-depth superset.
 */

import { HIGHLIGHT_GRAMMARS } from '../render-policy-content.js';
import {
  APPEARANCE_RESOLVED_MODE_ATTRIBUTE,
  APPEARANCE_ROOT_ATTRIBUTE,
  APPEARANCE_SELECT_ID,
} from './contract.js';
import { PAGE_KIND_ATTRIBUTE, PAGE_KIND_VALUES } from '../page-kinds.js';
import { SLOT_NAMES } from '../skeleton.js';
import { canonicalizeJcs, domainDigest } from '../canonical-jcs.js';

/** @type {string} */
export const TEMPLATE_STYLING_CONTRACT_PACKAGE = '@rathnasgala2/template';
/** @type {string} */
export const TEMPLATE_STYLING_CONTRACT_VERSION = '2.0.0';
/** @type {string} */
export const TEMPLATE_STYLING_CONTRACT_TEMPLATE_VERSION = '2.0.0';

/** @type {string} the `main-content` landmark's fixed `id`. */
const MAIN_CONTENT_ID = 'main-content';

/** @type {readonly string[]} the ordered `@layer` names DEC-097 fixes. */
export const ORDERED_LAYERS = Object.freeze([
  'gala-tokens',
  'gala-components',
  'gala-utilities',
  'gala-print',
]);

/** @type {string} */
export const PUBLICATION_ROOT_SELECTOR = '[data-gala-publication-root]';

/** @type {{light: string, dark: string}} */
export const RESOLVED_PALETTE_SELECTORS = Object.freeze({
  light: `[${APPEARANCE_ROOT_ATTRIBUTE}][${APPEARANCE_RESOLVED_MODE_ATTRIBUTE}="light"]`,
  dark: `[${APPEARANCE_ROOT_ATTRIBUTE}][${APPEARANCE_RESOLVED_MODE_ATTRIBUTE}="dark"]`,
});

/**
 * @typedef {object} StyleHookDefinition
 * @property {string} hookId
 * @property {string} selectorAtom
 * @property {'type' | 'class' | 'id' | 'attribute'} kind
 */

/**
 * Every type-selector hook: one per HTML element this renderer's own
 * `internal/skeleton.js`/`internal/page-kinds.js` chrome, or its
 * `internal/content-security.js` markdown-it pipeline (`html:false`,
 * CommonMark grammar only), ever actually emits.
 *
 * @type {readonly StyleHookDefinition[]}
 */
const TYPE_HOOKS = Object.freeze(
  [
    ['landmark-header', 'header'],
    ['landmark-navigation', 'nav'],
    ['landmark-main', 'main'],
    ['landmark-footer', 'footer'],
    ['content-article', 'article'],
    ['heading-1', 'h1'],
    ['heading-2', 'h2'],
    ['heading-3', 'h3'],
    ['heading-4', 'h4'],
    ['heading-5', 'h5'],
    ['heading-6', 'h6'],
    ['prose-paragraph', 'p'],
    ['prose-list-unordered', 'ul'],
    ['prose-list-ordered', 'ol'],
    ['prose-list-item', 'li'],
    ['prose-blockquote', 'blockquote'],
    ['code-block', 'pre'],
    ['code-inline', 'code'],
    ['prose-strong', 'strong'],
    ['prose-emphasis', 'em'],
    ['prose-link', 'a'],
    ['media-image', 'img'],
    ['prose-divider', 'hr'],
    ['control-label', 'label'],
    ['control-select', 'select'],
    ['control-option', 'option'],
    ['prose-span', 'span'],
    ['prose-time', 'time'],
  ].map(([hookId, tag]) =>
    Object.freeze({
      hookId,
      selectorAtom: tag,
      kind: /** @type {const} */ ('type'),
    }),
  ),
);

/**
 * Every class-selector hook: the base Prism `.token` class plus one
 * `.language-<grammar>` hook per admitted highlight grammar (S2 scope: no
 * per-token-kind class is public — see module documentation).
 *
 * @type {readonly StyleHookDefinition[]}
 */
const CLASS_HOOKS = Object.freeze([
  Object.freeze({
    hookId: 'code-token',
    selectorAtom: '.token',
    kind: /** @type {const} */ ('class'),
  }),
  ...HIGHLIGHT_GRAMMARS.map((grammar) =>
    Object.freeze({
      hookId: `code-language-${grammar}`,
      selectorAtom: `.language-${grammar}`,
      kind: /** @type {const} */ ('class'),
    }),
  ),
]);

/**
 * Every id-selector hook: the `<main>` landmark's fixed `id` and the
 * appearance control's fixed `<select id>`.
 *
 * @type {readonly StyleHookDefinition[]}
 */
const ID_HOOKS = Object.freeze([
  Object.freeze({
    hookId: 'landmark-main-content',
    selectorAtom: `#${MAIN_CONTENT_ID}`,
    kind: /** @type {const} */ ('id'),
  }),
  Object.freeze({
    hookId: 'control-appearance-select',
    selectorAtom: `#${APPEARANCE_SELECT_ID}`,
    kind: /** @type {const} */ ('id'),
  }),
]);

/**
 * Every attribute-value hook: one per `data-gala-slot` value
 * ({@link SLOT_NAMES}) and one per `data-gala-page-kind` value
 * ({@link PAGE_KIND_VALUES}).
 *
 * @type {readonly StyleHookDefinition[]}
 */
const ATTRIBUTE_VALUE_HOOKS = Object.freeze([
  ...SLOT_NAMES.map((slotName) =>
    Object.freeze({
      hookId: `slot-${slotName}`,
      selectorAtom: `[data-gala-slot="${slotName}"]`,
      kind: /** @type {const} */ ('attribute'),
    }),
  ),
  ...PAGE_KIND_VALUES.map((pageKind) =>
    Object.freeze({
      hookId: `page-${pageKind}`,
      selectorAtom: `[${PAGE_KIND_ATTRIBUTE}="${pageKind}"]`,
      kind: /** @type {const} */ ('attribute'),
    }),
  ),
]);

/** @type {readonly StyleHookDefinition[]} every public hook, unsorted. */
const ALL_HOOKS = Object.freeze([
  ...TYPE_HOOKS,
  ...CLASS_HOOKS,
  ...ID_HOOKS,
  ...ATTRIBUTE_VALUE_HOOKS,
]);

/**
 * @param {readonly string[]} values
 * @returns {string[]} a new, UTF-8-byte-sorted, duplicate-free copy
 */
function sortedUniqueBytes(values) {
  return [...new Set(values)].sort((a, b) => {
    const bufferA = Buffer.from(a, 'utf8');
    const bufferB = Buffer.from(b, 'utf8');
    return Buffer.compare(bufferA, bufferB);
  });
}

/**
 * Build the complete `templateStylingContract` object, including
 * `catalogDigest` (DEC-097 section 8:
 * `SHA256(UTF8("GALA-TEMPLATE-STYLING-CONTRACT-V2\0") || JCS(the catalog
 * with catalogDigest omitted))`).
 *
 * @returns {Record<string, unknown>} the complete, digested contract object
 */
export function buildTemplateStylingContract() {
  const attributesRows = [
    {
      name: APPEARANCE_ROOT_ATTRIBUTE,
      match: 'presence',
      values: [],
      role: 'root',
    },
    {
      name: APPEARANCE_RESOLVED_MODE_ATTRIBUTE,
      match: 'exact-value',
      values: sortedUniqueBytes(['dark', 'light']),
      role: 'state',
    },
    {
      name: 'data-gala-slot',
      match: 'exact-value',
      values: sortedUniqueBytes(SLOT_NAMES),
      role: 'semantic',
    },
    {
      name: PAGE_KIND_ATTRIBUTE,
      match: 'exact-value',
      values: sortedUniqueBytes(PAGE_KIND_VALUES),
      role: 'semantic',
    },
  ].sort((a, b) => {
    const bufferA = Buffer.from(canonicalizeJcs(a), 'utf8');
    const bufferB = Buffer.from(canonicalizeJcs(b), 'utf8');
    return Buffer.compare(bufferA, bufferB);
  });

  const publicThemeSlotHooks = ALL_HOOKS.map(({ hookId, selectorAtom }) => ({
    hookId,
    selectorAtom,
  })).sort((a, b) => {
    const bufferA = Buffer.from(a.hookId, 'utf8');
    const bufferB = Buffer.from(b.hookId, 'utf8');
    return Buffer.compare(bufferA, bufferB);
  });

  /** @type {Record<string, unknown>} */
  const withoutDigest = {
    profile: 'gala-template-styling-contract-v2',
    contractVersion: TEMPLATE_STYLING_CONTRACT_VERSION,
    templatePackage: TEMPLATE_STYLING_CONTRACT_PACKAGE,
    templateVersion: TEMPLATE_STYLING_CONTRACT_TEMPLATE_VERSION,
    orderedLayers: [...ORDERED_LAYERS],
    stylesheetLayers: {
      tokens: 'gala-tokens',
      components: 'gala-components',
      utilities: 'gala-utilities',
      print: 'gala-print',
    },
    publicationRootSelector: PUBLICATION_ROOT_SELECTOR,
    resolvedPaletteSelectors: { ...RESOLVED_PALETTE_SELECTORS },
    typeSelectors: sortedUniqueBytes(
      TYPE_HOOKS.map((hook) => hook.selectorAtom),
    ),
    classSelectors: sortedUniqueBytes(
      CLASS_HOOKS.map((hook) => hook.selectorAtom.replace(/^\./, '')),
    ),
    idSelectors: sortedUniqueBytes(
      ID_HOOKS.map((hook) => hook.selectorAtom.replace(/^#/, '')),
    ),
    attributes: attributesRows,
    pseudoClasses: [],
    pseudoElements: ['after', 'before', 'marker', 'selection'],
    functionalPseudos: ['is', 'where', 'not', 'nth-child', 'nth-last-child'],
    combinators: [' ', ' > ', ' + ', ' ~ '],
    publicThemeSlotHooks,
    composition: {
      rootScope: 'first-compound-required',
      compoundOrder: [
        'type',
        'id',
        'class',
        'attribute',
        'pseudo-class',
        'pseudo-element',
      ],
      functionalSelectorArguments: 'compound-only',
      maximumFunctionalDepth: 1,
      nthExpressionProfile: 'gala-positive-an-plus-b-v2',
    },
  };

  const catalogDigest = domainDigest(
    'GALA-TEMPLATE-STYLING-CONTRACT-V2\0',
    withoutDigest,
  );

  return { ...withoutDigest, catalogDigest };
}

/**
 * Every distinct catalog leaf this contract admits, independent of hooks
 * (used by the drift gate to cross-check rendered HTML).
 *
 * @returns {{types: string[], classes: string[], ids: string[]}}
 */
export function templateStylingContractLeaves() {
  return {
    types: TYPE_HOOKS.map((hook) => hook.selectorAtom),
    classes: CLASS_HOOKS.map((hook) => hook.selectorAtom.replace(/^\./, '')),
    ids: ID_HOOKS.map((hook) => hook.selectorAtom.replace(/^#/, '')),
  };
}

/** @returns {readonly StyleHookDefinition[]} every public hook definition. */
export function templateStylingContractHooks() {
  return ALL_HOOKS;
}

/**
 * A thrown error's message prefix for every structural violation
 * {@link assertTemplateStylingContractShape} detects.
 *
 * @type {string}
 */
export const TEMPLATE_STYLING_CONTRACT_INVALID =
  'TEMPLATE_STYLING_CONTRACT_INVALID';

/**
 * Structural self-validation of a `templateStylingContract` object against
 * DEC-097 section 4's closed shape (the checks this repository can run
 * without a published `urn:gala:schema:template-styling-contract` schema
 * entry — no such schema ID is registered in `@rathnasgala2/schemas@2.8.0`;
 * only `urn:gala:schema:theme-contract:2.0.0` is, which this module's sibling
 * theme fixtures are validated against with the schema package's own
 * exported `validateGalaDocument`, see `test/theme-styling-contract.test.js`).
 * Fails closed with a descriptive `Error` on the first violation found.
 *
 * @param {Record<string, unknown>} contract a candidate contract object
 * @returns {void}
 */
export function assertTemplateStylingContractShape(contract) {
  /**
   * @param {string} reason a short violation description
   * @returns {never}
   */
  const fail = (reason) => {
    throw new Error(`${TEMPLATE_STYLING_CONTRACT_INVALID}: ${reason}`);
  };
  if (contract.profile !== 'gala-template-styling-contract-v2') {
    fail('profile');
  }
  if (contract.contractVersion !== '2.0.0') fail('contractVersion');
  if (contract.templatePackage !== '@rathnasgala2/template') {
    fail('templatePackage');
  }
  if (typeof contract.templateVersion !== 'string') fail('templateVersion');
  if (
    !Array.isArray(contract.orderedLayers) ||
    JSON.stringify(contract.orderedLayers) !== JSON.stringify(ORDERED_LAYERS)
  ) {
    fail('orderedLayers');
  }
  const layers = /** @type {Record<string, unknown>} */ (
    contract.stylesheetLayers
  );
  if (
    !layers ||
    layers.tokens !== 'gala-tokens' ||
    layers.components !== 'gala-components' ||
    layers.utilities !== 'gala-utilities' ||
    layers.print !== 'gala-print'
  ) {
    fail('stylesheetLayers');
  }
  if (contract.publicationRootSelector !== PUBLICATION_ROOT_SELECTOR) {
    fail('publicationRootSelector');
  }
  const palettes = /** @type {Record<string, unknown>} */ (
    contract.resolvedPaletteSelectors
  );
  if (
    !palettes ||
    palettes.light !== RESOLVED_PALETTE_SELECTORS.light ||
    palettes.dark !== RESOLVED_PALETTE_SELECTORS.dark
  ) {
    fail('resolvedPaletteSelectors');
  }

  const attributes = /** @type {Record<string, unknown>[]} */ (
    contract.attributes
  );
  if (!Array.isArray(attributes) || attributes.length < 2) {
    fail('attributes');
  }
  const rootRows = attributes.filter(
    (row) =>
      row.name === APPEARANCE_ROOT_ATTRIBUTE &&
      row.match === 'presence' &&
      row.role === 'root' &&
      Array.isArray(row.values) &&
      row.values.length === 0,
  );
  const paletteRows = attributes.filter(
    (row) =>
      row.name === APPEARANCE_RESOLVED_MODE_ATTRIBUTE &&
      row.match === 'exact-value' &&
      row.role === 'state' &&
      Array.isArray(row.values) &&
      JSON.stringify([...row.values].sort()) ===
        JSON.stringify(['dark', 'light']),
  );
  if (rootRows.length !== 1) fail('root attribute row');
  if (paletteRows.length !== 1) fail('palette attribute row');

  if (
    JSON.stringify(contract.pseudoElements) !==
    JSON.stringify(['after', 'before', 'marker', 'selection'])
  ) {
    fail('pseudoElements');
  }
  if (
    JSON.stringify(contract.functionalPseudos) !==
    JSON.stringify(['is', 'where', 'not', 'nth-child', 'nth-last-child'])
  ) {
    fail('functionalPseudos');
  }
  if (
    JSON.stringify(contract.combinators) !==
    JSON.stringify([' ', ' > ', ' + ', ' ~ '])
  ) {
    fail('combinators');
  }

  const composition = /** @type {Record<string, unknown>} */ (
    contract.composition
  );
  if (
    !composition ||
    composition.rootScope !== 'first-compound-required' ||
    JSON.stringify(composition.compoundOrder) !==
      JSON.stringify([
        'type',
        'id',
        'class',
        'attribute',
        'pseudo-class',
        'pseudo-element',
      ]) ||
    composition.functionalSelectorArguments !== 'compound-only' ||
    composition.maximumFunctionalDepth !== 1 ||
    composition.nthExpressionProfile !== 'gala-positive-an-plus-b-v2'
  ) {
    fail('composition');
  }

  const hooks = /** @type {{hookId: string, selectorAtom: string}[]} */ (
    contract.publicThemeSlotHooks
  );
  if (!Array.isArray(hooks) || hooks.length < 1 || hooks.length > 64) {
    fail('publicThemeSlotHooks length');
  }
  const seenAtoms = new Set();
  const seenHookIds = new Set();
  let previousHookId = '';
  for (const hook of hooks) {
    if (seenAtoms.has(hook.selectorAtom)) fail('duplicate hook selectorAtom');
    if (seenHookIds.has(hook.hookId)) fail('duplicate hookId');
    if (previousHookId !== '' && hook.hookId <= previousHookId) {
      fail('publicThemeSlotHooks not sorted by hookId');
    }
    previousHookId = hook.hookId;
    seenAtoms.add(hook.selectorAtom);
    seenHookIds.add(hook.hookId);
  }

  const withoutDigest = { ...contract };
  delete withoutDigest.catalogDigest;
  const expectedDigest = domainDigest(
    'GALA-TEMPLATE-STYLING-CONTRACT-V2\0',
    withoutDigest,
  );
  if (contract.catalogDigest !== expectedDigest) fail('catalogDigest');
}
