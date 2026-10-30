/**
 * Listen (audio versions of posts), render side: the "is it live" decision,
 * the emitted audio paths, the top-bar button, the home page playlist, the UI
 * `<template>` and the JSON blobs the one browser script
 * (`src/modules/interactions/browser/gala-listen.js`) reads. The template renders
 * markup and data only; every playback, storage and analytics call lives in
 * the script.
 *
 * Everything is opt-in and silent when off. Listen is live for a build when
 * `publication.listen.enabled` is `true` AND at least one published article
 * carries a `listen` member. A build that is not live renders the bytes it
 * rendered before this feature existed, emits no audio and loads no script.
 *
 * A live build gives every page the top-bar button, the config and message
 * blobs, the UI `<template>` and the script tag; an article page with audio
 * also gets its track blob, and the home page gets the playlist section with
 * the track list. Only published posts' audio is emitted, once, as-is, at
 * `assets/listen/<slug>.<first 8 hex of sha256>.<ext>`.
 *
 * DOM contract (the script finds everything by `data-gala-listen-*`; classes
 * are for styling only):
 * - `<script type="application/json" data-gala-listen-config>`: site title,
 *   playlist address, artwork;
 * - `<script type="application/json" data-gala-listen-messages>`: one flat
 *   object keyed by the dotted keys of {@link LISTEN_MESSAGE_KEYS}; a value
 *   that takes arguments carries `{name}` placeholders for the script to fill;
 * - `<script type="application/json" data-gala-listen-current>`: one track
 *   (article pages with audio only);
 * - `<script type="application/json" data-gala-listen-tracks>`: the tracks,
 *   newest first (inside the playlist section on the home page only);
 * - `<template data-gala-listen-ui>`: the invitation and player, cloned by the
 *   script.
 */

import { readFile } from 'node:fs/promises';

import { MediaPipelineError } from '../errors.js';
import { escapeHtml } from './skeleton.js';
import { serializeJsonLd } from './structured-data.js';

/** @type {string} the emitted script's output-relative path */
export const LISTEN_SCRIPT_PATH = 'assets/gala-listen-v1.js';

/** @type {string} */
export const LISTEN_SCRIPT_MEDIA_TYPE = 'application/javascript; charset=utf-8';

const LISTEN_SCRIPT_SOURCE_URL = new URL(
  '../../modules/interactions/browser/gala-listen.js',
  import.meta.url,
);

/** @type {string} where the audio files are emitted (output-relative) */
export const LISTEN_AUDIO_DIRECTORY = 'assets/listen';

/** @type {string} the playlist section's `id`, the top-bar link's fragment */
export const LISTEN_SECTION_ID = 'listen';

/** @type {Readonly<Record<string, string>>} media type -> file extension */
const EXTENSION_BY_MEDIA_TYPE = Object.freeze({
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
});

/**
 * @typedef {import('../../../types/index.d.ts').ListenNormalized} ListenNormalized
 * @typedef {import('../../../types/index.d.ts').ContentBuildRecord} ContentBuildRecord
 * @typedef {Readonly<Record<string, string | ((...args: string[]) => string)>>} Messages
 */

/**
 * @typedef {object} ListenEntry one published article with audio
 * @property {ContentBuildRecord} record the article
 * @property {ListenNormalized} listen its normalised `listen` member
 * @property {string} path the audio file's output-relative path
 *   (`assets/listen/<slug>.<hash8>.<ext>`), before the base path is joined
 * @property {string} href the same file's public address (base path joined)
 */

/**
 * @typedef {object} ListenTrack one episode, as the script reads it
 * @property {string} id the content id
 * @property {string} slug
 * @property {string} title
 * @property {string} url the post's absolute path
 * @property {string} audio the emitted file's absolute path
 * @property {number} durationSeconds
 * @property {string} format `conversation`, `narration`, `debate` or `skit`
 * @property {string} publishedAt an ISO date-time
 */

/**
 * @typedef {object} ListenResolution
 * @property {boolean} live whether Listen is live for this build
 * @property {ListenEntry[]} entries every published article with audio, in
 *   the order of the articles given (newest first); empty unless live
 * @property {Map<ContentBuildRecord, ListenEntry>} byRecord the same entries
 *   by article
 */

