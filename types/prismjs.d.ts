/**
 * Minimal ambient typing for the parts of `prismjs` the highlighter uses.
 * Prism ships no declarations; this stays narrow rather than re-authoring its API.
 */
declare module 'prismjs' {
  const Prism: {
    languages: Record<string, unknown>;
    highlight(code: string, grammar: unknown, language: string): string;
  };
  export default Prism;
}
