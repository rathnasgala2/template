/**
 * Chrome message catalog for the `vi` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Chuyển đến nội dung',
  homeLinkLabel: 'Trang chủ',
  primaryNavigationLabel: 'Chính',
  footerNavigationLabel: 'Chân trang',
  breadcrumbNavigationLabel: 'Đường dẫn',
  paginationNavigationLabel: 'Phân trang',
  previousPageLabel: 'Trước',
  nextPageLabel: 'Sau',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Trang ${current} / ${total}`,
  authorsSectionLabel: 'Tác giả',
  tagsSectionLabel: 'Thẻ',
  seriesSectionLabel: 'Loạt bài',
  archiveSectionLabel: 'Lưu trữ',
  indexHeading: 'Tất cả bài viết',
  authorsIndexLabel: 'Tác giả',
  tagIndexLabelPrefix: 'Thẻ:',
  seriesIndexLabelPrefix: 'Loạt bài:',
  archiveYearLabelPrefix: 'Lưu trữ:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Về ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Bởi ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, mở trong tab mới',
  footerLegalLabel: 'Pháp lý',
  termsLinkLabel: 'Điều khoản',
  privacyLinkLabel: 'Quyền riêng tư',
  consentRegionLabel: 'Lựa chọn quyền riêng tư',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Trang này muốn dùng ${providerName} để hiểu độc giả. Sẽ không có gì được tải cho đến khi bạn đồng ý, và bạn có thể đổi lựa chọn bất cứ lúc nào ở chân trang.`,
  consentAcceptLabel: 'Chấp nhận phân tích',
  consentDeclineLabel: 'Từ chối',
  consentOpenLabel: 'Lựa chọn quyền riêng tư',
  errorPageHeading: 'Không tìm thấy trang',
  errorPageBody:
    'Không tìm thấy trang bạn cần. Trang có thể đã được chuyển, đổi tên hoặc gỡ bỏ.',
  errorPageReturnHomeLabel: 'Quay về trang chủ',
  appearanceControlLabel: 'Giao diện',
  appearanceModeLightLabel: 'Sáng',
  appearanceModeDarkLabel: 'Tối',
  appearanceModeSystemLabel: 'Theo hệ thống',
  searchButtonLabel: 'Tìm kiếm',
  searchButtonAriaLabel: 'Tìm bài viết',
  searchPlaceholderLabel: 'Tìm trong ấn phẩm',
  searchEmptyLabel: 'Không có bài viết nào khớp với tìm kiếm của bạn.',
  searchUnavailableLabel: 'Tìm kiếm hiện không khả dụng.',
  copyCodeLabel: 'Sao chép',
  copiedLabel: 'Đã sao chép',
  linkCopiedLabel: 'Đã sao chép liên kết.',
  copyBlockedLabel:
    'Việc sao chép bị chặn ở đây. Hãy sao chép địa chỉ từ trình duyệt.',
  codeSelectedLabel: 'Đã chọn mã. Nhấn Ctrl C hoặc Command C để sao chép.',
  savedLabel: 'Đã lưu để đọc sau.',
  unsavedLabel: 'Đã xóa khỏi bài viết đã lưu.',
  menuSummaryLabel: 'Menu',
  featuredLabel: 'Nổi bật',
  readEssayLabel: 'Đọc bài luận',
  latestHeading: 'Mới nhất',
  moreArticlesHeading: 'Thêm bài viết',
  browseByTagLabel: 'Duyệt theo thẻ',
  seriesCardLabel: 'Loạt bài',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${`${count} phần`}`,
  startSeriesLabel: 'Bắt đầu từ phần 1',
  newsletterLabel: 'Bản tin',
  newsletterActionLabel: 'Đăng ký',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} phút đọc`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Phần ${part} / ${total}`,
  onThisPageLabel: 'Trên trang này',
  writtenByLabel: 'Viết bởi',
  aboutTheAuthorLabel: 'Về tác giả',
  youAreHereLabel: 'Bạn đang ở đây',
  newerArticleLabel: 'Mới hơn',
  olderArticleLabel: 'Cũ hơn',
  moreArticlesNavigationLabel: 'Thêm bài viết',
  keepReadingHeading: 'Đọc tiếp',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Thêm trong ${tag}`,
  interactionsHeading: 'Phản hồi',
  reactionsGroupLabel: 'Cảm xúc',
  likeLabel: 'Thích',
  commentsHeading: 'Thảo luận',
  interactionsNeedScriptNotice: 'Cảm xúc và bình luận cần JavaScript.',
  showMoreCommentsLabel: 'Xem thêm bình luận',
  shareLabel: 'Chia sẻ',
  copyLinkLabel: 'Sao chép liên kết bài viết này',
  saveForLaterLabel: 'Lưu để đọc sau',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Chia sẻ lên ${network}`,
  shareByEmailLabel: 'Chia sẻ qua email',
  shareNativeLabel: 'Chia sẻ bài viết này',
  followLabel: 'Theo dõi',
  followingLabel: 'Đang theo dõi',
  unfollowLabel: 'Bỏ theo dõi',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Theo dõi ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Bỏ theo dõi ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Bạn đang theo dõi ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Bạn đã bỏ theo dõi ${name}.`,
  followDisabledMessage: 'Hiện chưa thể theo dõi trên trang này.',
  followAuthorMissingMessage: 'Hiện chưa thể theo dõi tác giả này.',
  audienceNetworkError: 'Không thể kết nối tới Galascribe. Hãy thử lại.',
  audienceRateLimited: 'Quá nhiều lần thử. Hãy thử lại sau giây lát.',
  audienceGenericError: 'Đã xảy ra lỗi. Hãy thử lại.',
  audienceStorageBlocked:
    'Trình duyệt đã chặn bộ nhớ mà trang này cần để đăng nhập cho bạn.',
  audienceSignInUnsupported:
    'Trình duyệt này không thể đăng nhập cho bạn ở trang này.',
  audienceSignInFailed: 'Đăng nhập chưa hoàn tất. Hãy thử lại.',
  audienceSignInInvalid: 'Liên kết đăng nhập đó không hợp lệ. Hãy thử lại.',
  honeypotLabel: 'Để trống ô này',
  fieldRequiredMessage: 'Ô này là bắt buộc.',
  fieldInvalidMessage: 'Hãy kiểm tra ô này.',
  newsletterEmailLabel: 'Địa chỉ email',
  newsletterCheckInbox: 'Kiểm tra hộp thư để xác nhận',
  newsletterFullMessage: 'Bản tin này hiện không nhận thêm người đăng ký.',
  newsletterEmailInvalid: 'Hãy nhập địa chỉ email hợp lệ.',
  contactLinkLabel: 'Liên hệ',
  contactPageTitle: 'Liên hệ',
  contactDefaultIntro:
    'Bạn có câu hỏi hay điều muốn nói? Hãy gửi tin nhắn và tác giả sẽ trả lời qua email.',
  contactNameLabel: 'Tên',
  contactEmailLabel: 'Email',
  contactMessageLabel: 'Tin nhắn',
  contactWebsiteLabel: 'Trang web (không bắt buộc)',
  contactPhoneLabel: 'Điện thoại (không bắt buộc)',
  contactSubmitLabel: 'Gửi tin nhắn',
  contactNoscript: 'Biểu mẫu này cần JavaScript. Hãy bật nó để gửi tin nhắn.',
  contactSent: 'Cảm ơn, tin nhắn của bạn đã được gửi.',
  contactUnavailable: 'Biểu mẫu này hiện không nhận tin nhắn.',
  contactRateLimited: 'Quá nhiều tin nhắn từ đây. Hãy thử lại sau.',
  contactMessageLinks: 'Tin nhắn của bạn chỉ có thể chứa tối đa hai liên kết.',
  tagListLabel: 'Thẻ',
  tagKickerLabel: 'Thẻ',
  seriesKickerLabel: 'Loạt bài',
  archiveKickerLabel: 'Lưu trữ',
  authorKickerLabel: 'Tác giả',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`${count} bài viết`}`,
  emptyListingLabel: 'Chưa có bài viết nào.',
  editionsNavigationLabel: 'Phiên bản',
  editionOriginalLabel: 'Bản gốc',
  editionQuickReadLabel: 'Đọc nhanh',
  editionStandardLabel: 'Tiêu chuẩn',
  editionDeepDiveLabel: 'Chuyên sâu',
  editionNoticeLabel:
    'Phiên bản được tạo tự động, đã được tác giả duyệt; bản gốc là bản chuẩn',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Giới thiệu',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Cập nhật ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Bài viết có thẻ “${tag}”`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${`${count} bài viết`} có thẻ ${tag} trên ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, loạt bài gồm ${`${count} phần`} trên ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Lưu trữ ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${`${count} bài viết`} đăng năm ${year} trên ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Bài viết của ${name} trên ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Duyệt ${`${count} chủ đề`} được đề cập trên ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Duyệt ${count} loạt bài đã đăng trên ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Mọi bài viết trên ${publication}, tổng cộng ${count}, theo năm.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Mọi bài viết trên ${publication}, mới nhất trước.`,
  exploreColumnLabel: 'Khám phá',
  rssFeedLabel: 'Nguồn cấp RSS',
  languageKickerLabel: 'Ngôn ngữ',
  languageSwitcherLabel: 'Ngôn ngữ',
  languageChipsLabel: 'Ngôn ngữ có sẵn',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${`${count} bài viết`} bằng ${language} trên ${publication}.`,
  postRemovedHeading: 'Bài viết này đã bị gỡ',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Bài đã bị gỡ vào ${date}.`,
  postRemovedHomeLabel: 'Về trang chủ',
  versionPageHeading: 'Phiên bản trang',
  versionTemplateLabel: 'Mẫu',
  versionThemeLabel: 'Giao diện',
  versionSchemasLabel: 'Lược đồ',
  versionToolchainLabel: 'Bộ công cụ xuất bản',
  versionCommitLabel: 'Commit nguồn',
  versionBuiltAtLabel: 'Dựng lúc',
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('vi', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
