/* eslint-disable @typescript-eslint/no-explicit-any */
import { getMetaData } from '../helpers/getMetaData';

type WindowWithContext = Window & {
  JIRA?: any;
  WRM?: any;
  Confluence?: any;
}

// This strongly depends on context managers to provide META information
// TODO: also make the ContextManager, WebAction and ContextProviders part of either iapetus or a generic AC implementation Java package
export const getContextFor = (host: 'jira'|'confluence'|'bamboo'|'bitbucket'): AP.JiraContext|AP.ConfluenceContext => {
  if (host === 'jira') {
    const { JIRA, WRM } = (window as unknown as WindowWithContext);
    return {
      jira: {
        issue: {
          id: getMetaData('issue-id') || JIRA?.Issue?.getIssueId() || '',
          key: getMetaData('issue-key') || JIRA?.Issue?.getIssueKey() || ''
        },
        project: {
          id: getMetaData('project-id') || WRM?._unparsedData?.projectId ||'',
          key: getMetaData('project-key') || WRM?._unparsedData?.projectKey || ''
        }
      }
    }
  } else if (host === 'confluence') {
    return {
      confluence: {
        content: {
          id: getMetaData('content-id') || getMetaData('page-id') || '',
          type: getMetaData('content-type') || '',
          version: getMetaData('page-version') || ''
        },
        macro: {
          hash: '',
          id: '',
          outputType: ''
        },
        space: {
          id: '',
          key: getMetaData('space-key') || getMetaData('confluence-space-key') || ''
        }
      }
    }
  } else {
    throw new Error('Could not find required objects JIRA or Confluence, unable to detect context');
  }
}

