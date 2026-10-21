# `@rathnasgala2/template`

The deterministic Eleventy-backed static publication renderer for Galascribe's
portable author repository format. It is one of the three author-facing S2
artifacts, alongside one `@rathnasgala2/theme-*` package and
`@rathnasgala2/publish-action`.

This package is JavaScript ESM on Node 24, authored without TypeScript sources:
every export carries JSDoc types, checked by `tsc --checkJs --noEmit` against a
hand-maintained `.d.ts` surface.

## Status

This repository's scaffold (exact pins, `src/core/`-only layout, module-tree
absence gate, quality-gate tooling) plus its renderer adapter:
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

The media pipeline lives under `src/core/internal/media/`, run from
`renderPublication` after the Eleventy route listing so its output is never
mistaken for an HTML route:

- **Bounded decode.** JPEG (via the pinned pure-JS `jpeg-js` decoder, no native
  addon or WebAssembly) and PNG (hand-written, using Node's built-in `zlib` with
  a decompression-bomb-bounded inflate) are fully decoded to RGBA8; WebP, AVIF
  and GIF get bounded container/declared-dimension validation without a full
  entropy decode, and their original bytes pass through unmodified (a documented
  scope decision — see `webp-probe.js`/`avif-probe.js`/ `gif-probe.js`; an
  animated GIF keeps its animation). Every format shares one set of resource
  ceilings in `limits.js` (raster dimension, pixel count, decoded-buffer and
  source-byte caps reused from the theme package's own closed binary-asset
  decoder bounds, plus this renderer's own documented per-publication ceilings).
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
  signature, a fixed 4,194,304-byte font cap); a remote font reference cannot
  enter `build-input` in the first place (`resolvedFile` is always a
  repository-relative path), so "no remote font is ever retrieved" holds
  structurally.
- **Fail-closed errors.** Every rejection — oversize, decompression bomb, digest
  mismatch, SVG, unrecognized format, invalid font — is a `MediaPipelineError`
  with a stable `reasonCode`, thrown before anything is written.

`options.sourceDirectory` is the caller-mounted, read-only repository source
tree `build-input`'s `resolvedFile` references point into; every referenced
file's bytes are read from there and verified against `build-input`'s declared
`sourceDigest` before being decoded.

### Content images

Every `<img>` in a rendered body must name an image file `build-input`
inventories for that document in `content[].media[]` (an entry whose `mediaType`
is `image/png`, `image/jpeg`, `image/webp`, `image/avif` or `image/gif`). The
`src` is resolved by one rule (`src/core/internal/media/content-images.js`): it
is entity-decoded; a scheme, a protocol-relative `//`, a query or a fragment
never resolves; one leading `/` or `./` is dropped (paths are
repository-root-relative); the rest is percent-decoded and NFC-normalized; an
empty, `.` or `..` segment never resolves; the result must equal an inventoried
`path`. The publication profile and the footer card (checked only when enabled,
since only then is it rendered) have no inventory, so an image there never
resolves.

An image that resolves to nothing (a remote image included: the render policy
already strips its `src`) fails the build with `BuildInputValidationError`, one
`MEDIA_REFERENCE_UNRESOLVED` diagnostic per image (`instancePointer` names the
body, `reference` the `src`), before anything is written. An inventoried file
the media pipeline rejects fails with that `MediaPipelineError` reason code,
also before anything is written.

A resolved image runs through the media pipeline and renders as
`<img src srcset sizes="(max-width: 960px) 100vw, 960px" alt width height loading="lazy" decoding="async">`:
`srcset` names every output file in ascending width (PNG/JPEG: each fixed
derivative width below the source plus the re-encoded original; GIF, WebP and
AVIF: the original only), and `src` is the widest of them no wider than 960
pixels, or the original when none is. `alt` is the authored text. The feeds
carry the same `src` as an absolute URL, without `srcset`. Only pipeline output
is written: the source file is never copied, and identical bytes under two paths
are processed and written once. Images use the base layer's existing `img`
rules; no class is added. The front-matter `hero` renders as the article's cover
`<figure>` above the body (`role: "decorative"` renders `alt=""`).

### Editions

A document of `kind: "edition"` restates one article at another depth. Its front
matter's `edition` object names the article (`of`, the article's slug) and the
depth (`kind`: `QUICK_READ`, `STANDARD` or `DEEP_DIVE`), and `build-input`
carries it as an ordinary `content[]` record. Whether an edition is current is
decided before the build input exists, so an edition that arrives is rendered as
given. An edition is a content kind, not a module: the renderer runs no
generation and has no Prism runtime.

- **Routes.** `/<slug>/quick-read`, `/<slug>/standard` and `/<slug>/deep-dive`,
  where `<slug>` is `edition.of` (written as `…/index.html` like every route).
  The page's `data-gala-page-kind` is `article`, so the published page-kind
  hooks do not change. Reactions and comments stay on the article; an edition
  page carries none.
- **The article stays the reference.** `<link rel="canonical">` and `og:url`
  name the article, the robots directive is `noindex, follow`, and the
  structured data is a `WebPage` with a breadcrumb back to the article.
- **Never listed.** An edition is in no index, tag, series, archive or author
  listing, feed, `sitemap.xml`, `search-index.json`, `llms.txt` or
  `llms-full.txt`, and it does not move the footer's copyright year.
