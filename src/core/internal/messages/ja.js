/**
 * Chrome message catalog for the `ja` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: '本文へスキップ',
  homeLinkLabel: 'ホーム',
  primaryNavigationLabel: 'メイン',
  footerNavigationLabel: 'フッター',
  breadcrumbNavigationLabel: 'パンくずリスト',
  paginationNavigationLabel: 'ページ送り',
  previousPageLabel: '前へ',
  nextPageLabel: '次へ',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `${current} / ${total} ページ`,
  authorsSectionLabel: '著者',
  tagsSectionLabel: 'タグ',
  seriesSectionLabel: 'シリーズ',
  archiveSectionLabel: 'アーカイブ',
  indexHeading: 'すべての記事',
  authorsIndexLabel: '著者',
  tagIndexLabelPrefix: 'タグ:',
  seriesIndexLabelPrefix: 'シリーズ:',
  archiveYearLabelPrefix: 'アーカイブ:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `${displayName}について`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe、新しいタブで開きます',
  footerLegalLabel: '法的情報',
  termsLinkLabel: '利用規約',
  privacyLinkLabel: 'プライバシー',
  consentRegionLabel: 'プライバシー設定',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `このサイトでは、読者の傾向を知るために${providerName}を利用したいと考えています。同意するまで何も読み込まれず、設定はいつでもフッターから変更できます。`,
  consentAcceptLabel: 'アクセス解析を許可',
  consentDeclineLabel: '許可しない',
  consentOpenLabel: 'プライバシー設定',
  errorPageHeading: 'ページが見つかりません',
  errorPageBody:
    'お探しのページは見つかりませんでした。移動、名称変更、または削除された可能性があります。',
  errorPageReturnHomeLabel: 'ホームに戻る',
  appearanceControlLabel: '外観',
  appearanceModeLightLabel: 'ライト',
  appearanceModeDarkLabel: 'ダーク',
  appearanceModeSystemLabel: 'システム',
  searchButtonLabel: '検索',
  searchButtonAriaLabel: '記事を検索',
  searchPlaceholderLabel: 'このサイトを検索',
  searchEmptyLabel: '該当する記事はありません。',
  searchUnavailableLabel: '現在、検索は利用できません。',
  copyCodeLabel: 'コピー',
  copiedLabel: 'コピーしました',
  linkCopiedLabel: 'リンクをコピーしました。',
  copyBlockedLabel:
    'ここではコピーできません。ブラウザからアドレスをコピーしてください。',
  codeSelectedLabel:
    'コードを選択しました。Ctrl C または Command C でコピーできます。',
  savedLabel: 'あとで読むに保存しました。',
  unsavedLabel: '保存した記事から削除しました。',
  menuSummaryLabel: 'メニュー',
  featuredLabel: '注目',
  readEssayLabel: 'エッセイを読む',
  latestHeading: '新着',
  moreArticlesHeading: 'その他の記事',
  browseByTagLabel: 'タグから探す',
  seriesCardLabel: 'シリーズ',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `全${`${count}話`}`,
  startSeriesLabel: '第1話から読む',
  newsletterLabel: 'ニュースレター',
  newsletterActionLabel: '購読する',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `読了目安 ${minutes}分`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `第${part}話 / 全${total}話`,
  onThisPageLabel: 'このページの内容',
  writtenByLabel: '執筆',
  aboutTheAuthorLabel: '著者について',
  youAreHereLabel: '現在位置',
  newerArticleLabel: '新しい記事',
  olderArticleLabel: '古い記事',
  moreArticlesNavigationLabel: 'その他の記事',
  keepReadingHeading: '続けて読む',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `${tag}の記事をもっと見る`,
  interactionsHeading: 'リアクション',
  reactionsGroupLabel: 'リアクション',
  likeLabel: 'いいね',
  commentsHeading: 'コメント',
  interactionsNeedScriptNotice:
    'リアクションとコメントにはJavaScriptが必要です。',
  showMoreCommentsLabel: 'コメントをさらに表示',
  shareLabel: '共有',
  copyLinkLabel: 'この記事のリンクをコピー',
  saveForLaterLabel: 'あとで読む',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `${network}で共有`,
  shareByEmailLabel: 'メールで共有',
  shareNativeLabel: 'この記事を共有',
  followLabel: 'フォロー',
  followingLabel: 'フォロー中',
  unfollowLabel: 'フォロー解除',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `${name}をフォロー`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `${name}のフォローを解除`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `${name}をフォローしました。`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `${name}のフォローを解除しました。`,
  followDisabledMessage: '現在、このサイトではフォローを利用できません。',
  followAuthorMissingMessage: '現在、この著者はフォローできません。',
  audienceNetworkError:
    'Galascribeに接続できませんでした。もう一度お試しください。',
  audienceRateLimited: '試行回数が多すぎます。しばらくしてからお試しください。',
  audienceGenericError: '問題が発生しました。もう一度お試しください。',
  audienceStorageBlocked:
    'サインインに必要なストレージがブラウザでブロックされています。',
  audienceSignInUnsupported:
    'このブラウザでは、このページでサインインできません。',
  audienceSignInFailed:
    'サインインが完了しませんでした。もう一度お試しください。',
  audienceSignInInvalid:
    'このサインインリンクは無効です。もう一度お試しください。',
  honeypotLabel: 'この欄は空のままにしてください',
  fieldRequiredMessage: 'この項目は必須です。',
  fieldInvalidMessage: 'この項目を確認してください。',
  newsletterEmailLabel: 'メールアドレス',
  newsletterCheckInbox: '受信トレイを確認して登録を完了してください',
  newsletterFullMessage:
    'このニュースレターは現在、新規の購読を受け付けていません。',
  newsletterEmailInvalid: '有効なメールアドレスを入力してください。',
  contactLinkLabel: 'お問い合わせ',
  contactPageTitle: 'お問い合わせ',
  contactDefaultIntro:
    'ご質問やご意見はありますか？ メッセージを送っていただければ、著者がメールで返信します。',
  contactNameLabel: 'お名前',
  contactEmailLabel: 'メール',
  contactMessageLabel: 'メッセージ',
  contactWebsiteLabel: 'ウェブサイト（任意）',
  contactPhoneLabel: '電話番号（任意）',
  contactSubmitLabel: '送信',
  contactNoscript:
    'このフォームにはJavaScriptが必要です。有効にしてからメッセージを送信してください。',
  contactSent: 'メッセージを送信しました。ありがとうございます。',
  contactUnavailable: '現在、このフォームはメッセージを受け付けていません。',
  contactRateLimited:
    'こちらからのメッセージが多すぎます。しばらくしてからお試しください。',
  contactMessageLinks: 'メッセージに含められるリンクは2つまでです。',
  tagListLabel: 'タグ',
  tagKickerLabel: 'タグ',
  seriesKickerLabel: 'シリーズ',
  archiveKickerLabel: 'アーカイブ',
  authorKickerLabel: '著者',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`${count}件の記事`}`,
  emptyListingLabel: '記事はまだありません。',
  editionsNavigationLabel: 'エディション',
  editionOriginalLabel: 'オリジナル',
  editionQuickReadLabel: 'かんたん版',
  editionStandardLabel: '標準版',
  editionDeepDiveLabel: '詳細版',
  editionNoticeLabel:
    '生成版（著者が確認済み）です。基準となるのはオリジナルです',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title}（${edition}）`,
  aboutPageTitle: 'このサイトについて',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `更新: ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `「${tag}」タグの記事`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${publication}の「${tag}」タグの記事（${`${count}件の記事`}）。`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}、${publication}の全${`${count}話`}のシリーズ。`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `${year}年のアーカイブ`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${publication}で${year}年に公開された${`${count}件の記事`}。`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `${publication}に掲載された${name}の記事。`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `${publication}で扱っている${`${count}件のトピック`}を探せます。`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `${publication}で公開されている${count}件のシリーズを探せます。`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `${publication}のすべての記事（全${count}件）を年別に掲載しています。`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `${publication}のすべての記事を新しい順に掲載しています。`,
  exploreColumnLabel: '探す',
  rssFeedLabel: 'RSSフィード',
  languageKickerLabel: '言語',
  languageSwitcherLabel: '言語',
  languageChipsLabel: '利用できる言語',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${publication}の${language}の${`${count}件の記事`}。`,
  postRemovedHeading: 'この記事は削除されました',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `${date}に削除されました。`,
  postRemovedHomeLabel: 'ホームへ',
  versionPageHeading: 'サイトのバージョン',
  versionTemplateLabel: 'テンプレート',
  versionThemeLabel: 'テーマ',
  versionSchemasLabel: 'スキーマ',
  versionToolchainLabel: '公開ツールチェーン',
  versionCommitLabel: 'ソースコミット',
  versionBuiltAtLabel: 'ビルド日時',
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('ja', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
