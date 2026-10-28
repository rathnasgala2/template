/**
 * The contact page (`publication.contactForm.enabled`): absent unless on,
 * `/contact/` as an indexable system page with an authored or default intro,
 * the form's fields and limits, the footer link, the sitemap entry and its
 * absence from feeds, search and llms files, the route it reserves, and the
 * shipped `gala-audience.js` driving the form in JSDOM (elapsed time, honeypot,
 * inline validation, every error code of the API).
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import {
  AUDIENCE_MARKER,
  CONTACT_ROUTE,
  renderContactForm,
} from '../src/core/internal/audience.js';
import { renderFooter } from '../src/core/internal/chrome.js';
import { buildFeeds } from '../src/core/internal/feeds.js';
import { buildLlmsDocuments } from '../src/core/internal/llms.js';
import { getMessages } from '../src/core/internal/messages.js';
import {
  buildGeneratedPages,
  contentRoute,
} from '../src/core/internal/page-kinds.js';
import { assertPolicyRoutesFree } from '../src/core/internal/policy-pages.js';
import { buildSearchIndex } from '../src/core/internal/search-index.js';
import { buildSitemap } from '../src/core/internal/sitemap.js';
import { collectIncludedSources } from '../src/core/internal/source-inventory.js';
import { buildRichFixture } from './helpers/page-kind-fixtures.js';
import {
  PUBLICATION,
  audiencePage,
  bootAudience,
  problem,
  routed,
} from './helpers/audience-dom.js';

const MESSAGES = `/v2/public/publications/${PUBLICATION}/contact-messages`;
const FIELDS = Object.freeze({ website: false, phone: false });

/**
 * The rich fixture without its authored `/contact` page (the page this one
 * would collide with), the contact form set as given.
 *
 * @param {Record<string, unknown> | undefined} contactForm
 * @returns {Promise<any>} the build input
 */
async function inputWith(contactForm) {
  const input = /** @type {any} */ (await buildRichFixture());
  input.content = input.content.filter(
    (record) => record.frontmatter.slug !== 'contact',
  );
  if (contactForm) input.publication.contactForm = contactForm;
  return input;
}

/**
 * @param {any} input
 * @returns {any[]} the generated pages
 */
const pagesOf = (input) =>
  buildGeneratedPages(input, { pageBody: (body) => body });

const contactPage = (/** @type {any[]} */ pages) =>
  pages.find((page) => page.route === CONTACT_ROUTE);

const count = (/** @type {string} */ html, /** @type {string} */ needle) =>
  html.split(needle).length - 1;

test('no contact form, or one switched off: no /contact page and every other page is the same bytes', async () => {
  const bare = pagesOf(await inputWith(undefined));
  const off = pagesOf(await inputWith({ enabled: false, fields: FIELDS }));
  assert.equal(contactPage(bare), undefined);
  assert.equal(contactPage(off), undefined);
  assert.deepEqual(
    off.map((page) => [page.route, page.bodyHtml]),
    bare.map((page) => [page.route, page.bodyHtml]),
  );
  for (const page of bare) {
    assert.ok(!page.bodyHtml.includes(AUDIENCE_MARKER), page.route);
  }
});

test('enabled: /contact is a policy-kind page titled Contact, indexable, with the default intro and the form', async () => {
  const input = await inputWith({ enabled: true, fields: FIELDS });
  const page = contactPage(pagesOf(input));
  assert.ok(page);
  assert.equal(page.kind, 'policy');
  assert.equal(page.title, 'Contact');
  assert.equal(page.documentTitle, `Contact | ${input.publication.title}`);
  assert.equal(page.robotsContent, 'index, follow');
  assert.equal(page.language, input.publication.defaultLanguage);
  assert.equal(page.canonicalUrl, undefined);
  assert.match(page.description, /^Have a question or something to say\?/);
  const html = page.bodyHtml;
  assert.match(html, /<h1 id="contact-title">Contact<\/h1>/);
  assert.ok(
    html.includes(
      '<div class="g-prose"><p>Have a question or something to say? Send a message and the author will reply by email.</p></div>',
    ),
  );
  assert.equal(count(html, AUDIENCE_MARKER), 1);
  assert.match(
    html,
    /<form class="g-form g-contact-form" data-gala-audience="contact" data-gala-contact-form aria-labelledby="contact-title" novalidate hidden>/,
  );
  assert.ok(
    !/<form [^>]*(action|method)=/.test(html),
    'every submit is a fetch',
  );
  assert.match(
    html,
    /<noscript><p class="g-form-note">This form needs JavaScript\. Turn it on to send a message\.<\/p><\/noscript>/,
  );
  assert.ok(!/<script/i.test(html));
});

