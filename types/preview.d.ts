/**
 * Types for `@rathnasgala2/template/preview`, the browser entry point that
 * renders one article page, or the home page, of a publication from an in-memory input.
 */

import type {
  AppearanceNormalized,
  AuthorNormalized,
  ContentFrontmatterNormalized,
  InteractionsModule,
  NavigationItem,
  PublicationNormalized,
  ResolvedMediaRef,
} from './index.js';

/** A message lookup: `loadMessagesFor(previewLanguages(input))` returns one. */
export type GetMessages = (
  bcp47?: string,
) => Record<string, string | ((...args: string[]) => string)>;

/** One image the caller has already resolved (the media pipeline does not run). */
export interface PreviewImage {
  /** Used verbatim as `src`: a `data:` or `blob:` URL, or any URL the iframe can load. */
  url: string;
  /** Intrinsic width in pixels (reserves the image's space). */
  width: number;
  /** Intrinsic height in pixels. */
  height: number;
  /** Media type; default `image/png`. */
  mediaType?:
    'image/png' | 'image/jpeg' | 'image/webp' | 'image/avif' | 'image/gif';
  /** Responsive files, ascending width, for `srcset` of body images (default: the image alone). */
  variants?: readonly { url: string; width: number; height: number }[];
  /** Optional source digest; default is a digest of the repository path. */
  sourceDigest?: string;
}

/** A reference to an image by repository path (looked up in `media`). */
export interface PreviewFileRef {
  path: string;
}

/** A body, as Markdown the entry normalizes or as already-normalized HTML. */
export type PreviewBody = { markdown: string } | { html: string };

export type PreviewFrontmatter = Omit<
  ContentFrontmatterNormalized,
  | 'kind'
  | 'status'
  | 'tags'
  | 'redirects'
  | 'createdAt'
  | 'hero'
  | 'socialImage'
> &
  Partial<
    Pick<
      ContentFrontmatterNormalized,
      'kind' | 'status' | 'tags' | 'redirects' | 'createdAt'
    >
  > & {
    hero?: Omit<ResolvedMediaRef, 'file'> & { file: PreviewFileRef };
    socialImage?: PreviewFileRef;
  };

/** The post being previewed. Exactly one of `markdown` and `bodyHtml`. */
export interface PreviewPost {
  frontmatter: PreviewFrontmatter;
  /** Authored Markdown; normalized with the render policy (Prism included). */
  markdown?: string;
  /** Already policy-normalized HTML (output of `normalizeAuthoredMarkdown`). */
  bodyHtml?: string;
}

/** Another post of the publication; its card, pager, series and tag entries use it. */
export interface PreviewSibling {
  frontmatter: PreviewFrontmatter;
  /** Normalized HTML; cards derive the excerpt and reading time from it. */
  bodyHtml?: string;
  markdown?: string;
}

export interface PreviewTheme {
  /** The parsed `theme.json` (needs `composition`, `palette`, `tokens`, `stylesheets`). */
  themeJson: Record<string, unknown>;
  /** The declared stylesheets, in `themeJson.stylesheets` order. */
  stylesheets: readonly {
    filename: string;
    /** Path under the theme (default: `filename`); names the sheet in `href`. */
    relativePath?: string;
    css: string | Uint8Array;
  }[];
}

/** The site sections both renderers read. */
export interface PreviewSiteInput {
  publication: Omit<
    PublicationNormalized,
    | 'slug'
    | 'canonicalBase'
    | 'description'
    | 'authorIds'
    | 'socialLinks'
    | 'sourcePath'
    | 'sourceDigest'
    | 'profile'
    | 'footerCard'
    | 'contactForm'
    | 'defaultImage'
  > &
    Partial<
      Pick<
        PublicationNormalized,
        'slug' | 'canonicalBase' | 'description' | 'authorIds' | 'socialLinks'
      >
    > & {
      defaultImage?: PreviewFileRef;
      contactForm?: {
        enabled: boolean;
        fields: { website: boolean; phone: boolean };
      };
      footerCard?: {
        enabled: boolean;
        heading: string;
        body: PreviewBody;
        authorIds?: string[];
      };
    };
  authors: readonly (Omit<
    AuthorNormalized,
    | 'biography'
    | 'links'
    | 'localized'
    | 'sourcePath'
    | 'sourceDigest'
    | 'avatar'
  > &
    Partial<Pick<AuthorNormalized, 'biography' | 'links' | 'localized'>> & {
      avatar?: PreviewFileRef;
    })[];
  navigation: { items: NavigationItem[]; footerItems?: NavigationItem[] };
  appearance: Pick<AppearanceNormalized, 'colorMode'> &
    Partial<Pick<AppearanceNormalized, 'attribution' | 'tokens'>> & {
      brandMark?: PreviewFileRef;
    };
  /** Optional modules the page reads: `interactions` and `analytics`. */
  modules?: { interactions?: InteractionsModule; analytics?: unknown };
  /** Absolute `http(s)` URL the site is served from. */
  baseUrl: string;
  /** Path the site is published under (`/` or `/blog`). */
  basePath: string;
  /** Images by repository path: body images, hero, social, avatars, brand mark, default image. */
  media?: Record<string, PreviewImage>;
  /** The selected theme. Without one the page has the base layer only. */
  theme?: PreviewTheme;
  /** The clock for `deleteDate`; default now. */
  buildEpoch?: string;
}

