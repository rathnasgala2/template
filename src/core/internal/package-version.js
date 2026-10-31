/**
 * The renderer's own published version, the single constant both the public
 * `TEMPLATE_PACKAGE_VERSION` export and theme `templateRange` admission read.
 * It is deliberately separate from the styling contract's
 * `templateVersion` (`appearance/styling-contract.js`), which records the
 * version the contract was published at and is part of the contract digest:
 * a renderer release that does not change the contract keeps that digest.
 * `test/pinned-versions.test.js` keeps it equal to `package.json`'s `version`.
 * The contract's `templateVersion` is the version that introduced the current
 * contract and stays put through patch releases until the hook catalog changes
 * again, so a theme's `templateRange` is `^` that value, never `^` this one,
 * and the test asserts only that this version satisfies it (same major,
 * greater than or equal), not equality.
 *
 * @type {string}
 */
export const TEMPLATE_RENDERER_VERSION = '4.10.0';
