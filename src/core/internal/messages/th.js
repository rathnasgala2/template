/**
 * Chrome message catalog for the `th` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'ข้ามไปยังเนื้อหา',
  homeLinkLabel: 'หน้าแรก',
  primaryNavigationLabel: 'เมนูหลัก',
  footerNavigationLabel: 'ส่วนท้าย',
  breadcrumbNavigationLabel: 'เส้นทาง',
  paginationNavigationLabel: 'การแบ่งหน้า',
  previousPageLabel: 'ก่อนหน้า',
  nextPageLabel: 'ถัดไป',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `หน้า ${current} จาก ${total}`,
  authorsSectionLabel: 'ผู้เขียน',
  tagsSectionLabel: 'แท็ก',
  seriesSectionLabel: 'ซีรีส์',
  archiveSectionLabel: 'คลังบทความ',
  indexHeading: 'บทความทั้งหมด',
  authorsIndexLabel: 'ผู้เขียน',
  tagIndexLabelPrefix: 'แท็ก:',
  seriesIndexLabelPrefix: 'ซีรีส์:',
  archiveYearLabelPrefix: 'คลังบทความ:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `เกี่ยวกับ ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `โดย ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, เปิดในแท็บใหม่',
  footerLegalLabel: 'ข้อกฎหมาย',
  termsLinkLabel: 'ข้อกำหนด',
  privacyLinkLabel: 'ความเป็นส่วนตัว',
  consentRegionLabel: 'ตัวเลือกความเป็นส่วนตัว',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `เว็บไซต์นี้ต้องการใช้ ${providerName} เพื่อทำความเข้าใจผู้อ่าน จะไม่มีการโหลดอะไรจนกว่าคุณจะยอมรับ และคุณเปลี่ยนการเลือกได้ทุกเมื่อจากส่วนท้ายของหน้า`,
  consentAcceptLabel: 'ยอมรับการวิเคราะห์',
  consentDeclineLabel: 'ปฏิเสธ',
  consentOpenLabel: 'ตัวเลือกความเป็นส่วนตัว',
  errorPageHeading: 'ไม่พบหน้านี้',
  errorPageBody:
    'ไม่พบหน้าที่คุณต้องการ หน้านี้อาจถูกย้าย เปลี่ยนชื่อ หรือลบไปแล้ว',
  errorPageReturnHomeLabel: 'กลับไปหน้าแรก',
  appearanceControlLabel: 'รูปลักษณ์',
  appearanceModeLightLabel: 'สว่าง',
  appearanceModeDarkLabel: 'มืด',
  appearanceModeSystemLabel: 'ตามระบบ',
  searchButtonLabel: 'ค้นหา',
  searchButtonAriaLabel: 'ค้นหาบทความ',
  searchPlaceholderLabel: 'ค้นหาในสิ่งพิมพ์นี้',
  searchEmptyLabel: 'ไม่พบบทความที่ตรงกับคำค้นหา',
  searchUnavailableLabel: 'ตอนนี้ยังใช้การค้นหาไม่ได้',
  copyCodeLabel: 'คัดลอก',
  copiedLabel: 'คัดลอกแล้ว',
  linkCopiedLabel: 'คัดลอกลิงก์แล้ว',
  copyBlockedLabel: 'ที่นี่ถูกบล็อกการคัดลอก โปรดคัดลอกที่อยู่จากเบราว์เซอร์',
  codeSelectedLabel: 'เลือกโค้ดแล้ว กด Ctrl C หรือ Command C เพื่อคัดลอก',
  savedLabel: 'บันทึกไว้อ่านภายหลังแล้ว',
  unsavedLabel: 'นำออกจากบทความที่บันทึกไว้แล้ว',
  menuSummaryLabel: 'เมนู',
  featuredLabel: 'แนะนำ',
  readEssayLabel: 'อ่านบทความ',
  latestHeading: 'ล่าสุด',
  moreArticlesHeading: 'บทความเพิ่มเติม',
  browseByTagLabel: 'เรียกดูตามแท็ก',
  seriesCardLabel: 'ซีรีส์',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${`${count} ตอน`}`,
  startSeriesLabel: 'เริ่มที่ตอนที่ 1',
  newsletterLabel: 'จดหมายข่าว',
  newsletterActionLabel: 'สมัครรับ',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `อ่าน ${minutes} นาที`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `ตอนที่ ${part} จาก ${total}`,
  onThisPageLabel: 'ในหน้านี้',
  writtenByLabel: 'เขียนโดย',
  aboutTheAuthorLabel: 'เกี่ยวกับผู้เขียน',
  youAreHereLabel: 'คุณอยู่ที่นี่',
  newerArticleLabel: 'ใหม่กว่า',
  olderArticleLabel: 'เก่ากว่า',
  moreArticlesNavigationLabel: 'บทความเพิ่มเติม',
  keepReadingHeading: 'อ่านต่อ',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `เพิ่มเติมใน ${tag}`,
  interactionsHeading: 'ความเห็น',
  reactionsGroupLabel: 'รีแอคชัน',
  likeLabel: 'ถูกใจ',
  commentsHeading: 'การสนทนา',
  interactionsNeedScriptNotice: 'รีแอคชันและความคิดเห็นต้องใช้ JavaScript',
  showMoreCommentsLabel: 'แสดงความคิดเห็นเพิ่มเติม',
  shareLabel: 'แชร์',
  copyLinkLabel: 'คัดลอกลิงก์บทความนี้',
  saveForLaterLabel: 'บันทึกไว้อ่านภายหลัง',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `แชร์บน ${network}`,
  shareByEmailLabel: 'แชร์ทางอีเมล',
  shareNativeLabel: 'แชร์บทความนี้',
  followLabel: 'ติดตาม',
  followingLabel: 'กำลังติดตาม',
  unfollowLabel: 'เลิกติดตาม',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `ติดตาม ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `เลิกติดตาม ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `ตอนนี้คุณติดตาม ${name} แล้ว`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `คุณเลิกติดตาม ${name} แล้ว`,
  followDisabledMessage: 'ตอนนี้เว็บไซต์นี้ยังไม่เปิดให้ติดตาม',
  followAuthorMissingMessage: 'ตอนนี้ยังติดตามผู้เขียนคนนี้ไม่ได้',
  audienceNetworkError: 'เชื่อมต่อ Galascribe ไม่ได้ ลองอีกครั้ง',
  audienceRateLimited: 'ลองหลายครั้งเกินไป โปรดลองอีกครั้งในอีกสักครู่',
  audienceGenericError: 'เกิดข้อผิดพลาด ลองอีกครั้ง',
  audienceStorageBlocked:
    'เบราว์เซอร์บล็อกที่เก็บข้อมูลที่เว็บไซต์ต้องใช้เพื่อเข้าสู่ระบบ',
  audienceSignInUnsupported: 'เบราว์เซอร์นี้เข้าสู่ระบบในหน้านี้ไม่ได้',
  audienceSignInFailed: 'เข้าสู่ระบบไม่สำเร็จ ลองอีกครั้ง',
  audienceSignInInvalid: 'ลิงก์เข้าสู่ระบบไม่ถูกต้อง ลองอีกครั้ง',
  honeypotLabel: 'เว้นช่องนี้ไว้',
  fieldRequiredMessage: 'จำเป็นต้องกรอกช่องนี้',
  fieldInvalidMessage: 'ตรวจสอบช่องนี้',
  newsletterEmailLabel: 'ที่อยู่อีเมล',
  newsletterCheckInbox: 'ตรวจสอบกล่องจดหมายเพื่อยืนยัน',
  newsletterFullMessage: 'ตอนนี้จดหมายข่าวนี้ไม่รับสมาชิกใหม่',
  newsletterEmailInvalid: 'กรอกที่อยู่อีเมลที่ถูกต้อง',
  contactLinkLabel: 'ติดต่อ',
  contactPageTitle: 'ติดต่อ',
  contactDefaultIntro:
    'มีคำถามหรืออยากบอกอะไร ส่งข้อความมาได้ ผู้เขียนจะตอบกลับทางอีเมล',
  contactNameLabel: 'ชื่อ',
  contactEmailLabel: 'อีเมล',
  contactMessageLabel: 'ข้อความ',
  contactWebsiteLabel: 'เว็บไซต์ (ไม่บังคับ)',
  contactPhoneLabel: 'โทรศัพท์ (ไม่บังคับ)',
  contactSubmitLabel: 'ส่งข้อความ',
  contactNoscript: 'แบบฟอร์มนี้ต้องใช้ JavaScript เปิดใช้งานเพื่อส่งข้อความ',
  contactSent: 'ขอบคุณ ส่งข้อความของคุณแล้ว',
  contactUnavailable: 'ตอนนี้แบบฟอร์มนี้ไม่รับข้อความ',
  contactRateLimited: 'มีข้อความจากที่นี่มากเกินไป ลองอีกครั้งภายหลัง',
  contactMessageLinks: 'ข้อความมีลิงก์ได้ไม่เกินสองลิงก์',
  tagListLabel: 'แท็ก',
  tagKickerLabel: 'แท็ก',
  seriesKickerLabel: 'ซีรีส์',
  archiveKickerLabel: 'คลังบทความ',
  authorKickerLabel: 'ผู้เขียน',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) => `${`${count} บทความ`}`,
  emptyListingLabel: 'ยังไม่มีบทความ',
  editionsNavigationLabel: 'ฉบับ',
  editionOriginalLabel: 'ฉบับต้นฉบับ',
  editionQuickReadLabel: 'อ่านเร็ว',
  editionStandardLabel: 'มาตรฐาน',
  editionDeepDiveLabel: 'เจาะลึก',
  editionNoticeLabel:
    'ฉบับที่สร้างขึ้นและผู้เขียนตรวจแล้ว โดยฉบับต้นฉบับเป็นหลัก',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'เกี่ยวกับ',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `อัปเดต ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `โพสต์ที่ติดแท็ก “${tag}”`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${`${count} บทความ`} ที่ติดแท็ก ${tag} บน ${publication}`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name} ซีรีส์ ${`${count} ตอน`} บน ${publication}`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `คลังบทความ ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${`${count} บทความ`} ที่เผยแพร่ในปี ${year} บน ${publication}`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `บทความที่เขียนโดย ${name} บน ${publication}`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `เรียกดู ${count} หัวข้อบน ${publication}`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `เรียกดู ${count} ซีรีส์ที่เผยแพร่บน ${publication}`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `บทความทั้งหมดบน ${publication} รวม ${count} บทความ แบ่งตามปี`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `บทความทั้งหมดบน ${publication} เรียงจากใหม่สุด`,
  exploreColumnLabel: 'สำรวจ',
  rssFeedLabel: 'ฟีด RSS',
  languageKickerLabel: 'ภาษา',
  languageSwitcherLabel: 'ภาษา',
  languageChipsLabel: 'ภาษาที่มี',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${`${count} บทความ`} ภาษา${language} บน ${publication}`,
  postRemovedHeading: 'โพสต์นี้ถูกลบแล้ว',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `ลบเมื่อ ${date}`,
  postRemovedHomeLabel: 'ไปที่หน้าแรก',
  versionPageHeading: 'เวอร์ชันของเว็บไซต์',
  versionTemplateLabel: 'เทมเพลต',
  versionThemeLabel: 'ธีม',
  versionSchemasLabel: 'สคีมา',
  versionToolchainLabel: 'เครื่องมือเผยแพร่',
  versionCommitLabel: 'คอมมิตต้นทาง',
  versionBuiltAtLabel: 'สร้างเมื่อ',
  listenNavLabel: 'ฟัง',
  listenNavCurrentLabel: 'ฟังบทความนี้',
  listenInviteTitle: 'มือไม่ว่างใช่ไหม ฟังแทนได้',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `บทความนี้มีเวอร์ชันบทสนทนายาว ${minutes} นาทีด้วย เหมาะกับการขับรถ ออกกำลังกาย หรือล้างจาน`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `บทความนี้มีเวอร์ชันบรรยายเสียงยาว ${minutes} นาทีด้วย เหมาะกับการขับรถ ออกกำลังกาย หรือล้างจาน`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `บทความนี้มีเวอร์ชันโต้วาทียาว ${minutes} นาทีด้วย เหมาะกับการขับรถ ออกกำลังกาย หรือล้างจาน`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `บทความนี้มีเวอร์ชันสกิตสั้นยาว ${minutes} นาทีด้วย เหมาะกับการขับรถ ออกกำลังกาย หรือล้างจาน`,
  listenInvitePlayLabel: 'เล่น',
  listenInviteDeclineLabel: 'ไม่เป็นไร ขอบคุณ',
  listenInviteNote: 'เสียง AI ดัดแปลงจากบทความนี้',
  listenInviteCloseLabel: 'ปิดไว้ก่อน',
  listenPlayerRegionLabel: 'เครื่องเล่นเสียง',
  listenPlayerNowPlayingLabel: 'กำลังเล่น',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} จาก ${count}`,
  listenPlayerPlayLabel: 'เล่น',
  listenPlayerPauseLabel: 'หยุดชั่วคราว',
  listenPlayerBackLabel: 'ย้อนกลับ 15 วินาที',
  listenPlayerPreviousLabel: 'ตอนก่อนหน้า',
  listenPlayerNextLabel: 'ตอนถัดไป',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `ความเร็วในการเล่น ${rate}×`,
  listenPlayerSeekLabel: 'ตำแหน่ง',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} จาก ${total}`,
  listenPlayerCloseLabel: 'หยุดและปิด',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `กำลังเล่น: ${title}`,
  listenListHeading: 'ฟังบล็อกนี้',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) => `${count} ตอน · ${duration}`,
  listenListPlayAllLabel: 'เล่นทั้งหมด',
  listenListShuffleLabel: 'สุ่มเล่น',
  listenListOrderLabel: 'ลำดับ',
  listenListNewestLabel: 'ใหม่สุดก่อน',
  listenListOldestLabel: 'เก่าสุดก่อน',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `แสดงทั้งหมด (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `เล่น ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} นาที`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) =>
    `${hours} ชม. ${minutes} นาที`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('th', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`));
  },
});
