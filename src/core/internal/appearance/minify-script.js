/**
 * A deliberately small, dependency-free, safe minifier for the one site
 * script: it removes comments and indentation and drops blank lines. It
 * never renames, reorders or joins statements, and it keeps every newline
 * that remains, so automatic semicolon insertion behaves exactly as in the
 * readable source. String literals and regular-expression literals are
 * copied byte for byte.
 */

/**
 * @param {string} previous the last non-whitespace character already
 *   emitted ('' at the start of the source)
 * @returns {boolean} whether a `/` here starts a regular-expression literal
 *   (rather than a division)
 */
function regexAllowed(previous) {
  return previous === '' || '(,=:[!&|?{};+-*%<>~^'.includes(previous);
}

/**
 * @param {string} source readable JavaScript source (no template literals)
 * @returns {string} the same program without comments, indentation or blank
 *   lines
 */
export function minifyScript(source) {
  let out = '';
  let previous = '';
  let index = 0;
  const length = source.length;
  while (index < length) {
    const character = source[index];
    const next = source[index + 1];
    if (character === "'" || character === '"') {
      let end = index + 1;
      while (end < length && source[end] !== character) {
        end += source[end] === '\\' ? 2 : 1;
      }
      out += source.slice(index, end + 1);
      previous = character;
      index = end + 1;
    } else if (character === '/' && next === '/') {
      while (index < length && source[index] !== '\n') index += 1;
    } else if (character === '/' && next === '*') {
      const end = source.indexOf('*/', index + 2);
      index = end === -1 ? length : end + 2;
    } else if (character === '/' && regexAllowed(previous)) {
      let end = index + 1;
      let inClass = false;
      while (end < length && (inClass || source[end] !== '/')) {
        if (source[end] === '\\') end += 1;
        else if (source[end] === '[') inClass = true;
        else if (source[end] === ']') inClass = false;
        end += 1;
      }
      out += source.slice(index, end + 1);
      previous = '/';
      index = end + 1;
    } else {
      out += character;
      if (!/\s/.test(character)) previous = character;
      index += 1;
    }
  }
  return `${out
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .join('\n')}\n`;
}
