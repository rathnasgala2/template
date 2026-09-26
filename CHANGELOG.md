# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security

- **TPL-C2**: theme-declared passive assets (`theme.json.assets[]`) are sniffed
  against a closed raster/font/SVG allowlist, budget-capped
  (`budgets.maximumFileBytes`/`maximumTotalBytes`/`maximumFiles`), and verified
  against each row's own declared `sha256`/`byteLength` before being copied into
  a published artifact; the manifest `mediaType` is derived from the sniff
  result, never the declaration. A passive SVG is admitted only after
  `internal/media/theme-svg-sanitizer.js` strips active content (`<script>`,
  event-handler attributes, external `<use href>`, `<foreignObject>`).
- **TPL-H1**: a consumed theme package's `theme.json` is schema-validated
  against `urn:gala:schema:theme-contract:2.0.0` and its digest chain is now
  load-bearing: `contractVersion`, `stylingContractDigest` and `templateRange`
  are checked against this template's own published contract and version, and
  every `assets[]` row's declared `sha256`/`byteLength` is checked against the
  bytes actually read, before any theme file is copied.
- **TPL-H4**: `frame-ancestors 'none'`, which the CSP specification ignores when
  delivered via `<meta http-equiv>`, is split out of the `<meta>`-safe baseline
  into a header-only directive set
  (`contentSecurityPolicyHeaderOnlyDirectives()`), surfaced as a hosting
  requirement rather than emitted where it has no effect.
- **TPL-C1**: the server-rendered `<html>` element now carries
  `data-gala-resolved-color-mode="light"` as the default, so a themed
  publication is fully styled before and without the appearance bootstrap script
  running.

### Fixed

- **TPL-H2**: removed `theme-assets.js`'s own `cssLayers`-projection check
  (`assertCssLayersProjection`/`isOrderedSubsequence`) — its rejection branch
  was unreachable, since `urn:gala:schema:theme-contract:2.0.0`'s `oneOf`
  already closes the `stylesheets`/`cssLayers` pairing to the two admitted
  combinations before this module ever runs. Schema validation
  (`assertThemeContractIntegrity`, TPL-H1) is now the single enforcement point;
  the existing reordered-`cssLayers` rejection test now asserts the
  schema-validation reason code directly.
- **TPL-M4**: added `test/readme-verify-description.test.js`, which parses
  `package.json`'s `verify` script and README.md's `npm run verify` descriptive
  paragraph and asserts every verify-chain gate is named there, in the same
  order, so the two cannot drift apart silently again.
- **TPL-L2**: `.github/workflows/release.yaml`'s version-already-published check
  now only exits 0 (skips) for a `workflow_dispatch` re-run; a `push` run that
  reaches a version already on the registry fails the job instead, so a real
  content change merged with a forgotten version bump reports red rather than
  reporting green while shipping nothing.
- **TPL-M1**: theme stylesheet `<link>` elements carry `integrity="sha256-…"`
  and `crossorigin="anonymous"`, derived from the same bytes the manifest digest
  is computed from, so a mutated published stylesheet is rejected by the
  browser, not only detectable by a later manifest re-verification.
- **TPL-M2**: passive-asset partitioning keys on the theme's own validated
  `stylesheets` list rather than an exact `mediaType === 'text/css'` string
  comparison, so a stylesheet declared with the manifest's own
  `text/css; charset=utf-8` spelling in `assets[]` is not classified as a
  passive asset and copied a second time.
- **TPL-M3**: `renderPrimaryNavigation`'s documentation matches its behaviour:
  it always renders a labelled `<nav>` landmark, including when there are no
  authored items.
- **TPL-H5**: `package.json` `engines` is a supported range
  (`>=24.0.0`/`>=11.0.0`) rather than an exact pin, so installing this package
  under a different Node/npm patch version or `engine-strict=true` no longer
  fails; `devEngines` keeps the exact toolchain pin for this repository's own
  development.

### Added

- **Contract 2.1.0**: publishes a closed five-member pseudo-class catalog
  (`:focus-visible`, `:hover`, `:visited`, `:active`, `:disabled`) so a theme
  can style interaction states for the tokens that require them (`color-focus`,
  `color-link-visited`) — **TPL-H2**.
