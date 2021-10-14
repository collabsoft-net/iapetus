import AJS from 'AJS';

import { findSource } from './iframe';

export const getContext = ({ source, data }: MessageEvent): void => {
  const frame = findSource(source as Window);
  if (frame && frame.contentWindow) {
    const { requestId } = JSON.parse(data);
    if (requestId) {
      frame.contentWindow.postMessage({
        requestId,
        context: generateContext()
      }, '*');
    }
  }
};

const generateContext = () => {
  // eslint-disable-next-line
  const JIRA = (window as any).JIRA || null;
  // eslint-disable-next-line
  const Confluence = (window as any).Confluence || null;

  if (JIRA) {
    return {
      jira: {
        issue: {
          id: getIssueId(),
          issueType: {
            id: null
          },
          key: null
        },
        project: {
          id: null,
          key: null
        }
      },
      license: {
        active: true
      }
    }
  } else if (Confluence) {
    return {
      confluence: {
        content: {
          id: null,
          type: null,
          version: null
        },
        macro: {
          hash: null,
          id: null,
          outputType: null
        },
        space: {
          id: null,
          key: null
        }
      }
    }
  } else {
    throw new Error('Could not find required objects JIRA or Confluence, unable to detect context');
  }
}

const getIssueId = () => {
  // eslint-disable-next-line
  const JIRA = (window as any).JIRA || null;

  if (JIRA && JIRA.Issue && JIRA.Issue.getIssueId && typeof JIRA.Issue.getIssueId === 'function') {
    return JIRA.Issue.getIssueId();
  } else if (AJS) {
    return AJS.Meta.get('issue-key');
  } else {
    return null;
  }
};