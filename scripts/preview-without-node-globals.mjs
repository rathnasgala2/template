/**
 * Child process for `test/preview-browser-runtime.test.js`: renders an article
 * preview and a home preview with the Node-only globals removed, as a browser has none of them.
 * The entry and its message catalogs are loaded first: a few third-party
 * packages (for example `picocolors`, under `postcss`) read `process` when
 * they load and rely on a bundler to select their `browser` build, which this
 * test has no bundler to do; everything the render itself runs is checked.
 * Reads a
 * JSON `{input, homeInput, options}` from the file named by the first argument and writes
 * the result as JSON to stdout, both captured before the globals go.
 */

import { readFileSync } from 'node:fs';

const [, , requestFile, previewUrl] = process.argv;
const request = JSON.parse(readFileSync(requestFile, 'utf8'));
const write = process.stdout.write.bind(process.stdout);

const preview = await import(previewUrl);
const getMessages = await preview.loadMessagesFor(
  preview.previewLanguages(request.input),
);
for (const name of ['process', 'Buffer', 'global', 'require', 'module']) {
  delete globalThis[name];
}
const present = ['process', 'Buffer', 'global', 'require'].filter(
  (name) => name in globalThis,
);
if (present.length > 0) {
  throw new Error(`could not remove ${present.join(', ')}`);
}

const withMessages = { ...request.options, getMessages };
const result = preview.renderArticlePreview(request.input, withMessages);
const home = preview.renderHomePreview(request.homeInput, withMessages);
write(
  JSON.stringify({
    ...result,
    home,
    removed: ['process', 'Buffer', 'global'],
  }),
);
