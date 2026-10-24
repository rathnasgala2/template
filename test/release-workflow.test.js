import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

test('release workflow refuses version reuse before the gate, publishes with provenance and checks the registry copy', async () => {
  // Generation 4 had turned the release into a source-only artifact upload;
  // consumers pin against the registry, so the release publishes, and only
  // after the version-on-npm check (which fails a push that touched a packed
  // path without a new version, and never skips silently) and the complete
  // gate. After publishing, the registry tarball is compared with the pack.
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
  assert.match(
    source,
    /npm publish --access public --provenance --ignore-scripts/u,
  );
  assert.match(
    source,
    /is already published, but this run was triggered by a push/u,
  );
  const order = [
    /Fail unless this version is new on npm/u,
    /Check the CHANGELOG has an entry for this version/u,
    /npm ci --ignore-scripts/u,
    /Run the complete release gate/u,
    /npm pack --dry-run/u,
    /npm publish --access public --provenance/u,
    /Wait until the registry lists the version/u,
    /Record the registry digest/u,
  ].map(at);
  assert.ok(
    order.every((index) => index >= 0),
    'every step must exist',
  );
  assert.deepEqual(
    order,
    [...order].sort((a, b) => a - b),
  );
  assert.equal(
    /NODE_AUTH_TOKEN|upload-artifact|::notice::/u.test(source),
    false,
  );
});
