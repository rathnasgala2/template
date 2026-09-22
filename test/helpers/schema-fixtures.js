/**
 * Load the `@rathnasgala2/schemas` package's own published examples and S2
 * fixture corpus for use in this repository's tests (LOCAL-1: the packed
 * tarball dependency; task packet S2-T03: "Include the brief's S2-T03
 * acceptance tests using the schema fixture corpus").
 *
 * `fixtures/s2/*.json` and `examples/valid/*` are not import-specifier
 * subpaths in the package's `exports` map, so they are read directly off
 * disk relative to the package's `package.json` (itself an exported
 * subpath), rather than imported.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  computeBodyDigest,
  computeRenderPolicyIdentity,
} from '../../src/core/internal/content-security.js';

const packageJsonUrl = await import.meta
  .resolve('@rathnasgala2/schemas/package.json');
const SCHEMAS_PACKAGE_ROOT = path.dirname(fileURLToPath(packageJsonUrl));

/**
 * @param {string} relativePath a path relative to the `@rathnasgala2/schemas`
 *   package root
 * @returns {Promise<unknown>} the parsed JSON document
 */
async function readJson(relativePath) {
  const text = await readFile(
    path.join(SCHEMAS_PACKAGE_ROOT, relativePath),
    'utf8',
  );
  return JSON.parse(text);
}

/**
 * The package's canonical `build-input:2.0.0` example: a complete,
 * structurally valid instance (`examples/valid/build-input/canonical.json`).
 *
 * The upstream fixture's one content record declares `redirects: ["/fixture-1"]`
 * while also resolving its own canonical route to `/fixture-1` (no explicit
 * `route`, `slug: "fixture-1"`) — a self-redirect that is schema-structurally
 * valid (the schema fixture corpus tests registered-schema shape only, per
 * its own `fixtures/s2/manifest.json` "publicCoverage" note) but semantically
 * nonsensical: it would collide the content page and its own redirect
 * document at the same output path. This loader clears that accidental
 * self-redirect so callers that do not care about redirects get a
 * renderable instance by default; tests that specifically exercise
 * redirects set `content[].frontmatter.redirects` to a distinct route
 * themselves.
 *
 * The same fixture also declares one `appearance.fontAssets` entry whose
 * `path` (`content/fixture-1.md`) and placeholder `sourceDigest`
 * (`sha256:00...01`) are schema-shape filler, not a real WOFF2 file's real
 * digest. A caller that does not care about the media pipeline (S2-T05)
 * would otherwise have every render fail closed on that unresolvable
 * reference; this loader clears it for the same documented reason as the
 * self-redirect above. Tests that specifically exercise the media pipeline
 * set `appearance.fontAssets` (and any image reference) themselves, against
 * real bytes staged under their own `sourceDirectory`.
 *
 * @returns {Promise<Record<string, unknown>>} a fresh deep clone with no
 *   pre-declared content redirects or placeholder media references
 */
export async function loadCanonicalBuildInput() {
  const buildInput = /** @type {Record<string, unknown>} */ (
    await readJson('examples/valid/build-input/canonical.json')
  );
  for (const record of /** @type {{frontmatter: {redirects: string[]}}[]} */ (
    buildInput.content
  )) {
    record.frontmatter.redirects = [];
  }
  /** @type {{appearance: {fontAssets: unknown[]}}} */ (
    buildInput
  ).appearance.fontAssets = [];
  await applyCurrentRenderPolicy(buildInput);
  return buildInput;
}

/**
 * Overwrite every `renderableBody.renderPolicy`/`bodyDigest` in a
 * build-input-shaped fixture (publication profile, footer card, every
 * content record) with the currently published render-policy identity and
 * a `bodyDigest` matching that record's own existing `body` text.
 *
 * The upstream `@rathnasgala2/schemas` fixture corpus uses the same
 * placeholder-digest convention everywhere (`sha256:00...0N`; see
 * {@link loadCanonicalBuildInput}'s own documentation), which is
 * schema-valid but never byte-equals a real published render-policy
 * identity, nor a real digest of its own placeholder `body` text. S2-T04
 * wires `renderPublication` to reject a mismatched `renderPolicy` or
 * `bodyDigest` before rendering (DEC-097 section 5), so any test fixture
 * that exercises rendering itself — rather than specifically testing one of
 * those rejections — must carry both real values. This deliberately does
 * *not* touch `body` itself: every upstream fixture's placeholder body text
 * (e.g. `"fixture-1"`) is already trivially render-policy-conformant HTML
 * (a bare text node, unchanged by re-sanitization), so only the digest
 * describing it needs correcting.
 *
 * @template {Record<string, unknown>} T
 * @param {T} buildInput a build-input-shaped object, mutated in place
 * @returns {Promise<T>} the same object, for convenient chaining
 */
export async function applyCurrentRenderPolicy(buildInput) {
  const identity = await computeRenderPolicyIdentity();
  const publication = /** @type {any} */ (buildInput).publication;
  if (publication?.profile?.body) {
    publication.profile.body.renderPolicy = { ...identity };
    publication.profile.body.bodyDigest = computeBodyDigest(
      publication.profile.body.body,
    );
  }
  if (publication?.footerCard?.body) {
    publication.footerCard.body.renderPolicy = { ...identity };
    publication.footerCard.body.bodyDigest = computeBodyDigest(
      publication.footerCard.body.body,
    );
  }
  for (const record of /** @type {any[]} */ (buildInput).content ?? []) {
    record.renderPolicy = { ...identity };
    record.bodyDigest = computeBodyDigest(record.body);
  }
  return buildInput;
}

/**
 * Load one S2 fixture family file from `fixtures/s2/`.
 *
 * @param {string} family the family's file basename without extension,
 *   e.g. `"empty-modules-placements"`
 * @returns {Promise<{family: string, cases: {caseId: string, schemaId: string, instance: unknown, expectedDiagnostics: readonly unknown[]}[]}>}
 *   the parsed family document
 */
export async function loadS2FixtureFamily(family) {
  return /** @type {{family: string, cases: {caseId: string, schemaId: string, instance: unknown, expectedDiagnostics: readonly unknown[]}[]}} */ (
    await readJson(`fixtures/s2/${family}.json`)
  );
}
