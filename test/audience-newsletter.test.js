/**
 * The Galascribe newsletter panel (`publication.newsletter.mode ===
 * "galascribe"`): link mode left byte-identical, the signup markup and its
 * no-JavaScript Subscribe link, the honeypot, the Galascribe-mode panel on
 * the pages that carry the newsletter, and the shipped `gala-audience.js`
 * driving the form in JSDOM (every answer and error code of the API).
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  AUDIENCE_MARKER,
  newsletterRequestUrl,
  serializeAudienceMessages,
} from '../src/core/internal/audience.js';
import { renderNewsletterPanel } from '../src/core/internal/components.js';
import { icon } from '../src/core/internal/icons.js';
import { getMessages } from '../src/core/internal/messages.js';
import { buildGeneratedPages } from '../src/core/internal/page-kinds.js';
import { buildRichFixture } from './helpers/page-kind-fixtures.js';
import {
  APP,
  PUBLICATION,
  audiencePage,
  bootAudience,
  problem,
  routed,
} from './helpers/audience-dom.js';

const SUBSCRIPTIONS = `/v2/public/publications/${PUBLICATION}/newsletter-subscriptions`;
const LINK = Object.freeze({
  url: 'https://news.example/join',
  title: 'The <Weekly>',
  text: 'One email "a week".',
});
const GALASCRIBE = Object.freeze({
  mode: /** @type {const} */ ('galascribe'),
  title: 'The <Weekly>',
  text: 'One email "a week".',
  emailContent: /** @type {const} */ ('card'),
  replyToOwner: false,
});
const SUBSCRIBE_URL = newsletterRequestUrl(APP, PUBLICATION);

/** Link-mode panel exactly as sites rendered it before the mode existed. */
const LEGACY_PANEL =
  `<section class="g-wrap g-newsletter" aria-labelledby="newsletter-title">` +
  `<div class="g-panel"><div class="g-panel-copy">` +
  `<p class="g-label">${icon('mail')}Newsletter</p>` +
  `<h2 id="newsletter-title">The &lt;Weekly&gt;</h2>` +
  `<p>One email &quot;a week&quot;.</p></div>` +
  `<a class="g-btn" href="https://news.example/join" rel="noopener">Subscribe${icon('arrow')}</a>` +
  `</div></section>`;

/**
 * @param {Record<string, unknown> | undefined} newsletter
 * @param {{follows: boolean, appOrigin: string}} [audience]
 * @returns {Promise<any[]>} the generated pages
 */
async function pagesWith(newsletter, audience) {
  const input = /** @type {any} */ (await buildRichFixture());
  if (newsletter) input.publication.newsletter = newsletter;
  return buildGeneratedPages(input, {
    pageBody: (body) => body,
    ...(audience ? { audience } : {}),
  });
}

const count = (/** @type {string} */ html, /** @type {string} */ needle) =>
  html.split(needle).length - 1;

test('link mode is byte-identical to the panel before the mode existed, with or without mode: "link"', async () => {
  const messages = getMessages('en');
  assert.equal(
    renderNewsletterPanel({ newsletter: LINK, messages }),
    LEGACY_PANEL,
  );
  assert.equal(
    renderNewsletterPanel({
      newsletter: { ...LINK, mode: 'link' },
      messages,
      subscribeUrl: SUBSCRIBE_URL,
    }),
    LEGACY_PANEL,
    'mode "link" and a stray subscribeUrl change nothing',
  );
  assert.equal(renderNewsletterPanel({ newsletter: undefined, messages }), '');
});

test('link mode on the generated pages: the legacy panel on the home and article pages, nothing of the audience script', async () => {
  const pages = await pagesWith(LINK, { follows: false, appOrigin: APP });
  const bare = await pagesWith(LINK);
  assert.deepEqual(
    pages.map((page) => page.bodyHtml),
    bare.map((page) => page.bodyHtml),
  );
  const carriers = pages.filter((page) => page.bodyHtml.includes(LEGACY_PANEL));
  assert.ok(carriers.length >= 2);
  assert.ok(carriers.some((page) => page.kind === 'article'));
  assert.ok(carriers.some((page) => page.kind === 'index'));
  for (const page of pages) {
    assert.ok(!page.bodyHtml.includes(AUDIENCE_MARKER), page.route);
  }
});

