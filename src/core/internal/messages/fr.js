/**
 * Chrome message catalog for the `fr` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Aller au contenu',
  homeLinkLabel: 'Accueil',
  primaryNavigationLabel: 'Principale',
  footerNavigationLabel: 'Pied de page',
  breadcrumbNavigationLabel: 'Fil d’Ariane',
  paginationNavigationLabel: 'Pagination',
  previousPageLabel: 'Précédent',
  nextPageLabel: 'Suivant',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Page ${current} sur ${total}`,
  authorsSectionLabel: 'Auteurs',
  tagsSectionLabel: 'Étiquettes',
  seriesSectionLabel: 'Séries',
  archiveSectionLabel: 'Archives',
  indexHeading: 'Tous les articles',
  authorsIndexLabel: 'Auteurs',
  tagIndexLabelPrefix: 'Étiquette :',
  seriesIndexLabelPrefix: 'Série :',
  archiveYearLabelPrefix: 'Archives :',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `À propos de ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Par ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, s’ouvre dans un nouvel onglet',
  footerLegalLabel: 'Mentions légales',
  termsLinkLabel: 'Conditions',
  privacyLinkLabel: 'Confidentialité',
  consentRegionLabel: 'Choix de confidentialité',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Ce site souhaite utiliser ${providerName} pour comprendre son lectorat. Rien n’est chargé tant que vous n’avez pas accepté, et vous pouvez changer d’avis à tout moment depuis le pied de page.`,
  consentAcceptLabel: 'Accepter les statistiques',
  consentDeclineLabel: 'Refuser',
  consentOpenLabel: 'Choix de confidentialité',
  errorPageHeading: 'Page introuvable',
  errorPageBody:
    'La page que vous cherchez est introuvable. Elle a peut-être été déplacée, renommée ou supprimée.',
  errorPageReturnHomeLabel: 'Retour à l’accueil',
  appearanceControlLabel: 'Apparence',
  appearanceModeLightLabel: 'Clair',
  appearanceModeDarkLabel: 'Sombre',
  appearanceModeSystemLabel: 'Système',
  searchButtonLabel: 'Rechercher',
  searchButtonAriaLabel: 'Rechercher des articles',
  searchPlaceholderLabel: 'Rechercher dans la publication',
  searchEmptyLabel: 'Aucun article ne correspond à votre recherche.',
  searchUnavailableLabel: 'La recherche est indisponible pour le moment.',
  copyCodeLabel: 'Copier',
  copiedLabel: 'Copié',
  linkCopiedLabel: 'Lien copié.',
  copyBlockedLabel:
    'La copie est bloquée ici. Copiez l’adresse depuis votre navigateur.',
  codeSelectedLabel:
    'Code sélectionné. Appuyez sur Ctrl C ou Command C pour copier.',
  savedLabel: 'Enregistré pour plus tard.',
  unsavedLabel: 'Retiré des articles enregistrés.',
  menuSummaryLabel: 'Menu',
  featuredLabel: 'À la une',
  readEssayLabel: 'Lire l’essai',
  latestHeading: 'Récents',
  moreArticlesHeading: 'Autres articles',
  browseByTagLabel: 'Parcourir par étiquette',
  seriesCardLabel: 'Série',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) =>
    `${count === '1' ? '1 partie' : `${count} parties`}`,
  startSeriesLabel: 'Commencer par la partie 1',
  newsletterLabel: 'Newsletter',
  newsletterActionLabel: 'S’abonner',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} min de lecture`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Partie ${part} sur ${total}`,
  onThisPageLabel: 'Sur cette page',
  writtenByLabel: 'Écrit par',
  aboutTheAuthorLabel: 'À propos de l’auteur',
  youAreHereLabel: 'Vous êtes ici',
  newerArticleLabel: 'Plus récent',
  olderArticleLabel: 'Plus ancien',
  moreArticlesNavigationLabel: 'Autres articles',
  keepReadingHeading: 'Continuer la lecture',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Plus dans ${tag}`,
  interactionsHeading: 'Réactions',
  reactionsGroupLabel: 'Réactions',
  likeLabel: 'J’aime',
  commentsHeading: 'Discussion',
  interactionsNeedScriptNotice:
    'Les réactions et les commentaires nécessitent JavaScript.',
  showMoreCommentsLabel: 'Afficher plus de commentaires',
  shareLabel: 'Partager',
  copyLinkLabel: 'Copier le lien de cet article',
  saveForLaterLabel: 'Enregistrer pour plus tard',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Partager sur ${network}`,
  shareByEmailLabel: 'Partager par e-mail',
  shareNativeLabel: 'Partager cet article',
  followLabel: 'Suivre',
  followingLabel: 'Suivi',
  unfollowLabel: 'Ne plus suivre',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Suivre ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Ne plus suivre ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Vous suivez maintenant ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Vous ne suivez plus ${name}.`,
  followDisabledMessage:
    'Le suivi n’est pas disponible sur ce site pour le moment.',
  followAuthorMissingMessage:
    'Cet auteur ne peut pas être suivi pour le moment.',
  audienceNetworkError: 'Impossible de joindre Galascribe. Réessayez.',
  audienceRateLimited: 'Trop de tentatives. Réessayez dans un instant.',
  audienceGenericError: 'Une erreur s’est produite. Réessayez.',
  audienceStorageBlocked:
    'Votre navigateur a bloqué le stockage dont ce site a besoin pour vous connecter.',
  audienceSignInUnsupported:
    'Ce navigateur ne peut pas vous connecter sur cette page.',
  audienceSignInFailed: 'La connexion n’a pas abouti. Réessayez.',
  audienceSignInInvalid: 'Ce lien de connexion n’était pas valide. Réessayez.',
  honeypotLabel: 'Laissez ce champ vide',
  fieldRequiredMessage: 'Ce champ est obligatoire.',
  fieldInvalidMessage: 'Vérifiez ce champ.',
  newsletterEmailLabel: 'Adresse e-mail',
  newsletterCheckInbox: 'Consultez votre boîte de réception pour confirmer',
  newsletterFullMessage:
    'Cette newsletter n’accepte pas de nouveaux abonnés pour le moment.',
  newsletterEmailInvalid: 'Saisissez une adresse e-mail valide.',
  contactLinkLabel: 'Contact',
  contactPageTitle: 'Contact',
  contactDefaultIntro:
    'Une question ou quelque chose à dire ? Envoyez un message, l’auteur vous répondra par e-mail.',
  contactNameLabel: 'Nom',
  contactEmailLabel: 'E-mail',
  contactMessageLabel: 'Message',
  contactWebsiteLabel: 'Site web (facultatif)',
  contactPhoneLabel: 'Téléphone (facultatif)',
  contactSubmitLabel: 'Envoyer le message',
  contactNoscript:
    'Ce formulaire nécessite JavaScript. Activez-le pour envoyer un message.',
  contactSent: 'Merci, votre message a été envoyé.',
  contactUnavailable: 'Ce formulaire n’accepte pas de messages pour le moment.',
  contactRateLimited:
    'Trop de messages depuis cet endroit. Réessayez plus tard.',
  contactMessageLinks: 'Votre message peut contenir au plus deux liens.',
  tagListLabel: 'Étiquettes',
  tagKickerLabel: 'Étiquette',
  seriesKickerLabel: 'Série',
  archiveKickerLabel: 'Archives',
  authorKickerLabel: 'Auteur',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) =>
    `${count === '1' ? '1 article' : `${count} articles`}`,
  emptyListingLabel: 'Aucun article pour le moment.',
  editionsNavigationLabel: 'Éditions',
  editionOriginalLabel: 'Original',
  editionQuickReadLabel: 'Lecture rapide',
  editionStandardLabel: 'Standard',
  editionDeepDiveLabel: 'Analyse approfondie',
  editionNoticeLabel:
    'Édition générée et relue par l’auteur ; l’original fait foi',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'À propos',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Mis à jour le ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Articles avec l’étiquette « ${tag} »`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count === '1' ? '1 article' : `${count} articles`} avec l’étiquette ${tag} sur ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, une série de ${count === '1' ? '1 partie' : `${count} parties`} sur ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Archives ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count === '1' ? '1 article' : `${count} articles`} publiés en ${year} sur ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Articles écrits par ${name} sur ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Parcourez ${count === '1' ? '1 sujet' : `${count} sujets`} abordés sur ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Parcourez les ${count} séries publiées sur ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Tous les articles de ${publication}, ${count} au total, par année.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Tous les articles de ${publication}, les plus récents d’abord.`,
  exploreColumnLabel: 'Explorer',
  rssFeedLabel: 'Flux RSS',
  languageKickerLabel: 'Langue',
  languageSwitcherLabel: 'Langues',
  languageChipsLabel: 'Langues disponibles',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count === '1' ? '1 article' : `${count} articles`} en ${language} sur ${publication}.`,
  postRemovedHeading: 'Cet article a été supprimé',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Il a été supprimé le ${date}.`,
  postRemovedHomeLabel: 'Aller à l’accueil',
  versionPageHeading: 'Version du site',
  versionTemplateLabel: 'Modèle',
  versionThemeLabel: 'Thème',
  versionSchemasLabel: 'Schémas',
  versionToolchainLabel: 'Chaîne de publication',
  versionCommitLabel: 'Commit source',
  versionBuiltAtLabel: 'Généré le',
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('fr', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