test('the form: name, email and message always; website and phone only when asked; limits mirror the API', async () => {
  const messages = getMessages('en');
  const base = renderContactForm({ fields: FIELDS, messages });
  const names = (/** @type {string} */ html) =>
    [...html.matchAll(/<(?:input|textarea) [^>]*name="([a-z]+)"/g)].map(
      (match) => match[1],
    );
  assert.deepEqual(names(base), ['name', 'email', 'message', 'trap']);
  const all = renderContactForm({
    fields: { website: true, phone: true },
    messages,
  });
  assert.deepEqual(names(all), [
    'name',
    'email',
    'website',
    'phone',
    'message',
    'trap',
  ]);
  const only = renderContactForm({
    fields: { website: false, phone: true },
    messages,
  });
  assert.deepEqual(names(only), ['name', 'email', 'phone', 'message', 'trap']);

  assert.match(
    all,
    /<label for="contact-name">Name<\/label><input class="g-input" type="text" id="contact-name" name="name" required maxlength="100" autocomplete="name" aria-describedby="contact-name-error">/,
  );
  assert.match(
    all,
    /<label for="contact-email">Email<\/label><input class="g-input" type="email" id="contact-email" name="email" required maxlength="320" autocomplete="email"/,
  );
  assert.match(
    all,
    /<label for="contact-website">Website \(optional\)<\/label><input class="g-input" type="text" inputmode="url" id="contact-website" name="website" maxlength="300" autocomplete="url"/,
  );
  assert.match(
    all,
    /<label for="contact-phone">Phone \(optional\)<\/label><input class="g-input" type="tel" id="contact-phone" name="phone" maxlength="40" autocomplete="tel"/,
  );
  assert.match(
    all,
    /<label for="contact-message">Message<\/label><textarea class="g-input" id="contact-message" name="message" required maxlength="5000" autocomplete="off" aria-describedby="contact-message-error" rows="6"><\/textarea>/,
  );
  // One inline error slot per field, linked to it, hidden until used.
  for (const name of ['name', 'email', 'website', 'phone', 'message']) {
    assert.ok(
      all.includes(
        `<p class="g-field-error" id="contact-${name}-error" data-field-error="${name}" hidden></p>`,
      ),
      name,
    );
  }
  // The honeypot, then Send message and the polite status.
  assert.match(
    all,
    /<div class="g-hp" aria-hidden="true"><label>Leave this field empty<input type="text" name="trap" tabindex="-1" autocomplete="off" value=""><\/label><\/div><button class="g-btn g-form-submit" type="submit">Send message.*<\/button><p class="g-form-status" role="status" aria-live="polite" data-form-status><\/p><\/form>/s,
  );
});

test('an authored gala/theme-pages/contact.md replaces the default intro; its leading Contact heading is not repeated', async () => {
  const input = await inputWith({
    enabled: true,
    fields: FIELDS,
    intro: {
      sourcePath: 'gala/theme-pages/contact.md',
      sourceDigest: 'sha256:' + '4'.repeat(64),
      bodyMediaType: 'text/html',
      body: '<h1>Contact</h1><p>Write to <strong>Ana</strong> any time.</p>',
      bodyDigest: 'sha256:' + '5'.repeat(64),
      renderPolicy: input_policy(),
    },
  });
  const page = contactPage(
    buildGeneratedPages(input, {
      pageBody: (body) => `[[${body}]]`,
    }),
  );
  assert.ok(page);
  assert.ok(
    page.bodyHtml.includes(
      '<div class="g-prose">[[<p>Write to <strong>Ana</strong> any time.</p>]]</div>',
    ),
  );
  assert.ok(!page.bodyHtml.includes('Have a question'));
  assert.equal(count(page.bodyHtml, '<h1'), 1);
  assert.equal(page.description, 'Write to Ana any time.');
  // The intro's source is an included source of the manifest, role content.
  const sources = collectIncludedSources(input);
  assert.deepEqual(
    sources.filter((row) => row.path === 'gala/theme-pages/contact.md'),
    [
      {
        path: 'gala/theme-pages/contact.md',
        sha256: 'sha256:' + '4'.repeat(64),
        sourceRevision: input.sourceRevision,
        role: 'content',
      },
    ],
  );
  const without = collectIncludedSources(
    await inputWith({ enabled: true, fields: FIELDS }),
  );
  assert.ok(!without.some((row) => row.path.includes('contact.md')));
});

