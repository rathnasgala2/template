/**
 * `contracts/theme-styling-contract.jcs` builder and structural validator:
 * the `templateStylingContract` closed object governing closed
 * theme-package and stylesheet admission.
 *
 * This is the one reviewed source module `scripts/generate-contracts.mjs`
 * reads from to emit the published contract file, and the one module
 * `test/theme-styling-contract.test.js` reads from to drift-check the
 * contract against what this renderer actually renders. Every catalog leaf
 * below is drawn from (or, for the two hooks documented inline,
 * wired into) the actual rendering modules — `internal/skeleton.js`,
 * `internal/page-kinds.js`, `internal/render-policy-content.js` and
 * `internal/appearance/contract.js` — never a hand-typed literal
 * independent of what those modules emit.
 *
 * Public-hook budget (`publicThemeSlotHooks` is a `[1..64]`-entry set):
 * every catalog leaf below (28 type + 15 class + 2 id + 19 attribute-value)
 * has exactly one corresponding public hook, for exactly 64 entries — this
 * renderer's complete public theming surface. A leaf with no matching hook
 * would be a catalog member no theme could ever validly select (a
 * used-but-undeclared public slot hook rejects), so catalogs and hooks are
 * generated from one shared list rather than two independently maintained
 * ones.
 *
 * Deliberately out of the S2 public hook surface (documented scope
 * decisions, not omissions):
 * - fine-grained Prism token-class hooks (`.keyword`, `.string`, ...): only
 *   the base `.token` class and one hook per admitted highlight grammar's
 *   `.language-<grammar>` class are public, so a theme can style a
 *   highlighted code block's overall presentation but not recolor
 *   individual token kinds in S2;
 * - `html`/`body` type selectors: themes reach the document root only
 *   through {@link PUBLICATION_ROOT_SELECTOR}/{@link RESOLVED_PALETTE_SELECTORS}.
 *
 * Iconography (TPL-H6 decision, recorded here rather than left as an
 * accident of theme authorship): **in scope, and expected.** Nothing in this
 * contract restricts it — `::before`/`::after` are public pseudo-elements, a
 * theme package may declare non-CSS passive assets (`theme.json.assets[]`),
 * and a package-relative `url()` is permitted in theme CSS (only an
 * external-origin `url()` is a theme-tooling lint concern, not a template
 * restriction). The only reason no theme shipped an icon before this
 * decision was recorded is that the prerequisite — safe admission of a
 * theme-declared SVG — did not exist yet. It does now:
 * `internal/media/theme-svg-sanitizer.js`, wired into
 * `internal/theme-assets.js`'s passive-asset pipeline (TPL-C2), is the
 * mechanism that makes shipping an SVG icon mark safe. A theme is free to
 * declare one and reference it from `::before`/`::after` `content: url(...)`
 * or a `background-image`.
 *
 * Contract 2.1.0 (TPL-H2/TPL-H3/TPL-M7 fix): S2.0's empty `pseudoClasses`
 * catalog made every interaction state unstylable while the closed 35-token
 * catalog already required `color-focus` and `color-link-visited`, tokens
 * only a pseudo-class can ever apply. {@link PSEUDO_CLASSES} publishes a
 * small closed catalog instead of widening indefinitely; the module
 * documentation on that constant records why each member is admitted and
 * why the set stops there. This is a template-owned, backward-compatible
 * *contract* addition (a theme still validates if it uses none of these), so
 * it ships as a minor bump: 2.0.0 -> 2.1.0.
 *
 * Every tag in `internal/render-policy-content.js`'s `ALLOWED_TAGS` that
 * markdown-it's own CommonMark grammar (with `html:false`) never actually
 * produces — `b`, `i`, `u`, `s`, `del`, `ins`, `sub`, `sup`, `mark`, `small`,
 * `wbr`, `table`, `thead`, `tbody`, `tr`, `th`, `td`, `dl`, `dt`, `dd`,
 * `figure`, `figcaption` — is likewise excluded from `typeSelectors`: this
 * catalog is every hook the template actually renders, not the sanitizer's
 * own defence-in-depth superset.
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
export const TEMPLATE_STYLING_CONTRACT_VERSION = '2.1.0';
/** @type {string} */
export const TEMPLATE_STYLING_CONTRACT_TEMPLATE_VERSION = '2.1.0';

/** @type {string} the `main-content` landmark's fixed `id`. */
const MAIN_CONTENT_ID = 'main-content';

