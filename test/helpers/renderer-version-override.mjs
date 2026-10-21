/**
 * A `node --import` preload that makes the renderer's own version
 * (`TEMPLATE_RENDERER_VERSION`, `src/core/internal/package-version.js`) read as
 * the value of `GALA_TEST_RENDERER_VERSION`, so a test can run the real
 * scaffold and theme-admission code under a hypothetical patch release without
 * touching `package.json` or any source file. It does nothing when the variable
 * is unset, which is also why `node --test` loading it as a plain file is safe.
 */

import { register } from 'node:module';

const HOOKS = `
let version;
export async function initialize(data) {
  version = data.version;
}
export async function load(url, context, nextLoad) {
  if (url.endsWith('/src/core/internal/package-version.js')) {
    return {
      format: 'module',
      shortCircuit: true,
      source: 'export const TEMPLATE_RENDERER_VERSION = ' + JSON.stringify(version) + ';',
    };
  }
  return nextLoad(url, context);
}
`;

const version = process.env.GALA_TEST_RENDERER_VERSION;
if (version) {
  register(`data:text/javascript,${encodeURIComponent(HOOKS)}`, {
    data: { version },
  });
}