/**
 * The `listen` member of a content record's normalised front matter.
 *
 * @param {ContentBuildRecord} record
 * @returns {ListenNormalized | undefined}
 */
export function listenOf(record) {
  return record.frontmatter.listen;
}

/**
 * The bare 64 lowercase hexadecimal characters of an audio digest, whether it
 * is written `sha256:<hex>` or as the bare hexadecimal.
 *
 * @param {string} sha256 the declared digest
 * @returns {string | undefined} the hexadecimal, or `undefined` when malformed
 */
export function audioDigestHex(sha256) {
  const match = /^(?:sha256:)?([0-9a-f]{64})$/.exec(sha256);
  return match?.[1];
}

/**
 * The output-relative path one audio file is emitted at.
 *
 * @param {string} slug the article's slug
 * @param {ListenNormalized['audio']} audio the normalised audio
 * @returns {string} `assets/listen/<slug>.<first 8 hex of sha256>.<ext>`
 */
export function listenAudioPath(slug, audio) {
  const extension = EXTENSION_BY_MEDIA_TYPE[audio.mediaType];
  const hex = audioDigestHex(audio.sha256);
  if (extension === undefined || hex === undefined) {
    throw new MediaPipelineError(
      'MEDIA_FORMAT_INVALID',
      'listen audio must be audio/mpeg or audio/mp4 with a sha256 digest',
      audio.sourcePath,
    );
  }
  return `${LISTEN_AUDIO_DIRECTORY}/${slug}.${hex.slice(0, 8)}.${extension}`;
}

/**
 * Decide whether Listen is live and which published articles carry audio.
 *
 * @param {object} options
 * @param {import('../../../types/index.d.ts').PublicationNormalized} options.publication
 * @param {readonly ContentBuildRecord[]} options.articles every published
 *   article (`status: "published"`, `kind: "article"`), newest first; an
 *   unlisted post's audio is never emitted
 * @param {(path: string) => string} options.hrefOf a file's output-relative
 *   path to its public address
 * @returns {ListenResolution}
 */
export function resolveListen({ publication, articles, hrefOf }) {
  /** @type {ListenEntry[]} */
  const entries = [];
  if (publication.listen?.enabled === true) {
    for (const record of articles) {
      const listen = listenOf(record);
      if (!listen) continue;
      const entryPath = listenAudioPath(record.frontmatter.slug, listen.audio);
      entries.push({
        record,
        listen,
        path: entryPath,
        href: hrefOf(entryPath),
      });
    }
  }
  return {
    live: entries.length > 0,
    entries,
    byRecord: new Map(entries.map((entry) => [entry.record, entry])),
  };
}

/**
 * One episode as the script reads it.
 *
 * @param {ListenEntry} entry the article's resolved audio
 * @param {string} url the post's absolute path
 * @returns {ListenTrack}
 */
export function listenTrackOf(entry, url) {
  const { frontmatter } = entry.record;
  return {
    id: frontmatter.id,
    slug: frontmatter.slug,
    title: frontmatter.title,
    url,
    audio: entry.href,
    durationSeconds: entry.listen.durationSeconds,
    format: entry.listen.format,
    publishedAt: frontmatter.publishedAt,
  };
}

/**
 * Read the Listen script's bytes from the template package.
 *
 * @returns {Promise<Buffer>} the script bytes
 */
export function loadListenScript() {
  return readFile(LISTEN_SCRIPT_SOURCE_URL);
}

/**
 * Every string the script and the markup need: the dotted key the blob uses,
 * the catalog key, and the placeholders the catalog function takes (in
 * order). A function-valued string reaches the blob with each placeholder as
 * the literal `{name}` for the script to replace.
 *
 * @type {ReadonlyArray<readonly [string, string, ReadonlyArray<string>?]>}
 */
