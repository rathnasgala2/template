import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { canonicalizeJcs } from '../scripts/jcs.mjs';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const CONTRACT_FILES = [
  'contracts/render-policy.jcs',
  'contracts/theme-styling-contract.jcs',
];

for (const relativePath of CONTRACT_FILES) {
  test(`${relativePath} exists, is UTF-8 with no BOM, and is compact canonical JSON`, async () => {
    const filePath = path.join(REPO_ROOT, relativePath);
    const bytes = await readFile(filePath);
    assert.ok(bytes.length > 0, `${relativePath}: must not be empty`);
    assert.ok(
      !(bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf),
      `${relativePath}: must not carry a UTF-8 BOM`,
    );

    const text = bytes.toString('utf8');
    let parsed;
    assert.doesNotThrow(() => {
      parsed = JSON.parse(text);
    }, `${relativePath}: must be valid JSON`);

    const canonical = canonicalizeJcs(parsed);
    assert.equal(
      text,
      canonical,
      `${relativePath}: bytes must equal a fresh RFC 8785 canonicalization (no insignificant whitespace, sorted keys)`,
    );
  });
}

test("contracts/render-policy.jcs is S2-T04's real, closed sanitizer/parser catalog", async () => {
  const filePath = path.join(REPO_ROOT, 'contracts/render-policy.jcs');
  const document = JSON.parse(await readFile(filePath, 'utf8'));
  assert.equal(document.name, 'gala-render-policy');
  assert.equal(document.version, '2.0.0');
  assert.equal(document.self, undefined, 'the document carries no self-digest');
  assert.equal(
    document.digest,
    undefined,
    'the document carries no self-digest',
  );
  assert.equal(
    document.contentSecurityPolicy,
    "default-src 'none'; base-uri 'none'; object-src 'none'; " +
      "frame-ancestors 'none'; form-action 'none'; script-src 'self'; " +
      "style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; " +
      "media-src 'self'; manifest-src 'self'; worker-src 'none'",
  );
  assert.deepEqual(document.markdownIt.options, {
    html: false,
    linkify: false,
    typographer: false,
  });
  assert.equal(document.markdownIt.package, 'markdown-it');
  assert.equal(document.markdownIt.version, '14.3.1');
  assert.equal(document.sanitizer.package, 'sanitize-html');
  assert.equal(document.sanitizer.version, '2.17.7');
  assert.ok(document.sanitizer.allowedTags.includes('p'));
  assert.ok(!document.sanitizer.allowedTags.includes('script'));
  assert.ok(!document.sanitizer.allowedTags.includes('style'));
  assert.ok(!document.sanitizer.allowedTags.includes('svg'));
  assert.ok(!document.sanitizer.allowedTags.includes('iframe'));
  assert.deepEqual(document.sanitizer.allowedUrlSchemes, [
    'https',
    'http',
    'mailto',
  ]);
  assert.equal(
    document.highlighter.package,
    '@11ty/eleventy-plugin-syntaxhighlight',
  );
  assert.equal(document.highlighter.version, '5.0.2');
  assert.ok(document.highlighter.grammars.includes('javascript'));
  assert.ok(document.highlighter.tokenClasses.includes('token'));
});

test("contracts/theme-styling-contract.jcs is S2-T12's real, closed template styling catalog", async () => {
  const filePath = path.join(REPO_ROOT, 'contracts/theme-styling-contract.jcs');
  const document = JSON.parse(await readFile(filePath, 'utf8'));
  assert.equal(document.profile, 'gala-template-styling-contract-v2');
  assert.equal(document.contractVersion, '2.0.0');
  assert.equal(document.templatePackage, '@rathnasgala2/template');
  assert.deepEqual(document.orderedLayers, [
    'gala-tokens',
    'gala-components',
    'gala-utilities',
    'gala-print',
  ]);
  assert.equal(
    document.publicationRootSelector,
    '[data-gala-publication-root]',
  );
  assert.ok(document.catalogDigest.startsWith('sha256:'));
  assert.equal(document.publicThemeSlotHooks.length, 64);
});