- **TPL-H3/TPL-M7**: a template-owned `gala-base` layer
  (`assets/gala-base-v1.css`) is emitted before any theme stylesheet on every
  page, carrying a normalization reset, the skip-link
  visually-hidden-until-focused pattern, and a real, paintable `:focus-visible`
  ring (`outline-style: solid`, not just colour/width). Cascade-layer precedence
  is declared explicitly by `gala-base`'s own first line
  (`@layer gala-base, gala-tokens, gala-components, gala-utilities, gala-print;`,
  from the exported, frozen `ORDERED_LAYERS`) rather than implied by `<link>`
  emission order.
- **TPL-H6**: the absence of theme iconography is documented as a scoped
  2.0.0/2.1.0 decision in the README's S2-T12 section and in
  `styling-contract.js`'s module documentation, alongside the mechanism (passive
  SVG assets, `::before`/`::after`, package-relative `url()`) that already
  supports it.
- `computeRenderPolicyIdentity` is exported from the package's public entry
  point (`src/core/index.js`), so a consumer can compute/verify the current
  render-policy identity without reaching into `src/core/internal/`.
- **TPL-M6**: a theme-authoring path — `docs/theme-authoring.md` documents how a
  theme is a delta over `gala-base`, the closed token/pseudo-class catalogs,
  passive-asset/SVG admission, the `theme.json` digest chain and
  `templateRange`, and the consume-time/release-time verify gates — plus
  `scripts/scaffold-theme.mjs`, which writes a minimal `theme.json`/
  `tokens.css`/`components.css`/`print.css` skeleton with correct digests that
  already passes schema validation and `loadThemeAssets`.

Recommended release: **2.1.0** (minor) — the pseudo-class catalog and
`gala-base` layer are additive contract surface; every other change in this
round is a bug fix or a hardening change with no removed public surface.

### Changed

- **Contract re-pin: `@rathnasgala2/schemas` moved from the LOCAL-1 local
  tarball to the published registry version, exact pin `2.11.0`** (2026-09-22
  contract re-pin packet). CI was failing with `ENOENT` on
  `local-packages/rathnasgala2-schemas-2.8.0.tgz`, a path that only ever existed
  on the owner's laptop; the package is now public on `registry.npmjs.org`, so
  `package.json` declares `"@rathnasgala2/schemas": "2.11.0"` and
  `package-lock.json` resolves it from the registry with a verified sha512
  integrity hash. `test/schema-consumption.test.js` and
  `CLAUDE.md`/`README.md`'s hardcoded `2.8.0`/tarball-path literals were updated
  in the same commit. Added `npm run schema-pin:check`
  (`scripts/check-no-local-schema-pin.mjs`), wired into `verify`, so a
  `file:.../local-packages/...` specifier can never reappear silently. The four
  roots this renderer validates (`theme-contract`, `build-input`, `lock`,
  `artifact-manifest`) and the `"."` export are unchanged between 2.8.0 and
  2.11.0, for the same reason the 2.7.0-2.8.0 delta below did not touch them.

- THEMES-2.8.0 (2026-09-18): `@rathnasgala2/schemas` pin moved from the packed
  2.6.1 tarball to `rathnasgala2-schemas-2.8.0.tgz` (sha256
  `6352293855cdcff9054d43ced876740644f6b45bc813eda3990b646ec9bef563`, LOCAL-1);
  lockfile integrity, `THIRD_PARTY_LICENSES.json` and `sbom.cdx.json`
  regenerated. The four roots this renderer validates (`theme-contract`,
  `build-input`, `lock`, `artifact-manifest`), the `"."` export and every
  published example/fixture they read are byte-identical between 2.6.1 and
  2.8.0; the 2.7.0-2.8.0 delta lives in the four deployment roots
  (`adapter-capability`, `deployment-intent`, `deployment-observation`,
  `deployment-receipt`: the `generationFence` sentinel and
  `EXPECTED_GENERATION_FENCE_INVALID`, `callClassBinding`, `providerBinding`),
  the OpenAPI bundle and the App catalogs, none of which this repository
  consumes. No renderer source logic changed.

### Fixed

- S2-T12 independent-review finding B1 (security): `internal/theme-assets.js`
  now validates every `theme.json`-declared `stylesheets`/`assets` path before
  opening it — `assertSafeThemeRelativePath` rejects an absolute path, a
  backslash, a non-NFC path, and an empty/`.`/`..` segment;
  `assertContainedThemePath` walks every path component under `themeDirectory`
  with `lstat`, rejecting a symlink at any component, and verifies the fully
  resolved path stays inside `themeDirectory`. A file physically present in the
  theme directory but never declared in `theme.json` is never enumerated and so
  can never be copied. New tests for `../` traversal, an absolute path, a
  backslash-separated path, a symlink escaping the theme directory, and an
  undeclared file never being copied.
