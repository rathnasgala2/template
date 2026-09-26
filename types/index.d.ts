/**
 * Hand-maintained declaration surface for `@rathnasgala2/template`
 * (DEC-094: JSDoc-typed JavaScript ESM, no TypeScript sources).
 *
 * Every `build-input:2.0.0` / `artifact-manifest:2.0.0` shape below is a
 * pragmatic subset of DEC-097 section 5/6's exact schemas: it types every
 * field this renderer actually reads or writes, and widens everything else
 * to `unknown`/index signatures rather than re-authoring the full published
 * schema as TypeScript. The `@rathnasgala2/schemas` package (JSON Schema
 * plus `validateGalaDocument`) remains the single source of truth for
 * validity; these types exist only so `tsc --checkJs` can check this
 * package's own code.
 */

/** The published npm package name for this renderer. */
export declare const TEMPLATE_PACKAGE_NAME: string;

/** The renderer's published major.minor.patch version. */
export declare const TEMPLATE_PACKAGE_VERSION: string;

/** A `packageIdentity`-shaped record: package, version, integrity, registry. */
export interface PackageIdentity {
  package: string;
  version: string;
  integrity: string;
  registry: string;
}

/** A `resolvedFile`-shaped reference: path plus source digest. */
export interface ResolvedFileRef {
  path: string;
  sourceDigest: string;
}

/** A `resolvedMedia`-shaped reference. */
export interface ResolvedMediaRef {
  file: ResolvedFileRef;
  alt: string;
  role: 'informative' | 'decorative';
}

/** A `normalizedSource`-shaped discriminated reference. */
export type NormalizedSource =
  | { kind: 'authored'; sourcePath: string; sourceDigest: string }
  | { kind: 'built-in-default'; defaultId: string; defaultDigest: string };

/** A `renderableBody`-shaped normalized body. */
export interface RenderableBody {
  sourcePath: string;
  sourceDigest: string;
  bodyMediaType: 'text/html';
  body: string;
  bodyDigest: string;
  renderPolicy: { name: string; version: string; digest: string };
}

/** A `contentFrontmatterNormalized`-shaped record's fields this renderer reads. */
export interface ContentFrontmatterNormalized {
  id: string;
  kind: 'article' | 'page';
  title: string;
  description?: string;
  language: string;
  authorIds: string[];
  tags: string[];
  series?: string;
  seriesOrder?: number;
  status: 'published' | 'unlisted';
  createdAt: string;
  publishedAt: string;
  updatedAt?: string;
  slug: string;
  route?: string;
  hero?: ResolvedMediaRef;
  socialImage?: ResolvedFileRef;
  redirects: string[];
}

/** A `contentBuildRecord`-shaped record. */
export interface ContentBuildRecord {
  frontmatter: ContentFrontmatterNormalized;
  body: string;
  bodyMediaType: 'text/html';
  bodyDigest: string;
  renderPolicy: { name: string; version: string; digest: string };
  sourcePath: string;
  sourceRevision: string;
  sourceDigest: string;
  resolvedAuthorIds: string[];
}

/** A `socialLink`-shaped reference. */
export interface SocialLink {
  type:
    | 'website'
    | 'email'
    | 'github'
    | 'linkedin'
    | 'mastodon'
    | 'bluesky'
    | 'x'
    | 'youtube'
    | 'other';
  uri: string;
  label?: string;
}

/** An `authorNormalized`-shaped record. */
export interface AuthorNormalized {
  id: string;
  displayName: string;
  biography: string;
  pronouns?: string;
  avatar?: ResolvedFileRef;
  links: SocialLink[];
  localized: unknown[];
  sourcePath: string;
  sourceDigest: string;
}

/** The subset of `publicationNormalized` this renderer reads. */
export interface PublicationNormalized {
  id: string;
  slug: string;
  title: string;
  description: string;
  canonicalBase: string;
  defaultLanguage: string;
  authorIds: string[];
  contactAuthorId?: string;
  socialLinks: unknown[];
  defaultImage?: ResolvedFileRef;
  profile?: { route: string; body: RenderableBody };
  footerCard?: {
    enabled: boolean;
    heading: string;
    body: RenderableBody;
    authorIds: string[];
  };
  sourcePath: string;
  sourceDigest: string;
}

/** A `navigationItem`/`navigationLeaf`-shaped entry (leaves never carry
 * children per the `navigation:2.0.0` schema's own `maxItems: 0` on a leaf's
 * `children`, but this renderer only reads `children.length`/iterates it, so
 * one recursive type is sufficient here). */
export interface NavigationItem {
  type: 'internal' | 'external';
  label: string;
  route?: string;
  url?: string;
  children: NavigationItem[];
}

/** The subset of `navigationNormalized` this renderer reads. */
export interface NavigationNormalized {
  items: NavigationItem[];
  footerItems: NavigationItem[];
  source: NormalizedSource;
}

/** The subset of `appearanceNormalized` this renderer reads. */
export interface AppearanceNormalized {
  theme: string;
  colorMode: unknown;
  brandMark?: ResolvedFileRef;
  wordmark?: ResolvedFileRef;
  headerComposition: string;
  footerComposition: string;
  typeScale: string;
  fontAssets: ResolvedFileRef[];
  tokens: Record<string, never>;
  source: NormalizedSource;
}