- **Selector.** The article and each of its editions carry one
  `<nav aria-label="Editions">` of links, in the `edition-selector` slot at the
  end of the article head: Original, Quick read, Standard, Deep dive in that
  order, only the kinds that exist, the page being read marked
  `aria-current="page"`. An `unlisted` edition is not listed, except on its own
  page. An edition page adds the line "Generated edition, reviewed by the
  author; the original is the reference". The links are plain anchors; nothing
  needs JavaScript. The strings come from the message catalog, and the markup
  reuses the base layer's `g-pills`, `g-pill` and `g-label` hooks, so the
  published theme styling contract does not change.
- **Cover.** An edition with no `hero` or social image of its own uses its
  article's.
- **Fails closed.** Before anything is written, `BuildInputValidationError`
  carries one diagnostic per edition that cannot be placed:
  `EDITION_ORIGINAL_UNRESOLVED` (`edition.of` names no article of the build),
  `EDITION_DUPLICATE` (two editions of one article at one depth) and
  `EDITION_ROUTE_CONFLICT` (the route is already another document's route or
  redirect).

The complete output-security pipeline (`src/core/internal/content-security.js`)
sits on top of that adapter. **Division of labour** (normalization replaces an
authored body path with a `renderableBody` carrying "the deterministic policy
output/digest"; `build-input.schema.json` fixes `renderableBody.bodyMediaType`
as `const: "text/html"`): a `renderableBody.body` inside a validated
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
  `renderableBody.renderPolicy` (publication profile, footer card, the policy
  pages, every content record) byte-equals
  `SHA256(UTF8("GALA-RENDER-POLICY-V2\0") || <contract file bytes>)`; every
  `bodyDigest` byte-equals a plain SHA-256 of its `body` bytes; and
  re-sanitizing `body` reproduces it byte-for-byte (an idempotence check —
  genuinely policy-conformant output cannot change under its own sanitizer). Any
  mismatch, or a non-empty `modules`/`placements` value, fails closed with
  `RenderPolicyViolationError` before anything is written. A verified body is
  then inserted into the page verbatim. The one Markdown the renderer renders
  itself is the shipped default policy text (see Policy pages): Markdown source
  from the schemas package, not a received body.

`contracts/render-policy.jcs` is the real, closed sanitizer/parser catalog
(name, version, CSP baseline, markdown-it options, sanitizer allowlist,
highlighter grammar/token-class catalog) both surfaces above read from,
generated deterministically by `scripts/generate-contracts.mjs` from
`src/core/internal/render-policy-content.js` — the single source of truth, so
the published contract and the enforced policy cannot drift apart. Every
rendered page also carries the meta-safe CSP baseline as a
`<meta http-equiv="Content-Security-Policy">` tag (byte-identical on every
route, since S2 materializes no module package/configuration/output/runtime).

**TPL-H4 fix — meta vs. header-only directives.** The CSP specification
explicitly ignores `frame-ancestors` (and `report-uri`/`sandbox`, neither used
here) when a policy is delivered via `<meta http-equiv>`; the `<meta>` tag above
therefore never includes `frame-ancestors`, and
`contentSecurityPolicyHeaderOnlyDirectives()` (`internal/content-security.js`)
returns the one directive that is not: `frame-ancestors 'none'`. Clickjacking
protection for a published artifact is a **hosting-layer requirement**: the
adapter/deployment serving this artifact must add
`Content-Security-Policy: frame-ancestors 'none'` (or an equivalent
`X-Frame-Options` header) as a real HTTP response header. This cannot yet be
carried in `artifact-manifest:2.0.0`'s own `declarativeHeaders` field, which
`@rathnasgala2/schemas` currently fixes to `const: []`; surfacing it there is a
schema-repo change, out of this repository's scope.

`img[src]` is restricted to repository-relative paths only in this pipeline;
full manifest-coverage verification of media references is the media pipeline's
job (immediately above). A handful of manifest fields (`builder`,
`sourceIdentity.repository`, `workflowIdentity`, `buildToolVersions`,
`excludedInputs`) describe facts `build-input` does not itself carry;
`renderPublication` accepts them as an explicit `options.provenance` bundle
rather than fabricating them — see `src/core/manifest.js`'s module
documentation. `contracts/theme-styling-contract.jcs` is the real, closed
`templateStylingContract` catalog (see the theme styling contract section
below).

The core semantic skeleton, page kinds and navigation renderer sit on top of the
output-security pipeline every generated page still passes through:

- **`src/core/internal/skeleton.js`** renders the one landmark contract every
  page kind shares, through its one `renderPageBody` composition: a skip link
  (the first focusable element, targeting `#main-content`), one `<header>` (home
  link with the validated publication name, plus the always-present
  `header-actions` slot), one primary `<nav>` from `navigationNormalized.items`,
  one `<main id="main-content">` (an optional breadcrumb `<nav>` before the
  page's own single `<h1>`), and one `<footer>` (publication name, footer
  navigation, the `footer-profile` slot, the remaining footer slots
  (`footer-auxiliary`, `account-intent`, `conversation`, `newsletter`), and the
  "Legal" navigation: Terms, Privacy and the "Made with Galascribe" referral
  link, which `appearance.attribution.showMadeWith: false` omits; Terms and
  Privacy always render). Core owns nine versioned semantic slots
  (`header-actions`, `article-preamble`, `article-end`, `footer-profile`,
  `footer-auxiliary`, `account-intent`, `conversation`, `newsletter`,
  `edition-selector`) plus the collapsed `article-footer-ad` slot: every slot is
  one `data-gala-slot="<name>"` attribute on an otherwise empty, non-landmark
  `<div>`, and the collapsed slot additionally carries `hidden`. This renderer
  has no module system, so every slot except `footer-profile` (which always
  wraps the publication's own footer card), `header-actions` (the appearance
  control, core content rather than a module) and `edition-selector` (see
  Editions) renders empty. `edition-selector` is rendered by the article page
  kind at the end of the article head, only where there is an edition to offer,
  not in the footer. This module also renders breadcrumbs and deterministic
  pagination controls (`rel="prev"`/`rel="next"`, an `aria-current="page"`
  status).
- **`src/core/internal/page-kinds.js`** builds every generated page kind from a
  validated `build-input:2.0.0`: `profile` (the optional publication profile),
  `author` (one page per `build-input.authors` entry, at `/authors/<id>`),
  `article`/`page` (one page per `content[]` record, at its own route; a
  `kind: "edition"` record renders beside its article, see Editions), `index` (a
  paginated reverse-chronological listing of every `status: "published"`,
  `kind: "article"` record — an `unlisted` record is reachable only by its own
  direct route, never through a generated listing), `tag`/`series` (one listing
  page per distinct authored value, plus a `/tags`/`/series` root page linking
  to each), and `archive` (one listing page per UTC calendar year, plus a
  `/archive` root page), and `policy` (the `/terms` and `/privacy` pages: the
  site's own text, then the Galascribe section; in the sitemap but not the
  search index, feeds or `llms` documents; a document or redirect on either
  route fails with `POLICY_ROUTE_CONFLICT`). The `error` page kind
  (`renderErrorPageBody`) is exported as a pure function for the `404.html`
  caller (see below), not wired into any generated route here. Listing page size
  (10), sort tie-break, and the tag/series/archive root pages are documented
  scoped decisions this renderer's own governing brief does not fix verbatim.
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
  `plainLabel`, not a route-safe `slug`): the ASCII-readable prefix alone when
  it is non-empty and unique (case-insensitive) among the site's labels of that
  kind, else the prefix plus a content-hash suffix, so two distinct Unicode
  labels can never collide on the same generated route. The choice is made once
  per build from the whole label set (`deriveTagSegments`,
  `deriveSeriesSegments`).

Chrome text is resolved once, in the publication's own `defaultLanguage`, for
every page (a scoped decision: navigation/footer text does not flip language
page to page); each page's own `<html lang>`/`dir` still reflects that
individual page's own content language.

The site script and appearance controller (`src/core/internal/appearance/`) are
the only browser script this renderer emits ("Module absence and CSP equality").
Every page is fully readable with JavaScript off; the script only enhances:

- **`contract.js`** is the one module every other appearance-related file
  imports every name/value from: the two fixed root attributes
  (`data-gala-publication-root` presence, `data-gala-resolved-color-mode`
  exact-value `"light"`/`"dark"`), the template-internal
  `data-gala-color-mode-selection` bookkeeping attribute, the three canonical
  mode values (`light`/`dark`/`system`), the versioned local storage key
  (`gala:appearance:color-mode:v1`), the toggle button's `id`, the script's
  fixed output path/media type and the `color-scheme` meta content.
- **`controller-markup.js`** renders one icon `<button>` (hidden until the
  script reveals it) in the header's `header-actions` slot. Its accessible name
  carries the current mode and the three localized labels travel as
  `data-label-*` attributes; which of the three mode icons shows is pure CSS off
  the root selection attribute.
- **`bootstrap-script.js`** is the exact deterministic script (every literal
  from `contract.js`). Phase 1 runs synchronously the instant this blocking,
  non-`defer`/non-`async`/non-`module` `<script src>` executes in `<head>`: it
  reads the stored selection (falling back to `system`; a `localStorage` failure
  is always caught), resolves it against `prefers-color-scheme` and applies both
  root attributes, subscribes to live system changes (applied only while the
  selection is `system`) and registers the `pageswap`/`pagereveal` listeners
  that name the cover image `gala-cover` so it morphs between a card and its
  article. Phase 2 (`DOMContentLoaded`) runs independent, each-in-its-own-try
  enhancements, every one a no-op when its markup is absent: the colour-mode
  toggle (system, light, dark; a circular reveal through a same-document view
  transition unless reduced motion is requested), the search dialog (lazy
  `fetch` of the `data-search-index` URL, `/` and Ctrl/Cmd+K, arrow keys and
  Enter), code blocks (language label and Copy button, select-text fallback),
  contents highlighting (`IntersectionObserver` on `data-toc`), the share group
  (copy link; bookmark stored under `gala:saved:v1`) and a reading-progress
  fallback where scroll-driven animations are unsupported. It never mutates
  `document.documentElement.style`, uses no cookie and no account identifier,
  and builds all DOM text with `textContent`/`setAttribute`, never HTML from
  fetched data. Localized strings are rendered by the server as `data-*`
  attributes on the `.g-toast` element.
