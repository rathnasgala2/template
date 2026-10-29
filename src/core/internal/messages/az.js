/**
 * Chrome message catalog for the `az` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Məzmuna keç',
  homeLinkLabel: 'Ana səhifə',
  primaryNavigationLabel: 'Əsas',
  footerNavigationLabel: 'Alt hissə',
  breadcrumbNavigationLabel: 'Naviqasiya yolu',
  paginationNavigationLabel: 'Səhifələmə',
  previousPageLabel: 'Əvvəlki',
  nextPageLabel: 'Növbəti',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Səhifə ${current} / ${total}`,
  authorsSectionLabel: 'Müəlliflər',
  tagsSectionLabel: 'Etiketlər',
  seriesSectionLabel: 'Seriya',
  archiveSectionLabel: 'Arxiv',
  indexHeading: 'Bütün yazılar',
  authorsIndexLabel: 'Müəlliflər',
  tagIndexLabelPrefix: 'Etiket:',
  seriesIndexLabelPrefix: 'Seriya:',
  archiveYearLabelPrefix: 'Arxiv:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `${displayName} haqqında`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Müəllif: ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, yeni vərəqdə açılır',
  footerLegalLabel: 'Hüquqi',
  termsLinkLabel: 'Şərtlər',
  privacyLinkLabel: 'Məxfilik',
  consentRegionLabel: 'Məxfilik seçimləri',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Bu sayt oxucu auditoriyasını anlamaq üçün ${providerName} xidmətindən istifadə etmək istəyir. Siz qəbul etməyincə heç nə yüklənmir, seçiminizi istənilən vaxt alt hissədən dəyişə bilərsiniz.`,
  consentAcceptLabel: 'Analitikanı qəbul et',
  consentDeclineLabel: 'Rədd et',
  consentOpenLabel: 'Məxfilik seçimləri',
  errorPageHeading: 'Səhifə tapılmadı',
  errorPageBody:
    'Axtardığınız səhifə tapılmadı. O, köçürülmüş, adı dəyişdirilmiş və ya silinmiş ola bilər.',
  errorPageReturnHomeLabel: 'Ana səhifəyə qayıt',
  appearanceControlLabel: 'Görünüş',
  appearanceModeLightLabel: 'Açıq',
  appearanceModeDarkLabel: 'Tünd',
  appearanceModeSystemLabel: 'Sistem',
  searchButtonLabel: 'Axtar',
  searchButtonAriaLabel: 'Yazılarda axtar',
  searchPlaceholderLabel: 'Nəşrdə axtar',
  searchEmptyLabel: 'Axtarışınıza uyğun yazı yoxdur.',
  searchUnavailableLabel: 'Axtarış hazırda əlçatan deyil.',
  copyCodeLabel: 'Kopyala',
  copiedLabel: 'Kopyalandı',
  linkCopiedLabel: 'Keçid kopyalandı.',
  copyBlockedLabel: 'Burada kopyalama bloklanıb. Ünvanı brauzerdən kopyalayın.',
  codeSelectedLabel:
    'Kod seçildi. Kopyalamaq üçün Ctrl C və ya Command C basın.',
  savedLabel: 'Sonra üçün saxlanıldı.',
  unsavedLabel: 'Saxlanılan yazılardan çıxarıldı.',
  menuSummaryLabel: 'Menyu',
  featuredLabel: 'Seçilmiş',
  readEssayLabel: 'Esseni oxu',
  latestHeading: 'Ən son',
  moreArticlesHeading: 'Daha çox yazı',
  browseByTagLabel: 'Etiketlərə görə bax',
  seriesCardLabel: 'Seriya',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count} hissə`,
  startSeriesLabel: '1-ci hissədən başla',
  newsletterLabel: 'Bülleten',
  newsletterActionLabel: 'Abunə ol',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} dəq oxu`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `${part}-ci hissə / ${total}`,
  onThisPageLabel: 'Bu səhifədə',
  writtenByLabel: 'Müəllif',
  aboutTheAuthorLabel: 'Müəllif haqqında',
  youAreHereLabel: 'Siz buradasınız',
  newerArticleLabel: 'Daha yeni',
  olderArticleLabel: 'Daha köhnə',
  moreArticlesNavigationLabel: 'Daha çox yazı',
  keepReadingHeading: 'Oxumağa davam edin',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `${tag} üzrə daha çox`,
  interactionsHeading: 'Cavablar',
  reactionsGroupLabel: 'Reaksiyalar',
  likeLabel: 'Bəyən',
  commentsHeading: 'Müzakirə',
  interactionsNeedScriptNotice:
    'Reaksiyalar və şərhlər üçün JavaScript lazımdır.',
  showMoreCommentsLabel: 'Daha çox şərh göstər',
  shareLabel: 'Paylaş',
  copyLinkLabel: 'Bu yazının keçidini kopyala',
  saveForLaterLabel: 'Sonra üçün saxla',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `${network} üzərində paylaş`,
  shareByEmailLabel: 'E-poçtla paylaş',
  shareNativeLabel: 'Bu yazını paylaş',
  followLabel: 'İzlə',
  followingLabel: 'İzləyirsiniz',
  unfollowLabel: 'İzləmə',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `${name} adlı müəllifi izlə`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `${name} adlı müəllifi izləmə`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Artıq ${name} adlı müəllifi izləyirsiniz.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Artıq ${name} adlı müəllifi izləmirsiniz.`,
  followDisabledMessage: 'İzləmə bu saytda hazırda mövcud deyil.',
  followAuthorMissingMessage: 'Bu müəllifi hazırda izləmək mümkün deyil.',
  audienceNetworkError: 'Galascribe ilə əlaqə qurulmadı. Yenidən cəhd edin.',
  audienceRateLimited: 'Çox cəhd edildi. Bir az sonra yenidən cəhd edin.',
  audienceGenericError: 'Nəsə alınmadı. Yenidən cəhd edin.',
  audienceStorageBlocked:
    'Brauzeriniz bu saytın daxil olmaq üçün lazım olan yaddaşını blokladı.',
  audienceSignInUnsupported: 'Bu brauzer bu səhifədə daxil ola bilmir.',
  audienceSignInFailed: 'Giriş tamamlanmadı. Yenidən cəhd edin.',
  audienceSignInInvalid: 'Giriş keçidi etibarlı deyildi. Yenidən cəhd edin.',
  honeypotLabel: 'Bu sahəni boş buraxın',
  fieldRequiredMessage: 'Bu sahə məcburidir.',
  fieldInvalidMessage: 'Bu sahəni yoxlayın.',
  newsletterEmailLabel: 'E-poçt ünvanı',
  newsletterCheckInbox: 'Təsdiq üçün gələnlər qutusuna baxın',
  newsletterFullMessage: 'Bu bülleten hazırda yeni abunəçi qəbul etmir.',
  newsletterEmailInvalid: 'Düzgün e-poçt ünvanı daxil edin.',
  contactLinkLabel: 'Əlaqə',
  contactPageTitle: 'Əlaqə',
  contactDefaultIntro:
    'Sualınız var, yoxsa nəsə demək istəyirsiniz? Mesaj göndərin, müəllif e-poçtla cavab verəcək.',
  contactNameLabel: 'Ad',
  contactEmailLabel: 'E-poçt',
  contactMessageLabel: 'Mesaj',
  contactWebsiteLabel: 'Veb sayt (könüllü)',
  contactPhoneLabel: 'Telefon (könüllü)',
  contactSubmitLabel: 'Mesaj göndər',
  contactNoscript:
    'Bu forma JavaScript tələb edir. Mesaj göndərmək üçün onu aktiv edin.',
  contactSent: 'Təşəkkürlər, mesajınız göndərildi.',
  contactUnavailable: 'Bu forma hazırda mesaj qəbul etmir.',
  contactRateLimited: 'Buradan çox mesaj göndərilib. Sonra yenidən cəhd edin.',
  contactMessageLinks: 'Mesajınızda ən çoxu iki keçid ola bilər.',
  tagListLabel: 'Etiketlər',
  tagKickerLabel: 'Etiket',
  seriesKickerLabel: 'Seriya',
  archiveKickerLabel: 'Arxiv',
  authorKickerLabel: 'Müəllif',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${count} yazı`,
  emptyListingLabel: 'Hələ yazı yoxdur.',
  editionsNavigationLabel: 'Redaksiyalar',
  editionOriginalLabel: 'Orijinal',
  editionQuickReadLabel: 'Qısa oxu',
  editionStandardLabel: 'Standart',
  editionDeepDiveLabel: 'Dərin oxu',
  editionNoticeLabel:
    'Yaradılmış redaksiya, müəllif tərəfindən yoxlanılıb; orijinal əsasdır',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Haqqında',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Yenilənib: ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `“${tag}” etiketli yazılar`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${publication} saytında ${tag} etiketli ${count} yazı.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, ${publication} saytında ${count} hissəlik seriya.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Arxiv ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${publication} saytında ${year} ilində dərc edilmiş ${count} yazı.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `${name} tərəfindən ${publication} saytında yazılmış yazılar.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `${publication} saytında işıqlandırılan ${count} mövzuya baxın.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `${publication} saytında dərc edilmiş ${count} seriyaya baxın.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `${publication} saytının bütün yazıları, cəmi ${count}, illər üzrə.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `${publication} saytının bütün yazıları, yenilər əvvəldə.`,
  exploreColumnLabel: 'Kəşf et',
  rssFeedLabel: 'RSS lenti',
  languageKickerLabel: 'Dil',
  languageSwitcherLabel: 'Dillər',
  languageChipsLabel: 'Mövcud dillər',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${publication} saytında ${language} dilində ${count} yazı.`,
  postRemovedHeading: 'Bu yazı silinib',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `O, ${date} tarixində silinib.`,
  postRemovedHomeLabel: 'Ana səhifəyə get',
  versionPageHeading: 'Saytın versiyası',
  versionTemplateLabel: 'Şablon',
  versionThemeLabel: 'Tema',
  versionSchemasLabel: 'Sxemlər',
  versionToolchainLabel: 'Nəşr alətləri',
  versionCommitLabel: 'Mənbə commit',
  versionBuiltAtLabel: 'Yığılma vaxtı',
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('az', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
