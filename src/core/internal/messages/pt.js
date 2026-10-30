/**
 * Chrome message catalog for the `pt` locale. Keys, value kinds and
 * placeholders must match `en.js` exactly (test/messages-parity.test.js).
 * See docs/LOCALES.md.
 *
 * @type {Readonly<Record<string, string | ((...args: string[]) => string)>>}
 */
export default Object.freeze({
  skipToContent: 'Ir para o conteúdo',
  homeLinkLabel: 'Início',
  primaryNavigationLabel: 'Principal',
  footerNavigationLabel: 'Rodapé',
  breadcrumbNavigationLabel: 'Caminho de navegação',
  paginationNavigationLabel: 'Paginação',
  previousPageLabel: 'Anterior',
  nextPageLabel: 'Próxima',
  /** @type {(current: string, total: string) => string} */
  pageStatusLabel: (current, total) => `Página ${current} de ${total}`,
  authorsSectionLabel: 'Autores',
  tagsSectionLabel: 'Etiquetas',
  seriesSectionLabel: 'Séries',
  archiveSectionLabel: 'Arquivo',
  indexHeading: 'Todos os artigos',
  authorsIndexLabel: 'Autores',
  tagIndexLabelPrefix: 'Etiqueta:',
  seriesIndexLabelPrefix: 'Série:',
  archiveYearLabelPrefix: 'Arquivo:',
  /** @type {(displayName: string) => string} */
  aboutAuthorHeading: (displayName) => `Sobre ${displayName}`,
  /** @type {(displayName: string) => string} */
  byLineLabel: (displayName) => `Por ${displayName}`,
  footerCopyrightPrefix: '©',
  footerAttributionLabel: 'Galascribe',
  footerAttributionAriaLabel: 'Galascribe, abre em uma nova aba',
  footerLegalLabel: 'Legal',
  termsLinkLabel: 'Termos',
  privacyLinkLabel: 'Privacidade',
  consentRegionLabel: 'Opções de privacidade',
  /** @type {(providerName: string) => string} */
  consentText: (providerName) =>
    `Este site gostaria de usar ${providerName} para entender seus leitores. Nada é carregado até você aceitar, e você pode mudar sua escolha a qualquer momento no rodapé.`,
  consentAcceptLabel: 'Aceitar análises',
  consentDeclineLabel: 'Recusar',
  consentOpenLabel: 'Opções de privacidade',
  errorPageHeading: 'Página não encontrada',
  errorPageBody:
    'A página que você procurava não foi encontrada. Ela pode ter sido movida, renomeada ou removida.',
  errorPageReturnHomeLabel: 'Voltar ao início',
  appearanceControlLabel: 'Aparência',
  appearanceModeLightLabel: 'Claro',
  appearanceModeDarkLabel: 'Escuro',
  appearanceModeSystemLabel: 'Sistema',
  searchButtonLabel: 'Buscar',
  searchButtonAriaLabel: 'Buscar artigos',
  searchPlaceholderLabel: 'Buscar na publicação',
  searchEmptyLabel: 'Nenhum artigo corresponde à sua busca.',
  searchUnavailableLabel: 'A busca está indisponível no momento.',
  copyCodeLabel: 'Copiar',
  copiedLabel: 'Copiado',
  linkCopiedLabel: 'Link copiado.',
  copyBlockedLabel:
    'A cópia está bloqueada aqui. Copie o endereço pelo navegador.',
  codeSelectedLabel:
    'Código selecionado. Pressione Ctrl C ou Command C para copiar.',
  savedLabel: 'Salvo para depois.',
  unsavedLabel: 'Removido dos artigos salvos.',
  menuSummaryLabel: 'Menu',
  featuredLabel: 'Destaque',
  readEssayLabel: 'Ler o ensaio',
  latestHeading: 'Recentes',
  moreArticlesHeading: 'Mais artigos',
  browseByTagLabel: 'Explorar por etiqueta',
  seriesCardLabel: 'Série',
  /** @type {(count: string) => string} */
  partsCountLabel: (count) =>
    `${count === '1' ? '1 parte' : `${count} partes`}`,
  startSeriesLabel: 'Começar pela parte 1',
  newsletterLabel: 'Newsletter',
  newsletterActionLabel: 'Assinar',
  /** @type {(minutes: string) => string} */
  readingTimeLabel: (minutes) => `${minutes} min de leitura`,
  /** @type {(part: string, total: string) => string} */
  seriesPartLabel: (part, total) => `Parte ${part} de ${total}`,
  onThisPageLabel: 'Nesta página',
  writtenByLabel: 'Escrito por',
  aboutTheAuthorLabel: 'Sobre o autor',
  youAreHereLabel: 'Você está aqui',
  newerArticleLabel: 'Mais recente',
  olderArticleLabel: 'Mais antigo',
  moreArticlesNavigationLabel: 'Mais artigos',
  keepReadingHeading: 'Continue lendo',
  /** @type {(tag: string) => string} */
  moreInTagLabel: (tag) => `Mais em ${tag}`,
  interactionsHeading: 'Respostas',
  reactionsGroupLabel: 'Reações',
  likeLabel: 'Curtir',
  commentsHeading: 'Conversa',
  interactionsNeedScriptNotice: 'Reações e comentários precisam de JavaScript.',
  showMoreCommentsLabel: 'Mostrar mais comentários',
  shareLabel: 'Compartilhar',
  copyLinkLabel: 'Copiar link deste artigo',
  saveForLaterLabel: 'Salvar para depois',
  /** @type {(network: string) => string} */
  shareOnLabel: (network) => `Compartilhar no ${network}`,
  shareByEmailLabel: 'Compartilhar por e-mail',
  shareNativeLabel: 'Compartilhar este artigo',
  followLabel: 'Seguir',
  followingLabel: 'Seguindo',
  unfollowLabel: 'Deixar de seguir',
  /** @type {(name: string) => string} */
  followAriaLabel: (name) => `Seguir ${name}`,
  /** @type {(name: string) => string} */
  unfollowAriaLabel: (name) => `Deixar de seguir ${name}`,
  /** @type {(name: string) => string} */
  followedAnnouncement: (name) => `Agora você segue ${name}.`,
  /** @type {(name: string) => string} */
  unfollowedAnnouncement: (name) => `Você não segue mais ${name}.`,
  followDisabledMessage: 'Seguir não está disponível neste site no momento.',
  followAuthorMissingMessage: 'Este autor não pode ser seguido no momento.',
  audienceNetworkError:
    'Não foi possível acessar o Galascribe. Tente novamente.',
  audienceRateLimited: 'Muitas tentativas. Tente de novo em instantes.',
  audienceGenericError: 'Algo deu errado. Tente novamente.',
  audienceStorageBlocked:
    'Seu navegador bloqueou o armazenamento de que este site precisa para entrar.',
  audienceSignInUnsupported:
    'Este navegador não consegue fazer seu login nesta página.',
  audienceSignInFailed: 'O login não foi concluído. Tente novamente.',
  audienceSignInInvalid: 'Esse link de login não era válido. Tente novamente.',
  honeypotLabel: 'Deixe este campo vazio',
  fieldRequiredMessage: 'Este campo é obrigatório.',
  fieldInvalidMessage: 'Confira este campo.',
  newsletterEmailLabel: 'Endereço de e-mail',
  newsletterCheckInbox: 'Verifique sua caixa de entrada para confirmar',
  newsletterFullMessage:
    'Esta newsletter não está aceitando novos assinantes no momento.',
  newsletterEmailInvalid: 'Informe um endereço de e-mail válido.',
  contactLinkLabel: 'Contato',
  contactPageTitle: 'Contato',
  contactDefaultIntro:
    'Tem uma pergunta ou algo a dizer? Envie uma mensagem e o autor responderá por e-mail.',
  contactNameLabel: 'Nome',
  contactEmailLabel: 'E-mail',
  contactMessageLabel: 'Mensagem',
  contactWebsiteLabel: 'Site (opcional)',
  contactPhoneLabel: 'Telefone (opcional)',
  contactSubmitLabel: 'Enviar mensagem',
  contactNoscript:
    'Este formulário precisa de JavaScript. Ative-o para enviar uma mensagem.',
  contactSent: 'Obrigado, sua mensagem foi enviada.',
  contactUnavailable:
    'Este formulário não está aceitando mensagens no momento.',
  contactRateLimited: 'Mensagens demais daqui. Tente novamente mais tarde.',
  contactMessageLinks: 'Sua mensagem pode ter no máximo dois links.',
  tagListLabel: 'Etiquetas',
  tagKickerLabel: 'Etiqueta',
  seriesKickerLabel: 'Série',
  archiveKickerLabel: 'Arquivo',
  authorKickerLabel: 'Autor',
  /** @type {(count: string) => string} */
  articleCountLabel: (count) =>
    `${count === '1' ? '1 artigo' : `${count} artigos`}`,
  emptyListingLabel: 'Ainda não há artigos.',
  editionsNavigationLabel: 'Edições',
  editionOriginalLabel: 'Original',
  editionQuickReadLabel: 'Leitura rápida',
  editionStandardLabel: 'Padrão',
  editionDeepDiveLabel: 'Aprofundado',
  editionNoticeLabel:
    'Edição gerada e revisada pelo autor; o original é a referência',
  /** @type {(title: string, edition: string) => string} */
  editionPageTitle: (title, edition) => `${title} (${edition})`,
  aboutPageTitle: 'Sobre',
  /** @type {(date: string) => string} */
  updatedLabel: (date) => `Atualizado em ${date}`,
  /** @type {(tag: string) => string} */
  tagPageTitle: (tag) => `Publicações com a etiqueta “${tag}”`,
  /** @type {(count: string, tag: string, publication: string) => string} */
  tagPageDescription: (count, tag, publication) =>
    `${count === '1' ? '1 artigo' : `${count} artigos`} com a etiqueta ${tag} em ${publication}.`,
  /** @type {(count: string, name: string, publication: string) => string} */
  seriesPageDescription: (count, name, publication) =>
    `${name}, uma série de ${count === '1' ? '1 parte' : `${count} partes`} em ${publication}.`,
  /** @type {(year: string) => string} */
  archivePageTitle: (year) => `Arquivo ${year}`,
  /** @type {(count: string, year: string, publication: string) => string} */
  archivePageDescription: (count, year, publication) =>
    `${count === '1' ? '1 artigo' : `${count} artigos`} publicados em ${year} em ${publication}.`,
  /** @type {(name: string, publication: string) => string} */
  authorPageDescription: (name, publication) =>
    `Artigos escritos por ${name} em ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  tagsRootDescription: (count, publication) =>
    `Explore ${count === '1' ? '1 tema' : `${count} temas`} abordados em ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  seriesRootDescription: (count, publication) =>
    `Explore as ${count} séries publicadas em ${publication}.`,
  /** @type {(count: string, publication: string) => string} */
  archiveRootDescription: (count, publication) =>
    `Todos os artigos de ${publication}, ${count} no total, por ano.`,
  /** @type {(publication: string) => string} */
  indexPageDescription: (publication) =>
    `Todos os artigos de ${publication}, dos mais recentes aos mais antigos.`,
  exploreColumnLabel: 'Explorar',
  rssFeedLabel: 'Feed RSS',
  languageKickerLabel: 'Idioma',
  languageSwitcherLabel: 'Idiomas',
  languageChipsLabel: 'Idiomas disponíveis',
  /** @type {(count: string, language: string, publication: string) => string} */
  languageIndexDescription: (count, language, publication) =>
    `${count === '1' ? '1 artigo' : `${count} artigos`} em ${language} em ${publication}.`,
  postRemovedHeading: 'Esta publicação foi removida',
  /** @type {(date: string) => string} */
  postRemovedBody: (date) => `Ela foi removida em ${date}.`,
  postRemovedHomeLabel: 'Ir para o início',
  versionPageHeading: 'Versão do site',
  versionTemplateLabel: 'Modelo',
  versionThemeLabel: 'Tema',
  versionSchemasLabel: 'Esquemas',
  versionToolchainLabel: 'Ferramentas de publicação',
  versionCommitLabel: 'Commit de origem',
  versionBuiltAtLabel: 'Gerado em',
  listenNavLabel: 'Ouvir',
  listenNavCurrentLabel: 'Ouvir este artigo',
  listenInviteTitle: 'Mãos ocupadas? Ouça em vez de ler.',
  /** @type {(minutes: string) => string} */
  listenInviteBodyConversation: (minutes) =>
    `Este artigo também é uma conversa de ${minutes} min. Ótimo para o trajeto de carro, o treino ou a louça.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyNarration: (minutes) =>
    `Este artigo também é uma narração de ${minutes} min. Ótimo para o trajeto de carro, o treino ou a louça.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodyDebate: (minutes) =>
    `Este artigo também é um debate de ${minutes} min. Ótimo para o trajeto de carro, o treino ou a louça.`,
  /** @type {(minutes: string) => string} */
  listenInviteBodySkit: (minutes) =>
    `Este artigo também é um esquete de ${minutes} min. Ótimo para o trajeto de carro, o treino ou a louça.`,
  listenInvitePlayLabel: 'Reproduzir',
  listenInviteDeclineLabel: 'Não, obrigado',
  listenInviteNote: 'Vozes de IA, adaptadas deste artigo.',
  listenInviteCloseLabel: 'Fechar por enquanto',
  listenPlayerRegionLabel: 'Reprodutor de áudio',
  listenPlayerNowPlayingLabel: 'Reproduzindo agora',
  /** @type {(index: string, count: string) => string} */
  listenPlayerPositionLabel: (index, count) => `${index} de ${count}`,
  listenPlayerPlayLabel: 'Reproduzir',
  listenPlayerPauseLabel: 'Pausar',
  listenPlayerBackLabel: 'Voltar 15 segundos',
  listenPlayerPreviousLabel: 'Episódio anterior',
  listenPlayerNextLabel: 'Próximo episódio',
  /** @type {(rate: string) => string} */
  listenPlayerSpeedLabel: (rate) => `Velocidade de reprodução ${rate}×`,
  listenPlayerSeekLabel: 'Posição',
  /** @type {(elapsed: string, total: string) => string} */
  listenPlayerTimeLabel: (elapsed, total) => `${elapsed} de ${total}`,
  listenPlayerCloseLabel: 'Parar e fechar',
  /** @type {(title: string) => string} */
  listenPlayerPlayingAnnouncement: (title) => `Reproduzindo: ${title}`,
  listenListHeading: 'Ouça este blog',
  /** @type {(count: string, duration: string) => string} */
  listenListSummary: (count, duration) =>
    count === '1'
      ? `1 episódio · ${duration}`
      : `${count} episódios · ${duration}`,
  listenListPlayAllLabel: 'Reproduzir tudo',
  listenListShuffleLabel: 'Aleatório',
  listenListOrderLabel: 'Ordem',
  listenListNewestLabel: 'Mais recentes primeiro',
  listenListOldestLabel: 'Mais antigos primeiro',
  /** @type {(count: string) => string} */
  listenListShowAllLabel: (count) => `Mostrar todos (${count})`,
  /** @type {(title: string) => string} */
  listenListPlayTrackLabel: (title) => `Reproduzir ${title}`,
  /** @type {(minutes: string) => string} */
  listenDurationMinutes: (minutes) => `${minutes} min`,
  /** @type {(hours: string, minutes: string) => string} */
  listenDurationHoursMinutes: (hours, minutes) => `${hours} h ${minutes} min`,
  /** @type {(iso: string) => string} */
  formatDate: (iso) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!match) return iso;
    return new Intl.DateTimeFormat('pt', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(
      new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
      ),
    );
  },
});
