/**
 * Audience features, render side: the author Follow control, the Galascribe
 * newsletter signup, the contact form and the one browser script
 * (`src/modules/interactions/browser/gala-audience.js`) that brings them to
 * life. The template renders markup only; every request, token and storage
 * access lives in the script and the API.
 *
 * Everything here is opt-in and silent when off: a site that sets none of
 * `interactions-config.follows.enabled`, `publication.newsletter.mode ===
 * "galascribe"` and `publication.contactForm.enabled` renders the bytes it
 * rendered before these features existed, and loads no script for them.
 *
 * Markers: every element the script enhances carries
 * `data-gala-audience="follow" | "newsletter" | "contact"`, and a page loads
 * the script exactly when its body contains one ({@link AUDIENCE_MARKER}).
 * Each element is server-rendered complete: without JavaScript a Follow
 * control and the contact form stay `hidden`, the contact page says the form
 * needs JavaScript, and the newsletter panel shows a Subscribe link to the
 * App's request page instead of the form. The script reveals the working
 * parts. Only classes with base-layer rules are used (`g-follow*`, `g-form*`,
 * `g-field*`, `g-hp`, `g-sr-only`, `g-input`); the published `g-btn`,
 * `g-panel*` and `g-newsletter` hooks are reused as they are.
 */

import { readFile } from 'node:fs/promises';

import { escapeHtml } from './skeleton.js';
import { icon } from './icons.js';
import { PRODUCTION_API_ORIGIN } from './render-policy-content.js';
import { serializeJsonLd } from './structured-data.js';

/** @type {string} the emitted script's output-relative path */
export const AUDIENCE_SCRIPT_PATH = 'assets/gala-audience-v1.js';

/** @type {string} */
export const AUDIENCE_SCRIPT_MEDIA_TYPE =
  'application/javascript; charset=utf-8';

const AUDIENCE_SCRIPT_SOURCE_URL = new URL(
  '../../modules/interactions/browser/gala-audience.js',
  import.meta.url,
);

/**
 * The App's production origin: where the no-JavaScript Subscribe link points
 * when the build input names no interactions module (which carries the App
 * origin of a local stack).
 *
 * @type {string}
 */
export const PRODUCTION_APP_ORIGIN = 'https://app.galascribe.com';

/** The exact opening of the attribute every enhanced element carries. */
export const AUDIENCE_MARKER = ' data-gala-audience="';

/** Where the contact form lives (un-joined route). */
export const CONTACT_ROUTE = '/contact';

/**
 * The longest fields, mirroring the API's request contract
 * (`POST .../contact-messages`, `POST .../newsletter-subscriptions`).
 */
const LIMITS = Object.freeze({
  name: 100,
  email: 320,
  message: 5000,
  website: 300,
  phone: 40,
});

/**
 * @typedef {Readonly<Record<string, string | ((...args: string[]) => string)>>} Messages
 */

/**
 * Whether the Follow control is on: the build input carries an interactions
 * module (which is what the reader sign-in the control needs belongs to) and
 * its config turns `follows` on. Independent of whether reactions or comments
 * are enabled.
 *
 * @param {import('../../../types/index.d.ts').InteractionsModule | undefined} module
 *   the validated interactions module, if any
 * @returns {boolean} whether bylines, author cards and author pages carry it
 */
export function followsEnabled(module) {
  return module !== undefined && module.config.follows?.enabled === true;
}

/**
 * The two origins the script talks to and links to: the interactions
 * module's (the local stack names its own), else the production pair.
 *
 * @param {import('../../../types/index.d.ts').InteractionsModule | undefined} module
 * @returns {{apiOrigin: string, appOrigin: string}}
 */
export function audienceOrigins(module) {
  return {
    apiOrigin: module?.apiOrigin ?? PRODUCTION_API_ORIGIN,
    appOrigin: module?.appOrigin ?? PRODUCTION_APP_ORIGIN,
  };
}

/**
 * The App page a reader without JavaScript opens to subscribe.
 *
 * @param {string} appOrigin the App origin
 * @param {string} publicationId the publication id
 * @returns {string} the absolute URL
 */
export function newsletterRequestUrl(appOrigin, publicationId) {
  return `${appOrigin}/t/newsletter/request/${encodeURIComponent(publicationId)}`;
}

/**
 * @param {Messages} messages
 * @returns {{text: (key: string) => string, call: (key: string, arg: string) => string}}
 */
function lookups(messages) {
  return {
    text: (key) => escapeHtml(/** @type {string} */ (messages[key])),
    call: (key, arg) =>
      escapeHtml(/** @type {(a: string) => string} */ (messages[key])(arg)),
  };
}