- The CSP is `connect-src 'self'` (so the script can read the static search
  index) and otherwise unchanged and strict. When
  `build-input.modules.analytics` is present the one analytics provider's
  catalog sources (`internal/analytics/providers.js`) are added to `script-src`,
  `connect-src` and `img-src` of that build's CSP meta tag only.
- `src/core/index.js` writes the script into the candidate output directory and
  enters it into the manifest as an ordinary `manifestAsset` row
  (`{path, byteLength, sha256}` plus its fixed
  `application/javascript; charset=utf-8` media type), after the Eleventy route
  listing, so it is never mistaken for an HTML route.
  `src/core/internal/eleventy-render.js`'s skeleton layout carries the
  `data-gala-publication-root` attribute, the
  `<meta name="color-scheme" content="light dark">` tag and the one
  `<script src>` reference, so every route's `<head>` is still byte-identical.
- With JavaScript disabled the toggle, search button and share group stay hidden
  (they would do nothing), the contents list, menu and links are plain anchors
  and `<details>`, and the resolved root attribute is server-rendered as the
  fixed `light` default, so a no-JS reader, an archival crawler, or a load where
  the script fails still gets a fully themed page. `<meta name="color-scheme">`
  carries `prefers-color-scheme` through to user-agent styling independent of
  any script.

**Authoring a theme:** see [`docs/theme-authoring.md`](docs/theme-authoring.md)
for the full guide — how a theme is a delta over the template-owned `gala-base`
layer, the closed token catalog, the closed five-member pseudo-class catalog,
passive-asset/SVG admission, the `theme.json` digest chain, and `templateRange`.
Run `node scripts/scaffold-theme.mjs <directory>` to write a minimal,
already-conformant theme package skeleton rather than hand-typing one.

The theme styling contract replaces `contracts/theme-styling-contract.jcs`'s
original scaffold placeholder with the real, closed `templateStylingContract`
catalog this renderer's own internal styling decision defines, and wires the
selected theme package's stylesheets into every generated page:

- **`src/core/internal/appearance/styling-contract.js`** is the one reviewed
  source module `scripts/generate-contracts.mjs` emits the contract from: the
  ordered five-layer catalog (`gala-base`/`gala-tokens`/`gala-components`/
  `gala-utilities`/`gala-print` — `gala-base` is the template's own layer,
  carrying the reset/type-scale/focus-ring defaults documented below
  `internal/appearance/base-layer.js`, always ordered first so a theme's own
  layers can override it), the publication-root/ resolved-palette selectors, the
  closed type/class/id/attribute leaf catalogs, a closed five-member
  pseudo-class catalog (`hover`, `focus-visible`, `active`, `visited`,
  `disabled`; see that module's own documentation for why each is admitted and
  why the token catalog's `color-focus`/`color-link-visited` had no reachable
  application before it), and up to 256 `publicThemeSlotHooks` (contract 3.0.0;
  exactly 225 today, contract 4.1.0) — one per catalog leaf, so every leaf a
  theme could validly select is a named, documented hook and no catalog member
  is orphaned. Every leaf is drawn from what this renderer actually renders: 30
  type-selector hooks (every landmark/prose/code/control element
  `internal/skeleton.js`, `internal/page-kinds.js` and the markdown-it
  CommonMark pipeline can produce), 138 class-selector hooks (123 `g-*`
  component classes, grouped by component in `COMPONENT_CLASS_GROUPS`, plus the
  base Prism `.token` class and one `.language-<grammar>` hook per admitted
  highlight grammar, 14 today — fine-grained per-token-kind classes are a
  documented scope exclusion), 2 id-selector hooks (`#main-content`, the
  appearance toggle button's fixed id) and 55 attribute-value hooks (one per
  value of each `data-gala-*` attribute the markup sets: slot, page kind, the
  article/author/footer/header/home/ listing layouts, density, media ratio and
  profile). `catalogDigest` is
  `SHA256(UTF8("GALA-TEMPLATE-STYLING-CONTRACT-V2\0") || JCS(...))`, matching
  the same domain-separated digest construction and the digest profile
  `@rathnasgala2/schemas`' own internal `templateStylingContract` profile uses
  (that function is not exported through the package's public API, so this
  module reimplements the same domain-separated formula rather than importing
  it). `assertTemplateStylingContractShape` is this repository's own structural
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
  directory, shaped exactly like the theme package's own file set —
  `theme.json`, `tokens.css`, `components.css`, an optional `utilities.css`,
  `print.css`, `package.json`, `LICENSE`, `README.md`, `assets/*`), it copies
  the declared stylesheets and any declared non-CSS passive assets into
  `assets/theme/`, enters each as an ordinary `{path, byteLength, sha256}`
  `manifestAsset` row, and renders the ordered `<link>` markup every generated
  page's `<head>` inserts (`print.css` alone carries `media="print"`). It
  validates the theme's own declared `stylesheets` list against the two admitted
  shapes (with or without `utilities.css`) and that `cssLayers` byte-equals the
  corresponding layer projection, but does **not** re-implement the full CSS
  Syntax Module admission grammar — that is the shared `theme-release.yml`
  conformance runner's job, run once per theme release, never per publication
  build. `renderPublication` falls back to the pre-existing fixed
  `assets/theme/print.css` link when no `options.themeDirectory` is supplied
  (every caller that predates theme integration, and this repository's own tests
  that do not exercise it). Minimal in-repo fixture theme packages for both
  stylesheet-list shapes live under `test/fixtures/theme-fixture-full/` and
  `test/fixtures/theme-fixture-minimal/` — deliberately not real, conformant
  theme CSS (authoring one is a theme package's own task); they exist only to
  exercise the copy/link/manifest mechanism.

Hardening at consume time (a theme package is lower-trust supply-chain input
than the repository owner's own authored content, so it is held to at least the
same bar): `theme.json` is schema-validated against
`urn:gala:schema:theme-contract:2.0.0` before anything else, and its
`contractVersion`/`stylingContractDigest`/ `templateRange` are checked against
this renderer's own published styling contract and version
(`internal/semver-range.js`: a deliberately closed exact-version/caret-range
subset). Every declared file's `byteLength`/ `sha256` is verified against the
bytes actually read, and `theme.json.budgets` is enforced. Every passive asset's
bytes are sniffed (never trusted from the declared `mediaType`) against a closed
allowlist: raster formats are admitted directly, and SVG is admitted only after
`internal/media/theme-svg-sanitizer.js`'s closed grammar rejects any
`<script>`/event-handler/external-reference construct outright. **Iconography is
in scope and expected** (TPL-H6 decision): this sanitizer is what makes a
theme-declared SVG icon mark safe to publish.

- **Publication palette and "Visitors see" (4.1.0).** Every build with a theme
  derives the theme's palette-driven tokens from `appearance.tokens` (`{}` is
  the theme's default palette) with `@rathnasgala2/schemas/palette`, checks the
  derived values and every contrast pair in both modes (a failure refuses the
  build with `APPEARANCE_PALETTE_CONTRAST`, naming the pair and mode), and
  writes `assets/gala-palette-<12 hex of sha256>.css`, linked last with SRI and
  listed in the manifest. A theme without a `palette` block is refused
  (`THEME_PALETTE_MISSING`; malformed: `THEME_PALETTE_INVALID`).
  `appearance.colorMode` reaches the page as `data-gala-color-mode-default` and
  `data-gala-color-mode-allowed` on the root; a `light`/`dark` default is the
  server-resolved mode, and a single allowed mode renders no toggle and sets
  `color-scheme` to it.
- **`baseUrl` path prefix (2.2.0).** `buildInput.baseUrl` may carry a path (a
  GitHub project site, `https://owner.github.io/g9/`); it is not origin-only.
  `internal/route.js#derivePublicBasePath(baseUrl, basePath)` joins that path
  with `basePath` into the one public base path every emitted URL uses (route
  and asset hrefs, the appearance script, stylesheet links, canonical/`og:url`,
  feed, sitemap and search-index URLs). Output file paths still use `basePath`
  alone, because the artifact is deployed at the hosting site root.
- **Public URL form (trailing slash).** Under the default `directory-index`
  route profile every emitted page URL ends with exactly one `/` (`/about/`,
  `/archive/2026/`; the site root stays `/`), because each page is written as a
  directory (`about/index.html`) and a host would otherwise 301 the slash-less
  form. This covers canonical, `og:url`, sitemap `<loc>`, Atom/RSS links and
  ids, `llms.txt`/`llms-full.txt`, JSON-LD, the search index, redirect-document
  targets and every internal `href`. Under `explicit-file` routes are emitted
  unchanged. Fixed files (`/sitemap.xml`, `/feed/rss.xml`, anything under
  `/assets/` or with a file extension) never change, and manifest and output
  paths are unaffected. One helper owns the rule:
  `internal/route.js#publicRouteForm(route, profile)`, applied by
  `joinPublicRoute(publicBasePath, route, profile)` for every emitter.
- **basePath fix (LOCAL-7 follow-up; independent-review finding B2).** Before
  theme integration existed, the appearance bootstrap script's `<script src>`
  and the social-image `og:image`/`twitter:image` URL were both root-absolute,
  unprefixed by the publication's own `basePath` — a non-root `basePath`
  publication would 404 them. `internal/appearance/contract.js`'s new
  `appearanceBootstrapScriptHref(basePath)` and `internal/seo.js`'s
  `resolveSocialImageUrl` (now taking `basePath`) both join through
  `internal/route.js`'s shared `joinBasePathAndRoute`/`projectFixedAssetPath`,
  exactly like the pre-existing print-stylesheet convention (now folded into
  `internal/theme-assets.js`) already did for _hrefs_. Independent review
  (finding B2) found that this was only half the fix: the _physical files_ this
  renderer writes for every asset class — theme CSS/passive assets, every media
  derivative, and the appearance bootstrap script — were still written, and
  entered into the manifest, at their bare **unprefixed** paths. Since the
  local-directory adapter serves a `manifestAsset.path` verbatim, a non-root
  `basePath` publication's `<link>`/`<script src>`/`og:image` href would point
  at `<basePath>/assets/...` while the actual file sat at the unprefixed
  `assets/...` — a 404 in practice, not just a theoretical href mismatch.
  `src/core/index.js` now joins `basePath` into the physical destination path
  and the `manifestAsset.path` for media derivatives (`joinedMediaAssets`,
  computed with the same `projectFixedAssetPath` every other fixed-name
  generated asset already uses) and the appearance bootstrap script
  (`joinedAppearanceScriptPath`); `internal/theme-assets.js` computes its joined
  output path once per file and derives both the `<link href>` and the
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

Neither this renderer's own governing brief nor its internal styling decision
fixes exact derivative widths, output formats/quality, or a per-publication
media byte/count ceiling for _author_ media (those numeric bounds are stated
only for the closed `gala-theme-binary-assets-v2` _theme passive-asset_
profile). This renderer therefore documents its own choices in
`src/core/internal/media/limits.js` rather than inventing undocumented magic
numbers:

- decode/resource ceilings reuse the theme binary-asset profile's numbers
  (dimension, pixel-count, decoded-buffer, source-byte caps), since the
  decode-bomb risk they defend against is identical regardless of asset class;
  the JPEG decoder's own memory knob counts its whole working set (coefficient
  and line buffers as well as the RGBA output), so it is sized for an image at
  the pixel ceiling at 32 bytes per pixel (512 MiB) rather than to the RGBA
  output alone, which rejected every JPEG above about three to five megapixels;
