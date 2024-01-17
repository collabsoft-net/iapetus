
import { Events } from './Events';
import { PlatformInstance } from './Platform'
import { postMessage } from './PostMessage';

/***********************************************************************
 *
 * AP (Jira)
 * This is the Jira specific implemenentation of AP
 *
 *********************************************************************** */
export const JiraInstance: AP.JiraInstance = {

  ...PlatformInstance,

  jira: {
    refreshIssuePage: function (): void {
      postMessage(Events.AP_JIRA_REFRESHISSUEPAGE);
    },
    getWorkflowConfiguration: function (callback: (obj: object) => void): void {
      postMessage(Events.AP_JIRA_GETWORKFLOWCONFIGURATION, callback);
    },
    isDashboardItemEditable: function (callback: (isDashboardItemEditable: boolean) => void): void {
      postMessage(Events.AP_JIRA_ISDASHBOARDITEMEDITABLE, (data?: boolean) => callback(data || false));
    },
    openCreateIssueDialog: function (callback: (issues: Array<AP.OpenCreateIssueDialogResult>) => void, params: AP.OpenCreateIssueDialogParams): void {
      postMessage(Events.AP_JIRA_OPENCREATEISSUEDIALOG, params, (data?: Array<AP.OpenCreateIssueDialogResult>) => callback(data || []));
    },
    openIssueDialog: function (issueKey: string, callback: (issueKeyOrError: string) => void): void {
      postMessage(Events.AP_JIRA_OPENISSUEDIALOG, { issueKey }, (data?: string) => callback(data || ''));
    },
    setDashboardItemTitle: function (title: string): void {
      postMessage(Events.AP_JIRA_SETDASHBOARDITEMTITLE, { title });
    },
    openDatePicker: function (options: AP.DatePickerOptions): void {
      postMessage(Events.AP_JIRA_OPENDATEPICKER, options);
    },
    initJQLEditor: function (): void {
      postMessage(Events.AP_JIRA_INITJQLEDITOR);
    },
    showJQLEditor: function (options: AP.JQLEditorOptions, callback: (result?: AP.JQLEditorResult) => void): void {
      postMessage(Events.AP_JIRA_SHOWJQLEDITOR, { options }, callback);
    },
    isNativeApp: function (callback: (isNativeApp: boolean) => void): void {
      postMessage(Events.AP_JIRA_ISNATIVEAPP, (data?: boolean) => callback(data || false));
    }
  },

  context: {
    ...PlatformInstance.context,
    getContext: (callback?: (context: AP.JiraContext) => void): Promise<AP.JiraContext> => {
      return new Promise<AP.JiraContext>((resolve, reject) => {
        postMessage(Events.AP_CONTEXT_GETCONTEXT, (data?: AP.JiraContext) => {
          if (data) {
            callback && callback(data);
            resolve(data);
          } else {
            reject()
          }
        });
      })
    }
  },

  navigator: {
    ...PlatformInstance.navigator,
    go: (target: AP.NavigatorTargetJira, context: AP.NavigatorContext) => {
      postMessage(Events.AP_NAVIGATOR_GO, { target, context });
    }
  }

}