- S2-T12 independent-review finding B2 (basePath): every asset class this
  renderer writes — S2-T05 media derivatives, the S2-T07 appearance bootstrap
  script, and S2-T12's own theme CSS/passive assets — now has its physical
  output path and its `manifestAsset.path` `basePath`-joined through
  `internal/route.js`'s `projectFixedAssetPath`, the same join
  `internal/route.js` already used for the generated `404.html`/feeds/
  sitemap/search-index paths. Before this fix only the _href_ was joined; the
  physical file and manifest path stayed at their bare, unprefixed `assets/...`
  location, which 404s under the local-directory adapter (it serves a manifest
  `path` verbatim) for any non-root `basePath` publication. `src/core/index.js`
  computes `joinedMediaAssets`/ `joinedAppearanceScriptPath` for this;
  `internal/theme-assets.js` derives both its `<link href>` and its
  file/manifest path from one shared joined value so they cannot drift apart.
  New non-root, multi-segment `basePath` (`/blog/2024`) test asserting the
  physical file for one asset of each class (theme CSS, media derivative,
  appearance script) actually exists at its joined manifest path.

### Added

- S2-T12 real, closed `contracts/theme-styling-contract.jcs`
  (`templateStylingContract`, DEC-097 section 4), generated deterministically by
  `scripts/generate-contracts.mjs` from the new
  `src/core/internal/appearance/styling-contract.js` — one reviewed source
  module enumerating every hook this renderer actually renders: 28 type-selector
  hooks (landmarks, headings, prose, code, controls), 15 class-selector hooks
  (the base Prism `.token` class plus one `.language-<grammar>` hook per
  admitted highlight grammar), 2 id-selector hooks (`#main-content`, the
  appearance `<select>`), and 19 attribute-value hooks (one per `data-gala-slot`
  value, one per the new `data-gala-page-kind` value) — exactly 64 total,
  DEC-097's own cap. `assertTemplateStylingContractShape` is this repository's
  structural self-validator (no `template-styling-contract` schema ID is
  registered in `@rathnasgala2/schemas@2.0.0` for `validateGalaDocument` to
  check this object against directly). New `data-gala-page-kind` semantic
  attribute on every generated page's `<body>` (`internal/page-kinds.js`'s
  `PAGE_KIND_ATTRIBUTE`/`PAGE_KIND_VALUES`), and a new exported `SLOT_NAMES` in
  `internal/skeleton.js`.
- S2-T12 theme asset integration: `src/core/internal/theme-assets.js` copies a
  selected theme package's stylesheets (and any declared passive assets) into
  `assets/theme/` as ordinary `manifestAsset` rows and renders the ordered
  `<link>` markup in `cssLayers` order (only `print.css` carries
  `media="print"`), given a new optional `options.themeDirectory` on
  `renderPublication`; validates the theme's declared `stylesheets` list against
  the two admitted shapes (with/without `utilities.css`) and that `cssLayers`
  byte-equals the corresponding layer projection, deferring the theme's own
  CSS-content admission grammar to the shared S2-T11 conformance runner. Falls
  back to the pre-existing fixed `assets/theme/print.css` link when no
  `options.themeDirectory` is supplied. Removed
  `src/core/internal/print-stylesheet.js` (superseded by `theme-assets.js`'s
  `defaultThemeStylesheetLinksHtml`, same fixed convention). New minimal in-repo
  fixture theme packages, `test/fixtures/theme-fixture-full/` (with
  `utilities.css` and one passive asset) and
  `test/fixtures/theme-fixture-minimal/` (without), shaped like the S2-T13
  package file set for this renderer's own tests only.
- S2-T12 basePath fix (LOCAL-7 follow-up): the appearance bootstrap script's
  `<script src>` (`internal/appearance/contract.js`'s new
  `appearanceBootstrapScriptHref(basePath)`) and the social-image
  `og:image`/`twitter:image` URL (`internal/seo.js`'s `resolveSocialImageUrl`,
  now taking `basePath`) are both `basePath`-joined through
  `internal/route.js`'s shared `joinBasePathAndRoute`, matching the pre-existing
  print-stylesheet convention. New drift-gate and basePath-fixture tests in
  `test/theme-styling-contract.test.js`, including a dedicated non-root,
  multi-segment `basePath` (`/blog/2024`) case asserting every emitted asset
  reference (media, appearance script, theme CSS, print CSS) is consistently
  joined.
