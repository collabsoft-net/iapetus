import AJS from 'AJS';
import JIRA from 'JIRA';

import { findSource } from './iframe';

export const getContext = ({ source, data }: MessageEvent): void => {
  const frame = findSource(source as Window);
  if (frame && frame.contentWindow) {
    const { requestId } = JSON.parse(data);
    if (requestId) {
      frame.contentWindow.postMessage({
        requestId,
        context: {
          jira: {
            issue: {
              id: getIssueId()
            }
          }
        }
      }, '*');
    }
  }
};

const getIssueId = () => {
  if (JIRA && JIRA.Issue && JIRA.Issue.getIssueId && typeof JIRA.Issue.getIssueId === 'function') {
    return JIRA.Issue.getIssueId();
  } else {
    return AJS.Meta.get('issue-key');
  }
};