/** The subset of `build-input:2.0.0` this renderer reads. */
export interface NormalizedBuildInput {
  schemaId: string;
  schemaVersion: string;
  contractVersion: string;
  repository: {
    repositoryId: string;
    repositoryOwnerId: string;
    sourceRevision: string;
    rootDigest: string;
  };
  sourceRevision: string;
  packages: {
    schemas: PackageIdentity;
    template: PackageIdentity;
    theme: PackageIdentity;
    publisher: PackageIdentity[];
    dependencies: PackageIdentity[];
  };
  publication: PublicationNormalized;
  authors: AuthorNormalized[];
  content: ContentBuildRecord[];
  navigation: NavigationNormalized;
  appearance: AppearanceNormalized;
  modules: Record<string, never>;
  buildEpoch: string;
  baseUrl: string;
  basePath: string;
  destinationCapabilities: unknown;
  placements: never[];
  inputDigest: string;
}

/** A `buildToolIdentity`-shaped entry. */
export type BuildToolIdentity =
  | { kind: 'runtime'; name: 'node' | 'npm'; version: string; digest: string }
  | { kind: 'package'; package: string; version: string; digest: string };

/** A `manifestRoute`-shaped entry this renderer emits. */
export interface ManifestRouteEntry {
  path: string;
  mediaType: string;
  byteLength: string;
  sha256: string;
  routeClass: 'html' | 'feed' | 'sitemap' | 'asset' | 'error';
  interactionBearing: false;
}

/** A `manifestAsset`-shaped entry (S2-T05's media pipeline emits one per generated file). */
export interface ManifestAssetEntry {
  path: string;
  mediaType: string;
  byteLength: string;
  sha256: string;
  immutable: boolean;
}

/** A `manifestRedirect`-shaped entry. */
export interface ManifestRedirectEntry {
  sourceRoute: string;
  targetRoute: string;
  status: 200;
  backingPath: string;
  sha256: string;
}

/** A `manifestIncludedSource`-shaped entry. */
export interface ManifestIncludedSourceEntry {
  path: string;
  sha256: string;
  sourceRevision: string;
  role:
    | 'publication'
    | 'author'
    | 'content'
    | 'navigation'
    | 'appearance'
    | 'asset';
}

/** A `manifestExcludedInput`-shaped entry. */
export interface ManifestExcludedInputEntry {
  path: string;
  sha256: string;
  ruleId: string;
  reason:
    | 'not-referenced-by-build-input'
    | 'deferred-capability-absent'
    | 'non-artifact-source'
    | 'policy-excluded';
}

/**
 * Provenance facts the renderer cannot derive from `build-input` alone (see
 * `src/core/manifest.js` module documentation). Supplied by the caller
 * (eventually `publish-kernel`/`publish-action`, S2-T15 through S2-T20).
 */
export interface RenderProvenance {
  builder: PackageIdentity;
  repositoryCoordinate: string;
  workflowIdentity: string;
  buildToolVersions: BuildToolIdentity[];
  additionalExcludedInputs?: ManifestExcludedInputEntry[];
}

/** Options accepted by `renderPublication`. */
export interface RenderOptions {
  outputDirectory: string;
  workDirectory: string;
  /**
   * The caller-mounted, read-only repository source tree that
   * `build-input`'s `resolvedFile` references (images, fonts) point into
   * (S2-T05). Must be distinct from `outputDirectory` and `workDirectory`.
   */
  sourceDirectory: string;
  /**
   * An optional caller-mounted, read-only extracted theme package directory
   * (S2-T12: `internal/theme-assets.js`). When supplied, its `theme.json`
   * declared stylesheets (and any declared passive assets) are copied into
   * `assets/theme/` and linked from every generated page. Must be distinct
   * from `outputDirectory`, `workDirectory` and `sourceDirectory`.
   */
  themeDirectory?: string;
  routeNormalizationProfile?: 'directory-index' | 'explicit-file';
  provenance: RenderProvenance;
}

export declare function renderPublication(
  buildInput: unknown,
  options: RenderOptions,
): Promise<{ outputDirectory: string; manifest: Record<string, unknown> }>;

export declare class BuildInputValidationError extends Error {
  diagnostics: ReadonlyArray<Record<string, unknown>>;
  constructor(diagnostics: ReadonlyArray<Record<string, unknown>>);
}

export declare class RenderOptionsError extends Error {
  constructor(message: string);
}

export declare class ArtifactManifestValidationError extends Error {
  diagnostics: ReadonlyArray<Record<string, unknown>>;
  constructor(diagnostics: ReadonlyArray<Record<string, unknown>>);
}

export declare class MediaPipelineError extends Error {
  reasonCode: string;
  referencePath: string;
  constructor(reasonCode: string, message: string, referencePath: string);
}

export declare class RenderPolicyViolationError extends Error {
  constructor(message: string);
}

/**
 * The upstream normalization step: run one authored Markdown source string
 * through the render-policy pipeline (markdown-it -> sanitize-html ->
 * highlighter) and return the exact `renderableBody.body`/`bodyDigest` pair
 * a `build-input:2.0.0` producer places into a `renderableBody`.
 * `renderPublication` never calls this itself; see
 * `src/core/internal/content-security.js`'s module documentation.
 */
export declare function normalizeAuthoredMarkdown(markdownSource: string): {
  html: string;
  bodyDigest: string;
};

/** A plain (not domain-separated) tagged SHA-256 digest of a body's exact UTF-8 bytes. */
export declare function computeBodyDigest(html: string): string;

/**
 * The current published `renderPolicyIdentity`
 * (`{name, version, digest}`) every `renderableBody.renderPolicy` must
 * byte-equal, computed from the published `contracts/render-policy.jcs`
 * file. A consumer that needs to construct or verify a `renderableBody`
 * ahead of calling `renderPublication` can compute this identity without
 * reaching into `src/core/internal/`.
 */
export declare function computeRenderPolicyIdentity(): Promise<{
  name: string;
  version: string;
  digest: string;
}>;
