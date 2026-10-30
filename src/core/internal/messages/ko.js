/**
 * Chrome message catalog for the `ko` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: '본문으로 건너뛰기',
  homeLinkLabel: '홈',
  primaryNavigationLabel: '주 메뉴',
  footerNavigationLabel: '푸터',
  breadcrumbNavigationLabel: '탐색 경로',
  paginationNavigationLabel: '페이지 이동',
  previousPageLabel: '이전',
  nextPageLabel: '다음',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `${current} / ${total} 페이지`,
  authorsSectionLabel: '작성자',
  tagsSectionLabel: '태그',
  seriesSectionLabel: '시리즈',
  archiveSectionLabel: '보관함',
  indexHeading: '모든 글',
  authorsIndexLabel: '작성자',
  tagIndexLabelPrefix: '태그:',
  seriesIndexLabelPrefix: '시리즈:',
  archiveYearLabelPrefix: '보관함:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `${displayName} 소개`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `${displayName} 작성`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, 새 탭에서 열림',
  footerLegalLabel: '법적 고지',
  termsLinkLabel: '이용약관',
  privacyLinkLabel: '개인정보처리방침',
  consentRegionLabel: '개인정보 선택',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `이 사이트는 독자를 이해하기 위해 ${providerName}을(를) 사용하려 합니다. 동의하기 전에는 아무것도 불러오지 않으며, 선택은 언제든 푸터에서 바꿀 수 있습니다.`,
  consentAcceptLabel: '분석 허용',
  consentDeclineLabel: '거부',
  consentOpenLabel: '개인정보 선택',
  errorPageHeading: '페이지를 찾을 수 없습니다',
  errorPageBody:
    '찾으시는 페이지를 찾을 수 없습니다. 이동했거나 이름이 바뀌었거나 삭제되었을 수 있습니다.',
  errorPageReturnHomeLabel: '홈으로 돌아가기',
  appearanceControlLabel: '화면 모드',
  appearanceModeLightLabel: '라이트',
  appearanceModeDarkLabel: '다크',
  appearanceModeSystemLabel: '시스템',
  searchButtonLabel: '검색',
  searchButtonAriaLabel: '글 검색',
  searchPlaceholderLabel: '사이트 검색',
  searchEmptyLabel: '검색과 일치하는 글이 없습니다.',
  searchUnavailableLabel: '지금은 검색을 사용할 수 없습니다.',
  copyCodeLabel: '복사',
  copiedLabel: '복사됨',
  linkCopiedLabel: '링크를 복사했습니다.',
  copyBlockedLabel:
    '여기서는 복사가 차단되었습니다. 브라우저에서 주소를 복사하세요.',
  codeSelectedLabel:
    '코드를 선택했습니다. 복사하려면 Ctrl C 또는 Command C를 누르세요.',
  savedLabel: '나중에 읽을 글로 저장했습니다.',
  unsavedLabel: '저장한 글에서 삭제했습니다.',
  menuSummaryLabel: '메뉴',
  featuredLabel: '추천',
  readEssayLabel: '에세이 읽기',
  latestHeading: '최신',
  moreArticlesHeading: '더 많은 글',
  browseByTagLabel: '태그로 둘러보기',
  seriesCardLabel: '시리즈',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${`${count}부`} 구성`,
  startSeriesLabel: '1부부터 시작',
  newsletterLabel: '뉴스레터',
  newsletterActionLabel: '구독',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `읽는 데 ${minutes}분`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `${total}부 중 ${part}부`,
  onThisPageLabel: '이 페이지의 내용',
  writtenByLabel: '작성자',
  aboutTheAuthorLabel: '작성자 소개',
  youAreHereLabel: '현재 위치',
  newerArticleLabel: '최신 글',
  olderArticleLabel: '이전 글',
  moreArticlesNavigationLabel: '더 많은 글',
  keepReadingHeading: '계속 읽기',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `${tag} 더 보기`,
  interactionsHeading: '반응',
  reactionsGroupLabel: '공감',
  likeLabel: '좋아요',
  commentsHeading: '댓글',
  interactionsNeedScriptNotice: '공감과 댓글에는 JavaScript가 필요합니다.',
  showMoreCommentsLabel: '댓글 더 보기',
  shareLabel: '공유',
  copyLinkLabel: '이 글의 링크 복사',
  saveForLaterLabel: '나중에 읽기',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `${network}에 공유`,
  shareByEmailLabel: '이메일로 공유',
  shareNativeLabel: '이 글 공유',
  followLabel: '팔로우',
  followingLabel: '팔로잉',
  unfollowLabel: '팔로우 취소',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `${name} 팔로우`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `${name} 팔로우 취소`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `이제 ${name}을(를) 팔로우합니다.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) =>
    `더 이상 ${name}을(를) 팔로우하지 않습니다.`,
  /** @type {(count: string) => string} */
  followersCountLabel: (count) => `팔로워 ${count}명`,
  followersTeamHint: '사이트 팀에게만 표시됩니다',
  followDisabledMessage: '지금은 이 사이트에서 팔로우를 사용할 수 없습니다.',
  followAuthorMissingMessage: '지금은 이 작성자를 팔로우할 수 없습니다.',
  audienceNetworkError: 'Galascribe에 연결할 수 없습니다. 다시 시도하세요.',
  audienceRateLimited: '시도가 너무 많습니다. 잠시 후 다시 시도하세요.',
  audienceGenericError: '문제가 발생했습니다. 다시 시도하세요.',
  audienceStorageBlocked: '로그인에 필요한 저장소를 브라우저가 차단했습니다.',
  audienceSignInUnsupported:
    '이 브라우저로는 이 페이지에서 로그인할 수 없습니다.',
  audienceSignInFailed: '로그인이 완료되지 않았습니다. 다시 시도하세요.',
  audienceSignInInvalid: '로그인 링크가 올바르지 않습니다. 다시 시도하세요.',
  honeypotLabel: '이 칸은 비워 두세요',
  fieldRequiredMessage: '필수 항목입니다.',
  fieldInvalidMessage: '이 항목을 확인하세요.',
  newsletterEmailLabel: '이메일 주소',
  newsletterCheckInbox: '받은편지함에서 확인해 주세요',
  newsletterFullMessage: '이 뉴스레터는 지금 새 구독자를 받지 않습니다.',
  newsletterEmailInvalid: '올바른 이메일 주소를 입력하세요.',
  contactLinkLabel: '문의',
  contactPageTitle: '문의',
  contactDefaultIntro:
    '궁금한 점이나 전하고 싶은 말이 있나요? 메시지를 보내면 작성자가 이메일로 답장합니다.',
  contactNameLabel: '이름',
  contactEmailLabel: '이메일',
  contactMessageLabel: '메시지',
  contactWebsiteLabel: '웹사이트(선택)',
  contactPhoneLabel: '전화번호(선택)',
  contactSubmitLabel: '메시지 보내기',
  contactNoscript:
    '이 양식에는 JavaScript가 필요합니다. 켠 뒤 메시지를 보내세요.',
  contactSent: '감사합니다. 메시지를 보냈습니다.',
  contactUnavailable: '이 양식은 지금 메시지를 받지 않습니다.',
  contactRateLimited:
    '이곳에서 보낸 메시지가 너무 많습니다. 나중에 다시 시도하세요.',
  contactMessageLinks: '메시지에는 링크를 최대 두 개까지 넣을 수 있습니다.',
  tagListLabel: '태그',
  tagKickerLabel: '태그',
  seriesKickerLabel: '시리즈',
  archiveKickerLabel: '보관함',
  authorKickerLabel: '작성자',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`${count}개의 글`}`,
  emptyListingLabel: '아직 글이 없습니다.',
  editionsNavigationLabel: '판본',
  editionOriginalLabel: '원문',
  editionQuickReadLabel: '빠른 읽기',
  editionStandardLabel: '표준',
  editionDeepDiveLabel: '심층',
  editionNoticeLabel:
    '생성된 판본이며 작성자가 검토했습니다. 기준은 원문입니다',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: '소개',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `${date} 업데이트`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `“${tag}” 태그가 달린 글`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${publication}에서 ${tag} 태그가 달린 글 ${`${count}개의 글`}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, ${publication}의 ${`${count}부`} 시리즈.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `${year}년 보관함`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${publication}에서 ${year}년에 발행한 글 ${`${count}개의 글`}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `${publication}에 실린 ${name}의 글.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `${publication}에서 다루는 ${`${count}개의 주제`}를 둘러보세요.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `${publication}에서 발행한 ${count}개의 시리즈를 둘러보세요.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `${publication}의 모든 글, 총 ${count}개를 연도별로 보여 드립니다.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `${publication}의 모든 글을 최신순으로 보여 드립니다.`,
  exploreColumnLabel: '둘러보기',
  rssFeedLabel: 'RSS 피드',
  languageKickerLabel: '언어',
  languageSwitcherLabel: '언어',
  languageChipsLabel: '사용 가능한 언어',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${publication}의 ${language} 글 ${`${count}개의 글`}.`,
  postRemovedHeading: '이 글은 삭제되었습니다',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `${date}에 삭제되었습니다.`,
  postRemovedHomeLabel: '홈으로 이동',
  versionPageHeading: '사이트 버전',
  versionTemplateLabel: '템플릿',
  versionThemeLabel: '테마',
  versionSchemasLabel: '스키마',
  versionToolchainLabel: '게시 툴체인',
  versionCommitLabel: '소스 커밋',
  versionBuiltAtLabel: '빌드 시각',
  listenNavLabel: '듣기',
  listenNavCurrentLabel: '이 글 듣기',
  listenInviteTitle: '손이 바쁘신가요? 대신 들어 보세요.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `이 글은 ${minutes}분 길이의 대화로도 들을 수 있어요. 운전이나 운동, 설거지할 때 좋아요.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `이 글은 ${minutes}분 길이의 낭독으로도 들을 수 있어요. 운전이나 운동, 설거지할 때 좋아요.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `이 글은 ${minutes}분 길이의 토론으로도 들을 수 있어요. 운전이나 운동, 설거지할 때 좋아요.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `이 글은 ${minutes}분 길이의 스킷으로도 들을 수 있어요. 운전이나 운동, 설거지할 때 좋아요.`,
  listenInvitePlayLabel: '재생',
  listenInviteDeclineLabel: '아니요, 괜찮아요',
  listenInviteNote: 'AI 음성으로 이 글을 바탕으로 만들었어요.',
  listenInviteCloseLabel: '지금은 닫기',
  listenPlayerRegionLabel: '오디오 플레이어',
  listenPlayerNowPlayingLabel: '재생 중',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} / ${count}`,
  listenPlayerPlayLabel: '재생',
  listenPlayerPauseLabel: '일시정지',
  listenPlayerBackLabel: '15초 뒤로',
  listenPlayerPreviousLabel: '이전 에피소드',
  listenPlayerNextLabel: '다음 에피소드',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `재생 속도 ${rate}배`,
  listenPlayerSeekLabel: '재생 위치',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} / ${total}`,
  listenPlayerCloseLabel: '정지하고 닫기',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `재생 중: ${title}`,
  listenListHeading: '이 블로그 듣기',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `${count}개 에피소드 · ${duration}`,
  listenListPlayAllLabel: '모두 재생',
  listenListShuffleLabel: '셔플',
  listenListOrderLabel: '정렬',
  listenListNewestLabel: '최신순',
  listenListOldestLabel: '오래된 순',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `${count}개 모두 보기`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `${title} 재생`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes}분`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours}시간 ${minutes}분`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('ko', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