export interface ArticlePreviewInput extends PreviewSiteInput {
  post: PreviewPost;
  /** The other posts of the publication (any order). */
  siblings?: readonly PreviewSibling[];
}

/**
 * The home page's input: the site sections, and the posts it lists (the
 * publication's whole set of posts, any order; the page shows the featured
 * post, the latest cards and the first page of older ones, and resolves each
 * hero through `media`). Pagination follows `publication.listing.pageSize`.
 */
export interface HomePreviewInput extends PreviewSiteInput {
  posts: readonly PreviewSibling[];
}

/**
 * The only differences from the built page, each applied only when set.
 * (a) `inlineStyles`: the base, theme and palette `<link rel="stylesheet">`
 * elements become inline `<style data-gala-preview-style>` elements, without
 * Subresource Integrity. (b) `omitScripts`: every `<script>` element is
 * removed. (c) `contentSecurityPolicy`: the CSP `<meta>` carries this policy.
 * (d) `inertLinks`: every `<a>` loses its `href` and gets `tabindex="-1"`.
 * (e) `colorMode`: the root's resolved colour mode is fixed.
 */
export interface ArticlePreviewDifferences {
  inlineStyles?: boolean;
  omitScripts?: boolean;
  contentSecurityPolicy?: string;
  inertLinks?: boolean;
  colorMode?: 'light' | 'dark';
}

export interface ArticlePreviewOptions {
  /** The chrome catalogs; see `loadMessagesFor` and `previewLanguages`. */
  getMessages: GetMessages;
  /** Default `directory-index`, as in `renderPublication`. */
  routeNormalizationProfile?: 'directory-index' | 'explicit-file';
  preview?: ArticlePreviewDifferences;
}

export interface ArticlePreviewResult {
  /** The complete `<!doctype html>` document. */
  html: string;
  /** The document title. */
  title: string;
  /** The page's route under the site, as `renderPublication` would route it. */
  route: string;
  /** Images named but not supplied (the page shows its fallback). */
  warnings: string[];
}

export class PreviewInputError extends Error {
  readonly issues: readonly string[];
}

/** Render one article page. Synchronous; throws `PreviewInputError`. */
export function renderArticlePreview(
  input: ArticlePreviewInput,
  options: ArticlePreviewOptions,
): ArticlePreviewResult;

/**
 * Render the site's home page (route `/`, page 1 of the listing) by the code
 * the build renders it with. Synchronous; throws `PreviewInputError`.
 */
export function renderHomePreview(
  input: HomePreviewInput,
  options: ArticlePreviewOptions,
): ArticlePreviewResult;

/** Tags to pass to `loadMessagesFor` for this input. */
export function previewLanguages(
  input: ArticlePreviewInput | HomePreviewInput,
): string[];

/** Load `en` plus the catalogs these tags resolve to (each a separate chunk). */
export function loadMessagesFor(
  languages: readonly string[],
): Promise<GetMessages>;

/** The same normalizer the build pipeline uses: Markdown to policy-conformant HTML. */
export function normalizeAuthoredMarkdown(markdownSource: string): {
  html: string;
  bodyDigest: string;
};

/** This template version's base layer stylesheet, as a built site serves it. */
export const BASE_LAYER_CSS: string;

/** The publication palette sheet, byte-identical to the built `gala-palette-*.css`. */
export function buildPaletteCss(
  themeJson: Record<string, unknown>,
  appearanceTokens?: unknown,
): {
  css: string;
  fileName: string;
  canvas: { light: string; dark: string } | undefined;
};

export const TEMPLATE_RENDERER_VERSION: string;
