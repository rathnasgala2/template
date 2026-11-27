/**
 * The IndexNow key file. IndexNow (indexnow.org) lets a site tell Bing, Yandex
 * and the other participating engines which URLs changed; the submitter proves
 * it controls the host by serving a text file named `<key>.txt` whose body is
 * the key. The key is public by design. Galascribe uses the publication id, so
 * the file is `<publication.id>.txt` under the site base (next to
 * `sitemap.xml`, never at the host root: a key under `/<repo>/` only proves
 * that path), holding the id and one newline.
 */

/** IndexNow's own key grammar (8 to 128 of letters, digits and dashes). */
const INDEXNOW_KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;

/**
 * @param {{id?: unknown}} publication the build input's `publication`
 * @returns {string} the IndexNow key (the publication id)
 * @throws {Error} when the id is not a valid IndexNow key
 */
export function indexNowKey(publication) {
  const key = publication?.id;
  if (typeof key !== 'string' || !INDEXNOW_KEY_PATTERN.test(key)) {
    throw new Error(
      'publication.id must be 8 to 128 letters, digits or dashes to serve as the IndexNow key',
    );
  }
  return key;
}

/**
 * @param {string} key the IndexNow key
 * @returns {string} the un-joined route the key file is published at
 */
export function indexNowRoute(key) {
  return `/${key}.txt`;
}

/**
 * @param {string} key the IndexNow key
 * @returns {string} the key file's exact text
 */
export function indexNowKeyFileContent(key) {
  return `${key}\n`;
}
