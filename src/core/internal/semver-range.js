/**
 * A closed subset of npm-compatible SemVer range satisfaction (TPL-H1), used
 * only to check a theme package's own declared `theme.json.templateRange`
 * against this renderer's published version. This is deliberately not a
 * general-purpose SemVer range engine: `@rathnasgala2/schemas`'
 * `theme-contract.schema.json` `templateRange` field (`$defs/semverRange`)
 * admits an open-ended npm range grammar, but every legitimate value this
 * closed-contract ecosystem actually emits is either an exact version or a
 * caret range — the same two forms `package.json` dependency pins in this
 * very repository use — so this module supports exactly those two forms and
 * fails closed (rejects) on anything else, exactly like every other closed
 * catalog in this repository (`nthExpressionProfile`, the pseudo-class
 * catalog, `functionalSelectorArguments`, ...).
 */

const EXACT_VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/;
const CARET_RANGE_PATTERN = /^\^(\d+)\.(\d+)\.(\d+)$/;

/**
 * @param {string} version a canonical `major.minor.patch` SemVer string
 * @returns {[number, number, number]} the parsed components
 */
function parseExactVersion(version) {
  const match = EXACT_VERSION_PATTERN.exec(version);
  if (!match) {
    throw new Error(`not a canonical major.minor.patch version: ${version}`);
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/**
 * @param {[number, number, number]} a
 * @param {[number, number, number]} b
 * @returns {number} negative, zero or positive per standard comparator
 *   contract
 */
function compareVersions(a, b) {
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

/**
 * Whether `version` satisfies `range`, supporting only an exact
 * `major.minor.patch` range (equality) or a caret range `^major.minor.patch`
 * (matches `>=major.minor.patch <(major+1).0.0`, or, for a `0.x.y` caret
 * range, npm's own tightened `0.x` semantics: `>=0.minor.patch <0.(minor+1).0`).
 *
 * @param {string} version this renderer's own exact published version
 * @param {string} range the theme's declared `templateRange`
 * @returns {boolean} whether `version` satisfies `range`
 * @throws {Error} when `range` is not one of the two closed forms this
 *   module admits
 */
export function satisfiesTemplateRange(version, range) {
  const parsedVersion = parseExactVersion(version);
  const exactMatch = EXACT_VERSION_PATTERN.exec(range);
  if (exactMatch) {
    return compareVersions(parsedVersion, parseExactVersion(range)) === 0;
  }
  const caretMatch = CARET_RANGE_PATTERN.exec(range);
  if (caretMatch) {
    const lower = /** @type {[number, number, number]} */ ([
      Number(caretMatch[1]),
      Number(caretMatch[2]),
      Number(caretMatch[3]),
    ]);
    if (compareVersions(parsedVersion, lower) < 0) return false;
    const [major, minor] = lower;
    if (major > 0) {
      return parsedVersion[0] === major;
    }
    if (minor > 0) {
      return parsedVersion[0] === 0 && parsedVersion[1] === minor;
    }
    // ^0.0.z: npm pins this to the exact patch version.
    return compareVersions(parsedVersion, lower) === 0;
  }
  throw new Error(
    `templateRange must be an exact "major.minor.patch" version or a ` +
      `"^major.minor.patch" caret range, got ${JSON.stringify(range)}`,
  );
}