/** @returns {Record<string, unknown>} a render-policy identity placeholder */
function input_policy() {
  return {
    name: 'placeholder',
    version: '0.0.0',
    digest: 'sha256:' + '0'.repeat(64),
  };
}

test('Tamil: the page title, labels, intro and noscript note are Tamil', () => {
  const html = renderContactForm({
    fields: { website: true, phone: true },
    messages: getMessages('ta'),
  });
  for (const word of [
    'பெயர்',
    'மின்னஞ்சல்',
    'செய்தி',
    'இணையதளம் (விருப்பம்)',
    'தொலைபேசி (விருப்பம்)',
    'செய்தியை அனுப்பு',
    'இந்தப் படிவத்திற்கு JavaScript தேவை.',
    'இந்தப் புலத்தை காலியாக விடவும்',
  ]) {
    assert.ok(html.includes(word), word);
  }
  const ta = getMessages('ta');
  assert.equal(ta.contactPageTitle, 'தொடர்பு');
  assert.equal(ta.contactLinkLabel, 'தொடர்புக்கு');
  assert.match(String(ta.contactDefaultIntro), /^கேள்வி/);
});

test('the sitemap lists /contact/ like About; feeds, the search index and the llms files do not mention it', async () => {
  const input = await inputWith({ enabled: true, fields: FIELDS });
  const pages = pagesOf(input);
  const sitemap = buildSitemap({
    generatedPages: pages,
    basePath: '/fixture-1',
    baseUrl: input.baseUrl,
    routeProfile: 'directory-index',
  });
  const loc = (/** @type {string} */ route) =>
    `<loc>${new URL(`/fixture-1${route}/`, input.baseUrl)}</loc>`;
  assert.ok(sitemap.includes(loc('/contact')), 'contact is in the sitemap');
  assert.ok(sitemap.includes(loc('/about')), 'as About is');
  assert.ok(sitemap.includes(loc('/terms')));

  const feeds = buildFeeds(input, {
    feedBody: (body) => body,
    routeProfile: 'directory-index',
  });
  const llms = buildLlmsDocuments(input, {
    rss: feeds.rssSelfUrl,
    atom: feeds.atomSelfUrl,
    sitemap: `${input.baseUrl}sitemap.xml`,
    searchIndex: `${input.baseUrl}search-index.json`,
    full: `${input.baseUrl}llms-full.txt`,
    routeProfile: 'directory-index',
  });
  for (const [label, text] of [
    ['atom', feeds.atomXml],
    ['rss', feeds.rssXml],
    ['search index', buildSearchIndex(input, 'directory-index')],
    ['llms.txt', llms.llmsTxt],
    ['llms-full.txt', llms.llmsFullTxt],
  ]) {
    assert.ok(!/\/contact\b/.test(text), `${label} has no /contact`);
  }
});

test('the footer legal navigation gains Contact after Privacy only while the form is on', () => {
  const footer = (/** @type {boolean | undefined} */ contactOn) =>
    renderFooter({
      homeRoute: '/',
      publicationName: 'Notes',
      description: 'About notes.',
      brandMark: undefined,
      socialLinks: [],
      rssHref: '/feed/rss.xml',
      primaryItems: [],
      footerItems: [],
      urlPrefix: '/',
      authorHtml: '',
      footerProfileHtml: '',
      copyrightText: '© Notes',
      showAttribution: false,
      messages: getMessages('en'),
      footerLayout: 'expanded',
      baseUrl: 'https://notes.example.test/',
      publicBasePath: '/',
      ...(contactOn === undefined ? {} : { contactOn }),
    });
  const legal =
    '<nav class="g-footer-legal" aria-label="Legal"><ul><li><a href="/terms/">Terms</a></li><li><a href="/privacy/">Privacy</a></li>';
  assert.ok(footer(undefined).includes(`${legal}</ul></nav>`));
  assert.equal(footer(false), footer(undefined));
  assert.ok(
    footer(true).includes(
      `${legal}<li><a href="/contact/">Contact</a></li></ul></nav>`,
    ),
  );
  // The Tamil footer names it in Tamil.
  const ta = renderFooter({
    homeRoute: '/',
    publicationName: 'Notes',
    description: 'About notes.',
    brandMark: undefined,
    socialLinks: [],
    rssHref: '/feed/rss.xml',
    primaryItems: [],
    footerItems: [],
    urlPrefix: '/',
    authorHtml: '',
    footerProfileHtml: '',
    copyrightText: '© Notes',
    showAttribution: false,
    messages: getMessages('ta'),
    footerLayout: 'expanded',
    baseUrl: 'https://notes.example.test/',
    publicBasePath: '/',
    contactOn: true,
  });
  assert.ok(ta.includes('<li><a href="/contact/">தொடர்புக்கு</a></li>'));
});

