# `@rathnasgala2/template`

The deterministic Eleventy-backed static publication renderer for Galascribe's
portable author repository format. It is one of the three author-facing S2
artifacts, alongside one `@rathnasgala2/theme-*` package and
`@rathnasgala2/publish-action`.

This package is JavaScript ESM on Node 24, authored without TypeScript sources
(DEC-094): every export carries JSDoc types, checked by `tsc --checkJs --noEmit`
against a hand-maintained `.d.ts` surface.

## Status

S2-T02's repository scaffold (exact pins, `src/core/`-only layout, module-tree
absence gate, quality-gate tooling) plus S2-T03's renderer adapter:
`renderPublication(buildInput, options)`, exported from `src/core/index.js`, is
the package's one documented entry point. It:

1. validates a candidate `urn:gala:schema:build-input:2.0.0` document with
   `@rathnasgala2/schemas`' `validateGalaDocument` and fails closed
   (`BuildInputValidationError`, before anything is written) on an invalid one;
2. renders the publication profile (when selected) and every selected content
   record, plus every authored static redirect document, through a single
   confined, single-pass programmatic Eleventy 3.1.6 build behind
   `src/core/internal/eleventy-render.js` — the only module in this repository
   permitted to import `@11ty/eleventy`, so no Eleventy object, plug-in API,
   config object or Nunjucks environment ever crosses back out of it; and
3. assembles, digests and schema-validates a closed
   `urn:gala:schema:artifact-manifest:2.0.0` instance describing the candidate
   output directory.

S2-T05 adds the media pipeline under `src/core/internal/media/`, run from
`renderPublication` after the Eleventy route listing so its output is never
mistaken for an HTML route:

- **Bounded decode.** JPEG (via the pinned pure-JS `jpeg-js` decoder, no native
  addon or WebAssembly) and PNG (hand-written, using Node's built-in `zlib` with
  a decompression-bomb-bounded inflate) are fully decoded to RGBA8; WebP and
  AVIF get bounded container/declared-dimension validation without a full
  entropy decode (a documented scope decision — see
  `webp-probe.js`/`avif-probe.js`). Every format shares one set of resource
  ceilings in `limits.js` (raster dimension, pixel count, decoded-buffer and
  source-byte caps reused from DEC-097's own closed binary-asset decoder bounds,
  plus this renderer's own documented per-publication ceilings).
- **Metadata strip, orientation.** PNG/JPEG derivatives are always re-encoded
  from decoded pixels, never byte-copied, so no ancillary/EXIF metadata survives
  into a derivative; JPEG's EXIF `Orientation` tag is read and applied
  (rotate/flip) before any derivative is produced.
- **Deterministic responsive derivatives.** Content-addressed
  `assets/media/<sourceDigest>/{original,<width>w}.<ext>` files at fixed widths
  `320/640/960/1280/1920` (below the source width), re-encoded with fixed,
  pinned encoder settings so two clean builds of the same source produce
  byte-identical derivative files.
- **SVG rejection.** Any byte sequence recognized as SVG/XML is rejected
  unconditionally as an image reference (`MEDIA_SVG_REJECTED`) — SVG is never
  processed as author media.
- **Font policy.** `appearance.fontAssets` entries must be bounded WOFF2 (exact
  signature, DEC-097's 4,194,304-byte font cap); a remote font reference cannot
  enter `build-input` in the first place (`resolvedFile` is always a
  repository-relative path), so "no remote font is ever retrieved" holds
  structurally.
- **Fail-closed errors.** Every rejection — oversize, decompression bomb, digest
  mismatch, SVG, unrecognized format, invalid font — is a `MediaPipelineError`
  with a stable `reasonCode`, thrown before the manifest is assembled.

`options.sourceDirectory` (new in S2-T05) is the caller-mounted, read-only
repository source tree `build-input`'s `resolvedFile` references point into;
every referenced file's bytes are read from there and verified against
`build-input`'s declared `sourceDigest` before being decoded.

S2-T04 adds the complete output-security pipeline
(`src/core/internal/content-security.js`) on top of that adapter. **Division of
labour** (DEC-097 section 5: normalization replaces an authored body path with a
`renderableBody` carrying "the deterministic policy output/digest";
`build-input.schema.json` fixes `renderableBody.bodyMediaType` as
`const: "text/html"`): a `renderableBody.body` inside a validated
`build-input:2.0.0` instance is **already** render-policy-conformant HTML,
produced once upstream of this renderer. This package therefore exposes two
distinct public entry points:

- **`normalizeAuthoredMarkdown(markdownSource) -> { html, bodyDigest }`**
  (exported from `src/core/index.js`) is the pipeline an upstream
  `build-input:2.0.0` producer (`publish-kernel`/`publish-action`) runs exactly
  once per authored Markdown source: `markdown-it` 14.3.1 configured exactly
  `{ html: false, linkify: false, typographer: false }`, with a closed
  URL-scheme allowlist (`https`, `http`, `mailto`, or a schemeless relative
  path/fragment — rejecting `javascript:`, `data:`, `blob:`, `vbscript:` and
  protocol-relative URLs, including WHATWG-style tab/newline scheme obfuscation)
  and deterministic, collision-free heading `id`s; fenced code through an owned
  highlighter over `@11ty/eleventy-plugin-syntaxhighlight` 5.0.2 (only a closed
  grammar catalog — `bash`, `css`, `diff`, `java`, `javascript`, `json`, `jsx`,
  `markdown`, `markup`, `python`, `sql`, `tsx`, `typescript`, `yaml` — is ever
  highlighted; every other fence language falls back to escaped, unhighlighted
  code); then `sanitize-html` 2.17.7 against a closed tag/attribute/class/scheme
  allowlist (no `style`, no `on*`, no `srcdoc`, no `id` outside generated
  heading IDs, no script/style/iframe/object/embed/ svg/math/template content)
  and a fail-closed residual-active-content scan.
- **`renderPublication`** (the renderer itself) never runs Markdown parsing on a
  `renderableBody.body` it receives — re-parsing already-rendered HTML under
  `html:false` would double-escape every tag (`<p>` becoming `&lt;p&gt;`).
  Instead it verifies, before any directory is created: every
  `renderableBody.renderPolicy` (publication profile, footer card, every content
  record) byte-equals
  `SHA256(UTF8("GALA-RENDER-POLICY-V2\0") || <contract file bytes>)`; every
  `bodyDigest` byte-equals a plain SHA-256 of its `body` bytes; and
  re-sanitizing `body` reproduces it byte-for-byte (an idempotence check —
  genuinely policy-conformant output cannot change under its own sanitizer). Any
  mismatch, or a non-empty `modules`/`placements` value, fails closed with
  `RenderPolicyViolationError` before anything is written. A verified body is
  then inserted into the page verbatim.

`contracts/render-policy.jcs` is the real, closed sanitizer/parser catalog
(name, version, CSP baseline, markdown-it options, sanitizer allowlist,
highlighter grammar/token-class catalog) both surfaces above read from,
generated deterministically by `scripts/generate-contracts.mjs` from
`src/core/internal/render-policy-content.js` — the single source of truth, so
the published contract and the enforced policy cannot drift apart. Every
rendered page also carries the exact per-artifact CSP baseline as a
`<meta http-equiv="Content-Security-Policy">` tag (byte-identical on every
route, since S2 materializes no module package/configuration/output/runtime).

`img[src]` is restricted to repository-relative paths only in this pipeline;
full manifest-coverage verification of media references is the S2-T05 media
pipeline's job (immediately above). A handful of manifest fields (`builder`,
`sourceIdentity.repository`, `workflowIdentity`, `buildToolVersions`,
`excludedInputs`) describe facts `build-input` does not itself carry;
`renderPublication` accepts them as an explicit `options.provenance` bundle
rather than fabricating them — see `src/core/manifest.js`'s module
documentation. `contracts/theme-styling-contract.jcs` is S2-T12's real, closed
`templateStylingContract` catalog (see the S2-T12 section below).

S2-T06 adds the core semantic skeleton, page kinds and navigation renderer on
top of the S2-T04 output-security pipeline every generated page still passes
through:

- **`src/core/internal/skeleton.js`** renders the one landmark contract every
  page kind shares, through its one `renderPageBody` composition: a skip link
  (the first focusable element, targeting `#main-content`), one `<header>` (home
  link with the validated publication name, plus the always-present
  `header-actions` slot), one primary `<nav>` from `navigationNormalized.items`,
  one `<main id="main-content">` (an optional breadcrumb `<nav>` before the
  page's own single `<h1>`), and one `<footer>` (publication name, footer
  navigation, the `footer-profile` slot, the remaining core slots, and the
  template attribution line). Core owns nine versioned semantic slots
  (`header-actions`, `article-preamble`, `article-end`, `footer-profile`,
  `footer-auxiliary`, `account-intent`, `conversation`, `newsletter`,
  `edition-selector`) plus the collapsed `article-footer-ad` slot (DEC-060):
  every slot is one `data-gala-slot="<name>"` attribute on an otherwise empty,
  non-landmark `<div>`, and the collapsed slot additionally carries `hidden`. S2
  has no module system, so every slot except `footer-profile` (which always
  wraps the publication's own footer card) and `header-actions` (S2-T07's
  appearance control, core content rather than a module) renders empty. This
  module also renders breadcrumbs and deterministic pagination controls
  (`rel="prev"`/`rel="next"`, an `aria-current="page"` status).
- **`src/core/internal/page-kinds.js`** builds every generated page kind from a
  validated `build-input:2.0.0`: `profile` (the optional publication profile),
  `author` (one page per `build-input.authors` entry, at `/authors/<id>`),
  `article`/`page` (one page per `content[]` record, at its own route), `index`
  (a paginated reverse-chronological listing of every `status: "published"`,
  `kind: "article"` record — an `unlisted` record is reachable only by its own
  direct route, never through a generated listing), `tag`/`series` (one listing
  page per distinct authored value, plus a `/tags`/`/series` root page linking
  to each), and `archive` (one listing page per UTC calendar year, plus a
  `/archive` root page). The `error` page kind (`renderErrorPageBody`) is
  exported as a pure function for a future `404.html` caller (S2-T08, out of
  this task's scope), not wired into any generated route here. Listing page size
  (10), sort tie-break, and the tag/series/archive root pages are documented
  scoped decisions the brief text this task read does not fix verbatim.
- **`src/core/internal/messages.js`** is the message catalog every user-visible
  chrome string above is looked up from (never an inline literal), keyed by
  BCP-47 tag with a fixed `en` fallback — the only catalog S2 authors;
  additional locales are future work that changes no call site.
- **`src/core/internal/text-direction.js`** derives a page's `dir` attribute
  from its own BCP-47 language tag (`build-input:2.0.0` carries no separate
  direction field) against a closed right-to-left primary-language-subtag table
  — the same approach `Intl.Locale`'s `textInfo.direction` uses, reimplemented
  as a small static table to add no runtime dependency.
- **`src/core/internal/route-labels.js`** derives a deterministic,
  collision-free route segment for an arbitrary tag/series label (a
  `plainLabel`, not a route-safe `slug`): an ASCII-readable prefix plus a
  content-hash suffix, so two distinct Unicode labels can never collide on the
  same generated route.

Chrome text is resolved once, in the publication's own `defaultLanguage`, for
every page (a scoped decision: navigation/footer text does not flip language
page to page); each page's own `<html lang>`/`dir` still reflects that
individual page's own content language.

S2-T07 adds the Light/Dark/System appearance controller
(`src/core/internal/appearance/`), the only browser bootstrap S2 emits (brief S2
section 3, "Module absence and CSP equality"):

- **`contract.js`** is the one module every other appearance-related file
  imports every name/value from: the two DEC-097-fixed root attributes
  (`data-gala-publication-root` presence, `data-gala-resolved-color-mode`
  exact-value `"light"`/`"dark"`), the template-internal
  `data-gala-color-mode-selection` bookkeeping attribute, the three canonical
  mode values (`light`/`dark`/`system`), the versioned local storage key
  (`gala:appearance:color-mode:v1`), the control's `id`, the bootstrap script's
  fixed output path/media type and the `color-scheme` meta content — the
  contract S2-T12's published theme styling catalog targets.
- **`controller-markup.js`** renders a native `<select>` (a brief-admitted
  pattern; needs no `aria-pressed`/`aria-checked` bookkeeping of its own, unlike
  a custom button-group or radio-group would) bound to a visible `<label>`, with
  message-catalog labels, inserted into the header's `header-actions` slot. Its
  default selected option is always `system`; the bootstrap script's own
  `DOMContentLoaded` phase corrects `select.value` to the actual stored/resolved
  value once `<body>` exists.
- **`bootstrap-script.js`** is the exact deterministic pre-paint bootstrap
  (every literal from `contract.js`, so it and the server-rendered control can
  never drift): a synchronous phase, run the instant this blocking,
  non-`defer`/non-`async`/non-`module` `<script src>` executes in `<head>` —
  before `<body>` is even parsed — that reads the stored selection (falling back
  to `system` on a missing/invalid/unreadable value; a `localStorage` read/write
  failure is always caught, so a blocked or private-mode session stays fully
  usable) and resolves it against `prefers-color-scheme` (`system` resolves to
  `light` when unavailable), then applies both root attributes. It never touches
  `document.documentElement.style` (no hide-until-ready trick of any kind), no
  network, no cookie, no account/tracking identifier, and no storage key other
  than its own. A `DOMContentLoaded`-deferred phase wires the control's `change`
  event and a live `prefers-color-scheme` subscription that only updates the
  resolved attribute while the current selection is still exactly `system` (an
  explicit `light`/`dark` choice is never overridden by a later system change).
- `src/core/index.js` writes the bootstrap script into the candidate output
  directory and enters it into the manifest as an ordinary `manifestAsset` row
  (`{path, byteLength, sha256}` plus its fixed
  `application/javascript; charset=utf-8` media type), after the Eleventy route
  listing — exactly like an S2-T05 media derivative — so it is never mistaken
  for an HTML route. `src/core/internal/eleventy-render.js`'s skeleton layout
  carries the `data-gala-publication-root` attribute, the
  `<meta name="color-scheme" content="light dark">` tag and the one
  `<script src>` reference, all fixed literals from `contract.js`, so every
  route's `<head>` is still byte-identical (S2 materializes no module
  package/configuration/output/runtime).
- With JavaScript disabled, the control still renders (a native `<select>`,
  fully keyboard-operable and usable with no script at all). The resolved root
  attribute is server-rendered as the fixed `light` default (TPL-C1 fix), so a
  no-JS reader, an archival crawler, or a load where the bootstrap script fails
  still gets a fully themed page instead of unstyled UA-default HTML; a
  scripted reader's phase 1 bootstrap always overwrites this attribute with the
  reader's real stored selection/system preference before first paint.
  `<meta name="color-scheme">` also carries `prefers-color-scheme` through to
  user-agent styling (form controls, scrollbars) independent of any script.

S2-T12 replaces `contracts/theme-styling-contract.jcs`'s S2-T02 scaffold
placeholder with the real, closed `templateStylingContract` catalog DEC-097
section 4 defines, and wires the selected theme package's stylesheets into every
generated page:

- **`src/core/internal/appearance/styling-contract.js`** is the one reviewed
  source module `scripts/generate-contracts.mjs` emits the contract from: the
  ordered five-layer catalog (`gala-base`/`gala-tokens`/`gala-components`/
  `gala-utilities`/`gala-print` — contract 2.1.0, TPL-H3/TPL-M7 fix: `gala-base`
  is the template's own layer, carrying the reset/type-scale/focus-ring
  defaults documented below `internal/appearance/base-layer.js`, always ordered
  first so a theme's own layers can override it), the publication-root/
  resolved-palette selectors, the closed type/class/id/attribute leaf catalogs,
  a closed five-member pseudo-class catalog (`hover`, `focus-visible`,
  `active`, `visited`, `disabled` — contract 2.1.0, TPL-H2 fix; see that
  module's own documentation for why each is admitted and why the token
  catalog's `color-focus`/`color-link-visited` had no reachable application
  before it), and exactly 64 `publicThemeSlotHooks` —
  one per catalog leaf, so every leaf a theme could validly select is a named,
  documented hook and no catalog member is orphaned. Every leaf is drawn from
  what this renderer actually renders: 28 type-selector hooks (every
  landmark/prose/code/control element `internal/skeleton.js`,
  `internal/page-kinds.js` and the markdown-it CommonMark pipeline can produce),
  15 class-selector hooks (the base Prism `.token` class plus one
  `.language-<grammar>` hook per admitted highlight grammar — fine-grained
  per-token-kind classes are a documented S2 scope exclusion), 2 id-selector
  hooks (`#main-content`, the appearance `<select>`'s fixed id) and 19
  attribute-value hooks (one per `data-gala-slot` value, one per the new
  `data-gala-page-kind` value). `catalogDigest` is
  `SHA256(UTF8("GALA-TEMPLATE-STYLING-CONTRACT-V2\0") || JCS(...))`, matching
  DEC-097 section 8 and the digest profile `@rathnasgala2/schemas`' own internal
  `templateStylingContract` profile uses (that function is not exported through
  the package's public API, so this module reimplements the same
  domain-separated formula rather than importing it).
  `assertTemplateStylingContractShape` is this repository's own structural
  self-validator (root/palette attribute rows, fixed layer/selector/composition
  constants, hook count/uniqueness bound, `catalogDigest` recomputation); no
  `urn:gala:schema:template-styling-contract` schema ID is registered in
  `@rathnasgala2/schemas@2.0.0` for `validateGalaDocument` to check this object
  against directly.
- **`data-gala-page-kind`** (`internal/page-kinds.js`) is a new template-owned
  semantic attribute on every generated page's `<body>`, one exact value per
  `PAGE_KIND_VALUES` entry (`archive`/`article`/`author`/`error`/`index`/
  `page`/`profile`/`series`/`tag`), so a theme can vary presentation by page
  kind without promoting a private selector.
- **`test/theme-styling-contract.test.js`** is the drift gate: it renders a rich
  fixture whose one extra article exercises every markdown-derived hook (every
  heading level, every admitted highlight grammar, lists, blockquote, emphasis,
  a link and an image) and asserts, in both directions, that every published
  hook is actually rendered and every rendered hook-like construct
  (`data-gala-*` attribute, `<pre>`/`<code>` class, or element tag inside
  `<body>`) is published. It also validates two `theme-contract:2.0.0` fixtures
  — one light-dominant, one dark-dominant palette — with
  `@rathnasgala2/schemas`' own exported `validateGalaDocument`.
- **`src/core/internal/theme-assets.js`** is the optional theme-asset
  integration layer: given `options.themeDirectory` (an extracted theme package
  directory, shaped exactly like the S2-T13 package file set — `theme.json`,
  `tokens.css`, `components.css`, an optional `utilities.css`, `print.css`,
  `package.json`, `LICENSE`, `README.md`, `assets/*`), it copies the declared
  stylesheets and any declared non-CSS passive assets into `assets/theme/`,
  enters each as an ordinary `{path, byteLength, sha256}` `manifestAsset` row,
  and renders the ordered `<link>` markup every generated page's `<head>`
  inserts (`print.css` alone carries `media="print"`). It validates the theme's
  own declared `stylesheets` list against the two admitted shapes (with or
  without `utilities.css`) and that `cssLayers` byte-equals the corresponding
  layer projection, but does **not** re-implement DEC-097's full CSS Syntax
  Module admission grammar — that is the shared `theme-release.yml` conformance
  runner's job (S2-T11), run once per theme release, never per publication
  build. `renderPublication` falls back to the pre-existing fixed
  `assets/theme/print.css` link when no `options.themeDirectory` is supplied
  (every caller before S2-T12, and this repository's own tests that do not
  exercise theme integration). Minimal in-repo fixture theme packages for both
  stylesheet-list shapes live under `test/fixtures/theme-fixture-full/` and
  `test/fixtures/theme-fixture-minimal/` — deliberately not real, conformant
  theme CSS (authoring one is S2-T13's task); they exist only to exercise the
  copy/link/manifest mechanism.
- **basePath fix (LOCAL-7 follow-up; independent-review finding B2).** Before
  S2-T12, the appearance bootstrap script's `<script src>` and the social-image
  `og:image`/`twitter:image` URL were both root-absolute, unprefixed by the
  publication's own `basePath` — a non-root `basePath` publication would 404
  them. `internal/appearance/contract.js`'s new
  `appearanceBootstrapScriptHref(basePath)` and `internal/seo.js`'s
  `resolveSocialImageUrl` (now taking `basePath`) both join through
  `internal/route.js`'s shared `joinBasePathAndRoute`/`projectFixedAssetPath`,
  exactly like the pre-existing print-stylesheet convention (now folded into
  `internal/theme-assets.js`) already did for _hrefs_. Independent review
  (finding B2) found that this was only half the fix: the _physical files_ this
  renderer writes for every asset class — theme CSS/passive assets, every S2-T05
  media derivative, and the S2-T07 appearance bootstrap script — were still
  written, and entered into the manifest, at their bare **unprefixed** paths.
  Since the local-directory adapter serves a `manifestAsset.path` verbatim, a
  non-root `basePath` publication's `<link>`/`<script src>`/`og:image` href
  would point at `<basePath>/assets/...` while the actual file sat at the
  unprefixed `assets/...` — a 404 in practice, not just a theoretical href
  mismatch. `src/core/index.js` now joins `basePath` into the physical
  destination path and the `manifestAsset.path` for media derivatives
  (`joinedMediaAssets`, computed with the same `projectFixedAssetPath` every
  other fixed-name generated asset already uses) and the appearance bootstrap
  script (`joinedAppearanceScriptPath`); `internal/theme-assets.js` computes its
  joined output path once per file and derives both the `<link href>` and the
  file/manifest path from that exact same value, so they cannot drift apart.
  `test/theme-styling-contract.test.js` carries a dedicated non-root,
  multi-segment `basePath` (`/blog/2024`) fixture test asserting every one of
  these hrefs (media, appearance script, theme CSS, print CSS) is consistently
  joined **and** that the physical file for one asset of each class actually
  exists at that exact joined path.

- **Theme-asset path containment (independent-review finding B1).** A theme
  package's `theme.json` `stylesheets`/`assets` paths are untrusted input from
  the selected theme package, not fixed literals. `internal/theme-assets.js`'s
  `assertSafeThemeRelativePath` rejects an absolute path, a backslash, a non-NFC
  path, and any empty/`.`/`..` segment, before the file is ever opened;
  `assertContainedThemePath` then walks every path component under
  `themeDirectory` with `lstat`, rejecting a symlink at any component (so a
  symlink planted inside the theme directory cannot be used to escape it), and
  verifies the fully resolved path still starts inside the resolved
  `themeDirectory`. Only paths this module reads directly off `theme.json`'s own
  declared arrays are ever opened or copied, so a file physically present in
  `themeDirectory` but never declared there can never be copied into the
  candidate output directory. `test/theme-styling-contract.test.js` has
  dedicated path-containment tests for `../` traversal, an absolute path, a
  backslash-separated path, a symlink escaping the theme directory, and an
  undeclared file never being copied.

### Media pipeline scope decisions (documented, not silently assumed)

Neither the S2 brief nor DEC-097 fixes exact derivative widths, output
formats/quality, or a per-publication media byte/count ceiling for _author_
media (DEC-097's own numeric bounds are stated for the closed
`gala-theme-binary-assets-v2` _theme passive-asset_ profile). This renderer
therefore documents its own choices in `src/core/internal/media/limits.js`
rather than inventing undocumented magic numbers:

- decode/resource ceilings reuse DEC-097's theme binary-asset numbers
  (dimension, pixel-count, decoded-buffer, source-byte caps), since the
  decode-bomb risk they defend against is identical regardless of asset class;
- responsive derivative widths (`320/640/960/1280/1920`), JPEG derivative
  quality (`82`), and the per-publication image/font count and aggregate byte
  ceilings are this renderer's own conservative choices;
- WebP and AVIF get bounded container/dimension validation but no full
  VP8/VP8L/AV1 entropy decode or derivative generation — hand-authoring an
  independently verifiable decoder for either format was judged out of
  proportion to this task, and is flagged as a follow-up rather than attempted
  partially.

S2-T08 adds every remaining "Required generated output" from brief S2 section 3
on top of S2-T06's page kinds:

- **Feeds** (`src/core/internal/feeds.js`): deterministic Atom 1.0
  (`/feed/atom.xml`) and RSS 2.0 (`/feed/rss.xml`) documents over the exact
  reverse-chronological `status: "published"`, `kind: "article"` selection
  `internal/page-kinds.js`'s `index` page kind paginates (the shared
  `selectPublishedArticles` export), every item URL absolute against
  `buildInput.baseUrl`, bounded to the most recent 50 entries (documented scoped
  decision — neither the brief nor DEC-097 fixes a feed item count).
- **Sitemap** (`src/core/internal/sitemap.js`): `/sitemap.xml` over every page
  `internal/page-kinds.js` generated that this renderer did not itself mark
  `noindex` (unlisted content), deterministically sorted by each entry's own
  absolute URL, with `<lastmod>` sourced from each page's own authored
  `publishedAt`/`updatedAt` — never build time.
- **Static search index** (`src/core/internal/search-index.js`):
  `/search-index.json`, a deterministic JSON document indexing every published
  `article`/`page` record's title, description, a bounded plain-text excerpt,
  tags and timestamps. Its shape is a documented scoped decision (neither the
  brief nor DEC-097 fixes one). **No runtime search JavaScript accompanies it**
  — the Light/Dark/System appearance controller (S2-T07) remains the only
  browser bootstrap this renderer ever emits in all of S2 (acceptance test C).
- **SEO/Open-Graph/Twitter/localization metadata**: every generated page's
  `<head>` now carries a viewport meta, an optional description, an optional
  `robots` directive (`noindex, follow` for `status: "unlisted"` content and for
  the generated `404.html`), a canonical link, `og:*`/ `twitter:*` meta tags
  (image resolved to an absolute content-addressed media derivative URL via
  `internal/seo.js`, never the raw source path) and the Atom/RSS feed-discovery
  `<link>`s. **hreflang** is a documented scope decision, not a silent omission:
  `build-input:2.0.0` has no translation/locale-variant linkage between distinct
  `content[]` records (see `internal/seo.js`'s module documentation), so no
  `<link rel="alternate" hreflang="...">` is ever emitted in S2.
- **`404.html`**: the S2-T06 `error` page kind's pure `renderErrorPageBody`, now
  actually wired into `renderPublication` at DEC-097's exact `errorDocumentKey`
  (`internal/route.js#errorDocumentPath`) — `404.html` at the root, or
  `<basePath>/404.html` otherwise.
- **Redirect documents**: unchanged from S2-T03
  (`internal/route.js#renderRedirectDocument`) — every authored redirect was
  already an ordinary generated artifact with manifest status fixed at `200`;
  this task's own scope note is documenting that fact here, not re-implementing
  it.
- **Print CSS hookup** (`src/core/internal/print-stylesheet.js`): every page's
  `<head>` carries a `<link rel="stylesheet" media="print">` at the documented
  conventional path `<basePath>/assets/theme/print.css`. A selected theme's own
  compiled `print.css` bytes land there through a later theme-integration layer,
  outside this renderer's own `build-input:2.0.0` contract —
  `appearanceNormalized` carries only the theme's package identity, never a
  stylesheet path.

Every route this task adds carries the schema's exact `routeClass`/ `mediaType`
pair (`error`, `feed` ×2, `sitemap`, `asset`), classified in `src/core/index.js`
by the route's own fixed output path.

## Prerequisites

- Node.js 24.18.0
- npm 11.16.0

Both are enforced by `package.json` `engines`/`devEngines`; `.nvmrc` and
`.node-version` carry the same pin.

## Commands

```sh
npm install
npm run verify
```

`npm run verify` runs, in order: Prettier format check, ESLint,
`tsc --checkJs --noEmit`, the dependency-cruiser
architecture/module-tree-absence gate, `jscpd` duplication scan, the
`contracts/*.jcs` canonical-form check, `node --test`, the license inventory
check, and `cyclonedx-npm` SBOM generation plus presence check.

Individual gates:

```sh
npm run format          # apply Prettier
npm run format:check    # CI check
npm run lint            # ESLint flat config
npm run typecheck       # tsc --checkJs --noEmit against types/index.d.ts
npm run architecture    # dependency-cruiser: no src/modules/, no circular deps
npm run duplication     # jscpd, 3% / 50 tokens
npm run contracts:generate  # (re)write contracts/*.jcs placeholders
npm run contracts:check     # fail if committed contracts drifted
npm test                # node --test
npm run licenses:generate   # (re)write THIRD_PARTY_LICENSES.json
npm run licenses:check      # fail if it drifted from package-lock.json
npm run sbom:generate       # cyclonedx-npm -> sbom.cdx.json
npm run sbom:check          # fail if sbom.cdx.json is missing
```

## Package layout

```text
src/core/                                # the only source root
contracts/render-policy.jcs              # normalized-body policy identity (S2-T04, real content)
contracts/theme-styling-contract.jcs     # published styling catalog (S2-T12, real and closed)
```

No `src/modules/` tree, module import edge, registration stub, module
configuration, module output or module runtime is ever admitted beside
`src/core/`. `test/module-tree-absence.test.js` and `.dependency-cruiser.cjs`'s
`only-src-core-is-a-source-root` rule both enforce this; `interactions`,
`whitelabel`, `newsletter` and `prism` have no module directory, package,
configuration schema, stub, output, runtime code, network target or
compatibility promise in this MVP (DEC-097 section 2).

## Consuming `@rathnasgala2/schemas`

This repository consumes `@rathnasgala2/schemas@2.11.0` from the public npm
registry, declared as `"@rathnasgala2/schemas": "2.11.0"` (exact pin, no range)
so `package-lock.json` records the resolved version and integrity hash. The
LOCAL-1/LOCAL-39 local-tarball convention
(`file:../../local-packages/rathnasgala2-schemas-*.tgz`) is retired for this
package now that it publishes to the registry. The 2.8.0->2.11.0 convergence
changes none of the four roots this renderer validates, for the same reason the
2.7.0-2.8.0 delta below did not. Only the `"."` export (`validateGalaDocument`,
`GALA_SCHEMA_IDS`) is consumed; the 2.6.0 `./runtime-origins` narrow export and
every other addition through 2.6.1 (new OpenAPI operations, App route/catalog
copy, the `PrincipalSummary`/`AuthenticatorSummary`/keyset field additions) are
App/API-surface changes this renderer does not read. The `"."` export's 2.2.2
browser-safety refactor (Node builtins replaced with browser-safe equivalents
behind the same public API) is byte-identical in behaviour for a Node consumer
such as this one. The 2.7.0-2.8.0 delta (the `generationFence` sentinel,
`callClassBinding` and `providerBinding` in the four deployment roots, the
receipt-exchange discriminators, the `201` repository-binding response, the
review/deployment reads and the App route catalog moves) changes none of the
four roots this renderer validates -- `theme-contract`, `build-input`, `lock`
and `artifact-manifest` are byte-identical from 2.6.1 to 2.8.0.

## Governing documents

- [Slice brief S2: author-owned publication](../../orchestration/slice-briefs/S2-author-owned-publication.md),
  section 3 (`@rathnasgala2/template`)
- [DEC-094](../../orchestration/decisions/DEC-094-javascript-esm-public-packages.md):
  JavaScript ESM for public packages
- [WORKSPACE.md](../../orchestration/WORKSPACE.md), sections 4-8 and 13