export const LISTEN_MESSAGE_KEYS = [
  ['nav.label', 'listenNavLabel'],
  ['nav.current', 'listenNavCurrentLabel'],
  ['invite.title', 'listenInviteTitle'],
  ['invite.body.conversation', 'listenInviteBodyConversation', ['minutes']],
  ['invite.body.narration', 'listenInviteBodyNarration', ['minutes']],
  ['invite.body.debate', 'listenInviteBodyDebate', ['minutes']],
  ['invite.body.skit', 'listenInviteBodySkit', ['minutes']],
  ['invite.play', 'listenInvitePlayLabel'],
  ['invite.decline', 'listenInviteDeclineLabel'],
  ['invite.note', 'listenInviteNote'],
  ['invite.close', 'listenInviteCloseLabel'],
  ['player.region', 'listenPlayerRegionLabel'],
  ['player.nowPlaying', 'listenPlayerNowPlayingLabel'],
  ['player.position', 'listenPlayerPositionLabel', ['index', 'count']],
  ['player.play', 'listenPlayerPlayLabel'],
  ['player.pause', 'listenPlayerPauseLabel'],
  ['player.back', 'listenPlayerBackLabel'],
  ['player.previous', 'listenPlayerPreviousLabel'],
  ['player.next', 'listenPlayerNextLabel'],
  ['player.speed', 'listenPlayerSpeedLabel', ['rate']],
  ['player.seek', 'listenPlayerSeekLabel'],
  ['player.time', 'listenPlayerTimeLabel', ['elapsed', 'total']],
  ['player.close', 'listenPlayerCloseLabel'],
  ['player.playing', 'listenPlayerPlayingAnnouncement', ['title']],
  ['list.heading', 'listenListHeading'],
  ['list.summary', 'listenListSummary', ['count', 'duration']],
  ['list.playAll', 'listenListPlayAllLabel'],
  ['list.shuffle', 'listenListShuffleLabel'],
  ['list.order', 'listenListOrderLabel'],
  ['list.newest', 'listenListNewestLabel'],
  ['list.oldest', 'listenListOldestLabel'],
  ['list.showAll', 'listenListShowAllLabel', ['count']],
  ['list.playTrack', 'listenListPlayTrackLabel', ['title']],
  ['duration.minutes', 'listenDurationMinutes', ['minutes']],
  ['duration.hoursMinutes', 'listenDurationHoursMinutes', ['hours', 'minutes']],
];

/**
 * @param {Messages} messages the page's catalog
 * @param {string} key a catalog key
 * @param {...string} args the catalog function's arguments
 * @returns {string} the unescaped text
 */
function say(messages, key, ...args) {
  const value = messages[key];
  return typeof value === 'function' ? value(...args) : String(value);
}

/**
 * @param {Messages} messages the page's catalog
 * @param {string} key a catalog key
 * @param {...string} args the catalog function's arguments
 * @returns {string} the text, escaped for HTML
 */
function sayHtml(messages, key, ...args) {
  return escapeHtml(say(messages, key, ...args));
}

/**
 * Minutes shown for a length: whole minutes, never less than one.
 *
 * @param {number} seconds a length in seconds
 * @returns {number}
 */
export function listenMinutes(seconds) {
  return Math.max(1, Math.round(seconds / 60));
}

/**
 * A length as the page shows it: `7 min`, or `1 h 5 min` from an hour.
 *
 * @param {number} seconds a length in seconds
 * @param {Messages} messages the page's catalog
 * @returns {string} the unescaped text
 */
export function formatListenDuration(seconds, messages) {
  const minutes = listenMinutes(seconds);
  return minutes < 60
    ? say(messages, 'listenDurationMinutes', String(minutes))
    : say(
        messages,
        'listenDurationHoursMinutes',
        String(Math.floor(minutes / 60)),
        String(minutes % 60),
      );
}

/**
 * The strings the script needs at run time, in the page's language, as one
 * JSON object keyed by the dotted keys of {@link LISTEN_MESSAGE_KEYS}.
 *
 * @param {Messages} messages the page's catalog
 * @returns {string} the JSON, escaped for embedding in HTML
 */