test('while the form is on, /contact is reserved: a document or redirect that takes it fails the build closed', async () => {
  const input = /** @type {any} */ (await buildRichFixture());
  // The fixture's own authored Contact page owns /contact.
  assert.doesNotThrow(() =>
    assertPolicyRoutesFree(input.content, contentRoute),
  );
  assert.throws(
    () => assertPolicyRoutesFree(input.content, contentRoute, [CONTACT_ROUTE]),
    (/** @type {any} */ error) => {
      const [diagnostic] = error.diagnostics;
      assert.equal(error.diagnostics.length, 1);
      assert.equal(diagnostic.code, 'POLICY_ROUTE_CONFLICT');
      assert.match(
        diagnostic.remediation,
        /uses \/contact, which the generated Contact page owns \(the site has its contact form on\)\. Rename or move it\./,
      );
      return true;
    },
  );
  const redirected = /** @type {any} */ (await inputWith(undefined));
  redirected.content[0].frontmatter.redirects = ['/Contact/'];
  assert.throws(
    () =>
      assertPolicyRoutesFree(redirected.content, contentRoute, [CONTACT_ROUTE]),
    (/** @type {any} */ error) => {
      assert.equal(error.diagnostics.length, 1);
      assert.equal(error.diagnostics[0].code, 'POLICY_ROUTE_CONFLICT');
      return true;
    },
  );
  assert.doesNotThrow(() =>
    assertPolicyRoutesFree(redirected.content, contentRoute),
  );
});

// ------------------------------------------------------------------ script ---

/**
 * @param {{website: boolean, phone: boolean}} [fields]
 * @param {string} [language]
 * @returns {string} the contact page's form, in a page that carries the script
 */
function formPage(fields = FIELDS, language = 'en') {
  return audiencePage(
    renderContactForm({ fields, messages: getMessages(language) }),
    language,
  );
}

const accepted = Object.freeze({ status: 202, body: { status: 'RECEIVED' } });
const statusOf = (/** @type {any} */ h) =>
  h.$('[data-form-status]').textContent;
const errorOf = (/** @type {any} */ h, /** @type {string} */ name) =>
  h.$(`[data-field-error="${name}"]`);

/**
 * Fill the named fields and press Send.
 *
 * @param {any} h harness
 * @param {Record<string, string>} values
 */
async function send(h, values) {
  for (const [name, value] of Object.entries(values)) {
    h.$(`[name="${name}"]`).value = value;
  }
  h.$('[data-gala-contact-form] button[type="submit"]').click();
  await h.settle();
}

const GOOD = Object.freeze({
  name: ' Ana Lima ',
  email: ' ana@example.com ',
  message: '  Hello there.  ',
});

test('script: the form is revealed, and nothing is requested until Send', async () => {
  const h = await bootAudience(formPage());
  await h.settle();
  assert.equal(h.$('[data-gala-contact-form]').hidden, false);
  assert.equal(h.calls.length, 0);
});

test('script: a message posts name, email, message, trap and the time since page load, trimmed, with no credential', async () => {
  const h = await bootAudience(formPage(), {
    now: 12345.6,
    handler: routed({ [`POST ${MESSAGES}`]: accepted }),
  });
  await h.settle();
  await send(h, GOOD);
  assert.equal(h.calls.length, 1);
  const [call] = h.calls;
  assert.equal(call.method, 'POST');
  assert.equal(call.url, 'https://api.galascribe.com' + MESSAGES);
  assert.deepEqual(call.body, {
    name: 'Ana Lima',
    email: 'ana@example.com',
    message: 'Hello there.',
    trap: '',
    elapsedMs: 12346,
  });
  assert.equal(call.headers.Authorization, undefined);
  assert.equal(call.init.credentials, 'omit');
  assert.equal(statusOf(h), 'Thanks, your message was sent.');
  assert.equal(h.$('[data-gala-contact-form]').dataset.state, 'sent');
  assert.equal(h.$('[name="message"]').value, '', 'the form is cleared');
  assert.equal(h.$('[data-form-status]').getAttribute('aria-live'), 'polite');
});