/**
 * The closed pseudo-class catalog (contract 2.1.0, TPL-H2 fix). Each member
 * is admitted for a specific, already-published reason — this is a closed
 * list, not a starting point:
 *
 * - `hover`: pointer affordance on links and the appearance control; the
 *   only way any theme can differentiate a hovered interactive element.
 * - `focus-visible`: the keyboard/assistive-technology focus indicator
 *   (WCAG 2.2 SC 2.4.11/2.4.13 are about this indicator specifically).
 *   `:focus` is deliberately *not* admitted instead: `:focus-visible` is
 *   what lets a theme paint a ring for keyboard focus without also painting
 *   one on every mouse click, which is why `internal/appearance/
 *   base-layer.js`'s own template-owned default ring (unconstrained by this
 *   catalog) uses it too.
 * - `active`: pressed-state affordance, the pointer-down counterpart to
 *   `hover`.
 * - `visited`: the only way to consume the closed token catalog's own
 *   `color-link-visited`, which had no reachable application before this.
 * - `disabled`: the appearance `<select>` is a native form control, which
 *   may legitimately be disabled by a later module; themes need a way to
 *   style that state today so it is not a breaking addition later.
 *
 * Deliberately still excluded: `:target`, `:checked`, `:required`,
 * `:invalid` and every other state this renderer's own markup can never
 * produce (no form beyond the one native `<select>`, no fragment-target
 * styling contract) — the same "every leaf has a matching hook" discipline
 * {@link ALL_HOOKS} documents above applies to pseudo-classes too: a
 * catalog member with nothing that can ever be in that state is a
 * specification defect, not a convenience.
 *
 * @type {readonly string[]}
 */
export const PSEUDO_CLASSES = Object.freeze(
  ['active', 'disabled', 'focus-visible', 'hover', 'visited'].sort(),
);

/**
 * Contract 2.1.0 (TPL-H2 fix, alongside {@link PSEUDO_CLASSES}): the
 * `nth-child`/`nth-last-child` functional pseudo-classes were already
 * admitted (see `functionalPseudos` below) but only under
 * `nthExpressionProfile: 'gala-positive-an-plus-b-v2'`, an arithmetic
 * `an+b` grammar with no keyword form — so a theme could not express the
 * conventional "every other row" zebra-striping pattern without a
 * (legal but obscure) `2n`/`2n+1` expression. This publishes the two
 * keyword arguments as an explicit, closed extension of that same
 * profile, admitted only as the sole argument to `nth-child`/
 * `nth-last-child`.
 *
 * @type {readonly string[]}
 */
export const FUNCTIONAL_PSEUDO_KEYWORD_ARGUMENTS = Object.freeze([
  'even',
  'odd',
]);

/**
 * TPL-H3/TPL-M7: the ordered `@layer` names this renderer fixes, including
 * the template-owned `gala-base` layer as the first (lowest-precedence)
 * entry. `gala-base` is emitted by this renderer itself, never by a theme
 * package (no `theme.json.cssLayers` entry ever names it —
 * `urn:gala:schema:theme-contract:2.0.0` only ever admits a theme's own
 * four-or-five-stylesheet subsequence of the layers *after* it), so it
 * stays first in this list unconditionally: cascade-layer
 * precedence is later-wins, and a theme's own `gala-tokens`/`gala-components`/
 * `gala-utilities` declarations must always be able to override the
 * template's own base defaults (its focus ring, its type scale, ...),
 * never the reverse.
 *
 * @type {readonly string[]}
 */
export const ORDERED_LAYERS = Object.freeze([
  'gala-base',
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
 * `catalogDigest`:
 * `SHA256(UTF8("GALA-TEMPLATE-STYLING-CONTRACT-V2\0") || JCS(the catalog
 * with catalogDigest omitted))`.
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
    pseudoClasses: [...PSEUDO_CLASSES],
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
      functionalPseudoKeywordArguments: [
        ...FUNCTIONAL_PSEUDO_KEYWORD_ARGUMENTS,
      ],
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
 * its closed shape (the checks this repository can run
 * without a published `urn:gala:schema:template-styling-contract` schema
 * entry — no such schema ID is registered in `@rathnasgala2/schemas@2.11.0`;
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
  if (contract.contractVersion !== '2.1.0') fail('contractVersion');
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
    JSON.stringify(contract.pseudoClasses) !==
    JSON.stringify([...PSEUDO_CLASSES])
  ) {
    fail('pseudoClasses');
  }
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
    composition.nthExpressionProfile !== 'gala-positive-an-plus-b-v2' ||
    JSON.stringify(composition.functionalPseudoKeywordArguments) !==
      JSON.stringify([...FUNCTIONAL_PSEUDO_KEYWORD_ARGUMENTS])
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