export function serializeListenMessages(messages) {
  return serializeJsonLd(
    Object.fromEntries(
      LISTEN_MESSAGE_KEYS.map(([key, name, params = []]) => [
        key,
        say(messages, name, ...params.map((param) => `{${param}}`)),
      ]),
    ),
  );
}

/**
 * The `<svg>` of one Listen icon: decorative, painted by the base layer
 * (`fill: none; stroke: currentColor`, with filled parts carrying their own
 * `fill="currentColor" stroke="none"`).
 *
 * @param {string} viewBox the icon's view box
 * @param {string} paths the icon's drawing elements
 * @param {string} [extraClass] a class the script looks up
 * @param {boolean} [hidden] whether the icon starts `hidden`
 * @returns {string}
 */
function svg(viewBox, paths, extraClass, hidden = false) {
  return `<svg class="g-icon${extraClass ? ` ${extraClass}` : ''}" viewBox="${viewBox}" aria-hidden="true" focusable="false"${hidden ? ' hidden' : ''}>${paths}</svg>`;
}

const FILLED = 'fill="currentColor" stroke="none"';

/** @type {Readonly<Record<string, string>>} */
const ICONS = Object.freeze({
  headphones: svg(
    '0 0 24 24',
    '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="7" rx="1.6"/><rect x="17" y="14" width="4" height="7" rx="1.6"/>',
  ),
  bars: svg(
    '0 0 22 22',
    `<g class="g-bars" ${FILLED}><rect x="3" y="6" width="3.2" height="12" rx="1.6"/><rect x="9.4" y="2.5" width="3.2" height="15.5" rx="1.6"/><rect x="15.8" y="8" width="3.2" height="10" rx="1.6"/></g>`,
  ),
  play: svg(
    '0 0 14 14',
    `<path ${FILLED} d="M3 1.8v10.4a.8.8 0 0 0 1.2.7l8.6-5.2a.8.8 0 0 0 0-1.4L4.2 1.1A.8.8 0 0 0 3 1.8z"/>`,
  ),
  playToggle: svg(
    '0 0 14 14',
    `<path ${FILLED} d="M3 1.8v10.4a.8.8 0 0 0 1.2.7l8.6-5.2a.8.8 0 0 0 0-1.4L4.2 1.1A.8.8 0 0 0 3 1.8z"/>`,
    'i-play',
    true,
  ),
  pause: svg(
    '0 0 18 18',
    `<rect ${FILLED} x="3.5" y="2.5" width="4" height="13" rx="1.2"/><rect ${FILLED} x="10.5" y="2.5" width="4" height="13" rx="1.2"/>`,
    'i-pause',
  ),
  close: svg('0 0 14 14', '<path d="M3 3l8 8M11 3l-8 8"/>'),
  back: svg(
    '0 0 20 20',
    '<path d="M4.5 7.5A6.5 6.5 0 1 1 3.5 11"/><path d="M4 3.5v4h4"/>',
  ),
  previous: svg(
    '0 0 24 24',
    `<path d="M6 5v14"/><path ${FILLED} d="M19 5.5v13a.8.8 0 0 1-1.25.66l-9-6.5a.8.8 0 0 1 0-1.32l9-6.5A.8.8 0 0 1 19 5.5z"/>`,
  ),
  next: svg(
    '0 0 24 24',
    `<path d="M18 5v14"/><path ${FILLED} d="M5 5.5v13a.8.8 0 0 0 1.25.66l9-6.5a.8.8 0 0 0 0-1.32l-9-6.5A.8.8 0 0 0 5 5.5z"/>`,
  ),
  shuffle: svg(
    '0 0 24 24',
    '<path d="M4 7h3l10 10h3"/><path d="M4 17h3l3-3M13 11l4-4h3"/><path d="m17 4 3 3-3 3"/><path d="m17 14 3 3-3 3"/>',
  ),
});

/**
 * The top-bar button: a `<button>` that opens the player with this post on an
 * article page that has audio, otherwise a link to the home page playlist
 * (which works without JavaScript). The label shows from 600px wide; below
 * that the icon shows alone and the accessible name comes from the visually
 * hidden label.
 *
 * @param {object} options
 * @param {Messages} options.messages the page's catalog
 * @param {string} options.playlistUrl the home page playlist address
 * @param {boolean} options.current whether this page's own post has audio
 * @returns {string}
 */