test('script: elapsed time is whole milliseconds and never above a day', async () => {
  const slow = await bootAudience(formPage(), {
    now: 90_000_000,
    handler: routed({ [`POST ${MESSAGES}`]: accepted }),
  });
  await slow.settle();
  await send(slow, GOOD);
  assert.equal(slow.calls[0].body.elapsedMs, 86_400_000);
  const real = await bootAudience(formPage(), {
    handler: routed({ [`POST ${MESSAGES}`]: accepted }),
  });
  await real.settle();
  await send(real, GOOD);
  const { elapsedMs } = real.calls[0].body;
  assert.ok(Number.isInteger(elapsedMs));
  assert.ok(elapsedMs >= 80 && elapsedMs <= 60_000, String(elapsedMs));
});

test('script: website and phone go only when the form asks for them and they are filled', async () => {
  const both = { website: true, phone: true };
  const filled = await bootAudience(formPage(both), {
    handler: routed({ [`POST ${MESSAGES}`]: accepted }),
  });
  await filled.settle();
  await send(filled, {
    ...GOOD,
    website: ' https://ana.example ',
    phone: ' +1 555 0100 ',
  });
  assert.equal(filled.calls[0].body.website, 'https://ana.example');
  assert.equal(filled.calls[0].body.phone, '+1 555 0100');
  const blank = await bootAudience(formPage(both), {
    handler: routed({ [`POST ${MESSAGES}`]: accepted }),
  });
  await blank.settle();
  await send(blank, { ...GOOD, website: '  ' });
  assert.deepEqual(Object.keys(blank.calls[0].body).sort(), [
    'elapsedMs',
    'email',
    'message',
    'name',
    'trap',
  ]);
  const none = await bootAudience(formPage(), {
    handler: routed({ [`POST ${MESSAGES}`]: accepted }),
  });
  await none.settle();
  await send(none, GOOD);
  assert.ok(!('website' in none.calls[0].body));
  assert.ok(!('phone' in none.calls[0].body));
});

test('script: a filled honeypot is sent as it is and the visitor sees the same thanks', async () => {
  const h = await bootAudience(formPage(), {
    handler: routed({ [`POST ${MESSAGES}`]: accepted }),
  });
  await h.settle();
  await send(h, { ...GOOD, trap: 'http://spam.example' });
  assert.equal(h.calls[0].body.trap, 'http://spam.example');
  assert.equal(statusOf(h), 'Thanks, your message was sent.');
});

test('script: empty required fields show inline errors, link them to the fields, focus the first and send nothing', async () => {
  const h = await bootAudience(formPage());
  await h.settle();
  await send(h, { name: '', email: 'not an address', message: '   ' });
  assert.equal(h.calls.length, 0);
  for (const [name, sentence] of [
    ['name', 'This field is required.'],
    ['email', 'Enter a valid email address.'],
    ['message', 'This field is required.'],
  ]) {
    const slot = errorOf(h, name);
    assert.equal(slot.hidden, false, name);
    assert.equal(slot.textContent, sentence, name);
    const field = h.$(`[name="${name}"]`);
    assert.equal(field.getAttribute('aria-invalid'), 'true', name);
    assert.equal(field.getAttribute('aria-describedby'), slot.id, name);
  }
  assert.equal(h.window.document.activeElement, h.$('[name="name"]'));
});

test('script: fixing the fields clears the errors on the next Send', async () => {
  const h = await bootAudience(formPage(), {
    handler: routed({ [`POST ${MESSAGES}`]: accepted }),
  });
  await h.settle();
  await send(h, { name: '', email: '', message: '' });
  assert.equal(errorOf(h, 'name').hidden, false);
  await send(h, GOOD);
  for (const name of ['name', 'email', 'message']) {
    assert.equal(errorOf(h, name).hidden, true, name);
    assert.equal(errorOf(h, name).textContent, '', name);
  }
  assert.equal(h.$('[name="name"]').hasAttribute('aria-invalid'), false);
});