- S2-T08 feeds, sitemap, static search index, SEO/localization metadata,
  `404.html` and print CSS hookup, built on top of S2-T06's page kinds:
  - `src/core/internal/feeds.js`: deterministic Atom 1.0 (`/feed/atom.xml`) and
    RSS 2.0 (`/feed/rss.xml`) documents over the exact same
    reverse-chronological `status: "published"`, `kind: "article"` selection the
    `index` page kind paginates (extracted to the new exported
    `selectPublishedArticles` in `internal/page-kinds.js` so both stay in sync),
    every URL absolute against `buildInput.baseUrl`, bounded to the most recent
    50 items (a documented scoped decision — neither the brief nor DEC-097 fixes
    a feed item count). The Atom feed's own `rel="self"` link is echoed inside
    the RSS channel too, as an `atom:link rel="self"` element (RSS 2.0's own
    de-facto self-discovery convention), per independent-review request.
  - `src/core/internal/sitemap.js`: `/sitemap.xml` (Sitemaps 0.9) over every
    generated page this renderer did not itself mark `noindex`, sorted by each
    entry's own absolute URL (UTF-8 byte order), with `<lastmod>` sourced from
    each page's own authored `publishedAt`/`updatedAt` (never build time) and
    omitted for a page kind with no natural timestamp.
  - `src/core/internal/search-index.js`: `/search-index.json`, a deterministic
    JSON document indexing every published `article`/`page` record (title,
    plain-text excerpt, tags, timestamps, absolute route); its shape is a
    documented scoped decision (neither the brief nor DEC-097 fixes one). No
    runtime search JavaScript accompanies it — the Light/Dark/System appearance
    controller remains the only browser bootstrap in all of S2 (acceptance test
    C).
  - `src/core/internal/seo.js`: resolves each page's own `og:image`/
    `twitter:image` to an absolute content-addressed derivative URL using the
    S2-T05 media pipeline's own finished `assets` list (never the raw source
    path), and the `summary`/`summary_large_image` Twitter Card selection.
  - `src/core/internal/print-stylesheet.js`: the `basePath`-joined
    `<link rel="stylesheet" media="print">` hookup every page's `<head>` now
    carries, at the documented conventional path
    `<basePath>/assets/theme/print.css` — a theme's own compiled `print.css`
    bytes are copied there by a later theme-integration layer, out of this
    renderer's own `build-input:2.0.0` contract (`appearanceNormalized` has no
    stylesheet-path field).
  - `src/core/internal/route.js`: new `errorDocumentPath` (DEC-097's exact
    `404.html`/`<basePath>/404.html` key) and `projectFixedAssetPath` (the
    `explicit-file` projection every fixed-name generated asset — 404, feeds,
    sitemap, search index — uses, independent of the selected
    `routeNormalizationProfile`).
  - `internal/eleventy-render.js`'s shared layout now also emits a viewport
    meta, an optional description/`robots` meta, an optional canonical link,
    `og:*`/`twitter:*` meta tags, the Atom/RSS feed-discovery `<link>`s and the
    print stylesheet link — every value from a per-page Nunjucks data field
    `internal/page-kinds.js`'s `GeneratedPage` now carries (`description`,
    `ogType`, `socialImageRef`, `robotsContent`, `lastModified`), relying on
    Nunjucks' own default `autoescape: true` for HTML-entity escaping (verified:
    no override exists anywhere in this repository or in `@11ty/eleventy`).
  - The generated `404.html` (`internal/page-kinds.js`'s existing
    `renderErrorPageBody`, now actually wired into `renderPublication`),
    carrying the shared header/nav/footer chrome, `robots: noindex, follow` and
    no canonical link.
  - hreflang (documented scope decision, `internal/seo.js`'s module
    documentation): `build-input:2.0.0` has no translation/locale-variant
    linkage between distinct `content[]` records, so no
    `<link rel="alternate" hreflang="...">` is ever emitted in S2 — there is
    nothing declared to alternate to.
  - Redirect documents: unchanged from S2-T03
    (`internal/route.js#renderRedirectDocument`); every authored redirect was
    already an ordinary generated artifact with its manifest status fixed at
    `200`. This task packet's own scope only documents that fact here — see
    `test/seo-feeds-sitemap.test.js`'s module documentation.
  - Every manifest route this task adds carries the schema's exact
    `routeClass`/`mediaType` pair: `error`/`text/html; charset=utf-8` for
    `404.html`; `feed`/`application/atom+xml; charset=utf-8` and
    `feed`/`application/rss+xml; charset=utf-8` for the two feeds;
    `sitemap`/`application/xml; charset=utf-8` for the sitemap;
    `asset`/`application/json; charset=utf-8` for the search index.
  - New unit test `test/route-labels.test.js` (requested by the S2-T06
    reviewer): two labels whose ASCII-stripped prefixes collide (`"Alpha!"` and
    `"Alpha?"`) still produce distinct, stable `routeSegmentForLabel` segments.
  - New acceptance/determinism tests `test/seo-feeds-sitemap.test.js` and
    `test/helpers/xml-well-formed.js` (a dependency-free XML well-formedness
    checker for this repository's own generated feed/sitemap XML — no new pinned
    XML-parser dependency; `parse5` remains an HTML5 parser, not a meaningful
    well-formedness check for XML).
