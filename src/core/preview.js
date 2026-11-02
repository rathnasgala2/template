/**
 * `@rathnasgala2/template/preview`: the browser entry point. It renders the
 * real page of a draft (an article, page or edition), the home page or a
 * language section home, the profile page, or the contact page, or a Terms or Privacy page (the
 * code `renderPublication` uses, for one page) from an in-memory input, with
 * no file access, no media pipeline and no schema validator, so it runs in a
 * browser bundle. Types: `types/preview.d.ts`.
 */

export {
  BASE_LAYER_CSS,
  PreviewInputError,
  buildPaletteCss,
  previewLanguages,
  renderArticlePreview,
  renderContactPreview,
  renderContentPreview,
  renderHomePreview,
  renderPolicyPreview,
  renderProfilePreview,
} from './internal/article-preview.js';
export { normalizeAuthoredMarkdown } from './internal/content-security.js';
export { loadMessagesFor } from './internal/messages-load.js';
export { TEMPLATE_RENDERER_VERSION } from './internal/package-version.js';
