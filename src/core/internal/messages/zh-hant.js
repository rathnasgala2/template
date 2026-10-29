/**
 * Chrome message catalog for the `zh-hant` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: '跳到內文',
  homeLinkLabel: '首頁',
  primaryNavigationLabel: '主選單',
  footerNavigationLabel: '頁尾',
  breadcrumbNavigationLabel: '導覽路徑',
  paginationNavigationLabel: '分頁',
  previousPageLabel: '上一頁',
  nextPageLabel: '下一頁',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `第 ${current} 頁，共 ${total} 頁`,
  authorsSectionLabel: '作者',
  tagsSectionLabel: '標籤',
  seriesSectionLabel: '系列',
  archiveSectionLabel: '封存',
  indexHeading: '所有文章',
  authorsIndexLabel: '作者',
  tagIndexLabelPrefix: '標籤：',
  seriesIndexLabelPrefix: '系列：',
  archiveYearLabelPrefix: '封存：',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `關於 ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `作者：${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe，在新分頁中開啟',
  footerLegalLabel: '法律資訊',
  termsLinkLabel: '條款',
  privacyLinkLabel: '隱私權',
  consentRegionLabel: '隱私權選項',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `本站希望使用 ${providerName} 了解讀者狀況。在您同意之前不會載入任何內容，您也可以隨時在頁尾變更選擇。`,
  consentAcceptLabel: '接受分析',
  consentDeclineLabel: '拒絕',
  consentOpenLabel: '隱私權選項',
  errorPageHeading: '找不到頁面',
  errorPageBody: '找不到您要前往的頁面。它可能已被移動、重新命名或刪除。',
  errorPageReturnHomeLabel: '回到首頁',
  appearanceControlLabel: '外觀',
  appearanceModeLightLabel: '淺色',
  appearanceModeDarkLabel: '深色',
  appearanceModeSystemLabel: '跟隨系統',
  searchButtonLabel: '搜尋',
  searchButtonAriaLabel: '搜尋文章',
  searchPlaceholderLabel: '搜尋本站',
  searchEmptyLabel: '沒有符合搜尋條件的文章。',
  searchUnavailableLabel: '目前無法使用搜尋。',
  copyCodeLabel: '複製',
  copiedLabel: '已複製',
  linkCopiedLabel: '已複製連結。',
  copyBlockedLabel: '此處無法複製，請從瀏覽器複製網址。',
  codeSelectedLabel: '已選取程式碼。按 Ctrl C 或 Command C 複製。',
  savedLabel: '已儲存，稍後閱讀。',
  unsavedLabel: '已從儲存的文章中移除。',
  menuSummaryLabel: '選單',
  featuredLabel: '精選',
  readEssayLabel: '閱讀這篇隨筆',
  latestHeading: '最新',
  moreArticlesHeading: '更多文章',
  browseByTagLabel: '依標籤瀏覽',
  seriesCardLabel: '系列',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `共${`${count}個部分`}`,
  startSeriesLabel: '從第 1 部分開始',
  newsletterLabel: '電子報',
  newsletterActionLabel: '訂閱',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `閱讀約 ${minutes} 分鐘`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `第 ${part} 部分，共 ${total} 部分`,
  onThisPageLabel: '本頁內容',
  writtenByLabel: '作者',
  aboutTheAuthorLabel: '關於作者',
  youAreHereLabel: '目前位置',
  newerArticleLabel: '較新',
  olderArticleLabel: '較舊',
  moreArticlesNavigationLabel: '更多文章',
  keepReadingHeading: '繼續閱讀',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `更多 ${tag} 文章`,
  interactionsHeading: '互動',
  reactionsGroupLabel: '表情回應',
  likeLabel: '按讚',
  commentsHeading: '留言',
  interactionsNeedScriptNotice: '表情回應與留言需要啟用 JavaScript。',
  showMoreCommentsLabel: '顯示更多留言',
  shareLabel: '分享',
  copyLinkLabel: '複製本文連結',
  saveForLaterLabel: '稍後閱讀',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `分享到 ${network}`,
  shareByEmailLabel: '以電子郵件分享',
  shareNativeLabel: '分享這篇文章',
  followLabel: '追蹤',
  followingLabel: '追蹤中',
  unfollowLabel: '取消追蹤',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `追蹤 ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `取消追蹤 ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `您已追蹤 ${name}。`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `您已取消追蹤 ${name}。`,
  followDisabledMessage: '本站目前無法使用追蹤功能。',
  followAuthorMissingMessage: '目前無法追蹤這位作者。',
  audienceNetworkError: '無法連線至 Galascribe，請再試一次。',
  audienceRateLimited: '嘗試次數過多，請稍後再試。',
  audienceGenericError: '發生錯誤，請再試一次。',
  audienceStorageBlocked: '您的瀏覽器封鎖了本站登入所需的儲存空間。',
  audienceSignInUnsupported: '此瀏覽器無法在本頁登入。',
  audienceSignInFailed: '登入未完成，請再試一次。',
  audienceSignInInvalid: '該登入連結無效，請再試一次。',
  honeypotLabel: '請將此欄留空',
  fieldRequiredMessage: '此欄位為必填。',
  fieldInvalidMessage: '請檢查此欄位。',
  newsletterEmailLabel: '電子郵件',
  newsletterCheckInbox: '請到收件匣確認訂閱',
  newsletterFullMessage: '此電子報目前不接受新訂閱。',
  newsletterEmailInvalid: '請輸入有效的電子郵件。',
  contactLinkLabel: '聯絡',
  contactPageTitle: '聯絡',
  contactDefaultIntro: '有問題或想說些什麼嗎？傳送訊息，作者會以電子郵件回覆。',
  contactNameLabel: '姓名',
  contactEmailLabel: '電子郵件',
  contactMessageLabel: '訊息',
  contactWebsiteLabel: '網站（選填）',
  contactPhoneLabel: '電話（選填）',
  contactSubmitLabel: '傳送訊息',
  contactNoscript: '此表單需要 JavaScript。請啟用後再傳送訊息。',
  contactSent: '謝謝，您的訊息已送出。',
  contactUnavailable: '此表單目前不接受訊息。',
  contactRateLimited: '來自此處的訊息過多，請稍後再試。',
  contactMessageLinks: '訊息中最多只能包含兩個連結。',
  tagListLabel: '標籤',
  tagKickerLabel: '標籤',
  seriesKickerLabel: '系列',
  archiveKickerLabel: '封存',
  authorKickerLabel: '作者',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`${count}篇文章`}`,
  emptyListingLabel: '尚無文章。',
  editionsNavigationLabel: '版本',
  editionOriginalLabel: '原文',
  editionQuickReadLabel: '速讀版',
  editionStandardLabel: '標準版',
  editionDeepDiveLabel: '深度版',
  editionNoticeLabel: '產生的版本，已由作者審閱；以原文為準',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title}（${edition}）`,
  aboutPageTitle: '關於',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `更新於 ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `標籤「${tag}」的文章`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${publication}上帶有標籤 ${tag} 的文章，共${`${count}篇文章`}。`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}，${publication}上的系列，共${`${count}個部分`}。`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `${year} 年封存`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${publication}在 ${year} 年發布的${`${count}篇文章`}。`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `${name}在${publication}上撰寫的文章。`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `瀏覽${publication}涵蓋的${`${count}個主題`}。`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `瀏覽${publication}發布的 ${count} 個系列。`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `${publication}的所有文章，共 ${count} 篇，依年份排列。`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) => `${publication}的所有文章，由新到舊。`,
  exploreColumnLabel: '探索',
  rssFeedLabel: 'RSS 訂閱',
  languageKickerLabel: '語言',
  languageSwitcherLabel: '語言',
  languageChipsLabel: '可用語言',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${publication}上的${language}文章，共${`${count}篇文章`}。`,
  postRemovedHeading: '這篇文章已被刪除',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `刪除於 ${date}。`,
  postRemovedHomeLabel: '前往首頁',
  versionPageHeading: '網站版本',
  versionTemplateLabel: '範本',
  versionThemeLabel: '主題',
  versionSchemasLabel: '資料結構',
  versionToolchainLabel: '發布工具鏈',
  versionCommitLabel: '原始碼提交',
  versionBuiltAtLabel: '建置時間',
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('zh-Hant', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