export function renderListenNav({ messages, playlistUrl, current }) {
  const label = `<span class="g-listen-nav__label">${sayHtml(messages, 'listenNavLabel')}</span>`;
  return current
    ? `<button type="button" class="g-listen-nav" data-gala-listen-open="current" aria-label="${sayHtml(messages, 'listenNavCurrentLabel')}">${ICONS.headphones}${label}</button>`
    : `<a class="g-listen-nav" href="${escapeHtml(playlistUrl)}" data-gala-listen-open="playlist">${ICONS.headphones}${label}</a>`;
}

/**
 * The invitation and player, inert inside a `<template>`; the script clones it.
 *
 * @param {Messages} messages the page's catalog
 * @returns {string}
 */
export function renderListenUi(messages) {
  const text = (/** @type {string} */ key) => sayHtml(messages, key);
  const close = (/** @type {string} */ act, /** @type {string} */ key) =>
    `<button type="button" class="g-listen__close" data-gala-listen-act="${act}" aria-label="${text(key)}">${ICONS.close}</button>`;
  const round = (
    /** @type {string} */ act,
    /** @type {string} */ key,
    /** @type {string} */ icon,
    hidden = false,
  ) =>
    `<button type="button" class="g-listen__round" data-gala-listen-act="${act}" aria-label="${text(key)}"${hidden ? ' hidden' : ''}>${icon}</button>`;
  return (
    `<template data-gala-listen-ui>` +
    `<aside class="g-listen" aria-labelledby="g-listen-title">` +
    `<div class="g-listen__invite">` +
    `<span class="g-listen__icon" aria-hidden="true">${ICONS.bars}</span>` +
    `<p class="g-listen__title" id="g-listen-title">${text('listenInviteTitle')}</p>` +
    `<p class="g-listen__body" data-gala-listen-slot="invite-body"></p>` +
    `<div class="g-listen__actions">` +
    `<button type="button" class="g-listen__yes" data-gala-listen-act="yes">${ICONS.play}${text('listenInvitePlayLabel')}</button>` +
    `<button type="button" class="g-listen__no" data-gala-listen-act="no">${text('listenInviteDeclineLabel')}</button>` +
    `</div>` +
    `<p class="g-listen__note">${text('listenInviteNote')}</p>` +
    close('later', 'listenInviteCloseLabel') +
    `</div>` +
    `<div class="g-listen__player" role="region" aria-label="${text('listenPlayerRegionLabel')}" hidden>` +
    `<div class="g-listen__now">` +
    `<span class="g-listen__icon" aria-hidden="true">${ICONS.bars}</span>` +
    `<div class="g-listen__meta">` +
    `<p class="g-listen__label" data-gala-listen-slot="label"></p>` +
    `<a class="g-listen__name" data-gala-listen-slot="name" href=""></a>` +
    `</div></div>` +
    `<input class="g-listen__seek" id="g-listen-seek" type="range" min="0" step="1" value="0" aria-label="${text('listenPlayerSeekLabel')}">` +
    `<div class="g-listen__row">` +
    `<span class="g-listen__time" data-gala-listen-slot="time" aria-hidden="true"></span>` +
    round('prev', 'listenPlayerPreviousLabel', ICONS.previous, true) +
    round('back', 'listenPlayerBackLabel', ICONS.back) +
    `<button type="button" class="g-listen__toggle" data-gala-listen-act="toggle" aria-label="${text('listenPlayerPauseLabel')}">${ICONS.pause}${ICONS.playToggle}</button>` +
    round('next', 'listenPlayerNextLabel', ICONS.next, true) +
    `<button type="button" class="g-listen__speed" data-gala-listen-act="speed">1×</button>` +
    `</div>` +
    close('stop', 'listenPlayerCloseLabel') +
    `<p class="g-listen__status" data-gala-listen-slot="status" aria-live="polite"></p>` +
    `</div>` +
    `<audio preload="none"></audio>` +
    `</aside>` +
    `</template>`
  );
}