- S2-T07 Light/Dark/System appearance controller
  (`src/core/internal/appearance/`): `contract.js` is the one module every fixed
  `data-` attribute name (`data-gala-publication-root` presence,
  `data-gala-resolved-color-mode` exact-value, the template-internal
  `data-gala-color-mode-selection` bookkeeping attribute), mode value
  (`light`/`dark`/`system`), the versioned local storage key
  (`gala:appearance:color-mode:v1`), the control's `id` and the bootstrap
  script's output path/media type are exported from — the contract S2-T12's
  published theme styling catalog targets. `controller-markup.js` renders a
  native `<select>` bound to a visible `<label>`, message-catalog labels, into
  the header's `header-actions` slot (`internal/skeleton.js`'s
  `renderSlot`/`renderHeader` now accept the slot's inner markup instead of
  always rendering it empty). `bootstrap-script.js` is the one deterministic
  pre-paint bootstrap script this renderer ever emits: a synchronous phase
  (resolves the stored selection, or `system` on any missing/invalid/ unreadable
  value — a `localStorage` failure is always caught, leaving the session usable
  — against `prefers-color-scheme`, falling back to `light` when unavailable,
  and sets both root attributes before `<body>` is even parsed) plus a
  `DOMContentLoaded`-deferred phase (wires the control's `change` event and a
  live `prefers-color-scheme` subscription that only updates the resolved
  attribute while the selection is still exactly `system`, so an explicit choice
  is never overridden). It touches no network, cookie, account/tracking
  identifier or storage key other than its own, and never mutates inline style
  (no hide-until-ready trick). `src/core/index.js` writes the script into the
  candidate output directory and enters it into the manifest as an ordinary
  `manifestAsset` row (`{path, byteLength, sha256}` plus
  `application/javascript; charset=utf-8`), after the routes listing so it is
  never mistaken for an HTML route — this changed `manifest.assets.length` by
  exactly one on every build, so `test/media-pipeline.test.js`'s exact-count
  assertions were updated to match. `src/core/internal/eleventy-render.js`'s
  skeleton layout now also carries the `data-gala-publication-root` attribute on
  `<html>`, a `<meta name="color-scheme" content="light dark">` tag and the one
  `<script src>` reference, all fixed literals, still byte-identical on every
  route; `test/page-kinds.test.js`'s `<html>` structural regex was widened to
  admit the new attribute. With JavaScript disabled the control still renders
  and is fully keyboard-operable; the resolved-mode attribute is simply never
  set, and `<meta name="color-scheme">` alone already carries
  `prefers-color-scheme` through to user-agent styling independent of any
  script. New pinned exact test-only dev dependency `jsdom@30.0.1`
  (`test/appearance-controller.test.js` executes the actual shipped bootstrap
  script bytes in a jsdom window rather than a hand-reimplemented mirror of its
  logic). The per-artifact CSP baseline is unchanged (the bootstrap is an
  external, same-origin file under the existing `script-src 'self'` baseline —
  no inline script, so no hash/nonce/ `unsafe-inline` is ever added).
