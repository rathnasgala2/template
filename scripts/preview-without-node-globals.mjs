/**
 * Child process for `test/preview-browser-runtime.test.js`: renders an article
 * preview, a page preview, a home preview, a language section home, a profile
 * page and a policy page with the Node-only globals removed, as a browser has
 * none of them.
 * The entry and its message catalogs are loaded first: a few third-party
 * packages (for example `picocolors`, under `postcss`) read `process` when
 * they load and rely on a bundler to select their `browser` build, which this
 * test has no bundler to do; everything the render itself runs is checked.
 * Reads a
 * JSON `{input, homeInput, pageInput, profileInput, policyInput, options}` from the file named by the first argument and writes
 * the result as JSON to stdout, both captured before the globals go.
 */

import { readFileSync } from 'node:fs';

const [, , requestFile, previewUrl] = process.argv;
const request = JSON.parse(readFileSync(requestFile, 'utf8'));
const write = process.stdout.write.bind(process.stdout);

const preview = await import(previewUrl);
const getMessages = await preview.loadMessagesFor([
  ...new Set(
    [
      request.input,
      request.homeInput,
      request.pageInput,
      request.profileInput,
      request.policyInput,
    ].flatMap((input) => preview.previewLanguages(input)),
  ),
]);
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
const page = preview.renderContentPreview(request.pageInput, withMessages);
const section = preview.renderHomePreview(request.homeInput, {
  ...withMessages,
  language: 'ta',
});
const profile = preview.renderProfilePreview(
  request.profileInput,
  withMessages,
);
const policy = preview.renderPolicyPreview(
  request.policyInput,
  { page: 'terms' },
  withMessages,
);
write(
  JSON.stringify({
    ...result,
    home,
    page,
    section,
    profile,
    policy,
    removed: ['process', 'Buffer', 'global'],
  }),
);
