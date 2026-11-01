/**
 * The one module in this repository permitted to import `@11ty/eleventy`.
 * Every other module reaches rendered output only through
 * {@link renderPagesWithEleventy}'s plain-data return value: no Eleventy
 * instance, plug-in API, config object or Nunjucks environment crosses back
 * out of this module: no Eleventy object, plug-in API, config object or
 * Nunjucks environment may cross the adapter boundary in either direction.
 *
 * Confinement enforced here:
 * - `configPath: false` on the `Eleventy` constructor disables discovery of
 *   any `.eleventy.js`/`eleventy.config.*` file entirely (`TemplateConfig`
 *   treats an explicit falsy `configPath` as "skip config files" rather
 *   than searching `process.cwd()`), so nothing from an author repository
 *   or an ambient host directory is ever read as configuration.
 * - The only filesystem paths this module touches are the caller-supplied
 *   `inputDirectory` and `outputDirectory`, both required to be absolute
 *   paths under the caller's declared work/output roots.
 * - `eleventyConfig.setUseGitIgnore(false)` stops Eleventy from walking
 *   parent directories looking for a `.gitignore` to exclude files by.
 * - Every page is supplied as an in-memory virtual template
 *   (`eleventyConfig.addTemplate`) with `templateEngineOverride: false`, so
 *   author-authority body content is written verbatim and is never
 *   interpreted as Nunjucks/Liquid template syntax.
 * - `elev.write()` runs exactly one full build; this module never calls
 *   `.watch()` or constructs an incremental build, and never sets
 *   `runMode: "watch"`: incremental and watch mode cannot produce a
 *   releasable artifact.
 * - No plugin that performs network access is registered, and Eleventy's
 *   own default plugins (`HtmlBasePlugin`, `BundlePlugin`) perform no
 *   network access.
 */

import Eleventy from '@11ty/eleventy';

/**
 * @typedef {object} EleventyPage
 * @property {string} virtualPath a unique virtual input path (arbitrary,
 *   never read from any real filesystem location)
 * @property {string} content the exact output bytes for this page (a
 *   complete HTML document from `document-shell.js`, or a raw XML/JSON/text
 *   file)
 * @property {string} permalink the output-directory-relative file path,
 *   already normalized (no leading slash)
 */

/**
 * Render every supplied page through a fully confined, single-pass,
 * programmatic Eleventy 3.1.6 build.
 *
 * @param {object} options render options
 * @param {readonly EleventyPage[]} options.pages pages to emit, already
 *   carrying their final output-relative permalink
 * @param {string} options.inputDirectory an absolute, empty-or-caller-owned
 *   directory Eleventy may treat as its input root (nothing is written into
 *   it; every page is an in-memory virtual template)
 * @param {string} options.outputDirectory an absolute directory Eleventy
 *   writes the candidate publication into
 * @returns {Promise<void>} resolves once the single build pass completes
 */
export async function renderPagesWithEleventy({
  pages,
  inputDirectory,
  outputDirectory,
}) {
  const { mkdir } = await import('node:fs/promises');
  const path = await import('node:path');

  await mkdir(inputDirectory, { recursive: true });

  // Eleventy turns every input path into a path relative to `process.cwd()`
  // with a bare string `startsWith` and no path-boundary check
  // (`TemplatePath.stripLeadingSubPath`, `@11ty/eleventy-utils`). An absolute
  // `inputDirectory` that merely shares a string prefix with the working
  // directory (cwd `/x/site`, input `/x/site-work/input`) is cut to
  // `work/input/...`, the dependency-graph node names then match no template
  // map entry, and the build fails with `entry._pages is not iterable` for
  // that cwd and work-directory spelling only. Handing Eleventy the path
  // already relative to the working directory (`../site-work/input`, or
  // `.gala/work/input` when inside it) leaves it nothing to cut, and the
  // output bytes do not depend on where the process was started.
  const eleventyInput = path.relative(process.cwd(), inputDirectory) || '.';

  const eleventy = new Eleventy(eleventyInput, outputDirectory, {
    source: 'script',
    runMode: 'build',
    dryRun: false,
    quietMode: true,
    // Explicit falsy configPath: skip .eleventy.js/eleventy.config.*
    // discovery entirely rather than searching process.cwd().
    configPath: false,
    config(eleventyConfig) {
      eleventyConfig.setUseGitIgnore(false);
      eleventyConfig.setQuietMode(true);
      eleventyConfig.setDataDeepMerge(false);
      // Every page's data arrives through `addTemplate`'s options, never as
      // front matter in its content, and a generated Markdown file starts with
      // its own `---` fence. Moving the delimiter somewhere no document starts
      // keeps Eleventy from reading that fence as page data.
      eleventyConfig.setFrontMatterParsingOptions({
        delimiters: '<!--gala-eleventy-front-matter-->',
      });

      for (const page of pages) {
        eleventyConfig.addTemplate(page.virtualPath, page.content, {
          permalink: page.permalink,
          templateEngineOverride: false,
        });
      }
    },
  });

  // Eleventy's "Wrote N files" summary is logged with `force: true`
  // regardless of quiet mode (its own `logFinished()` caller intentionally
  // bypasses verbosity). `disableLogger()` is Eleventy's own documented
  // escape hatch for that: it marks the console logger disabled so this
  // library call produces no stdout/stderr output of its own; the caller
  // decides what, if anything, to report.
  eleventy.disableLogger();

  await eleventy.write();
}
