/**
 * Types for `@rathnasgala2/template/preview`, the browser entry point that
 * renders one page of a publication (any content kind, the home page or a
 * language section home, the profile page, Terms or Privacy) from an
 * in-memory input.
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
  /**
   * Used verbatim as `src`. Interactive previews allow `img-src data:` only,
   * so pass a `data:` URL there; other previews load any URL the frame can.
   */
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
        /** The `gala/theme-pages/contact.md` intro; absent shows the default sentence. */
        intro?: PreviewBody;
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

/**
 * One content record of any kind. `post.frontmatter.kind` (default
 * `article`) picks the layout, as in the build. An `edition` needs its
 * original article among `siblings` (and any sibling editions).
 */
export interface ContentPreviewInput extends PreviewSiteInput {
  post: PreviewPost;
  /** The other posts of the publication (any order). */
  siblings?: readonly PreviewSibling[];
}

/** The input of the article-only name; the same shape as `ContentPreviewInput`. */
export type ArticlePreviewInput = ContentPreviewInput;

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
 * The profile (About) page's input: the site sections and the page body. The
 * App edits it in Settings; `route` is `publication.profile.route`. `posts`
 * is optional: pass the publication's posts when it has language variants, so
 * the page shows the language switcher it shows in the build.
 */
export interface ProfilePreviewInput extends PreviewSiteInput {
  profile: { route: string; body: PreviewBody };
  posts?: readonly PreviewSibling[];
}

/**
 * The Terms and Privacy pages' input: the site sections and, when the author
 * wrote them, both pages' text (`build-input.policies`). Without `policies`
 * the shipped default text renders, as the build does. The template adds its
 * own Galascribe section to both. `posts` as in `ProfilePreviewInput`.
 */
export interface PolicyPreviewInput extends PreviewSiteInput {
  policies?: {
    terms: { title: string; body: PreviewBody };
    privacy: { title: string; body: PreviewBody };
  };
  posts?: readonly PreviewSibling[];
}

/**
 * The contact page's input: the site sections with
 * `publication.contactForm.enabled` true (the page exists only then) and the
 * optional intro. `posts` as in `ProfilePreviewInput`.
 */
export interface ContactPreviewInput extends PreviewSiteInput {
  posts?: readonly PreviewSibling[];
}

/**
 * Interactive mode (`ArticlePreviewDifferences.interactive`): the built page's
 * own scripts run inside the App's sandboxed frame
 * (`<iframe sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
 * srcdoc=... allow="clipboard-write">`, no `allow-same-origin`, no
 * `allow-forms`). The template builds the Content-Security-Policy itself, so
 * it cannot be combined with `omitScripts`, `inertLinks`,
 * `contentSecurityPolicy` or `inlineStyles: false` (`PreviewInputError`).
 */
export interface InteractivePreview {
  /**
   * The API origin the page's scripts read from (production
   * `https://api.galascribe.com`). Only `GET` of its `/v2/public/` paths ever
   * reach the network (no credentials); every other request is simulated
   * inside the frame and shows "Preview only. Nothing was saved.". It is also
   * the policy's `connect-src`.
   */
  apiOrigin: string;
  /**
   * Where the published site lives, once it is. Links to the site open there
   * in a new tab and Listen audio plays from it (the policy's `media-src`).
   * Null or absent: links show "This page isn't published yet" and audio shows
   * "Audio plays once this post is published".
   */
  liveBaseUrl?: string | null;
  /**
   * Scroll position to restore once, after fonts and images settle. The frame
   * posts `{type: 'gala-preview-scroll', y}` to its parent (about every
   * 100 ms while scrolling, `targetOrigin` `'*'`); the parent must check
   * `event.source` is its frame, keep `y` and pass it back here on the next
   * render.
   */
  scrollY?: number;
  /**
   * Who is looking. `'reader'` (default) is a signed-in "Preview reader"
   * (a seeded in-memory session), so likes, comments and Follow work locally.
   * `'visitor'` is anonymous: likes and Follow start sign-in, which toasts
   * "Sign-in isn't available in the preview".
   */
  viewer?: 'reader' | 'visitor';
}