/**
 * One author's Follow control. Rendered `hidden`: the script reveals it,
 * reads the reader's state when a token exists, and drives its states
 * (`data-state` is `idle`, `following` or `pending`; the live region inside it
 * announces results and errors politely). Buttons carry the author's name in
 * their accessible name.
 *
 * @param {object} options
 * @param {{id: string, displayName: string}} options.author the author (the
 *   stable id keys the follow)
 * @param {Messages} options.messages the page's message catalog
 * @returns {string} the control markup
 */
export function renderFollowControl({ author, messages }) {
  const { text, call } = lookups(messages);
  const name = author.displayName;
  return (
    `<span class="g-follow" data-gala-audience="follow" data-author-id="${escapeHtml(author.id)}" data-author-name="${escapeHtml(name)}" data-state="idle" hidden>` +
    `<button class="g-btn g-follow-btn" type="button" data-follow-action="follow" aria-label="${call('followAriaLabel', name)}">${icon('plus')}<span>${text('followLabel')}</span></button>` +
    `<span class="g-follow-on" data-follow-on hidden>` +
    `<span class="g-follow-state">${icon('check')}<span>${text('followingLabel')}</span></span>` +
    `<button class="g-follow-undo" type="button" data-follow-action="unfollow" aria-label="${call('unfollowAriaLabel', name)}">${text('unfollowLabel')}</button>` +
    `</span>` +
    `<span class="g-follow-status" role="status" aria-live="polite"></span>` +
    `</span>`
  );
}

/**
 * The honeypot every public form carries: a text input a person never sees
 * or fills, named `trap` as the API contract names it. Off-screen (not
 * `hidden`, which form-filling bots skip) and out of the tab order and the
 * accessibility tree.
 *
 * @param {Messages} messages
 * @returns {string}
 */
function honeypot(messages) {
  const { text } = lookups(messages);
  return `<div class="g-hp" aria-hidden="true"><label>${text('honeypotLabel')}<input type="text" name="trap" tabindex="-1" autocomplete="off" value=""></label></div>`;
}

/**
 * The Galascribe-mode newsletter panel: the link-mode panel's copy, then a
 * Subscribe link to the App (the no-JavaScript path) and, hidden, the signup
 * form the script reveals in its place.
 *
 * @param {object} options
 * @param {{title: string, text: string}} options.newsletter
 *   `publication.newsletter` in Galascribe mode
 * @param {Messages} options.messages the message catalog
 * @param {string} options.subscribeUrl the App's request page
 * @returns {string} the panel markup
 */
export function renderGalascribeNewsletterPanel({
  newsletter,
  messages,
  subscribeUrl,
}) {
  const { text } = lookups(messages);
  return (
    `<section class="g-wrap g-newsletter" aria-labelledby="newsletter-title" data-gala-audience="newsletter">` +
    `<div class="g-panel">` +
    `<div class="g-panel-copy">` +
    `<p class="g-label">${icon('mail')}${text('newsletterLabel')}</p>` +
    `<h2 id="newsletter-title">${escapeHtml(newsletter.title)}</h2>` +
    (newsletter.text ? `<p>${escapeHtml(newsletter.text)}</p>` : '') +
    `</div>` +
    `<a class="g-btn" href="${escapeHtml(subscribeUrl)}" rel="noopener" data-gala-newsletter-link>${text('newsletterActionLabel')}${icon('arrow')}</a>` +
    `<form class="g-form g-newsletter-form" data-gala-newsletter-form aria-labelledby="newsletter-title" novalidate hidden>` +
    `<label class="g-sr-only" for="newsletter-email">${text('newsletterEmailLabel')}</label>` +
    `<input class="g-input" id="newsletter-email" type="email" name="email" required maxlength="${LIMITS.email}" autocomplete="email" aria-describedby="newsletter-status">` +
    honeypot(messages) +
    `<button class="g-btn" type="submit">${text('newsletterActionLabel')}${icon('arrow')}</button>` +
    `<p class="g-form-status" id="newsletter-status" role="status" aria-live="polite" data-form-status></p>` +
    `</form>` +
    `</div></section>`
  );
}

/**
 * One labelled contact field with its inline error slot.
 *
 * @param {object} spec
 * @param {string} spec.name field name (the API member)
 * @param {string} spec.label already-escaped label text
 * @param {'text' | 'email' | 'url' | 'tel' | 'textarea'} spec.type
 * @param {boolean} spec.required
 * @param {string} spec.autocomplete
 * @returns {string}
 */