/**
 * The per-page Listen fragment, appended after the footer: the config and
 * message blobs, this page's own track (an article with audio), and the UI
 * template.
 *
 * @param {object} options
 * @param {Messages} options.messages the page's catalog
 * @param {{siteTitle: string, playlistUrl: string, artwork: string | null}} options.config
 * @param {ListenTrack} [options.current] the page's own track
 * @returns {string}
 */
export function renderListenPage({ messages, config, current }) {
  return (
    `<script type="application/json" data-gala-listen-config>${serializeJsonLd(config)}</script>` +
    `<script type="application/json" data-gala-listen-messages>${serializeListenMessages(messages)}</script>` +
    (current
      ? `<script type="application/json" data-gala-listen-current>${serializeJsonLd(current)}</script>`
      : '') +
    renderListenUi(messages)
  );
}

/**
 * The home page playlist section: a plain list of links without JavaScript
 * (the controls and play buttons ship `hidden`; the script reveals them), with
 * the track list as a JSON blob.
 *
 * @param {object} options
 * @param {readonly ListenTrack[]} options.tracks the episodes, newest first
 * @param {Messages} options.messages the home page's catalog
 * @returns {string}
 */
export function renderListenPlaylist({ tracks, messages }) {
  const totalSeconds = tracks.reduce(
    (sum, track) => sum + track.durationSeconds,
    0,
  );
  const act = (
    /** @type {string} */ name,
    /** @type {string} */ icon,
    /** @type {string} */ key,
  ) =>
    `<button type="button" data-gala-listen-act="${name}">${icon}${sayHtml(messages, key)}</button>`;
  const rows = tracks
    .map(
      (track) =>
        `<li data-gala-listen-track="${escapeHtml(track.id)}">` +
        `<button type="button" data-gala-listen-act="play-track" data-gala-listen-track-id="${escapeHtml(track.id)}" aria-label="${sayHtml(messages, 'listenListPlayTrackLabel', track.title)}" hidden>${ICONS.play}</button>` +
        `<a href="${escapeHtml(track.url)}">${escapeHtml(track.title)}</a> ` +
        `<span class="g-listen-list__len">${escapeHtml(formatListenDuration(track.durationSeconds, messages))}</span> ` +
        `<time datetime="${escapeHtml(track.publishedAt)}">${sayHtml(messages, 'formatDate', track.publishedAt)}</time>` +
        `</li>`,
    )
    .join('');
  return (
    `<section id="${LISTEN_SECTION_ID}" class="g-listen-list" aria-labelledby="g-listen-list-title" data-gala-listen-list>` +
    `<div class="g-listen-list__head">` +
    `<h2 id="g-listen-list-title">${sayHtml(messages, 'listenListHeading')}</h2>` +
    `<p class="g-listen-list__summary">${sayHtml(messages, 'listenListSummary', String(tracks.length), formatListenDuration(totalSeconds, messages))}</p>` +
    `</div>` +
    `<div class="g-listen-list__controls" data-gala-listen-controls hidden>` +
    act('play-all', ICONS.play, 'listenListPlayAllLabel') +
    act('shuffle', ICONS.shuffle, 'listenListShuffleLabel') +
    `<label for="g-listen-order">${sayHtml(messages, 'listenListOrderLabel')}</label>` +
    `<select id="g-listen-order" data-gala-listen-order>` +
    `<option value="newest">${sayHtml(messages, 'listenListNewestLabel')}</option>` +
    `<option value="oldest">${sayHtml(messages, 'listenListOldestLabel')}</option>` +
    `</select>` +
    `</div>` +
    `<ol class="g-listen-list__tracks" data-gala-listen-tracklist>${rows}</ol>` +
    `<button type="button" data-gala-listen-act="show-all" hidden>${sayHtml(messages, 'listenListShowAllLabel', String(tracks.length))}</button>` +
    `<script type="application/json" data-gala-listen-tracks>${serializeJsonLd(tracks)}</script>` +
    `</section>`
  );
}
