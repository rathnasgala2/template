import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

test('release workflow validates the gate, refuses version reuse and publishes with provenance', async () => {
  // Generation 4 had turned the release into a source-only artifact upload;
  // consumers pin against the registry, so the release publishes, and only
  // after the complete gate.
  const source = await readFile('.github/workflows/release.yaml', 'utf8');
  const at = (/** @type {RegExp} */ pattern) => source.search(pattern);

  assert.match(source, /workflow_dispatch/u);
  assert.match(
    source,
    /name: Validate and publish the declared package version/u,
  );
  assert.match(source, /environment: npm/u);
  assert.match(source, /id-token: write/u);
  assert.match(source, /registry-url: https:\/\/registry\.npmjs\.org/u);
  assert.match(source, /npm publish --access public --provenance/u);
  const order = [
    /Run the complete release gate/u,
    /npm pack --dry-run/u,
    /npm view "\$\{package_name\}@\$\{package_version\}"/u,
    /npm publish --access public --provenance/u,
  ].map(at);
  assert.ok(
    order.every((index) => index >= 0),
    'every step must exist',
  );
  assert.deepEqual(
    order,
    [...order].sort((a, b) => a - b),
  );
  assert.equal(/NODE_AUTH_TOKEN|upload-artifact/u.test(source), false);
});
