/**
 * Prism's own grammar files are plain scripts that extend the global
 * `Prism`. This module loads the Prism core and publishes it on
 * `globalThis` (Prism only does so itself when it finds `window` or Node's
 * `global`), so the grammar files `prism-grammars.js` imports next can
 * register against it in any ECMAScript host. ES module evaluation runs this
 * module to completion before the grammar files.
 */

import Prism from 'prismjs';

/** @type {any} */ (globalThis).Prism = Prism;

export default Prism;