test('Galascribe mode: the panel keeps the copy, adds the no-JavaScript Subscribe link and a hidden form', () => {
  const html = renderNewsletterPanel({
    newsletter: GALASCRIBE,
    messages: getMessages('en'),
    subscribeUrl: SUBSCRIBE_URL,
  });
  assert.match(
    html,
    /^<section class="g-wrap g-newsletter" aria-labelledby="newsletter-title" data-gala-audience="newsletter">/,
  );
  assert.ok(html.includes('<h2 id="newsletter-title">The &lt;Weekly&gt;</h2>'));
  assert.ok(html.includes('<p>One email &quot;a week&quot;.</p>'));
  // Without JavaScript: a plain link to the App's request page.
  assert.match(
    html,
    new RegExp(
      `<a class="g-btn" href="${APP}/t/newsletter/request/${PUBLICATION}" rel="noopener" data-gala-newsletter-link>Subscribe`,
    ),
  );
  // The form is hidden until the script runs.
  const form = html.match(/<form [^>]*>/)?.[0] ?? '';
  assert.match(form, /data-gala-newsletter-form/);
  assert.match(form, / hidden>$/);
  assert.ok(!/action=|method=/.test(form), 'every submit is a fetch');
  assert.match(
    html,
    /<label class="g-sr-only" for="newsletter-email">Email address<\/label><input class="g-input" id="newsletter-email" type="email" name="email" required maxlength="320" autocomplete="email"/,
  );
  assert.match(html, /<button class="g-btn" type="submit">Subscribe/);
  assert.match(
    html,
    /<p class="g-form-status" id="newsletter-status" role="status" aria-live="polite" data-form-status><\/p>/,
  );
  assert.ok(!/<script|onsubmit|onclick/i.test(html));
});

test('the honeypot is named trap, off-screen, out of the tab order and the accessibility tree, empty', () => {
  const html = renderNewsletterPanel({
    newsletter: GALASCRIBE,
    messages: getMessages('en'),
    subscribeUrl: SUBSCRIBE_URL,
  });
  assert.equal(count(html, 'name="trap"'), 1);
  assert.match(
    html,
    /<div class="g-hp" aria-hidden="true"><label>Leave this field empty<input type="text" name="trap" tabindex="-1" autocomplete="off" value=""><\/label><\/div>/,
  );
  assert.ok(!/name="trap"[^>]*\bhidden\b/.test(html), 'not display:none');
});

test('Galascribe mode on the generated pages: the panel on the home and article pages only, the Subscribe link on the given App origin', async () => {
  const pages = await pagesWith(GALASCRIBE, {
    follows: false,
    appOrigin: 'http://localhost:8443',
  });
  const carriers = pages.filter((page) =>
    page.bodyHtml.includes('data-gala-newsletter-form'),
  );
  assert.deepEqual([...new Set(carriers.map((page) => page.kind))].sort(), [
    'article',
    'index',
  ]);
  const { id } = /** @type {any} */ (await buildRichFixture()).publication;
  for (const page of carriers) {
    assert.equal(count(page.bodyHtml, AUDIENCE_MARKER), 1, page.route);
    assert.ok(
      page.bodyHtml.includes(
        `href="http://localhost:8443/t/newsletter/request/${id}"`,
      ),
      page.route,
    );
  }
  // No App origin given: the production App.
  const production = await pagesWith(GALASCRIBE);
  const home = production.find((page) => page.kind === 'index');
  assert.ok(
    home?.bodyHtml.includes(
      'href="https://app.galascribe.com/t/newsletter/request/',
    ),
  );
  // No newsletter at all: no panel, no marker.
  for (const page of await pagesWith(undefined)) {
    assert.ok(!page.bodyHtml.includes('g-newsletter'), page.route);
    assert.ok(!page.bodyHtml.includes(AUDIENCE_MARKER), page.route);
  }
});

test('Tamil pages get the Tamil panel and sentences', () => {
  const messages = getMessages('ta');
  const html = renderNewsletterPanel({
    newsletter: GALASCRIBE,
    messages,
    subscribeUrl: SUBSCRIBE_URL,
  });
  assert.ok(html.includes('செய்திமடல்'));
  assert.ok(html.includes('சந்தா செய்'));
  assert.ok(html.includes('மின்னஞ்சல் முகவரி'));
  assert.ok(html.includes('இந்தப் புலத்தை காலியாக விடவும்'));
  const sentences = JSON.parse(serializeAudienceMessages(messages));
  assert.equal(
    sentences.checkInbox,
    'உறுதிப்படுத்த உங்கள் இன்பாக்ஸைப் பாருங்கள்',
  );
  assert.equal(
    sentences.newsletterFull,
    'இந்தச் செய்திமடல் இப்போது புதிய சந்தாதாரர்களை ஏற்கவில்லை.',
  );
});