function contactField({ name, label, type, required, autocomplete }) {
  const id = `contact-${name}`;
  const common =
    `id="${id}" name="${name}"${required ? ' required' : ''} maxlength="${LIMITS[/** @type {keyof typeof LIMITS} */ (name)]}" ` +
    `autocomplete="${autocomplete}" aria-describedby="${id}-error"`;
  const control =
    type === 'textarea'
      ? `<textarea class="g-input" ${common} rows="6"></textarea>`
      : `<input class="g-input" type="${type === 'url' ? 'text" inputmode="url' : type}" ${common}>`;
  return (
    `<div class="g-field"><label for="${id}">${label}</label>${control}` +
    `<p class="g-field-error" id="${id}-error" data-field-error="${name}" hidden></p></div>`
  );
}

/**
 * The contact form, `hidden` until the script reveals it (the page carries a
 * `<noscript>` note beside it). Name, email and message are always present;
 * Website and Phone follow `contactForm.fields`.
 *
 * @param {object} options
 * @param {{website: boolean, phone: boolean}} options.fields
 *   `publication.contactForm.fields`
 * @param {Messages} options.messages the message catalog
 * @returns {string} the form and its `<noscript>` note
 */
export function renderContactForm({ fields, messages }) {
  const { text } = lookups(messages);
  return (
    `<form class="g-form g-contact-form" data-gala-audience="contact" data-gala-contact-form aria-labelledby="contact-title" novalidate hidden>` +
    contactField({
      name: 'name',
      label: text('contactNameLabel'),
      type: 'text',
      required: true,
      autocomplete: 'name',
    }) +
    contactField({
      name: 'email',
      label: text('contactEmailLabel'),
      type: 'email',
      required: true,
      autocomplete: 'email',
    }) +
    (fields.website
      ? contactField({
          name: 'website',
          label: text('contactWebsiteLabel'),
          type: 'url',
          required: false,
          autocomplete: 'url',
        })
      : '') +
    (fields.phone
      ? contactField({
          name: 'phone',
          label: text('contactPhoneLabel'),
          type: 'tel',
          required: false,
          autocomplete: 'tel',
        })
      : '') +
    contactField({
      name: 'message',
      label: text('contactMessageLabel'),
      type: 'textarea',
      required: true,
      autocomplete: 'off',
    }) +
    honeypot(messages) +
    `<button class="g-btn g-form-submit" type="submit">${text('contactSubmitLabel')}${icon('arrow')}</button>` +
    `<p class="g-form-status" role="status" aria-live="polite" data-form-status></p>` +
    `</form>` +
    `<noscript><p class="g-form-note">${text('contactNoscript')}</p></noscript>`
  );
}

/**
 * The strings the script needs at run time, in the page's language, as one
 * JSON data block (`<script type="application/json">`, never executed).
 * `{name}` stands for the author's display name in the follow sentences.
 *
 * @param {Messages} messages the page's message catalog
 * @returns {string} the JSON, escaped for embedding in HTML
 */
export function serializeAudienceMessages(messages) {
  const plain = (/** @type {string} */ key) =>
    /** @type {string} */ (messages[key]);
  const named = (/** @type {string} */ key) =>
    /** @type {(name: string) => string} */ (messages[key])('{name}');
  return serializeJsonLd({
    followed: named('followedAnnouncement'),
    unfollowed: named('unfollowedAnnouncement'),
    followDisabled: plain('followDisabledMessage'),
    authorGone: plain('followAuthorMissingMessage'),
    network: plain('audienceNetworkError'),
    rateLimited: plain('audienceRateLimited'),
    generic: plain('audienceGenericError'),
    storageBlocked: plain('audienceStorageBlocked'),
    signInUnsupported: plain('audienceSignInUnsupported'),
    signInFailed: plain('audienceSignInFailed'),
    signInInvalid: plain('audienceSignInInvalid'),
    required: plain('fieldRequiredMessage'),
    invalid: plain('fieldInvalidMessage'),
    emailInvalid: plain('newsletterEmailInvalid'),
    checkInbox: plain('newsletterCheckInbox'),
    newsletterFull: plain('newsletterFullMessage'),
    contactSent: plain('contactSent'),
    contactUnavailable: plain('contactUnavailable'),
    contactRateLimited: plain('contactRateLimited'),
    messageLinks: plain('contactMessageLinks'),
  });
}

/**
 * Read the audience script's bytes from the template package.
 *
 * @returns {Promise<Buffer>} the script bytes
 */
export function loadAudienceScript() {
  return readFile(AUDIENCE_SCRIPT_SOURCE_URL);
}