- responsive derivative widths (`320/640/960/1280/1920`), JPEG derivative
  quality (`82`), and the per-publication image/font count and aggregate byte
  ceilings are this renderer's own conservative choices;
- WebP and AVIF get bounded container/dimension validation but no full
  VP8/VP8L/AV1 entropy decode or derivative generation — hand-authoring an
  independently verifiable decoder for either format was judged out of
  proportion to this task, and is flagged as a follow-up rather than attempted
  partially;
- GIF gets a bounded block-structure walk (signature, logical screen and every
  frame within the dimension ceilings, every sub-block chain inside the file, at
  least one image, the trailer as the last byte) and passes through unmodified:
  this renderer carries no GIF encoder, so an animation is never resized, and
  any comment or application extension is served as authored.

Every remaining "Required generated output" from this renderer's own governing
brief sits on top of the page kinds above:

- **Feeds** (`src/core/internal/feeds.js`): deterministic Atom 1.0
  (`/feed/atom.xml`) and RSS 2.0 (`/feed/rss.xml`) documents over the exact
  reverse-chronological `status: "published"`, `kind: "article"` selection
  `internal/page-kinds.js`'s `index` page kind paginates (the shared
  `selectPublishedArticles` export; editions are never in it), every item URL
  absolute against `buildInput.baseUrl`, bounded to the most recent 50 entries
  (documented scoped decision — neither the brief nor this renderer's own
  styling decision fixes a feed item count).
- **Sitemap** (`src/core/internal/sitemap.js`): `/sitemap.xml` over every page
  `internal/page-kinds.js` generated that this renderer did not itself mark
  `noindex` (unlisted content and editions), deterministically sorted by each
  entry's own absolute URL, with `<lastmod>` sourced from each page's own
  authored `publishedAt`/`updatedAt` — never build time.
