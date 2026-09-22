# Repository instructions

## Purpose

Own the deterministic Eleventy-backed static publication renderer that turns a
validated `build-input:2.0.0` instance into a candidate output directory plus an
`artifact-manifest:2.0.0` instance. Never own deployment, provider credentials,
theme presentation bytes, or any `interactions` / `whitelabel` / `newsletter` /
`prism` module boundary (document 32 section 3.1; brief S2 section 1).

## Commands

Use Node.js 24.18.0 and npm 11.16.0 (`.nvmrc` and `.node-version` pin the same
version). Run `npm install`, then `npm run verify` before review. Use
`npm run format` only to apply formatting, `npm run contracts:generate` only
when a later task changes a contract's published content, and
`npm run licenses:generate` / `npm run sbom:generate` after a dependency change.

## Architecture boundaries

`src/core/` is the only admitted source root. No `src/modules/` tree, module
import edge, registration stub, module configuration, module output or module
runtime is ever added. `.dependency-cruiser.cjs`'s
`only-src-core-is-a-source-root` rule and `test/module-tree-absence.test.js`
both enforce this; either failing blocks merge. Eleventy 3.1.6 (added in S2-T03)
must stay fully confined behind the renderer adapter: no Eleventy object,
plug-in API, config object or Nunjucks environment may cross the adapter
boundary in either direction.

## What never goes here

Do not add a `src/modules/` directory, provider adapters, deployment or
publish-kernel logic (owned by `publish`), theme presentation CSS/assets (owned
by `theme-*`), schema authoring (owned by `schema`), a `bin` named `gala`, or
any `interactions`/`whitelabel`/`newsletter`/`prism` boundary.

## Contract sources and generation commands

This repository consumes `@rathnasgala2/schemas@2.8.0` (LOCAL-1/LOCAL-39: the
packed tarball at
`/Users/anand/ws/galascribe/local-packages/rathnasgala2-schemas-2.8.0.tgz`,
declared as a `file:` dependency so `package-lock.json` pins its resolved
version and integrity). It owns two of its own published contracts,
`contracts/render-policy.jcs` and `contracts/theme-styling-contract.jcs`,
emitted as compact RFC 8785 JCS by `npm run contracts:generate` and
drift-checked by `npm run contracts:check`. `contracts/render-policy.jcs` is
S2-T04's real, closed sanitizer/parser catalog, generated from
`src/core/internal/render-policy-content.js` (the single source of truth both
the published contract and the runtime output-security pipeline in
`src/core/internal/content-security.js` read from);
`contracts/theme-styling-contract.jcs` is S2-T12's real, closed
`templateStylingContract` catalog (DEC-097 section 4), generated from
`src/core/internal/appearance/styling-contract.js` — one reviewed source module
enumerating every hook this renderer actually renders (landmarks,
prose/code/control type selectors, the base Prism `.token`/`.language-*` class
hooks, the `#main-content`/appearance-select id hooks, and one attribute-value
hook per `data-gala-slot`/`data-gala-page-kind` value), capped at exactly 64
`publicThemeSlotHooks`. `test/theme-styling-contract.test.js` drift-checks the
published contract against a rich rendered-HTML fixture in both directions
(every hook actually rendered; every rendered hook-like construct published) and
validates `theme-contract:2.0.0` fixtures for both palettes with
`@rathnasgala2/schemas`' own exported `validateGalaDocument`.
`src/core/internal/theme-assets.js` is the optional theme-asset copy/link
integration layer (`options.themeDirectory` on `renderPublication`); see the
README's S2-T12 section for the full division of labour with S2-T11's
theme-release conformance runner and S2-T13's real theme CSS. Every
`theme.json`-declared path it reads is untrusted input, validated with
`assertSafeThemeRelativePath`/`assertContainedThemePath` (no `..`, no absolute
path, no backslash, NFC-normalized, no symlink component, and the fully resolved
path must stay inside `themeDirectory`) before the file is ever opened —
independent-review finding B1. Every asset class this renderer writes (media
derivatives, the appearance bootstrap script, theme CSS/passive assets) has its
physical output path and its `manifestAsset.path` `basePath`-joined through
`internal/route.js`'s `projectFixedAssetPath`, matching the href it also emits —
independent-review finding B2; a mismatch here is a real 404 under the
local-directory adapter, not just a cosmetic href bug, since that adapter serves
a manifest `path` verbatim.

**Division of labour (`renderableBody.body` is already HTML, never re-parsed):**
per DEC-097 section 5 and `build-input.schema.json`'s
`renderableBody.bodyMediaType: const "text/html"`, a `renderableBody.body`
inside a validated `build-input:2.0.0` instance is already the render policy's
markdown-it/sanitize-html/highlighter output, produced once upstream by
`publish-kernel`/`publish-action`. `normalizeAuthoredMarkdown` (exported from
`src/core/index.js`) is that upstream normalization step; `renderPublication`
itself never calls it and never runs markdown-it on a `body` it receives — it
only verifies `bodyDigest` and re-sanitization idempotence
(`assertPolicyConformantHtml` in `src/core/internal/content-security.js`) before
inserting the body verbatim. Do not reintroduce a markdown-it call inside the
`renderPublication` code path; that would double-escape every already-rendered
tag.

## How to run locally

Activate Node 24.18.0, run `npm install`, then `npm run verify`. This repository
has no service or external runtime dependency; the execution phase added by
S2-T03 onward has no ambient network, credentials or wall-clock dependence by
design.

## Review checklist

Confirm: exact dependency pins (Eleventy 3.1.6, markdown-it 14.3.1,
sanitize-html 2.17.7, syntaxhighlight 5.0.2, `jpeg-js` 0.4.4) unchanged from
`test/pinned-versions.test.js`; lockfile v3; `src/core/` remains the only source
root; no `bin` named `gala`; no default export other than the documented entry
point; `contracts/*.jcs` still canonical; `renderPublication`'s required
`options.sourceDirectory` (S2-T05: the caller-mounted, read-only repository
source tree `build-input`'s `resolvedFile` references point into, distinct from
`outputDirectory`/`workDirectory`) is still asserted and wired through to the
media pipeline; every emitted asset reference (media, appearance script, theme
CSS, print CSS) is `basePath`-joined (S2-T12); the optional
`options.themeDirectory` stays additive (every pre-S2-T12 render path is
unaffected when it is absent); and every gate in `npm run verify` passing before
approval.
