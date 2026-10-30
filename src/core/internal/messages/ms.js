/**
 * Chrome message catalog for the `ms` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Langkau ke kandungan',
  homeLinkLabel: 'Laman Utama',
  primaryNavigationLabel: 'Utama',
  footerNavigationLabel: 'Pengaki',
  breadcrumbNavigationLabel: 'Jejak navigasi',
  paginationNavigationLabel: 'Penomboran halaman',
  previousPageLabel: 'Sebelumnya',
  nextPageLabel: 'Seterusnya',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Halaman ${current} daripada ${total}`,
  authorsSectionLabel: 'Penulis',
  tagsSectionLabel: 'Teg',
  seriesSectionLabel: 'Siri',
  archiveSectionLabel: 'Arkib',
  indexHeading: 'Semua artikel',
  authorsIndexLabel: 'Penulis',
  tagIndexLabelPrefix: 'Teg:',
  seriesIndexLabelPrefix: 'Siri:',
  archiveYearLabelPrefix: 'Arkib:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Tentang ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Oleh ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, dibuka dalam tab baharu',
  footerLegalLabel: 'Perundangan',
  termsLinkLabel: 'Terma',
  privacyLinkLabel: 'Privasi',
  consentRegionLabel: 'Pilihan privasi',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Laman ini ingin menggunakan ${providerName} untuk memahami khalayak pembaca. Tiada apa-apa dimuatkan sehingga anda bersetuju, dan anda boleh menukar pilihan pada bila-bila masa dari pengaki.`,
  consentAcceptLabel: 'Terima analitik',
  consentDeclineLabel: 'Tolak',
  consentOpenLabel: 'Pilihan privasi',
  errorPageHeading: 'Halaman tidak ditemui',
  errorPageBody:
    'Halaman yang anda cari tidak ditemui. Mungkin ia telah dialihkan, dinamakan semula atau dibuang.',
  errorPageReturnHomeLabel: 'Kembali ke laman utama',
  appearanceControlLabel: 'Penampilan',
  appearanceModeLightLabel: 'Cerah',
  appearanceModeDarkLabel: 'Gelap',
  appearanceModeSystemLabel: 'Sistem',
  searchButtonLabel: 'Cari',
  searchButtonAriaLabel: 'Cari artikel',
  searchPlaceholderLabel: 'Cari dalam penerbitan',
  searchEmptyLabel: 'Tiada artikel sepadan dengan carian anda.',
  searchUnavailableLabel: 'Carian tidak tersedia buat masa ini.',
  copyCodeLabel: 'Salin',
  copiedLabel: 'Disalin',
  linkCopiedLabel: 'Pautan disalin.',
  copyBlockedLabel:
    'Penyalinan disekat di sini. Salin alamat daripada pelayar anda.',
  codeSelectedLabel: 'Kod dipilih. Tekan Ctrl C atau Command C untuk menyalin.',
  savedLabel: 'Disimpan untuk kemudian.',
  unsavedLabel: 'Dibuang daripada artikel tersimpan.',
  menuSummaryLabel: 'Menu',
  featuredLabel: 'Pilihan',
  readEssayLabel: 'Baca esei',
  latestHeading: 'Terkini',
  moreArticlesHeading: 'Lagi artikel',
  browseByTagLabel: 'Layari mengikut teg',
  seriesCardLabel: 'Siri',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count} bahagian`,
  startSeriesLabel: 'Mulakan dengan bahagian 1',
  newsletterLabel: 'Surat berita',
  newsletterActionLabel: 'Langgan',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} min bacaan`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Bahagian ${part} daripada ${total}`,
  onThisPageLabel: 'Pada halaman ini',
  writtenByLabel: 'Ditulis oleh',
  aboutTheAuthorLabel: 'Tentang penulis',
  youAreHereLabel: 'Anda di sini',
  newerArticleLabel: 'Lebih baharu',
  olderArticleLabel: 'Lebih lama',
  moreArticlesNavigationLabel: 'Lagi artikel',
  keepReadingHeading: 'Teruskan membaca',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Lagi dalam ${tag}`,
  interactionsHeading: 'Maklum balas',
  reactionsGroupLabel: 'Reaksi',
  likeLabel: 'Suka',
  commentsHeading: 'Perbincangan',
  interactionsNeedScriptNotice: 'Reaksi dan komen memerlukan JavaScript.',
  showMoreCommentsLabel: 'Tunjuk lagi komen',
  shareLabel: 'Kongsi',
  copyLinkLabel: 'Salin pautan artikel ini',
  saveForLaterLabel: 'Simpan untuk kemudian',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Kongsi di ${network}`,
  shareByEmailLabel: 'Kongsi melalui e-mel',
  shareNativeLabel: 'Kongsi artikel ini',
  followLabel: 'Ikuti',
  followingLabel: 'Mengikuti',
  unfollowLabel: 'Berhenti ikuti',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Ikuti ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Berhenti mengikuti ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Anda kini mengikuti ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Anda tidak lagi mengikuti ${name}.`,
  followDisabledMessage:
    'Fungsi ikuti tidak tersedia di laman ini buat masa ini.',
  followAuthorMissingMessage: 'Penulis ini tidak dapat diikuti buat masa ini.',
  audienceNetworkError: 'Tidak dapat menghubungi Galascribe. Cuba lagi.',
  audienceRateLimited: 'Terlalu banyak percubaan. Cuba lagi sebentar nanti.',
  audienceGenericError: 'Sesuatu telah berlaku. Cuba lagi.',
  audienceStorageBlocked:
    'Pelayar anda menyekat storan yang diperlukan laman ini untuk melog masuk.',
  audienceSignInUnsupported:
    'Pelayar ini tidak dapat melog masuk anda pada halaman ini.',
  audienceSignInFailed: 'Log masuk tidak selesai. Cuba lagi.',
  audienceSignInInvalid: 'Pautan log masuk itu tidak sah. Cuba lagi.',
  honeypotLabel: 'Biarkan medan ini kosong',
  fieldRequiredMessage: 'Medan ini diperlukan.',
  fieldInvalidMessage: 'Semak medan ini.',
  newsletterEmailLabel: 'Alamat e-mel',
  newsletterCheckInbox: 'Semak peti masuk anda untuk mengesahkan',
  newsletterFullMessage:
    'Surat berita ini tidak menerima pelanggan baharu buat masa ini.',
  newsletterEmailInvalid: 'Masukkan alamat e-mel yang sah.',
  contactLinkLabel: 'Hubungi',
  contactPageTitle: 'Hubungi',
  contactDefaultIntro:
    'Ada soalan atau sesuatu untuk dikatakan? Hantar mesej dan penulis akan membalas melalui e-mel.',
  contactNameLabel: 'Nama',
  contactEmailLabel: 'E-mel',
  contactMessageLabel: 'Mesej',
  contactWebsiteLabel: 'Laman web (pilihan)',
  contactPhoneLabel: 'Telefon (pilihan)',
  contactSubmitLabel: 'Hantar mesej',
  contactNoscript:
    'Borang ini memerlukan JavaScript. Hidupkannya untuk menghantar mesej.',
  contactSent: 'Terima kasih, mesej anda telah dihantar.',
  contactUnavailable: 'Borang ini tidak menerima mesej buat masa ini.',
  contactRateLimited: 'Terlalu banyak mesej dari sini. Cuba lagi kemudian.',
  contactMessageLinks: 'Mesej anda boleh mengandungi paling banyak dua pautan.',
  tagListLabel: 'Teg',
  tagKickerLabel: 'Teg',
  seriesKickerLabel: 'Siri',
  archiveKickerLabel: 'Arkib',
  authorKickerLabel: 'Penulis',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${count} artikel`,
  emptyListingLabel: 'Belum ada artikel.',
  editionsNavigationLabel: 'Edisi',
  editionOriginalLabel: 'Asal',
  editionQuickReadLabel: 'Bacaan pantas',
  editionStandardLabel: 'Standard',
  editionDeepDiveLabel: 'Bacaan mendalam',
  editionNoticeLabel:
    'Edisi dijana, disemak oleh penulis; yang asal ialah rujukan',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Tentang',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Dikemas kini ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Siaran bertanda “${tag}”`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count} artikel bertanda ${tag} di ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, siri ${count} bahagian di ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Arkib ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count} artikel diterbitkan pada ${year} di ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Artikel yang ditulis oleh ${name} di ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Layari ${count} topik yang diliputi di ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Layari ${count} siri yang diterbitkan di ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Setiap artikel di ${publication}, ${count} kesemuanya, mengikut tahun.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Semua artikel di ${publication}, yang terbaharu dahulu.`,
  exploreColumnLabel: 'Teroka',
  rssFeedLabel: 'Suapan RSS',
  languageKickerLabel: 'Bahasa',
  languageSwitcherLabel: 'Bahasa',
  languageChipsLabel: 'Bahasa yang tersedia',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count} artikel dalam ${language} di ${publication}.`,
  postRemovedHeading: 'Siaran ini telah dibuang',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Ia dibuang pada ${date}.`,
  postRemovedHomeLabel: 'Pergi ke laman utama',
  versionPageHeading: 'Versi laman',
  versionTemplateLabel: 'Templat',
  versionThemeLabel: 'Tema',
  versionSchemasLabel: 'Skema',
  versionToolchainLabel: 'Rantaian alat penerbitan',
  versionCommitLabel: 'Commit sumber',
  versionBuiltAtLabel: 'Dibina pada',
  listenNavLabel: 'Dengar',
  listenNavCurrentLabel: 'Dengar catatan ini',
  listenInviteTitle: 'Tangan sibuk? Dengar sahaja.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Catatan ini juga tersedia sebagai perbualan selama ${minutes} minit. Sesuai untuk memandu, bersenam atau membasuh pinggan.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Catatan ini juga tersedia sebagai naratif selama ${minutes} minit. Sesuai untuk memandu, bersenam atau membasuh pinggan.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Catatan ini juga tersedia sebagai perdebatan selama ${minutes} minit. Sesuai untuk memandu, bersenam atau membasuh pinggan.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Catatan ini juga tersedia sebagai sketsa selama ${minutes} minit. Sesuai untuk memandu, bersenam atau membasuh pinggan.`,
  listenInvitePlayLabel: 'Mainkan',
  listenInviteDeclineLabel: 'Tidak, terima kasih',
  listenInviteNote: 'Suara AI, diadaptasi daripada catatan ini.',
  listenInviteCloseLabel: 'Tutup buat masa ini',
  listenPlayerRegionLabel: 'Pemain audio',
  listenPlayerNowPlayingLabel: 'Sedang dimainkan',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} daripada ${count}`,
  listenPlayerPlayLabel: 'Main',
  listenPlayerPauseLabel: 'Jeda',
  listenPlayerBackLabel: 'Undur 15 saat',
  listenPlayerPreviousLabel: 'Episod sebelumnya',
  listenPlayerNextLabel: 'Episod seterusnya',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Kelajuan main balik ${rate}×`,
  listenPlayerSeekLabel: 'Kedudukan',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} daripada ${total}`,
  listenPlayerCloseLabel: 'Henti dan tutup',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Sedang dimainkan: ${title}`,
  listenListHeading: 'Dengar blog ini',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `${count} episod · ${duration}`,
  listenListPlayAllLabel: 'Mainkan semua',
  listenListShuffleLabel: 'Rawak',
  listenListOrderLabel: 'Susunan',
  listenListNewestLabel: 'Terbaharu dahulu',
  listenListOldestLabel: 'Terlama dahulu',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Tunjuk semua ${count}`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Mainkan ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} min`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} j ${minutes} min`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('ms', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