- S2-T06 core semantic skeleton, page kinds and navigation renderer:
  `src/core/internal/skeleton.js` (skip link, header, primary/footer navigation,
  breadcrumbs, pagination controls, the nine versioned core semantic slots plus
  the collapsed `article-footer-ad` slot, and `renderPageBody`'s one shared
  landmark composition every page kind funnels through),
  `src/core/internal/page-kinds.js` (`profile`, `author`, `article`, `page`,
  `index`, `tag`, `series` and `archive` page-kind assembly, plus the pure
  `renderErrorPageBody` for a future `404.html` caller),
  `src/core/internal/messages.js` (the core chrome message catalog every
  user-visible skeleton/navigation string is looked up from), and
  `src/core/internal/text-direction.js` (deterministic `dir` resolution from a
  BCP-47 language tag; `build-input:2.0.0` carries no separate direction field).
  `internal/route-labels.js` derives a deterministic, collision-free route
  segment for an arbitrary tag/series label. The `skeleton.njk` layout in
  `internal/eleventy-render.js` now sets `dir` and no longer wraps content in
  its own `<main>` (every page kind supplies its own complete landmark
  structure). `renderPublication` renders every generated page kind, still
  through the same S2-T04 output-security pipeline and S2-T03 manifest assembly.
  New dev dependency `parse5@8.0.1`, used only by the new structural
  landmarks/heading-order test.
- S2-T05 media pipeline (`src/core/internal/media/`), run from
  `renderPublication` after the Eleventy route listing: bounded JPEG (via the
  pinned pure-JS `jpeg-js` 0.4.4 decoder/encoder, zero dependencies, no native
  addon or WebAssembly) and PNG (hand-written, Node built-in `zlib`) decode with
  decompression-bomb and dimension/pixel/byte ceilings reused from DEC-097's
  closed binary-asset decoder bounds; bounded WebP/AVIF container and
  declared-dimension validation (documented scope decision: no full entropy
  decode or derivative generation for either format); metadata stripping and
  EXIF-orientation application before every derivative is produced;
  deterministic content-addressed responsive derivatives at fixed widths
  `320/640/960/1280/1920` below the source width; unconditional SVG rejection as
  an image reference (`MEDIA_SVG_REJECTED`); a WOFF2-only, size-bounded font
  policy for `appearance.fontAssets`; and a new `MediaPipelineError` (with a
  stable `reasonCode`) for every fail-closed rejection. New required
  `options.sourceDirectory` on `renderPublication`: the caller-mounted,
  read-only repository source tree `resolvedFile` references point into,
  verified byte-for-byte against `build-input`'s declared `sourceDigest` before
  decode. `src/core/index.js` now passes the pipeline's real `manifestAsset[]`
  rows into `buildArtifactManifest` (previously always `[]`);
  `src/core/manifest.js` itself is unchanged. Unit tests for every codec/probe
  (`test/media-codecs.test.js`) and acceptance tests through `renderPublication`
  (`test/media-pipeline.test.js`), including a two-clean-build byte-equality
  test on generated derivatives, generated from small deterministic in-code
  fixtures (`test/helpers/media-fixtures.js`) since the `@rathnasgala2/schemas`
  S2 fixture corpus carries only placeholder `resolvedFile` digests, never real
  image/font bytes.
- S2-T04 output-security pipeline (`src/core/internal/content-security.js`,
  `src/core/internal/render-policy-content.js`): `contracts/render-policy.jcs`
  is now the real, closed sanitizer/parser catalog (no self-digest) instead of
  S2-T02's scaffold placeholder, generated deterministically by
  `scripts/generate-contracts.mjs` from one shared module also used to build the
  runtime markdown-it/sanitize-html/highlighter configuration, so the published
  contract and the enforced policy cannot drift apart. Every
  `renderableBody.renderPolicy` in a `build-input:2.0.0` instance (publication
  profile, footer card, every content record) is verified to byte-equal
  `SHA256(UTF8("GALA-RENDER-POLICY-V2\0") || <contract file bytes>)` before any
  directory is created or Eleventy ever runs, and a non-empty
  `modules`/`placements` value is independently rejected as a
  belt-and-suspenders check; either failure raises the new
  `RenderPolicyViolationError`, exported from `src/core/index.js`.
