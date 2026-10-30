/**
 * Chrome message catalog for the `id` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Lewati ke konten',
  homeLinkLabel: 'Beranda',
  primaryNavigationLabel: 'Utama',
  footerNavigationLabel: 'Kaki halaman',
  breadcrumbNavigationLabel: 'Jejak navigasi',
  paginationNavigationLabel: 'Halaman',
  previousPageLabel: 'Sebelumnya',
  nextPageLabel: 'Berikutnya',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Halaman ${current} dari ${total}`,
  authorsSectionLabel: 'Penulis',
  tagsSectionLabel: 'Tag',
  seriesSectionLabel: 'Seri',
  archiveSectionLabel: 'Arsip',
  indexHeading: 'Semua artikel',
  authorsIndexLabel: 'Penulis',
  tagIndexLabelPrefix: 'Tag:',
  seriesIndexLabelPrefix: 'Seri:',
  archiveYearLabelPrefix: 'Arsip:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Tentang ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Oleh ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, terbuka di tab baru',
  footerLegalLabel: 'Hukum',
  termsLinkLabel: 'Ketentuan',
  privacyLinkLabel: 'Privasi',
  consentRegionLabel: 'Pilihan privasi',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Situs ini ingin menggunakan ${providerName} untuk memahami pembacanya. Tidak ada yang dimuat sebelum Anda setuju, dan Anda bisa mengubah pilihan kapan saja dari kaki halaman.`,
  consentAcceptLabel: 'Setujui analitik',
  consentDeclineLabel: 'Tolak',
  consentOpenLabel: 'Pilihan privasi',
  errorPageHeading: 'Halaman tidak ditemukan',
  errorPageBody:
    'Halaman yang Anda cari tidak ditemukan. Mungkin sudah dipindahkan, diganti namanya, atau dihapus.',
  errorPageReturnHomeLabel: 'Kembali ke beranda',
  appearanceControlLabel: 'Tampilan',
  appearanceModeLightLabel: 'Terang',
  appearanceModeDarkLabel: 'Gelap',
  appearanceModeSystemLabel: 'Sistem',
  searchButtonLabel: 'Cari',
  searchButtonAriaLabel: 'Cari artikel',
  searchPlaceholderLabel: 'Cari di publikasi',
  searchEmptyLabel: 'Tidak ada artikel yang cocok dengan pencarian Anda.',
  searchUnavailableLabel: 'Pencarian sedang tidak tersedia.',
  copyCodeLabel: 'Salin',
  copiedLabel: 'Tersalin',
  linkCopiedLabel: 'Tautan disalin.',
  copyBlockedLabel:
    'Menyalin diblokir di sini. Salin alamat dari browser Anda.',
  codeSelectedLabel:
    'Kode dipilih. Tekan Ctrl C atau Command C untuk menyalin.',
  savedLabel: 'Disimpan untuk nanti.',
  unsavedLabel: 'Dihapus dari artikel tersimpan.',
  menuSummaryLabel: 'Menu',
  featuredLabel: 'Pilihan',
  readEssayLabel: 'Baca esai',
  latestHeading: 'Terbaru',
  moreArticlesHeading: 'Artikel lainnya',
  browseByTagLabel: 'Jelajahi berdasarkan tag',
  seriesCardLabel: 'Seri',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${`${count} bagian`}`,
  startSeriesLabel: 'Mulai dari bagian 1',
  newsletterLabel: 'Buletin',
  newsletterActionLabel: 'Berlangganan',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} mnt baca`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Bagian ${part} dari ${total}`,
  onThisPageLabel: 'Di halaman ini',
  writtenByLabel: 'Ditulis oleh',
  aboutTheAuthorLabel: 'Tentang penulis',
  youAreHereLabel: 'Anda di sini',
  newerArticleLabel: 'Lebih baru',
  olderArticleLabel: 'Lebih lama',
  moreArticlesNavigationLabel: 'Artikel lainnya',
  keepReadingHeading: 'Lanjutkan membaca',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Lainnya di ${tag}`,
  interactionsHeading: 'Tanggapan',
  reactionsGroupLabel: 'Reaksi',
  likeLabel: 'Suka',
  commentsHeading: 'Diskusi',
  interactionsNeedScriptNotice: 'Reaksi dan komentar memerlukan JavaScript.',
  showMoreCommentsLabel: 'Tampilkan komentar lainnya',
  shareLabel: 'Bagikan',
  copyLinkLabel: 'Salin tautan artikel ini',
  saveForLaterLabel: 'Simpan untuk nanti',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Bagikan di ${network}`,
  shareByEmailLabel: 'Bagikan lewat email',
  shareNativeLabel: 'Bagikan artikel ini',
  followLabel: 'Ikuti',
  followingLabel: 'Mengikuti',
  unfollowLabel: 'Berhenti mengikuti',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Ikuti ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Berhenti mengikuti ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Sekarang Anda mengikuti ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Anda tidak lagi mengikuti ${name}.`,
  /** @type {(count: string) => string} */
  followersCountLabel: (count) => `${count} pengikut`,
  followersTeamHint: 'Hanya tim situs Anda yang melihat ini',
  followDisabledMessage: 'Fitur mengikuti sedang tidak tersedia di situs ini.',
  followAuthorMissingMessage: 'Penulis ini sedang tidak bisa diikuti.',
  audienceNetworkError: 'Tidak dapat menjangkau Galascribe. Coba lagi.',
  audienceRateLimited: 'Terlalu banyak percobaan. Coba lagi sebentar lagi.',
  audienceGenericError: 'Terjadi kesalahan. Coba lagi.',
  audienceStorageBlocked:
    'Browser Anda memblokir penyimpanan yang dibutuhkan situs ini untuk masuk.',
  audienceSignInUnsupported:
    'Browser ini tidak dapat memasukkan Anda di halaman ini.',
  audienceSignInFailed: 'Proses masuk tidak selesai. Coba lagi.',
  audienceSignInInvalid: 'Tautan masuk itu tidak valid. Coba lagi.',
  honeypotLabel: 'Biarkan kolom ini kosong',
  fieldRequiredMessage: 'Kolom ini wajib diisi.',
  fieldInvalidMessage: 'Periksa kolom ini.',
  newsletterEmailLabel: 'Alamat email',
  newsletterCheckInbox: 'Periksa kotak masuk Anda untuk konfirmasi',
  newsletterFullMessage: 'Buletin ini sedang tidak menerima pelanggan baru.',
  newsletterEmailInvalid: 'Masukkan alamat email yang valid.',
  contactLinkLabel: 'Kontak',
  contactPageTitle: 'Kontak',
  contactDefaultIntro:
    'Punya pertanyaan atau ingin berbagi sesuatu? Kirim pesan dan penulis akan membalas lewat email.',
  contactNameLabel: 'Nama',
  contactEmailLabel: 'Email',
  contactMessageLabel: 'Pesan',
  contactWebsiteLabel: 'Situs web (opsional)',
  contactPhoneLabel: 'Telepon (opsional)',
  contactSubmitLabel: 'Kirim pesan',
  contactNoscript:
    'Formulir ini memerlukan JavaScript. Aktifkan untuk mengirim pesan.',
  contactSent: 'Terima kasih, pesan Anda terkirim.',
  contactUnavailable: 'Formulir ini sedang tidak menerima pesan.',
  contactRateLimited: 'Terlalu banyak pesan dari sini. Coba lagi nanti.',
  contactMessageLinks: 'Pesan Anda boleh berisi paling banyak dua tautan.',
  tagListLabel: 'Tag',
  tagKickerLabel: 'Tag',
  seriesKickerLabel: 'Seri',
  archiveKickerLabel: 'Arsip',
  authorKickerLabel: 'Penulis',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`${count} artikel`}`,
  emptyListingLabel: 'Belum ada artikel.',
  editionsNavigationLabel: 'Edisi',
  editionOriginalLabel: 'Asli',
  editionQuickReadLabel: 'Baca cepat',
  editionStandardLabel: 'Standar',
  editionDeepDiveLabel: 'Mendalam',
  editionNoticeLabel:
    'Edisi hasil generate, ditinjau penulis; yang asli menjadi acuan',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Tentang',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Diperbarui ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Tulisan bertag “${tag}”`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${`${count} artikel`} bertag ${tag} di ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, seri dengan ${`${count} bagian`} di ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Arsip ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${`${count} artikel`} terbit pada ${year} di ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Artikel yang ditulis ${name} di ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Jelajahi ${`${count} topik`} yang dibahas di ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Jelajahi ${count} seri yang terbit di ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Semua artikel di ${publication}, total ${count}, menurut tahun.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Semua artikel di ${publication}, terbaru lebih dulu.`,
  exploreColumnLabel: 'Jelajahi',
  rssFeedLabel: 'Feed RSS',
  languageKickerLabel: 'Bahasa',
  languageSwitcherLabel: 'Bahasa',
  languageChipsLabel: 'Bahasa yang tersedia',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${`${count} artikel`} dalam bahasa ${language} di ${publication}.`,
  postRemovedHeading: 'Tulisan ini telah dihapus',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Dihapus pada ${date}.`,
  postRemovedHomeLabel: 'Ke beranda',
  versionPageHeading: 'Versi situs',
  versionTemplateLabel: 'Templat',
  versionThemeLabel: 'Tema',
  versionSchemasLabel: 'Skema',
  versionToolchainLabel: 'Toolchain publikasi',
  versionCommitLabel: 'Commit sumber',
  versionBuiltAtLabel: 'Dibangun pada',
  listenNavLabel: 'Dengarkan',
  listenNavCurrentLabel: 'Dengarkan tulisan ini',
  listenInviteTitle: 'Tangan sedang sibuk? Dengarkan saja.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Tulisan ini juga tersedia sebagai percakapan berdurasi ${minutes} menit. Cocok untuk menyetir, berolahraga, atau mencuci piring.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Tulisan ini juga tersedia sebagai narasi berdurasi ${minutes} menit. Cocok untuk menyetir, berolahraga, atau mencuci piring.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Tulisan ini juga tersedia sebagai debat berdurasi ${minutes} menit. Cocok untuk menyetir, berolahraga, atau mencuci piring.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Tulisan ini juga tersedia sebagai sketsa berdurasi ${minutes} menit. Cocok untuk menyetir, berolahraga, atau mencuci piring.`,
  listenInvitePlayLabel: 'Putar',
  listenInviteDeclineLabel: 'Tidak, terima kasih',
  listenInviteNote: 'Suara AI, diadaptasi dari tulisan ini.',
  listenInviteCloseLabel: 'Tutup dulu',
  listenPlayerRegionLabel: 'Pemutar audio',
  listenPlayerNowPlayingLabel: 'Sedang diputar',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} dari ${count}`,
  listenPlayerPlayLabel: 'Putar',
  listenPlayerPauseLabel: 'Jeda',
  listenPlayerBackLabel: 'Mundur 15 detik',
  listenPlayerPreviousLabel: 'Episode sebelumnya',
  listenPlayerNextLabel: 'Episode berikutnya',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Kecepatan pemutaran ${rate}×`,
  listenPlayerSeekLabel: 'Posisi',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} dari ${total}`,
  listenPlayerCloseLabel: 'Hentikan dan tutup',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Sedang diputar: ${title}`,
  listenListHeading: 'Dengarkan blog ini',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `${count} episode · ${duration}`,
  listenListPlayAllLabel: 'Putar semua',
  listenListShuffleLabel: 'Acak',
  listenListOrderLabel: 'Urutan',
  listenListNewestLabel: 'Terbaru dulu',
  listenListOldestLabel: 'Terlama dulu',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Tampilkan semua ${count}`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Putar ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} mnt`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} jam ${minutes} mnt`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('id', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
