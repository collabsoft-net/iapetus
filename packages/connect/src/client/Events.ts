
export enum Events {
  HANDSHAKE = 'handshake',

  AP_CONTEXT_GETTOKEN = 'AP.context.getToken()',
  AP_CONTEXT_GETCONTEXT = 'AP.context.getContext()',

  AP_COOKIE_SAVE = 'AP.cookie.save()',
  AP_COOKIE_READ = 'AP.cookie.read()',
  AP_COOKIE_ERASE = 'AP.cookie.erase()',

  AP_CUSTOMCONTENT_INTERCEPT = 'AP.customContent.intercept()',
  AP_CUSTOMCONTENT_SUBMITCALLBACK = 'AP.customContent.submitCallback()',
  AP_CUSTOMCONTENT_SUBMITSUCCESSCALLBACK = 'AP.customContent.submitSuccessCallback()',
  AP_CUSTOMCONTENT_SUBMITERRORCALLBACK = 'AP.customContent.submitErrorCallback()',
  AP_CUSTOMCONTENT_CANCELCALLBACK = 'AP.customContent.submitCancelCallback()',

  AP_DIALOG_CREATE = 'AP.dialog.create()',
  AP_DIALOG_CLOSE = 'AP.dialog.close()',
  AP_DIALOG_GETCUSTOMDATA = 'AP.dialog.getCustomData()',
  AP_DIALOG_GETBUTTON = 'AP.dialog.getButton()',
  AP_DIALOG_DISABLECLOSEONSUBMIT = 'AP.dialog.disableCloseOnSubmit()',
  AP_DIALOG_CREATEBUTTON = 'AP.dialog.createButton()',
  AP_DIALOG_ISCLOSEONESCAPE = 'AP.dialog.isCloseOnEscape()',
  AP_DIALOG_ON = 'AP.dialog.on()',

  AP_EVENTS_ON = 'AP.events.on()',
  AP_EVENTS_ONPUBLIC = 'AP.events.onPublic()',
  AP_EVENTS_ONCE = 'AP.events.once()',
  AP_EVENTS_ONCEPUBLIC = 'AP.events.oncePublic()',
  AP_EVENTS_ONANY = 'AP.events.onAny()',
  AP_EVENTS_ONANYPUBLIC = 'AP.events.onAnyPublic()',
  AP_EVENTS_OFF = 'AP.events.off()',
  AP_EVENTS_OFFPUBLIC = 'AP.events.offPublic()',
  AP_EVENTS_OFFALL = 'AP.events.offAll()',
  AP_EVENTS_OFFALLPUBLIC = 'AP.events.offAllPublic()',
  AP_EVENTS_OFFANY = 'AP.events.offAny()',
  AP_EVENTS_OFFANYPUBLIC = 'AP.events.offAnyPublic()',
  AP_EVENTS_EMIT = 'AP.events.emit()',
  AP_EVENTS_EMITPUBLIC = 'AP.events.emitPublic()',

  AP_FLAG_CREATE = 'AP.flag.create()',
  AP_FLAG_CLOSE = 'AP.flag.close()',

  AP_HISTORY_BACK = 'AP.history.back()',
  AP_HISTORY_FORWARD = 'AP.history.forward()',
  AP_HISTORY_GO = 'AP.history.go()',
  AP_HISTORY_GETSTATE = 'AP.history.getState()',
  AP_HISTORY_PUSHSTATE = 'AP.history.pushSate()',
  AP_HISTORY_REPLACESTATE = 'AP.history.replaceState()',
  AP_HISTORY_POPSTATE = 'AP.history.popState()',

  AP_IFRAME_GETLOCATION = 'AP.getLocation()',
  AP_IFRAME_RESIZE = 'AP.resize()',
  AP_IFRAME_SIZETOPARENT = 'AP.sizeToParent()',

  AP_REQUIRE = 'AP.require()',
  AP_REQUEST = 'AP.request()',

  AP_INLINEDIALOG_HIDE = 'AP.inlineDialog.hide()',

  AP_NAVIGATOR_RELOAD = 'AP.navigator.reload()',
  AP_NAVIGATOR_GETLOCATION = 'AP.navigator.getLocation()',
  AP_NAVIGATOR_GO = 'AP.navigator.go()',

  AP_PAGE_SETTITLE = 'AP.page.title()',

  AP_SCROLLPOSITION_GETPOSITION = 'AP.scrollPosition.getPosition()',
  AP_SCROLLPOSITION_SETVERTICALPOSITION = 'AP.scrollPosition.setVerticalPosition()',

  AP_THEMING_INITIALIZETHEMING = 'AP.theminig.initializeTheming()',

  AP_USER_GETCURRENTUSER = 'AP.user.getCurrentUser()',
  AP_USER_GETTIMEZONE = 'AP.user.getTimezone()',
  AP_USER_GETLOCALE = 'AP.user.getLocale()',

  AP_JIRA_REFRESHISSUEPAGE = 'AP.jira.refreshIssuePage()',
  AP_JIRA_GETWORKFLOWCONFIGURATION = 'AP.jira.getWorkflowConfiguration()',
  AP_JIRA_ISDASHBOARDITEMEDITABLE = 'AP.jira.isDashboardItemEditable()',
  AP_JIRA_OPENCREATEISSUEDIALOG = 'AP.jira.openCreateIssueDialog()',
  AP_JIRA_OPENISSUEDIALOG = 'AP.jira.openIssueDialog()',
  AP_JIRA_SETDASHBOARDITEMTITLE = 'AP.jira.setDashboardItemTitle()',
  AP_JIRA_OPENDATEPICKER = 'AP.jira.openDatePicker()',
  AP_JIRA_INITJQLEDITOR = 'AP.jira.initJqlEditor()',
  AP_JIRA_SHOWJQLEDITOR = 'AP.jira.showJqlEditor()',
  AP_JIRA_ISNATIVEAPP = 'AP.jira.isNativeApp()',

  AP_CONFLUENCE_SAVEMACRO = 'AP.confluence.saveMacro()',
  AP_CONFLUENCE_CLOSEMACROEDITOR = 'AP.confluence.closeMacroEditor()',
  AP_CONFLUENCE_GETMACRODATA = 'AP.confluence.getMacroData()',
  AP_CONFLUENCE_GETMACROBODY = 'AP.confluence.getMacroBody()',
  AP_CONFLUENCE_ONMACROPROPERTYPANELEVENT = 'AP.confluence.onMacroPropertyPanelEvent()',
  AP_CONFLUENCE_CLOSEMACROPROPERTYPANEL = 'AP.confluence.closeMacroPropertyPanel()',
  AP_CONFLUENCE_GETCONTENTPROPERTY = 'AP.confluence.getContentProperty()',
  AP_CONFLUENCE_SETCONTENTPROPERTY = 'AP.confluence.setContentProperty()',
  AP_CONFLUENCE_SYNCPROPERTYFROMSERVER = 'AP.confluence.syncPropertyFromServer()'
}