- **Division of labour** (DEC-097 section 5; `build-input.schema.json` fixes
  `renderableBody.bodyMediaType` as `const: "text/html"`): a
  `renderableBody.body` inside a validated `build-input:2.0.0` instance is
  already render-policy-conformant HTML, produced once upstream of this renderer
  — never re-parsed as Markdown here.
  `normalizeAuthoredMarkdown(markdownSource) -> { html, bodyDigest }`, exported
  from `src/core/index.js`, is the **public upstream** normalization step a
  `build-input:2.0.0` producer (`publish-kernel`/`publish-action`) runs once per
  authored Markdown source: `markdown-it` 14.3.1 configured exactly
  `{ html: false, linkify: false, typographer: false }`, with a replaced
  `validateLink` admitting only `https`, `http`, `mailto` or a schemeless
  relative path/fragment (rejecting `javascript:`, `data:`, `blob:`, `vbscript:`
  and protocol-relative URLs, including WHATWG-style tab/newline scheme
  obfuscation) and a markdown-it core rule assigning deterministic,
  collision-free heading `id`s. Fenced code passes through an owned highlighter
  over `@11ty/eleventy-plugin-syntaxhighlight` 5.0.2's Prism-backed markdown-it
  highlight function, called only for a closed grammar catalog (`bash`, `css`,
  `diff`, `java`, `javascript`, `json`, `jsx`, `markdown`, `markup`, `python`,
  `sql`, `tsx`, `typescript`, `yaml`); every other fence language falls back to
  markdown-it's own escaped-and-unhighlighted rendering, never reaching the
  upstream plugin's unescaped raw-passthrough branches. The resulting fragment
  is sanitized with `sanitize-html` 2.17.7 against a closed
  tag/attribute/class/scheme allowlist (no `style`, no `on*`, no `srcdoc`, no
  `id` outside generated heading IDs; `nonTextTags` extended so a stripped
  `<script>`/`<style>`/`<iframe>`/`<object>`/`<embed>`/`<svg>`/`<math>`/
  `<template>`'s own text content can never leak; `img[src]` restricted to
  repository-relative paths, `a[href]` to `https`/`http`/`mailto` with
  `rel="noopener noreferrer"` added to every absolute link and no `target` ever
  emitted), followed by a fail-closed residual-active-content scan.
  `renderPublication` itself never calls `normalizeAuthoredMarkdown`; it calls
  the new `assertPolicyConformantHtml(body, bodyDigest, location)` instead,
  which verifies `bodyDigest` byte-equals a fresh `computeBodyDigest(body)`
  (also newly exported) and that re-sanitizing `body` reproduces it
  byte-for-byte (an idempotence check — genuinely conformant output cannot
  change under its own sanitizer allowlist), then inserts the verified `body`
  verbatim.
- Every rendered page now carries the exact per-artifact CSP baseline
  (`default-src 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; media-src 'self'; manifest-src 'self'; worker-src 'none'`)
  as a `<meta http-equiv="Content-Security-Policy">` tag in
  `src/core/internal/eleventy-render.js`'s skeleton layout, byte-identical on
  every route.
