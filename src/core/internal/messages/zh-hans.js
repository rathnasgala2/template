/**
 * Chrome message catalog for the `zh-hans` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: '跳到正文',
  homeLinkLabel: '首页',
  primaryNavigationLabel: '主导航',
  footerNavigationLabel: '页脚',
  breadcrumbNavigationLabel: '面包屑导航',
  paginationNavigationLabel: '分页',
  previousPageLabel: '上一页',
  nextPageLabel: '下一页',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `第 ${current} 页，共 ${total} 页`,
  authorsSectionLabel: '作者',
  tagsSectionLabel: '标签',
  seriesSectionLabel: '系列',
  archiveSectionLabel: '归档',
  indexHeading: '全部文章',
  authorsIndexLabel: '作者',
  tagIndexLabelPrefix: '标签：',
  seriesIndexLabelPrefix: '系列：',
  archiveYearLabelPrefix: '归档：',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `关于 ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `作者：${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe，在新标签页中打开',
  footerLegalLabel: '法律信息',
  termsLinkLabel: '条款',
  privacyLinkLabel: '隐私',
  consentRegionLabel: '隐私选项',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `本站希望使用 ${providerName} 来了解读者情况。在你同意之前不会加载任何内容，你也可以随时在页脚更改选择。`,
  consentAcceptLabel: '接受统计分析',
  consentDeclineLabel: '拒绝',
  consentOpenLabel: '隐私选项',
  errorPageHeading: '页面未找到',
  errorPageBody: '找不到你要访问的页面。它可能已被移动、重命名或删除。',
  errorPageReturnHomeLabel: '返回首页',
  appearanceControlLabel: '外观',
  appearanceModeLightLabel: '浅色',
  appearanceModeDarkLabel: '深色',
  appearanceModeSystemLabel: '跟随系统',
  searchButtonLabel: '搜索',
  searchButtonAriaLabel: '搜索文章',
  searchPlaceholderLabel: '搜索本站',
  searchEmptyLabel: '没有与搜索匹配的文章。',
  searchUnavailableLabel: '搜索暂时不可用。',
  copyCodeLabel: '复制',
  copiedLabel: '已复制',
  linkCopiedLabel: '链接已复制。',
  copyBlockedLabel: '此处无法复制，请从浏览器中复制地址。',
  codeSelectedLabel: '代码已选中。按 Ctrl C 或 Command C 复制。',
  savedLabel: '已保存，稍后阅读。',
  unsavedLabel: '已从收藏的文章中移除。',
  menuSummaryLabel: '菜单',
  featuredLabel: '精选',
  readEssayLabel: '阅读这篇随笔',
  latestHeading: '最新',
  moreArticlesHeading: '更多文章',
  browseByTagLabel: '按标签浏览',
  seriesCardLabel: '系列',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `共${`${count}部分`}`,
  startSeriesLabel: '从第 1 部分开始',
  newsletterLabel: '邮件通讯',
  newsletterActionLabel: '订阅',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `阅读约 ${minutes} 分钟`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `第 ${part} 部分，共 ${total} 部分`,
  onThisPageLabel: '本页内容',
  writtenByLabel: '作者',
  aboutTheAuthorLabel: '关于作者',
  youAreHereLabel: '当前位置',
  newerArticleLabel: '较新',
  olderArticleLabel: '较早',
  moreArticlesNavigationLabel: '更多文章',
  keepReadingHeading: '继续阅读',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `更多 ${tag} 文章`,
  interactionsHeading: '互动',
  reactionsGroupLabel: '表情回应',
  likeLabel: '点赞',
  commentsHeading: '评论',
  interactionsNeedScriptNotice: '表情回应和评论需要启用 JavaScript。',
  showMoreCommentsLabel: '显示更多评论',
  shareLabel: '分享',
  copyLinkLabel: '复制本文链接',
  saveForLaterLabel: '稍后阅读',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `分享到 ${network}`,
  shareByEmailLabel: '通过邮件分享',
  shareNativeLabel: '分享这篇文章',
  followLabel: '关注',
  followingLabel: '已关注',
  unfollowLabel: '取消关注',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `关注 ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `取消关注 ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `你已关注 ${name}。`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `你已取消关注 ${name}。`,
  followDisabledMessage: '本站暂时无法使用关注功能。',
  followAuthorMissingMessage: '暂时无法关注这位作者。',
  audienceNetworkError: '无法连接 Galascribe，请重试。',
  audienceRateLimited: '尝试次数过多，请稍后再试。',
  audienceGenericError: '出了点问题，请重试。',
  audienceStorageBlocked: '你的浏览器阻止了本站登录所需的存储。',
  audienceSignInUnsupported: '此浏览器无法在本页登录。',
  audienceSignInFailed: '登录未完成，请重试。',
  audienceSignInInvalid: '该登录链接无效，请重试。',
  honeypotLabel: '请将此栏留空',
  fieldRequiredMessage: '此项为必填。',
  fieldInvalidMessage: '请检查此项。',
  newsletterEmailLabel: '电子邮箱',
  newsletterCheckInbox: '请查收邮件以确认订阅',
  newsletterFullMessage: '此邮件通讯暂时不接受新订阅。',
  newsletterEmailInvalid: '请输入有效的电子邮箱。',
  contactLinkLabel: '联系',
  contactPageTitle: '联系',
  contactDefaultIntro: '有问题或想说点什么？发送消息，作者会通过邮件回复。',
  contactNameLabel: '姓名',
  contactEmailLabel: '邮箱',
  contactMessageLabel: '消息',
  contactWebsiteLabel: '网站（选填）',
  contactPhoneLabel: '电话（选填）',
  contactSubmitLabel: '发送消息',
  contactNoscript: '此表单需要 JavaScript。请启用后再发送消息。',
  contactSent: '谢谢，你的消息已发送。',
  contactUnavailable: '此表单暂时不接收消息。',
  contactRateLimited: '来自此处的消息过多，请稍后再试。',
  contactMessageLinks: '消息中最多只能包含两个链接。',
  tagListLabel: '标签',
  tagKickerLabel: '标签',
  seriesKickerLabel: '系列',
  archiveKickerLabel: '归档',
  authorKickerLabel: '作者',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`${count}篇文章`}`,
  emptyListingLabel: '暂无文章。',
  editionsNavigationLabel: '版本',
  editionOriginalLabel: '原文',
  editionQuickReadLabel: '速读版',
  editionStandardLabel: '标准版',
  editionDeepDiveLabel: '深度版',
  editionNoticeLabel: '生成版本，已由作者审阅；以原文为准',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title}（${edition}）`,
  aboutPageTitle: '关于',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `更新于 ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `标签“${tag}”下的文章`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${publication}上带有标签 ${tag} 的文章，共${`${count}篇文章`}。`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}，${publication}上的系列，共${`${count}部分`}。`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `${year} 年归档`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${publication}在 ${year} 年发布的${`${count}篇文章`}。`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `${name}在${publication}上撰写的文章。`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `浏览${publication}涵盖的${`${count}个主题`}。`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `浏览${publication}发布的 ${count} 个系列。`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `${publication}的全部文章，共 ${count} 篇，按年份排列。`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `${publication}的全部文章，按最新排序。`,
  exploreColumnLabel: '探索',
  rssFeedLabel: 'RSS 订阅',
  languageKickerLabel: '语言',
  languageSwitcherLabel: '语言',
  languageChipsLabel: '可用语言',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${publication}上的${language}文章，共${`${count}篇文章`}。`,
  postRemovedHeading: '这篇文章已被删除',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `删除于 ${date}。`,
  postRemovedHomeLabel: '前往首页',
  versionPageHeading: '站点版本',
  versionTemplateLabel: '模板',
  versionThemeLabel: '主题',
  versionSchemasLabel: '数据模式',
  versionToolchainLabel: '发布工具链',
  versionCommitLabel: '源码提交',
  versionBuiltAtLabel: '构建时间',
  listenNavLabel: '收听',
  listenNavCurrentLabel: '收听本文',
  listenInviteTitle: '腾不出手？不妨听一听。',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `本文也有 ${minutes} 分钟的对话版。适合开车、健身或洗碗时收听。`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `本文也有 ${minutes} 分钟的朗读版。适合开车、健身或洗碗时收听。`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `本文也有 ${minutes} 分钟的辩论版。适合开车、健身或洗碗时收听。`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `本文也有 ${minutes} 分钟的短剧版。适合开车、健身或洗碗时收听。`,
  listenInvitePlayLabel: '播放',
  listenInviteDeclineLabel: '不用了',
  listenInviteNote: 'AI 配音，改编自本文。',
  listenInviteCloseLabel: '暂时关闭',
  listenPlayerRegionLabel: '音频播放器',
  listenPlayerNowPlayingLabel: '正在播放',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} / ${count}`,
  listenPlayerPlayLabel: '播放',
  listenPlayerPauseLabel: '暂停',
  listenPlayerBackLabel: '后退 15 秒',
  listenPlayerPreviousLabel: '上一集',
  listenPlayerNextLabel: '下一集',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `播放速度 ${rate} 倍`,
  listenPlayerSeekLabel: '进度',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} / ${total}`,
  listenPlayerCloseLabel: '停止并关闭',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `正在播放：${title}`,
  listenListHeading: '收听本博客',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `${count} 集 · ${duration}`,
  listenListPlayAllLabel: '全部播放',
  listenListShuffleLabel: '随机播放',
  listenListOrderLabel: '排序',
  listenListNewestLabel: '最新优先',
  listenListOldestLabel: '最早优先',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `显示全部 ${count} 集`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `播放 ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} 分钟`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) =>
    `${hours} 小时 ${minutes} 分钟`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('zh-Hans', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