test('the run-time sentences are one JSON block, English exactly as specified, safe inside <script>', () => {
  const raw = serializeAudienceMessages(getMessages('en'));
  assert.ok(!/[<>&]/.test(raw), 'no markup characters survive');
  const sentences = JSON.parse(raw);
  assert.equal(sentences.checkInbox, 'Check your inbox to confirm');
  assert.equal(
    sentences.newsletterFull,
    "This newsletter isn't taking new subscribers right now.",
  );
  assert.equal(sentences.followed, 'You now follow {name}.');
  for (const [key, value] of Object.entries(sentences)) {
    assert.equal(typeof value, 'string', key);
    assert.ok(value, key);
  }
});

// ------------------------------------------------------------------ script ---

/**
 * @param {string} [language]
 * @returns {string} a page with the Galascribe newsletter panel
 */
function panelPage(language = 'en') {
  return audiencePage(
    renderNewsletterPanel({
      newsletter: GALASCRIBE,
      messages: getMessages(language),
      subscribeUrl: SUBSCRIBE_URL,
    }),
    language,
  );
}

const statusOf = (/** @type {any} */ h) =>
  h.$('[data-form-status]').textContent;

/**
 * Type an address and submit.
 *
 * @param {any} h harness
 * @param {string} email
 * @param {string} [trap]
 */
async function subscribe(h, email, trap) {
  h.$('#newsletter-email').value = email;
  if (trap !== undefined) h.$('input[name="trap"]').value = trap;
  h.$('[data-gala-newsletter-form] button[type="submit"]').click();
  await h.settle();
}

test('script: the Subscribe link gives way to the form', async () => {
  const before = await bootAudience(
    panelPage().replace(/ data-gala-audience-script/, ''),
  );
  await before.settle();
  assert.equal(
    before.$('[data-gala-newsletter-form]').hidden,
    true,
    'no script tag, no enhancement: the link path stays',
  );
  assert.equal(before.$('[data-gala-newsletter-link]').hidden, false);

  const h = await bootAudience(panelPage());
  await h.settle();
  assert.equal(h.$('[data-gala-newsletter-form]').hidden, false);
  assert.equal(h.$('[data-gala-newsletter-link]').hidden, true);
  assert.equal(h.calls.length, 0, 'nothing is requested until a submit');
});

test('script: a good address posts email and an empty trap, with no credential, and says to check the inbox', async () => {
  const h = await bootAudience(panelPage(), {
    handler: routed({
      [`POST ${SUBSCRIPTIONS}`]: {
        status: 202,
        body: { status: 'CHECK_YOUR_INBOX' },
      },
    }),
  });
  await h.settle();
  await subscribe(h, '  Reader@Example.com ');
  assert.equal(h.calls.length, 1);
  const [call] = h.calls;
  assert.equal(call.method, 'POST');
  assert.equal(call.url, 'https://api.galascribe.com' + SUBSCRIPTIONS);
  assert.deepEqual(call.body, { email: 'Reader@Example.com', trap: '' });
  assert.equal(call.headers.Authorization, undefined);
  assert.equal(call.headers['Content-Type'], 'application/json');
  assert.equal(call.init.credentials, 'omit');
  assert.equal(call.init.mode, 'cors');
  assert.equal(statusOf(h), 'Check your inbox to confirm');
  assert.equal(h.$('#newsletter-email').value, '', 'address cleared');
  assert.equal(h.$('[data-gala-newsletter-form]').dataset.state, 'sent');
  assert.equal(h.$('[data-form-status]').getAttribute('aria-live'), 'polite');
});

test('script: a honeypot hit still reads "Check your inbox to confirm" (the API answers the same 202 and sends nothing)', async () => {
  const h = await bootAudience(panelPage(), {
    handler: routed({
      [`POST ${SUBSCRIPTIONS}`]: {
        status: 202,
        body: { status: 'CHECK_YOUR_INBOX' },
      },
    }),
  });
  await h.settle();
  await subscribe(h, 'bot@example.com', 'http://spam.example');
  assert.equal(h.calls[0].body.trap, 'http://spam.example');
  assert.equal(statusOf(h), 'Check your inbox to confirm');
});