- New tests: `test/content-security.test.js` covers both public surfaces —
  `normalizeAuthoredMarkdown`'s markdown-it option/adversarial corpus (script
  tags, event handlers, `javascript:`/`data:`/protocol-relative URLs including
  tab-obfuscated schemes, SVG-in-HTML, nested/unbalanced raw markup, a Unicode
  homoglyph URL, the closed highlighter grammar catalog, deterministic heading
  IDs, cross-origin link `rel` handling, `img[src]` scheme restriction) and
  `renderPublication`'s verify-then-insert path (`renderPolicyIdentity`
  computation and mismatch rejection, a `bodyDigest` mismatch negative, a
  non-conformant-HTML-with-matching-digest negative — real `<script>` markup
  that fails the sanitizer-idempotence check even though its digest is
  internally consistent — a realistic multi-element-HTML case proving an
  already-conformant body is inserted as live markup rather than re-escaped, the
  CSP baseline, and a golden byte-exact output test on the package's canonical
  `build-input:2.0.0` fixture, whose plain-text body is now inserted as the bare
  text node it already is, with no markdown-it `<p>` wrapping applied by this
  renderer). `test/contracts-presence.test.js`'s render-policy test now asserts
  the real closed catalog instead of scaffold identification fields.
  `test/helpers/schema-fixtures.js`'s `applyCurrentRenderPolicy` now also
  corrects each fixture's `bodyDigest` to match its own placeholder `body` text,
  so existing S2-T03 fixture-driven tests (which use the upstream schema
  package's placeholder `renderPolicy`/`bodyDigest` digests) continue to
  exercise real rendering under the now-enforced identity and digest checks.
- S2-T03 renderer adapter: `renderPublication(buildInput, options)`, the
  package's only documented entry point, added under `src/core/`. It validates a
  candidate `build-input:2.0.0` document with `@rathnasgala2/schemas`'
  `validateGalaDocument` and fails closed (`BuildInputValidationError`) before
  anything is written; renders the publication profile and every selected
  content record, plus every authored static redirect document, through a fully
  confined, single-pass programmatic Eleventy 3.1.6 build
  (`src/core/internal/eleventy-render.js`, the only module permitted to import
  `@11ty/eleventy`); and assembles, digests (RFC 8785 JCS plus the DEC-097
  section 8 `GALA-*-V2` domain separators) and schema-validates a closed
  `artifact-manifest:2.0.0` instance before returning it.
- Eleventy confinement: `configPath: false` disables `.eleventy.js` discovery
  entirely (proven by `test/eleventy-confinement.test.js` running the confined
  call in a subprocess whose `cwd` holds a decoy config file that throws if
  loaded); every page is supplied as an in-memory virtual template with
  `templateEngineOverride: false` so author body content is never interpreted as
  Nunjucks/Liquid syntax; only one full `.write()` build pass runs, never
  `.watch()` or an incremental build; and the adapter touches no filesystem path
  outside the caller-declared output/work directories.
- `src/core/manifest.js` documents and implements the manifest fields this
  renderer can and cannot derive from `build-input` alone: routes, assets,
  redirects, `includedSources` (via `src/core/internal/source-inventory.js`) and
  every renderer-computed digest are derived from `build-input`; `builder`,
  `sourceIdentity.repository`, `workflowIdentity`, `buildToolVersions` and
  `excludedInputs` are accepted from an explicit, validated `options.provenance`
  bundle supplied by the caller (`publish-kernel`/`publish-action`, S2-T15
  through S2-T20), never fabricated.
- Acceptance tests using the `@rathnasgala2/schemas` S2 fixture corpus
  (`test/renderer-fail-closed.test.js`, `test/renderer-manifest.test.js`) and a
  two-clean-build byte-equality plus digest-equality test on the package's
  canonical `build-input:2.0.0` fixture (`test/renderer-determinism.test.js`);
  the full hostile-environment determinism harness is S2-T09's deliverable.
- Fixed the carried-over `sbom:generate`/`sbom:check` non-determinism: the new
  `scripts/sbom-normalize.mjs` and `scripts/apply-sbom-normalization.mjs`
  replace `cyclonedx-npm`'s fresh random `serialNumber` and wall-clock
  `metadata.timestamp` with values derived only from the described package's own
  identity, so `sbom.cdx.json` no longer changes on every generation of an
  unchanged dependency graph; `scripts/check-sbom-current.mjs` now regenerates
  and normalizes into a temporary file and byte-compares it against the
  committed file, an honest drift check rather than a bare presence check.
- S2-T02 repository scaffold: `@rathnasgala2/template@2.0.0` package metadata
  with exact pins (Node 24.18.0, npm 11.16.0, Eleventy 3.1.6, markdown-it
  14.3.1, sanitize-html 2.17.7, `@11ty/eleventy-plugin-syntaxhighlight` 5.0.2)
  and an npm lockfile v3.
- `src/core/` established as the only admitted source root, with an automated
  module-tree absence gate (`test/module-tree-absence.test.js` plus a
  dependency-cruiser `only-src-core-is-a-source-root` rule) enforcing that no
  `src/modules/` tree, module package or module runtime is ever added.
- `contracts/render-policy.jcs` and `contracts/theme-styling-contract.jcs`
  scaffold placeholders, emitted and drift-checked as compact RFC 8785 JCS by
  `scripts/generate-contracts.mjs`; their exact published content lands in
  S2-T04 and S2-T12 respectively.
- Quality gate tooling: Prettier, ESLint flat config with `eslint-plugin-jsdoc`,
  `tsc --checkJs --noEmit` against a hand-maintained `types/index.d.ts`,
  dependency-cruiser architecture/boundary checks, `jscpd` duplication scanning,
  the Node native test runner, a license-inventory script and a
  `cyclonedx-npm`-backed SBOM script, wired together as `npm run verify`.
- `@rathnasgala2/schemas@2.0.0` consumed from the LOCAL-1 packed tarball, with
  version and integrity pinned in `package-lock.json`.
- `CLAUDE.md`, README and this changelog, following `orchestration/WORKSPACE.md`
  sections 6 and 13.
