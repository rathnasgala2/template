/**
 * Invoke a script's `main` function only when the module is the process
 * entry point, so the same file is safely importable from tests.
 *
 * @param {ImportMeta} importMeta the importing module's `import.meta`
 * @param {() => (void | Promise<void>)} main the script body
 * @returns {void}
 */
export function runIfMain(importMeta, main) {
  const entry = process.argv[1];
  if (entry && importMeta.url === new URL(`file://${entry}`).href) {
    Promise.resolve(main()).catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
  }
}
