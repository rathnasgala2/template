/**
 * The closed analytics provider catalog, keyed by `provider.kind`. Everything
 * the renderer needs to know about a provider lives here: the origins its
 * script, beacons and pixels use (added to the page's Content-Security-Policy
 * only when the module is on), the loader URL, and the name and policy link
 * the Privacy page and consent banner show. The browser script
 * (`consent-script.js`) keeps its own small per-kind loader table; a second
 * provider is one entry in each.
 */

/**
 * @typedef {object} AnalyticsProvider
 * @property {string} name the human name shown to readers
 * @property {string} privacyPolicyUrl the provider's own privacy policy
 * @property {string} privacyPolicyLabel the link text for that policy
 * @property {readonly string[]} scriptSources CSP `script-src` sources
 * @property {readonly string[]} connectSources CSP `connect-src` sources
 * @property {readonly string[]} imageSources CSP `img-src` sources
 * @property {(measurementId: string) => string} loaderUrl the script URL
 */

/** @type {Readonly<Record<string, Readonly<AnalyticsProvider>>>} */
export const ANALYTICS_PROVIDERS = Object.freeze({
  'google-analytics-4': Object.freeze({
    name: 'Google Analytics 4 (Google LLC)',
    privacyPolicyUrl: 'https://policies.google.com/privacy',
    privacyPolicyLabel: "Google's privacy policy",
    scriptSources: Object.freeze(['https://www.googletagmanager.com']),
    connectSources: Object.freeze([
      'https://*.analytics.google.com',
      'https://*.google-analytics.com',
      'https://*.googletagmanager.com',
    ]),
    imageSources: Object.freeze([
      'https://*.google-analytics.com',
      'https://*.googletagmanager.com',
    ]),
    loaderUrl: (/** @type {string} */ measurementId) =>
      'https://www.googletagmanager.com/gtag/js?id=' +
      encodeURIComponent(measurementId),
  }),
});

/**
 * @param {string} kind a provider kind
 * @returns {Readonly<AnalyticsProvider> | undefined} its catalog entry
 */
export function analyticsProvider(kind) {
  return Object.hasOwn(ANALYTICS_PROVIDERS, kind)
    ? ANALYTICS_PROVIDERS[kind]
    : undefined;
}