/**
 * The only differences from the built page, each applied only when set.
 * (a) `inlineStyles`: the base, theme and palette `<link rel="stylesheet">`
 * elements become inline `<style data-gala-preview-style>` elements, without
 * Subresource Integrity. (b) `omitScripts`: every `<script>` element is
 * removed. (c) `contentSecurityPolicy`: the CSP `<meta>` carries this policy.
 * (d) `inertLinks`: every `<a>` loses its `href` and gets `tabindex="-1"`.
 * (e) `colorMode`: the root's resolved colour mode is fixed (in interactive
 * mode also the stored selection, so the page's script keeps it).
 * (f) `interactive`: see {@link InteractivePreview}. The page's
 * `assets/gala-*.js` scripts become inline scripts with exactly the built
 * file's text (the appearance bootstrap in place, the deferred ones at the end
 * of `<body>`, in order), a template-owned runtime and its data come first in
 * `<head>`, the stylesheets are inlined as in (a), and the policy lists those
 * inline scripts by SHA-256 hash.
 */
export interface ArticlePreviewDifferences {
  inlineStyles?: boolean;
  omitScripts?: boolean;
  contentSecurityPolicy?: string;
  inertLinks?: boolean;
  colorMode?: 'light' | 'dark';
  interactive?: InteractivePreview;
}

export interface ArticlePreviewOptions {
  /** The chrome catalogs; see `loadMessagesFor` and `previewLanguages`. */
  getMessages: GetMessages;
  /** Default `directory-index`, as in `renderPublication`. */
  routeNormalizationProfile?: 'directory-index' | 'explicit-file';
  preview?: ArticlePreviewDifferences;
}

/** Options of `renderHomePreview`. */
export interface HomePreviewOptions extends ArticlePreviewOptions {
  /**
   * Render the section home of this non-default language (page 1, at
   * `/<segment>`, e.g. `/ta`) instead of `/`. The language must have a
   * published article, and the site must have a `translationOf` variant
   * (the build makes no section home otherwise): else `PreviewInputError`.
   */
  language?: string;
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

/**
 * Render one content record of any kind (article, page, edition) with its
 * own layout. Synchronous; throws `PreviewInputError`.
 */
export function renderContentPreview(
  input: ContentPreviewInput,
  options: ArticlePreviewOptions,
): ArticlePreviewResult;

/**
 * Alias of `renderContentPreview` (the same function, kept so existing
 * callers keep working; not deprecated). Before 4.13.0 it accepted articles
 * only; it now renders any kind.
 */
export const renderArticlePreview: typeof renderContentPreview;

/**
 * Render the site's home page (route `/`, page 1 of the listing), or with
 * `options.language` that language's section home, by the code the build
 * renders it with. Synchronous; throws `PreviewInputError`.
 */
export function renderHomePreview(
  input: HomePreviewInput,
  options: HomePreviewOptions,
): ArticlePreviewResult;

/** Render the profile (About) page. Synchronous; throws `PreviewInputError`. */
export function renderProfilePreview(
  input: ProfilePreviewInput,
  options: ArticlePreviewOptions,
): ArticlePreviewResult;

/**
 * Render the Contact page (`/contact`): the optional intro and the form. Only
 * while `publication.contactForm.enabled` is true, else `PreviewInputError`.
 * Synchronous.
 */
export function renderContactPreview(
  input: ContactPreviewInput,
  options: ArticlePreviewOptions,
): ArticlePreviewResult;

/**
 * Render the Terms or the Privacy page, the template-owned Galascribe section
 * included. Synchronous; throws `PreviewInputError`.
 */
export function renderPolicyPreview(
  input: PolicyPreviewInput,
  which: { page: 'terms' | 'privacy' },
  options: ArticlePreviewOptions,
): ArticlePreviewResult;

/** Tags to pass to `loadMessagesFor` for this input. */
export function previewLanguages(
  input:
    | ContentPreviewInput
    | HomePreviewInput
    | ProfilePreviewInput
    | PolicyPreviewInput
    | ContactPreviewInput,
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
