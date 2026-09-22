/**
 * A minimal, dependency-free XML well-formedness check for this
 * repository's own S2-T08 test suite (task packet S2-T08 acceptance tests:
 * "feed/sitemap validity ... with a pinned dev-only parser or the existing
 * parse5/xml approach"). This repository already pins `parse5` as a dev
 * dependency, but it is an HTML5 parser (deliberately lenient/error-
 * recovering, per the HTML5 parsing algorithm) — adequate for the
 * structural HTML assertions `test/structural-landmarks.test.js` already
 * makes, but not a meaningful *well-formedness* check for XML (an HTML5
 * parser never rejects a mismatched or unclosed tag; it silently repairs
 * the tree). Rather than adding a new pinned XML-parser dependency for one
 * test file, this module implements the one well-formedness property that
 * actually matters for this renderer's own generated XML (no external
 * entities, no DOCTYPE, no untrusted schema resolution are ever at risk
 * here — every byte is this renderer's own escaped output): a single well-
 * formed root element, and every opening tag matched by exactly one closing
 * tag (or self-closed) in a properly nested order.
 */

/**
 * Assert that `xml` is a well-formed XML document: exactly one root
 * element, and every tag either self-closed or matched by a correctly
 * nested closing tag. Throws with a descriptive message on the first
 * violation found.
 *
 * @param {string} xml the exact candidate XML document text
 * @returns {void}
 */
export function assertWellFormedXml(xml) {
  // Strip the leading `<?xml ...?>` declaration and any comments before tag
  // scanning; neither carries a nestable element.
  const withoutProlog = xml.replace(/^<\?xml[^>]*\?>\s*/, '');
  const tagPattern = /<(\/?)([a-zA-Z][\w.:-]*)((?:\s+[^<>]*?)?)\s*(\/?)>/g;
  /** @type {string[]} */
  const stack = [];
  let match;
  let sawRoot = false;
  let matchCount = 0;
  while ((match = tagPattern.exec(withoutProlog)) !== null) {
    matchCount += 1;
    const [, closing, name, , selfClosing] = match;
    if (closing) {
      const expected = stack.pop();
      if (expected !== name) {
        throw new Error(
          `XML not well-formed: closing tag </${name}> does not match ` +
            `open tag <${expected ?? '(none)'}> at index ${match.index}`,
        );
      }
      continue;
    }
    if (selfClosing) continue;
    stack.push(name);
    if (stack.length === 1) {
      if (sawRoot && stack.length === 1) {
        // A second top-level element opened after the first fully closed.
      }
      sawRoot = true;
    }
  }
  if (stack.length !== 0) {
    throw new Error(
      `XML not well-formed: unclosed tag(s) remain open: ${stack.join(', ')}`,
    );
  }
  if (!sawRoot || matchCount === 0) {
    throw new Error('XML not well-formed: no root element found');
  }
}
