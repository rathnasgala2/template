/**
 * Chrome message catalog for the `el` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Μετάβαση στο περιεχόμενο',
  homeLinkLabel: 'Αρχική',
  primaryNavigationLabel: 'Κύριο μενού',
  footerNavigationLabel: 'Υποσέλιδο',
  breadcrumbNavigationLabel: 'Διαδρομή',
  paginationNavigationLabel: 'Σελιδοποίηση',
  previousPageLabel: 'Προηγούμενο',
  nextPageLabel: 'Επόμενο',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Σελίδα ${current} από ${total}`,
  authorsSectionLabel: 'Συγγραφείς',
  tagsSectionLabel: 'Ετικέτες',
  seriesSectionLabel: 'Σειρές',
  archiveSectionLabel: 'Αρχείο',
  indexHeading: 'Όλα τα άρθρα',
  authorsIndexLabel: 'Συγγραφείς',
  tagIndexLabelPrefix: 'Ετικέτα:',
  seriesIndexLabelPrefix: 'Σειρά:',
  archiveYearLabelPrefix: 'Αρχείο:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Σχετικά με τον/την ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Από ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, ανοίγει σε νέα καρτέλα',
  footerLegalLabel: 'Νομικά',
  termsLinkLabel: 'Όροι',
  privacyLinkLabel: 'Απόρρητο',
  consentRegionLabel: 'Επιλογές απορρήτου',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Αυτός ο ιστότοπος θα ήθελε να χρησιμοποιήσει το ${providerName} για να κατανοεί την αναγνωσιμότητα. Τίποτα δεν φορτώνεται μέχρι να αποδεχτείς, και μπορείς να αλλάξεις την επιλογή σου οποτεδήποτε από το υποσέλιδο.`,
  consentAcceptLabel: 'Αποδοχή αναλυτικών',
  consentDeclineLabel: 'Απόρριψη',
  consentOpenLabel: 'Επιλογές απορρήτου',
  errorPageHeading: 'Η σελίδα δεν βρέθηκε',
  errorPageBody:
    'Η σελίδα που ψάχνεις δεν βρέθηκε. Ίσως μετακινήθηκε, μετονομάστηκε ή αφαιρέθηκε.',
  errorPageReturnHomeLabel: 'Επιστροφή στην αρχική σελίδα',
  appearanceControlLabel: 'Εμφάνιση',
  appearanceModeLightLabel: 'Φωτεινή',
  appearanceModeDarkLabel: 'Σκούρα',
  appearanceModeSystemLabel: 'Σύστημα',
  searchButtonLabel: 'Αναζήτηση',
  searchButtonAriaLabel: 'Αναζήτηση άρθρων',
  searchPlaceholderLabel: 'Αναζήτηση στην έκδοση',
  searchEmptyLabel: 'Κανένα άρθρο δεν ταιριάζει με την αναζήτησή σου.',
  searchUnavailableLabel: 'Η αναζήτηση δεν είναι διαθέσιμη αυτή τη στιγμή.',
  copyCodeLabel: 'Αντιγραφή',
  copiedLabel: 'Αντιγράφηκε',
  linkCopiedLabel: 'Ο σύνδεσμος αντιγράφηκε.',
  copyBlockedLabel:
    'Η αντιγραφή έχει αποκλειστεί εδώ. Αντίγραψε τη διεύθυνση από το πρόγραμμα περιήγησης.',
  codeSelectedLabel:
    'Ο κώδικας επιλέχθηκε. Πάτα Ctrl C ή Command C για αντιγραφή.',
  savedLabel: 'Αποθηκεύτηκε για αργότερα.',
  unsavedLabel: 'Αφαιρέθηκε από τα αποθηκευμένα άρθρα.',
  menuSummaryLabel: 'Μενού',
  featuredLabel: 'Προτεινόμενο',
  readEssayLabel: 'Διάβασε το δοκίμιο',
  latestHeading: 'Τελευταία',
  moreArticlesHeading: 'Περισσότερα άρθρα',
  browseByTagLabel: 'Περιήγηση ανά ετικέτα',
  seriesCardLabel: 'Σειρά',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) => `${count === '1' ? '1 μέρος' : `${count} μέρη`}`,
  startSeriesLabel: 'Ξεκίνα με το μέρος 1',
  newsletterLabel: 'Ενημερωτικό δελτίο',
  newsletterActionLabel: 'Εγγραφή',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} λεπτά ανάγνωσης`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Μέρος ${part} από ${total}`,
  onThisPageLabel: 'Σε αυτή τη σελίδα',
  writtenByLabel: 'Γράφτηκε από',
  aboutTheAuthorLabel: 'Σχετικά με τον συγγραφέα',
  youAreHereLabel: 'Βρίσκεσαι εδώ',
  newerArticleLabel: 'Νεότερο',
  olderArticleLabel: 'Παλαιότερο',
  moreArticlesNavigationLabel: 'Περισσότερα άρθρα',
  keepReadingHeading: 'Συνέχισε το διάβασμα',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Περισσότερα στο ${tag}`,
  interactionsHeading: 'Αντιδράσεις',
  reactionsGroupLabel: 'Αντιδράσεις',
  likeLabel: 'Μου αρέσει',
  commentsHeading: 'Συζήτηση',
  interactionsNeedScriptNotice:
    'Οι αντιδράσεις και τα σχόλια απαιτούν JavaScript.',
  showMoreCommentsLabel: 'Περισσότερα σχόλια',
  shareLabel: 'Κοινοποίηση',
  copyLinkLabel: 'Αντιγραφή συνδέσμου του άρθρου',
  saveForLaterLabel: 'Αποθήκευση για αργότερα',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Κοινοποίηση στο ${network}`,
  shareByEmailLabel: 'Κοινοποίηση με email',
  shareNativeLabel: 'Κοινοποίηση αυτού του άρθρου',
  followLabel: 'Ακολούθησε',
  followingLabel: 'Ακολουθείς',
  unfollowLabel: 'Διακοπή',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Ακολούθησε: ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Διακοπή παρακολούθησης: ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Τώρα ακολουθείς: ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Δεν ακολουθείς πια: ${name}.`,
  followDisabledMessage:
    'Η παρακολούθηση δεν είναι διαθέσιμη σε αυτόν τον ιστότοπο αυτή τη στιγμή.',
  followAuthorMissingMessage:
    'Αυτός ο συγγραφέας δεν μπορεί να ακολουθηθεί αυτή τη στιγμή.',
  audienceNetworkError:
    'Δεν ήταν δυνατή η σύνδεση με το Galascribe. Δοκίμασε ξανά.',
  audienceRateLimited: 'Πάρα πολλές προσπάθειες. Δοκίμασε ξανά σε λίγο.',
  audienceGenericError: 'Κάτι πήγε στραβά. Δοκίμασε ξανά.',
  audienceStorageBlocked:
    'Το πρόγραμμα περιήγησης απέκλεισε τον αποθηκευτικό χώρο που χρειάζεται ο ιστότοπος για τη σύνδεσή σου.',
  audienceSignInUnsupported:
    'Αυτό το πρόγραμμα περιήγησης δεν μπορεί να σε συνδέσει σε αυτή τη σελίδα.',
  audienceSignInFailed: 'Η σύνδεση δεν ολοκληρώθηκε. Δοκίμασε ξανά.',
  audienceSignInInvalid:
    'Ο σύνδεσμος σύνδεσης δεν ήταν έγκυρος. Δοκίμασε ξανά.',
  honeypotLabel: 'Άφησε αυτό το πεδίο κενό',
  fieldRequiredMessage: 'Αυτό το πεδίο είναι υποχρεωτικό.',
  fieldInvalidMessage: 'Έλεγξε αυτό το πεδίο.',
  newsletterEmailLabel: 'Διεύθυνση email',
  newsletterCheckInbox: 'Έλεγξε τα εισερχόμενά σου για επιβεβαίωση',
  newsletterFullMessage:
    'Αυτό το ενημερωτικό δελτίο δεν δέχεται νέους συνδρομητές αυτή τη στιγμή.',
  newsletterEmailInvalid: 'Εισήγαγε μια έγκυρη διεύθυνση email.',
  contactLinkLabel: 'Επικοινωνία',
  contactPageTitle: 'Επικοινωνία',
  contactDefaultIntro:
    'Έχεις μια ερώτηση ή κάτι να πεις; Στείλε ένα μήνυμα και ο συγγραφέας θα απαντήσει με email.',
  contactNameLabel: 'Όνομα',
  contactEmailLabel: 'Email',
  contactMessageLabel: 'Μήνυμα',
  contactWebsiteLabel: 'Ιστότοπος (προαιρετικό)',
  contactPhoneLabel: 'Τηλέφωνο (προαιρετικό)',
  contactSubmitLabel: 'Αποστολή μηνύματος',
  contactNoscript:
    'Αυτή η φόρμα απαιτεί JavaScript. Ενεργοποίησέ το για να στείλεις μήνυμα.',
  contactSent: 'Ευχαριστούμε, το μήνυμά σου στάλθηκε.',
  contactUnavailable: 'Αυτή η φόρμα δεν δέχεται μηνύματα αυτή τη στιγμή.',
  contactRateLimited: 'Πάρα πολλά μηνύματα από εδώ. Δοκίμασε ξανά αργότερα.',
  contactMessageLinks: 'Το μήνυμά σου μπορεί να έχει το πολύ δύο συνδέσμους.',
  tagListLabel: 'Ετικέτες',
  tagKickerLabel: 'Ετικέτα',
  seriesKickerLabel: 'Σειρά',
  archiveKickerLabel: 'Αρχείο',
  authorKickerLabel: 'Συγγραφέας',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) =>
    `${count === '1' ? '1 άρθρο' : `${count} άρθρα`}`,
  emptyListingLabel: 'Δεν υπάρχουν άρθρα ακόμη.',
  editionsNavigationLabel: 'Εκδόσεις',
  editionOriginalLabel: 'Πρωτότυπο',
  editionQuickReadLabel: 'Γρήγορη ανάγνωση',
  editionStandardLabel: 'Τυπική',
  editionDeepDiveLabel: 'Σε βάθος',
  editionNoticeLabel:
    'Παραγόμενη έκδοση, ελεγμένη από τον συγγραφέα· το πρωτότυπο είναι η αναφορά',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Σχετικά',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Ενημερώθηκε ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Αναρτήσεις με ετικέτα «${tag}»`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count === '1' ? '1 άρθρο' : `${count} άρθρα`} με ετικέτα ${tag} στο ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, σειρά με ${count === '1' ? '1 μέρος' : `${count} μέρη`} στο ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Αρχείο ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count === '1' ? '1 άρθρο' : `${count} άρθρα`} δημοσιεύτηκαν το ${year} στο ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Άρθρα του/της ${name} στο ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Περιηγήσου στα ${count} θέματα του ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Περιηγήσου στις ${count} σειρές που δημοσιεύτηκαν στο ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Όλα τα άρθρα του ${publication}, ${count} συνολικά, ανά έτος.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Όλα τα άρθρα του ${publication}, τα νεότερα πρώτα.`,
  exploreColumnLabel: 'Εξερεύνηση',
  rssFeedLabel: 'Ροή RSS',
  languageKickerLabel: 'Γλώσσα',
  languageSwitcherLabel: 'Γλώσσες',
  languageChipsLabel: 'Διαθέσιμες γλώσσες',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count === '1' ? '1 άρθρο' : `${count} άρθρα`} στα ${language} στο ${publication}.`,
  postRemovedHeading: 'Αυτή η ανάρτηση αφαιρέθηκε',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Αφαιρέθηκε στις ${date}.`,
  postRemovedHomeLabel: 'Μετάβαση στην αρχική σελίδα',
  versionPageHeading: 'Έκδοση ιστότοπου',
  versionTemplateLabel: 'Πρότυπο',
  versionThemeLabel: 'Θέμα',
  versionSchemasLabel: 'Σχήματα',
  versionToolchainLabel: 'Εργαλεία δημοσίευσης',
  versionCommitLabel: 'Commit πηγής',
  versionBuiltAtLabel: 'Δημιουργήθηκε',
  listenNavLabel: 'Ακούστε',
  listenNavCurrentLabel: 'Ακούστε αυτό το άρθρο',
  listenInviteTitle: 'Απασχολημένα χέρια; Ακούστε το.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Αυτό το άρθρο υπάρχει και ως συζήτηση διάρκειας ${minutes} λεπτών. Ιδανικό για το αυτοκίνητο, την προπόνηση ή τα πιάτα.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Αυτό το άρθρο υπάρχει και ως αφήγηση διάρκειας ${minutes} λεπτών. Ιδανικό για το αυτοκίνητο, την προπόνηση ή τα πιάτα.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Αυτό το άρθρο υπάρχει και ως αντιπαράθεση διάρκειας ${minutes} λεπτών. Ιδανικό για το αυτοκίνητο, την προπόνηση ή τα πιάτα.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Αυτό το άρθρο υπάρχει και ως σκετς διάρκειας ${minutes} λεπτών. Ιδανικό για το αυτοκίνητο, την προπόνηση ή τα πιάτα.`,
  listenInvitePlayLabel: 'Αναπαραγωγή',
  listenInviteDeclineLabel: 'Όχι, ευχαριστώ',
  listenInviteNote: 'Φωνές AI, διασκευή από αυτό το άρθρο.',
  listenInviteCloseLabel: 'Κλείσιμο προς το παρόν',
  listenPlayerRegionLabel: 'Αναπαραγωγή ήχου',
  listenPlayerNowPlayingLabel: 'Αναπαράγεται τώρα',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} από ${count}`,
  listenPlayerPlayLabel: 'Αναπαραγωγή',
  listenPlayerPauseLabel: 'Παύση',
  listenPlayerBackLabel: 'Πίσω 15 δευτερόλεπτα',
  listenPlayerPreviousLabel: 'Προηγούμενο επεισόδιο',
  listenPlayerNextLabel: 'Επόμενο επεισόδιο',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Ταχύτητα αναπαραγωγής ${rate}×`,
  listenPlayerSeekLabel: 'Θέση',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} από ${total}`,
  listenPlayerCloseLabel: 'Διακοπή και κλείσιμο',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Αναπαράγεται: ${title}`,
  listenListHeading: 'Ακούστε αυτό το ιστολόγιο',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) =>
    count === '1'
      ? `1 επεισόδιο · ${duration}`
      : `${count} επεισόδια · ${duration}`,
  listenListPlayAllLabel: 'Αναπαραγωγή όλων',
  listenListShuffleLabel: 'Τυχαία σειρά',
  listenListOrderLabel: 'Σειρά',
  listenListNewestLabel: 'Πρώτα τα νεότερα',
  listenListOldestLabel: 'Πρώτα τα παλαιότερα',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Εμφάνιση όλων (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Αναπαραγωγή: ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} λ.`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} ω. ${minutes} λ.`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('el', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`));
  },
});
