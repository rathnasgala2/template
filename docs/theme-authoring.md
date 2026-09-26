# Authoring a theme package

A theme package (`@rathnasgala2/theme-default`, `-amaze`, `-flashy`, `-minimal`
or `-zebra` — see [Theme identity](#theme-identity) for why the list is closed)
supplies presentation only: colors, spacing, type, and a handful of passive
image/font assets. It never supplies markup, behaviour, or document structure —
those are this renderer's job. Concretely, a theme is **four files and one
manifest**:

```
theme.json        # the theme-contract:2.0.0 manifest (schema-validated)
tokens.css        # design-token custom properties, per resolved palette
components.css    # presentation rules, scoped to the published hook catalog
print.css         # the print stylesheet
utilities.css     # optional: a fourth stylesheet, inserted before print.css
```

Run `node scripts/scaffold-theme.mjs <directory> [themeId] [packageVersion]` to
write a minimal, already-conformant version of this file set — every required
token declared with a starter value, correct digests, and a `theme.json` that
already passes schema validation. Start from there rather than hand-typing a
`theme.json` from scratch.

## A theme is a delta over `gala-base`

This renderer ships its own cascade layer, `gala-base`
(`src/core/internal/appearance/base-layer.js`), on every build, whether or not a
theme is selected. It carries the reset/normalization every publication needs
regardless of theme (box-sizing, image sizing, code/table overflow, the
skip-link visually-hidden-until-focused pattern) and the one rule that makes the
`color-focus`/`focus-width` tokens do anything at all: a real `:focus-visible`
outline.

The five layers are declared in one fixed, explicit order, independent of which
stylesheets a theme happens to ship:

```
@layer gala-base, gala-tokens, gala-components, gala-utilities, gala-print;
```

`gala-base` is always first (lowest precedence). A theme's own
`gala-tokens`/`gala-components`/`gala-utilities` rules always win over the base
defaults for the same property on the same element — a theme overrides, it does
not need to reset. A theme never declares a `gala-base` layer itself, and never
needs to reproduce what `gala-base` already provides; write only what your theme
changes.

## `theme.json`

Validated against `urn:gala:schema:theme-contract:2.0.0` before anything is read
from the package (`assertThemeContractIntegrity` in
`src/core/internal/theme-assets.js`). Fields worth knowing about beyond the
obvious ones:

- **`stylesheets`/`cssLayers`** — exactly
  `["tokens.css", "components.css", "print.css"]` (three-file shape) or the same
  list with `"utilities.css"` inserted before `"print.css"` (four-file shape),
  and `cssLayers` must be the corresponding fixed `@layer` name per file. The
  schema closes this to exactly those two combinations — there is no other valid
  pairing.
- **`contractVersion`** — must byte-equal this template's own published styling
  contract version (currently `2.1.0`). A theme built against a different
  contract version fails to load, on purpose: the token/hook/ pseudo-class
  catalogs a theme was authored against are the catalogs it is checked against.
- **`stylingContractDigest`** — must byte-equal the published contract's own
  `catalogDigest`. This is what actually enforces the previous point at the byte
  level (a `contractVersion` string could be copy-pasted wrong;
  `stylingContractDigest` cannot, without also recomputing it correctly). Get
  the current value from `buildTemplateStylingContract().catalogDigest`
  (`src/core/internal/appearance/styling-contract.js`) — the scaffold script
  already does this for you.
- **`templateRange`** — an exact version or caret range (`^2.0.0`) admitting
  this renderer's own published version. Checked with `satisfiesTemplateRange`
  (`src/core/internal/semver-range.js`), a deliberately narrow SemVer-range
  engine: only exact versions and caret ranges are supported, nothing else.
- **`assets[]`** — one row per file the theme ships, stylesheet or passive asset
  alike, each with its own `mediaType`, `byteLength` and `sha256`. Every value
  here is verified against the bytes actually read
  (`assertPassiveAssetIntegrity`) — a stale or wrong digest is a load-time
  rejection, not a warning.

### Theme identity

`theme.json.themeId`/`package` are closed to five admitted identities:
`default`, `amaze`, `flashy`, `minimal`, `zebra`
(`urn:gala:schema: theme-contract:2.0.0`'s own enum). A new theme cannot mint a
sixth identity today; extending the set is a schema change in
`@rathnasgala2/schemas`, not something this repository or a theme package
controls.

## The token catalog

Exactly 35 tokens, every one required, each declared as a `--gala-<key>` custom
property. `scripts/scaffold-theme.mjs`'s `THEME_TOKEN_CATALOG` lists them with
their type; the four types and their value grammar:

| Type          | Value grammar                                      | Example                 |
| ------------- | -------------------------------------------------- | ----------------------- |
| `color`       | 6- or 8-digit lowercase hex, `#rrggbb[aa]`         | `#2454ff`               |
| `length`      | a plain non-negative number in `px` or `rem`       | `0.5rem`                |
| `font-family` | 1–8 comma-separated family names, no leading digit | `system-ui, sans-serif` |
| `font-weight` | one of `100`–`900` in steps of 100, as a string    | `600`                   |

`light` and `dark` must both be present on every token row; for `length`,
`font-family` and `font-weight` tokens they are conventionally byte-equal (the
value doesn't change with palette), but `color` tokens are exactly where a
theme's dark/light distinction lives.

Declare every token's custom property only inside the two resolved-palette
selectors — never a bare `:root`:

```css
@layer gala-tokens {
  [data-gala-publication-root][data-gala-resolved-color-mode='light'] {
    --gala-color-canvas: #ffffff;
  }
  [data-gala-publication-root][data-gala-resolved-color-mode='dark'] {
    --gala-color-canvas: #0b0b0c;
  }
}
```

This is also the no-JS fallback, for free: `data-gala-resolved-color-mode` is
now server-rendered as `"light"` on every page before any script runs (the
appearance bootstrap script only ever _corrects_ it, for a returning visitor
with a stored `"dark"`/`"system"` preference or a `prefers-color-scheme: dark`
system default). A theme that scopes every token to these two selectors, exactly
as above, is always fully styled — with or without script.

Four tokens have no use anywhere in the shipped reference themes today and are
easy to leave inert by accident: `color-accent`, `color-success`,
`color-warning`, `color-on-accent`, and `color-link-visited`. They are still
required — `color-link-visited` in particular has exactly one legitimate
consumer, the `:visited` pseudo-class (see below); an author who never writes
`a:visited { color: var(--gala-color-link-visited); }` has declared a value
nothing ever reads.

## The pseudo-class catalog

Contract 2.1.0 publishes a closed, five-member pseudo-class catalog — this is
the complete list, not a starting point:

- **`:hover`** — pointer affordance on links and the appearance control.
- **`:focus-visible`** — the keyboard/assistive-technology focus indicator.
  Deliberately not `:focus`: `:focus-visible` lets a theme paint a ring for
  keyboard focus without also painting one on every mouse click. `gala-base`
  already ships a default ring using this pseudo-class and the
  `color-focus`/`focus-width` tokens; a theme only needs to write its own
  `:focus-visible` rule if it wants to override that default's colors.
- **`:active`** — pressed-state affordance, the pointer-down counterpart to
  `:hover`.
- **`:visited`** — the only way to consume `color-link-visited`.
- **`:disabled`** — state styling for the appearance `<select>` control.

No other pseudo-class is admitted (no `:target`, `:checked`, `:required`, plain
`:focus`, ...). `nth-child`/`nth-last-child` are admitted separately, either
with the closed `an+b` arithmetic grammar or the keyword arguments `even`/`odd`.

## Passive assets and the SVG sanitiser

A theme may declare non-stylesheet files in `theme.json.assets[]` — icons,
fonts, a logo mark. Every declared asset is treated as a lower-trust
supply-chain input, held to at least the bar author-supplied content is held to:

1. **Sniffed** from its actual bytes (`internal/media/sniff.js`), never trusted
   from the declared `mediaType` string.
2. **Allowlisted** by the _sniffed_ format: raster formats (`png`, `jpeg`,
   `webp`, `avif`) are admitted as-is; SVG is admitted only after passing
   `internal/media/theme-svg-sanitizer.js`'s closed grammar.
3. **Budget-checked** against `theme.json.budgets.maximumFileBytes` /
   `maximumTotalBytes` / `maximumFiles`.
4. **Digest-verified**: the declared `byteLength`/`sha256` in `assets[]` must
   match the bytes actually read.

The manifest `mediaType` a published artifact carries is always the sniffed
type, never the theme's own declaration — a mislabeled or malicious declaration
cannot change what gets served as what.

The SVG sanitiser's grammar is narrow on purpose (small decorative icons and
marks, referenced from `::before`/`::after` `content: url(...)` or a
`background-image`, or a package-relative `<img>`): no `<script>`, no `<style>`,
no `<foreignObject>`, no `<image>`, no event-handler attribute, and no attribute
whose value is a URL reference other than a same-document `#fragment` (so
`<use href="#id">` against a `<symbol>` defined earlier in the same file works;
anything reaching off-document content does not). Iconography is in scope and
expected — nothing in the contract restricts it, and the sanitiser is exactly
the mechanism that makes shipping an SVG icon safe.

## `templateRange`

A caret range or exact version against this renderer's own published version —
see `theme.json` above. When this template ships a breaking contract change, it
bumps its own published version past what an already-published theme's
`templateRange` admits, so that theme stops loading instead of silently
rendering against a catalog it was never checked against.

## The verify gates that touch a theme

From this repository's side, a theme package is checked at two points:

1. **Consume time** (every build, `internal/theme-assets.js`): schema
   validation, the digest-chain/version checks above, path containment on every
   declared file, and the passive-asset sniff/allowlist/budget/digest chain.
   This is what `scripts/scaffold-theme.mjs` and `test/scaffold-theme.test.js`
   exercise directly, and what `loadThemeAssets({ themeDirectory, basePath })`
   runs for any theme directory you want to check by hand.
2. **Release time** (a separate `theme-release.yml` conformance runner, run once
   per theme package release, not owned by this repository): the full CSS Syntax
   Module admission grammar — the closed selector/property/at-rule catalogs,
   byte/token/rule ceilings — that this renderer's own consume-time checks do
   not re-implement. Authoring conformant theme CSS end-to-end means passing
   both.