test('script: a link-heavy message is refused by the API at /message and the field says so', async () => {
  const h = await bootAudience(formPage(), {
    handler: routed({
      [`POST ${MESSAGES}`]: problem(400, 'VALIDATION_FAILED', [
        { pointer: '/message', code: 'VALIDATION_FAILED' },
      ]),
    }),
  });
  await h.settle();
  await send(h, GOOD);
  assert.equal(
    errorOf(h, 'message').textContent,
    'Your message can have at most two links.',
  );
  assert.equal(errorOf(h, 'message').hidden, false);
  assert.equal(h.$('[name="message"]').getAttribute('aria-invalid'), 'true');
  assert.equal(h.window.document.activeElement, h.$('[name="message"]'));
  assert.equal(statusOf(h), 'Check this field.');
  assert.equal(
    h.$('[name="message"]').value.trim(),
    'Hello there.',
    'kept for a retry',
  );
});

test('script: other field problems from the API show beside their fields; an unknown pointer shows in the status', async () => {
  const h = await bootAudience(formPage({ website: true, phone: true }), {
    handler: routed({
      [`POST ${MESSAGES}`]: problem(400, 'VALIDATION_FAILED', [
        { pointer: '/email', code: 'VALIDATION_FAILED' },
        { pointer: '/phone', code: 'VALIDATION_FAILED' },
        { pointer: '/elsewhere', code: 'VALIDATION_FAILED' },
      ]),
    }),
  });
  await h.settle();
  await send(h, GOOD);
  assert.equal(errorOf(h, 'email').textContent, 'Enter a valid email address.');
  assert.equal(errorOf(h, 'phone').textContent, 'Check this field.');
  assert.equal(errorOf(h, 'name').hidden, true);
  assert.equal(statusOf(h), 'Check this field.');
  assert.equal(h.window.document.activeElement, h.$('[name="email"]'));
});

test('script: unavailable, rate limited, unknown site, outage and server error each have their sentence', async () => {
  const cases = [
    [
      problem(409, 'CONTACT_FORM_UNAVAILABLE'),
      "This form isn't accepting messages right now.",
    ],
    [
      problem(429, 'RATE_LIMITED'),
      'Too many messages from here. Try again later.',
    ],
    [
      problem(404, 'PUBLICATION_NOT_LIVE'),
      "This form isn't accepting messages right now.",
    ],
    [new Error('offline'), "Couldn't reach Galascribe. Try again."],
    [{ status: 500, body: {} }, 'Something went wrong. Try again.'],
  ];
  for (const [answer, sentence] of cases) {
    const h = await bootAudience(formPage(), {
      handler: routed({ [`POST ${MESSAGES}`]: answer }),
    });
    await h.settle();
    await send(h, GOOD);
    assert.equal(statusOf(h), sentence);
    assert.equal(h.$('[data-gala-contact-form]').dataset.state, 'error');
    assert.equal(h.$('[name="message"]').value.trim(), 'Hello there.', 'kept');
  }
});

test('script: a second press while the request is out sends nothing', async () => {
  /** @type {(value: any) => void} */
  let release = () => {};
  const h = await bootAudience(formPage(), {
    handler: routed({
      [`POST ${MESSAGES}`]: () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    }),
  });
  await h.settle();
  await send(h, GOOD);
  const submit = h.$('[data-gala-contact-form] button[type="submit"]');
  assert.equal(submit.getAttribute('aria-busy'), 'true');
  submit.click();
  await h.settle();
  assert.equal(h.calls.length, 1);
  release(accepted);
  await h.settle();
  assert.equal(statusOf(h), 'Thanks, your message was sent.');
  assert.equal(submit.hasAttribute('aria-busy'), false);
});

test('script: Tamil pages answer and flag fields in Tamil', async () => {
  const h = await bootAudience(formPage(FIELDS, 'ta'), {
    handler: routed({ [`POST ${MESSAGES}`]: accepted }),
  });
  await h.settle();
  await send(h, { name: '', email: '', message: '' });
  assert.equal(errorOf(h, 'name').textContent, 'இந்தப் புலம் தேவை.');
  await send(h, GOOD);
  assert.equal(statusOf(h), 'நன்றி, உங்கள் செய்தி அனுப்பப்பட்டது.');
});
