import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

test('release workflow validates and packages without npm publication authority', async () => {
  const source = await readFile('.github/workflows/release.yaml', 'utf8');

  assert.match(source, /name: Validate and package the declared version/u);
  assert.match(source, /npm pack --pack-destination dist/u);
  assert.match(
    source,
    /actions\/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a/u,
  );
  assert.equal(
    /npm publish|npm view|NODE_AUTH_TOKEN|id-token|environment:\s*npm/u.test(
      source,
    ),
    false,
  );
});
