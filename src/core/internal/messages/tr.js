/**
 * Chrome message catalog for the `tr` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'İçeriğe geç',
  homeLinkLabel: 'Ana sayfa',
  primaryNavigationLabel: 'Ana menü',
  footerNavigationLabel: 'Alt bilgi',
  breadcrumbNavigationLabel: 'Gezinti yolu',
  paginationNavigationLabel: 'Sayfalama',
  previousPageLabel: 'Önceki',
  nextPageLabel: 'Sonraki',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Sayfa ${current} / ${total}`,
  authorsSectionLabel: 'Yazarlar',
  tagsSectionLabel: 'Etiketler',
  seriesSectionLabel: 'Seriler',
  archiveSectionLabel: 'Arşiv',
  indexHeading: 'Tüm makaleler',
  authorsIndexLabel: 'Yazarlar',
  tagIndexLabelPrefix: 'Etiket:',
  seriesIndexLabelPrefix: 'Seri:',
  archiveYearLabelPrefix: 'Arşiv:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `${displayName} hakkında`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Yazan: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, yeni sekmede açılır',
  footerLegalLabel: 'Yasal',
  termsLinkLabel: 'Koşullar',
  privacyLinkLabel: 'Gizlilik',
  consentRegionLabel: 'Gizlilik tercihleri',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Bu site, okurlarını anlamak için ${providerName} kullanmak istiyor. Kabul edene kadar hiçbir şey yüklenmez; tercihinizi istediğiniz zaman alt bilgiden değiştirebilirsiniz.`,
  consentAcceptLabel: 'Analitiği kabul et',
  consentDeclineLabel: 'Reddet',
  consentOpenLabel: 'Gizlilik tercihleri',
  errorPageHeading: 'Sayfa bulunamadı',
  errorPageBody:
    'Aradığınız sayfa bulunamadı. Taşınmış, yeniden adlandırılmış veya kaldırılmış olabilir.',
  errorPageReturnHomeLabel: 'Ana sayfaya dön',
  appearanceControlLabel: 'Görünüm',
  appearanceModeLightLabel: 'Açık',
  appearanceModeDarkLabel: 'Koyu',
  appearanceModeSystemLabel: 'Sistem',
  searchButtonLabel: 'Ara',
  searchButtonAriaLabel: 'Makalelerde ara',
  searchPlaceholderLabel: 'Yayında ara',
  searchEmptyLabel: 'Aramanızla eşleşen makale yok.',
  searchUnavailableLabel: 'Arama şu anda kullanılamıyor.',
  copyCodeLabel: 'Kopyala',
  copiedLabel: 'Kopyalandı',
  linkCopiedLabel: 'Bağlantı kopyalandı.',
  copyBlockedLabel:
    'Burada kopyalama engellendi. Adresi tarayıcınızdan kopyalayın.',
  codeSelectedLabel:
    'Kod seçildi. Kopyalamak için Ctrl C veya Command C tuşlarına basın.',
  savedLabel: 'Sonrası için kaydedildi.',
  unsavedLabel: 'Kaydedilen makalelerden kaldırıldı.',
  menuSummaryLabel: 'Menü',
  featuredLabel: 'Öne çıkan',
  readEssayLabel: 'Denemeyi oku',
  latestHeading: 'En yeni',
  moreArticlesHeading: 'Daha fazla makale',
  browseByTagLabel: 'Etikete göre göz at',
  seriesCardLabel: 'Seri',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${`${count} bölüm`}`,
  startSeriesLabel: '1. bölümle başla',
  newsletterLabel: 'Bülten',
  newsletterActionLabel: 'Abone ol',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} dk okuma`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Bölüm ${part} / ${total}`,
  onThisPageLabel: 'Bu sayfada',
  writtenByLabel: 'Yazan',
  aboutTheAuthorLabel: 'Yazar hakkında',
  youAreHereLabel: 'Buradasınız',
  newerArticleLabel: 'Daha yeni',
  olderArticleLabel: 'Daha eski',
  moreArticlesNavigationLabel: 'Daha fazla makale',
  keepReadingHeading: 'Okumaya devam et',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `${tag} etiketinde daha fazlası`,
  interactionsHeading: 'Yanıtlar',
  reactionsGroupLabel: 'Tepkiler',
  likeLabel: 'Beğen',
  commentsHeading: 'Sohbet',
  interactionsNeedScriptNotice: 'Tepkiler ve yorumlar için JavaScript gerekir.',
  showMoreCommentsLabel: 'Daha fazla yorum göster',
  shareLabel: 'Paylaş',
  copyLinkLabel: 'Bu makalenin bağlantısını kopyala',
  saveForLaterLabel: 'Sonrası için kaydet',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `${network} üzerinde paylaş`,
  shareByEmailLabel: 'E-postayla paylaş',
  shareNativeLabel: 'Bu makaleyi paylaş',
  followLabel: 'Takip et',
  followingLabel: 'Takip ediliyor',
  unfollowLabel: 'Takibi bırak',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `${name} kişisini takip et`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `${name} kişisini takibi bırak`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Artık ${name} kişisini takip ediyorsunuz.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) =>
    `Artık ${name} kişisini takip etmiyorsunuz.`,
  /** @type {(count: string) => string} */
  followersCountLabel: (count) => `${count} takipçi`,
  followersTeamHint: 'Bunu yalnızca sitenizin ekibi görür',
  followDisabledMessage: 'Takip özelliği bu sitede şu anda kullanılamıyor.',
  followAuthorMissingMessage: 'Bu yazar şu anda takip edilemiyor.',
  audienceNetworkError: "Galascribe'a ulaşılamadı. Tekrar deneyin.",
  audienceRateLimited: 'Çok fazla deneme. Birazdan tekrar deneyin.',
  audienceGenericError: 'Bir şeyler ters gitti. Tekrar deneyin.',
  audienceStorageBlocked:
    'Tarayıcınız, bu sitenin oturum açması için gereken depolamayı engelledi.',
  audienceSignInUnsupported: 'Bu tarayıcı bu sayfada oturum açamıyor.',
  audienceSignInFailed: 'Oturum açma tamamlanmadı. Tekrar deneyin.',
  audienceSignInInvalid:
    'Bu oturum açma bağlantısı geçerli değildi. Tekrar deneyin.',
  honeypotLabel: 'Bu alanı boş bırakın',
  fieldRequiredMessage: 'Bu alan zorunludur.',
  fieldInvalidMessage: 'Bu alanı kontrol edin.',
  newsletterEmailLabel: 'E-posta adresi',
  newsletterCheckInbox: 'Onaylamak için gelen kutunuza bakın',
  newsletterFullMessage: 'Bu bülten şu anda yeni abone almıyor.',
  newsletterEmailInvalid: 'Geçerli bir e-posta adresi girin.',
  contactLinkLabel: 'İletişim',
  contactPageTitle: 'İletişim',
  contactDefaultIntro:
    'Bir sorunuz ya da söyleyeceğiniz bir şey mi var? Mesaj gönderin, yazar e-postayla yanıtlasın.',
  contactNameLabel: 'Ad',
  contactEmailLabel: 'E-posta',
  contactMessageLabel: 'Mesaj',
  contactWebsiteLabel: 'Web sitesi (isteğe bağlı)',
  contactPhoneLabel: 'Telefon (isteğe bağlı)',
  contactSubmitLabel: 'Mesaj gönder',
  contactNoscript: 'Bu form JavaScript gerektirir. Mesaj göndermek için açın.',
  contactSent: 'Teşekkürler, mesajınız gönderildi.',
  contactUnavailable: 'Bu form şu anda mesaj kabul etmiyor.',
  contactRateLimited:
    'Buradan çok fazla mesaj geldi. Daha sonra tekrar deneyin.',
  contactMessageLinks: 'Mesajınızda en fazla iki bağlantı olabilir.',
  tagListLabel: 'Etiketler',
  tagKickerLabel: 'Etiket',
  seriesKickerLabel: 'Seri',
  archiveKickerLabel: 'Arşiv',
  authorKickerLabel: 'Yazar',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`${count} makale`}`,
  emptyListingLabel: 'Henüz makale yok.',
  editionsNavigationLabel: 'Sürümler',
  editionOriginalLabel: 'Orijinal',
  editionQuickReadLabel: 'Hızlı okuma',
  editionStandardLabel: 'Standart',
  editionDeepDiveLabel: 'Derinlemesine',
  editionNoticeLabel:
    'Yazar tarafından gözden geçirilmiş üretilmiş sürüm; esas olan orijinaldir',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Hakkında',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Güncellendi: ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `“${tag}” etiketli yazılar`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${publication} sitesinde ${tag} etiketli ${`${count} makale`}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, ${publication} sitesinde ${`${count} bölüm`} süren bir seri.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Arşiv ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${publication} sitesinde ${year} yılında yayımlanan ${`${count} makale`}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `${name} tarafından ${publication} sitesinde yazılan makaleler.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `${publication} sitesinde ele alınan konulara göz atın (${`${count} konu`}).`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `${publication} sitesinde yayımlanan ${count} seriye göz atın.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `${publication} sitesindeki tüm makaleler, toplam ${count}, yıllara göre.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `${publication} sitesindeki tüm makaleler, en yeniden eskiye.`,
  exploreColumnLabel: 'Keşfet',
  rssFeedLabel: 'RSS akışı',
  languageKickerLabel: 'Dil',
  languageSwitcherLabel: 'Diller',
  languageChipsLabel: 'Kullanılabilir diller',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${publication} sitesinde ${language} dilinde ${`${count} makale`}.`,
  postRemovedHeading: 'Bu yazı kaldırıldı',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `${date} tarihinde kaldırıldı.`,
  postRemovedHomeLabel: 'Ana sayfaya git',
  versionPageHeading: 'Site sürümü',
  versionTemplateLabel: 'Şablon',
  versionThemeLabel: 'Tema',
  versionSchemasLabel: 'Şemalar',
  versionToolchainLabel: 'Yayın araç zinciri',
  versionCommitLabel: 'Kaynak commit',
  versionBuiltAtLabel: 'Derlenme zamanı',
  listenNavLabel: 'Dinle',
  listenNavCurrentLabel: 'Bu yazıyı dinle',
  listenInviteTitle: 'Elleriniz meşgul mü? Bunun yerine dinleyin.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Bu yazı ${minutes} dakikalık bir sohbet olarak da var. Yolculuk, spor veya bulaşık için ideal.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Bu yazı ${minutes} dakikalık bir anlatım olarak da var. Yolculuk, spor veya bulaşık için ideal.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Bu yazı ${minutes} dakikalık bir tartışma olarak da var. Yolculuk, spor veya bulaşık için ideal.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Bu yazı ${minutes} dakikalık bir skeç olarak da var. Yolculuk, spor veya bulaşık için ideal.`,
  listenInvitePlayLabel: 'Oynat',
  listenInviteDeclineLabel: 'Hayır, teşekkürler',
  listenInviteNote: 'Yapay zekâ sesleri, bu yazıdan uyarlandı.',
  listenInviteCloseLabel: 'Şimdilik kapat',
  listenPlayerRegionLabel: 'Ses oynatıcı',
  listenPlayerNowPlayingLabel: 'Şimdi çalıyor',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} / ${count}`,
  listenPlayerPlayLabel: 'Oynat',
  listenPlayerPauseLabel: 'Duraklat',
  listenPlayerBackLabel: '15 saniye geri',
  listenPlayerPreviousLabel: 'Önceki bölüm',
  listenPlayerNextLabel: 'Sonraki bölüm',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Oynatma hızı ${rate}×`,
  listenPlayerSeekLabel: 'Konum',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} / ${total}`,
  listenPlayerCloseLabel: 'Durdur ve kapat',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Çalıyor: ${title}`,
  listenListHeading: 'Bu blogu dinle',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `${count} bölüm · ${duration}`,
  listenListPlayAllLabel: 'Tümünü oynat',
  listenListShuffleLabel: 'Karıştır',
  listenListOrderLabel: 'Sıralama',
  listenListNewestLabel: 'Önce en yeni',
  listenListOldestLabel: 'Önce en eski',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Tümünü göster (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `${title} oynat`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} dk`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} sa ${minutes} dk`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('tr', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
