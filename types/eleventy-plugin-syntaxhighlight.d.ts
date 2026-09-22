/**
 * Minimal ambient typing for the one internal helper
 * `src/core/internal/content-security.js` calls directly:
 * `@11ty/eleventy-plugin-syntaxhighlight`'s markdown-it `highlight` option
 * factory. The package ships no published type declarations, publishes no
 * `exports` map (so this deep import path is a plain, resolvable file), and
 * this typing is deliberately narrow rather than a full re-authoring of its
 * API.
 */
declare module '@11ty/eleventy-plugin-syntaxhighlight/src/markdownSyntaxHighlightOptions.js' {
  export interface MarkdownSyntaxHighlightOptions {
    lineSeparator?: string;
    alwaysWrapLineHighlights?: boolean;
    preAttributes?: Record<string, unknown>;
    codeAttributes?: Record<string, unknown>;
  }

  export type MarkdownItHighlightFn = (
    code: string,
    language: string,
  ) => string;

  export default function markdownSyntaxHighlightOptions(
    options?: MarkdownSyntaxHighlightOptions,
  ): MarkdownItHighlightFn;
}