test('script: a known and an unknown address are told the same thing', async () => {
  const sentences = [];
  for (const email of ['known@example.com', 'new@example.com']) {
    const h = await bootAudience(panelPage(), {
      handler: routed({
        [`POST ${SUBSCRIPTIONS}`]: {
          status: 202,
          body: { status: 'CHECK_YOUR_INBOX' },
        },
      }),
    });
    await h.settle();
    await subscribe(h, email);
    sentences.push(statusOf(h));
  }
  assert.equal(sentences[0], sentences[1]);
});

test('script: an empty or malformed address never reaches the API', async () => {
  for (const email of ['', '   ', 'nope', 'two words@example.com']) {
    const h = await bootAudience(panelPage());
    await h.settle();
    await subscribe(h, email);
    assert.equal(h.calls.length, 0, JSON.stringify(email));
    assert.equal(h.$('#newsletter-email').getAttribute('aria-invalid'), 'true');
    assert.equal(
      statusOf(h),
      email.trim() === ''
        ? 'This field is required.'
        : 'Enter a valid email address.',
    );
    assert.equal(h.window.document.activeElement, h.$('#newsletter-email'));
  }
});

test('script: a full or unavailable newsletter says it is not taking subscribers', async () => {
  for (const code of ['NEWSLETTER_FULL', 'NEWSLETTER_UNAVAILABLE']) {
    const h = await bootAudience(panelPage(), {
      handler: routed({ [`POST ${SUBSCRIPTIONS}`]: problem(409, code) }),
    });
    await h.settle();
    await subscribe(h, 'a@example.com');
    assert.equal(
      statusOf(h),
      "This newsletter isn't taking new subscribers right now.",
      code,
    );
    assert.equal(h.$('[data-gala-newsletter-form]').dataset.state, 'error');
    assert.equal(
      h.$('#newsletter-email').value,
      'a@example.com',
      'kept for a retry',
    );
  }
});

test('script: rate limit, rejected address, unknown site, outage and server error each have their own sentence', async () => {
  const cases = [
    [problem(429, 'RATE_LIMITED'), 'Too many attempts. Try again in a moment.'],
    [
      problem(400, 'VALIDATION_FAILED', [
        { pointer: '/email', code: 'VALIDATION_FAILED' },
      ]),
      'Enter a valid email address.',
    ],
    [problem(404, 'PUBLICATION_NOT_LIVE'), 'Something went wrong. Try again.'],
    [new Error('offline'), "Couldn't reach Galascribe. Try again."],
    [{ status: 500, body: {} }, 'Something went wrong. Try again.'],
  ];
  for (const [answer, sentence] of cases) {
    const h = await bootAudience(panelPage(), {
      handler: routed({ [`POST ${SUBSCRIPTIONS}`]: answer }),
    });
    await h.settle();
    await subscribe(h, 'a@example.com');
    assert.equal(statusOf(h), sentence);
  }
});

test('script: a second press while the request is out sends nothing and the button shows it is busy', async () => {
  /** @type {(value: any) => void} */
  let release = () => {};
  const h = await bootAudience(panelPage(), {
    handler: routed({
      [`POST ${SUBSCRIPTIONS}`]: () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    }),
  });
  await h.settle();
  h.$('#newsletter-email').value = 'a@example.com';
  const submit = h.$('[data-gala-newsletter-form] button[type="submit"]');
  submit.click();
  await h.settle();
  assert.equal(submit.getAttribute('aria-busy'), 'true');
  assert.equal(submit.getAttribute('aria-disabled'), 'true');
  submit.click();
  await h.settle();
  assert.equal(h.calls.length, 1);
  release({ status: 202, body: { status: 'CHECK_YOUR_INBOX' } });
  await h.settle();
  assert.equal(submit.hasAttribute('aria-busy'), false);
  assert.equal(statusOf(h), 'Check your inbox to confirm');
});

test('script: Tamil pages answer in Tamil', async () => {
  const h = await bootAudience(panelPage('ta'), {
    handler: routed({
      [`POST ${SUBSCRIPTIONS}`]: {
        status: 202,
        body: { status: 'CHECK_YOUR_INBOX' },
      },
    }),
  });
  await h.settle();
  await subscribe(h, 'a@example.com');
  assert.equal(statusOf(h), 'உறுதிப்படுத்த உங்கள் இன்பாக்ஸைப் பாருங்கள்');
});
