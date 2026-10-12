/**
 * The renderer's own published version, the single constant both the public
 * `TEMPLATE_PACKAGE_VERSION` export and theme `templateRange` admission read.
 * It is deliberately separate from the styling contract's
 * `templateVersion` (`appearance/styling-contract.js`), which records the
 * version the contract was published at and is part of the contract digest:
 * a renderer release that does not change the contract keeps that digest.
 *
 * @type {string}
 */
export const TEMPLATE_RENDERER_VERSION = '4.1.0';