- **Static search index** (`src/core/internal/search-index.js`):
  `/search-index.json`, a deterministic JSON document indexing every published
  `article`/`page` record's title, description, a bounded plain-text excerpt,
  tags and timestamps. Its shape is a documented scoped decision (neither the
  brief nor this renderer's own styling decision fixes one). **No runtime search
  JavaScript accompanies it** — the Light/Dark/System appearance controller
  remains the only browser bootstrap this renderer ever emits (acceptance test
  C).
- **SEO/Open-Graph/Twitter/localization metadata**: every generated page's
  `<head>` now carries a viewport meta, an optional description, an optional
  `robots` directive (`noindex, follow` for `status: "unlisted"` content, for
  editions and for the generated `404.html`), a canonical link, `og:*`/
  `twitter:*` meta tags (image resolved to an absolute content-addressed media
  derivative URL via `internal/seo.js`, never the raw source path) and the
  Atom/RSS feed-discovery `<link>`s. A post's optional `seo` object overrides
  the head (`seo.title`, `seo.description`, `seo.canonicalUrl`; `seo.noindex`
  adds `noindex, follow` and drops the post from the sitemap, feeds, `llms.txt`
  and the search index while keeping it listed), a site with an
  `appearance.brandMark` also gets `rel="icon"` and `apple-touch-icon`, and
  every page gets `theme-color` (the canvas colour, plus a dark-scheme variant).
  **hreflang** is a documented scope decision, not a silent omission:
  `build-input:2.0.0` has no translation/locale-variant linkage between distinct
  `content[]` records (see `internal/seo.js`'s module documentation), so no
  `<link rel="alternate" hreflang="...">` is ever emitted by this renderer.
- **Search and assistant discovery** (3.0.0, unpublished). Every page carries
  one `<script type="application/ld+json">` data block
  (`internal/ structured-data.js`: `WebSite` + `Blog` on the home page,
  `BlogPosting` + `BreadcrumbList` on articles, `CollectionPage` on tag, series
  and archive pages, `ProfilePage` on authors; no `SearchAction`, because the
  site search has no results URL). It is data, never executed, so "exactly one
  executable script per page" still holds. Article pages add
  `article:published_time`, `article:modified_time`, `article:author`,
  `article:tag`, and every `og:image` carries width, height and alt. `<title>`
  is `<Page> | <Publication>` (home: `<Publication> – <tagline>`, at most 60
  characters; the tagline is dropped when it repeats the name); every indexable
  page has a meta description (the subtitle, else the body's opening prose with
  heading text skipped, else the whole body text, else the publication
  description). A leading body `<h1>` equal to the title is dropped from the
  rendered article, since the head prints the title. Every `<img>` has `width`
  and `height` from the media pipeline; the article cover and the home hero are
  `fetchpriority="high"`, all other images `loading="lazy" decoding="async"`.
  Feeds carry the full sanitized body (`content:encoded` in RSS,
  `<content type="html">` in Atom; each image as its absolute media-derivative
  URL), authors and categories. Author pages live at `/authors/<name-slug>` (the
  id when two names collide).
- **`robots.txt`, `llms.txt`, `llms-full.txt`** (`internal/robots.js`,
  `internal/llms.js`). `robots.txt` allows all crawlers and names the absolute
  sitemap; `publication.crawlers.ai: "block"` (validated by the build-input
  schema, absent means allow) adds `Disallow: /` groups for the 15 known AI
  crawlers. It is always written at the output root: **only a robots.txt at the
  host root is honoured by crawlers**, so a site served from a path (for example
  a GitHub project site) must have the same file at its host root. `llms.txt`
  follows llmstxt.org (`# title`, `> description`, `## Articles`, `## Series`,
  `## Optional`); `llms-full.txt` is every published article as plain text.
  Unlisted content and editions are excluded from both.
- **`404.html`**: the `error` page kind's pure `renderErrorPageBody`, now
  actually wired into `renderPublication` at the fixed `errorDocumentKey`
  (`internal/route.js#errorDocumentPath`) — `404.html` at the root, or
  `<basePath>/404.html` otherwise.
- **Redirect documents**: unchanged from the renderer adapter
  (`internal/route.js#renderRedirectDocument`) — every authored redirect was
  already an ordinary generated artifact with manifest status fixed at `200`;
  this is documenting that fact here, not re-implementing it.
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

- Node.js >= 24.0.0 (this repository's own development/CI toolchain is Node.js
  24.18.0)
- npm >= 11.0.0 (this repository's own development/CI toolchain is npm 11.16.0)

`package.json`'s published `engines` field declares the supported _range_
(TPL-H5 fix: an exact pin published in the tarball rejects every consumer not on
that precise patch version, including under a consumer's own `engine-strict`
setting). This repository's own exact toolchain is pinned separately in
`devEngines` (evaluated only for this project root, never for a consumer) and in
`.nvmrc`/`.node-version`.

## Commands

```sh
npm install
npm run verify
```

`npm run verify` (this description is kept in sync with `package.json`'s own
`verify` script string by `test/readme-verify-description.test.js`, not
hand-maintained) runs, in order: Prettier format check, ESLint,
`tsc --checkJs --noEmit`, the dependency-cruiser
architecture/module-tree-absence gate, `jscpd` duplication scan, the
`contracts/*.jcs` canonical-form check, the no-local-schema-pin check, the
`node --test`, the license inventory check, the SBOM currency check
(`sbom:check` compares `sbom.cdx.json` against the current lockfile — it is not
a presence check), the workflow-pin check, and `npm audit --audit-level=high`.

Individual gates:

```sh
npm run format          # apply Prettier
npm run format:check    # CI check
npm run lint            # ESLint flat config
npm run typecheck       # tsc --checkJs --noEmit against types/index.d.ts
npm run architecture    # dependency-cruiser: core never imports src/modules, no circular deps
npm run duplication     # jscpd, 3% / 50 tokens
npm run contracts:generate  # (re)write contracts/*.jcs from their reviewed source modules
npm run contracts:check     # fail if committed contracts drifted
npm run schema-pin:check    # require the exact registry @rathnasgala2/schemas release
npm test                # node --test
npm run licenses:generate   # (re)write THIRD_PARTY_LICENSES.json
npm run licenses:check      # fail if it drifted from package-lock.json
npm run sbom:generate       # cyclonedx-npm -> sbom.cdx.json
npm run sbom:check          # fail if sbom.cdx.json is stale against package-lock.json
npm run workflows:check     # fail if a GitHub Actions ref is not SHA-pinned
npm run workflows:drift     # fail if workflow files diverge from their own baseline
npm run audit               # npm audit --audit-level=high
```

Source development does not require a sibling schema checkout. The lockfile pins
a `@rathnasgala2/schemas` release installed from the npm registry (3.12.0 until
3.16.0 is published; see "Consuming `@rathnasgala2/schemas`") and carries its
registry integrity. The exact peer is the public consumer contract.

## Package layout

```text
src/core/                                # the renderer
src/modules/interactions/browser/        # the reader-interactions browser script (emitted as data)
contracts/render-policy.jcs              # normalized-body policy identity (real content)
contracts/theme-styling-contract.jcs     # published styling catalog (real and closed)
```

`src/core/` and `src/modules/interactions/` are the only source roots, and
`src/core` never imports from `src/modules`: the interactions browser script is
read from disk and emitted as `assets/gala-interactions-v1.js` when
`build-input.modules.interactions` is present.
`test/module-tree-absence.test.js`, `.dependency-cruiser.cjs` and the ESLint
`no-restricted-imports` rule enforce this. `newsletter` and `prism` have no
module directory, package, configuration schema, stub, output or runtime code in
this MVP. Reader consent and analytics are not a module either: they are a core
privacy setting. `build-input.modules.analytics` (schemas 3.16.0, Google
Analytics 4 with an opt-in policy) adds, under `src/core/internal/analytics/`, a
consent banner after the footer of every HTML page, a "Privacy choices" button
in the footer legal navigation, `assets/gala-consent-v1.js` (deferred; no eval,
no cookie; the choice is kept in `localStorage` as `gala.consent.v1`), the
provider's CSP sources and the analytics paragraph of the policy pages'
Galascribe section. Nothing from the provider loads before the reader accepts,
and a site without the module has none of these (it still carries the legal
footer navigation and the two policy pages). A browser that sends the Global
Privacy Control signal (`navigator.globalPrivacyControl === true`) with no
stored choice is treated as declining, without storing anything and without the
banner on load; the footer's "Privacy choices" button still opens it, and
`gala:consent` carries `{analytics: false, source: 'gpc'}`. Whitelabel is not a
module either: the footer's "Made with Galascribe" link is a core appearance
switch, `build-input.appearance.attribution` (`showMadeWith: false` omits the
line; absent or `true` shows it). Nor are editions: they are a rendered content
kind (see Editions).

## Policy pages

Every site carries two legal pages, `/terms` and `/privacy` (page kind
`policy`). Each is the site's own text followed by the template-owned
"Galascribe" section. They are indexable, in the sitemap, and never in the
search index, the feeds or the `llms` documents.

- **The site's own text** is `build-input.policies` when present (schemas
  3.16.0): `{terms: {title, body}, privacy: {title, body}}`, each `body` a
  `renderableBody` produced upstream. The `title` is the page title and its one
  `<h1>`, and the `body` is placed as an article or page body is, with a leading
  `<h1>` that repeats the title dropped. It is verified like every other body
  before anything is written: its `renderPolicy` must equal the published
  identity, its `bodyDigest` the digest of its bytes, and re-sanitizing it must
  reproduce it (`RenderPolicyViolationError` otherwise). An image in a policy
  body never resolves (`MEDIA_REFERENCE_UNRESOLVED`). When `policies` is absent
  the text is the English default the schemas package publishes as
  `@rathnasgala2/schemas/site-policy-defaults`
  (`{terms: {title, markdown}, privacy: {title, markdown}}`), rendered through
  this package's own `normalizeAuthoredMarkdown`. The renderer carries no copy
  of that text.
- **The Galascribe section** is hardcoded English and the author's text never
  replaces it. Every fact in it comes from the build input: that the site is
  published with Galascribe (Rathnas LLC) and that Galascribe's Terms of Service
  and Privacy Policy (`https://app.galascribe.com/terms`, `/privacy`, the App's
  public origin) apply and are incorporated; the text above the section is
  described as the site author's when `policies` is present and as Galascribe's
  standard text (which the author can replace in Galascribe) when the shipped
  default renders; with reactions or comments on, that Galascribe provides them,
  processes what readers submit and keeps a reader session in browser storage;
  with `modules.analytics`, the provider, that consent is required, the `_ga`
  and `_ga_*` cookies, the `gala.consent.v1` storage key, the "Privacy choices"
  footer control and the Global Privacy Control behaviour, otherwise that no
  analytics or advertising trackers load; and the contact for Galascribe,
  `support@galascribe.com`.

A content record or redirect that uses either route (compared without a trailing
slash and ignoring letter case) fails the build closed with
`POLICY_ROUTE_CONFLICT`; rename or move the document.

## Consuming `@rathnasgala2/schemas`

This source targets `@rathnasgala2/schemas@3.16.0` with a `^3.16.0` peer range
(any 3.x from 3.16.0; 3.16.0 adds `modules.analytics`, `build-input.policies`
and the `site-policy-defaults` export, and its `theme-contract` admits styling
contract 4.1.0); the lock still installs 3.12.0 exactly. Generation-4
development verifies against the schema sibling/packed candidate. The historical
`package-lock.json` is not a 3.16.0 registry claim: it must be regenerated,
together with the SBOM, from the authoritative published 3.16.0 artifact before
release. The 2.8.0->2.11.0 convergence changes none of the four roots this
renderer validates, for the same reason the 2.7.0-2.8.0 delta below did not.
Only the `"."` export (`validateGalaDocument`, `GALA_SCHEMA_IDS`) and, since
4.4.0, the `./site-policy-defaults` export (the default policy text) are
consumed; the 2.6.0 `./runtime-origins` narrow export and every other addition
through 2.6.1 (new OpenAPI operations, App route/catalog copy, the
`PrincipalSummary`/`AuthenticatorSummary`/keyset field additions) are
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

The internal specifications this package is built against live outside this
repository and have no public URL, so they are named here as plain text rather
than as dead links:

- Slice brief S2: author-owned publication, section 3 (`@rathnasgala2/template`)
  (internal)
- The internal decision record establishing JavaScript ESM for public packages
  (internal)
- WORKSPACE.md, sections 4-8 and 13 (internal)
