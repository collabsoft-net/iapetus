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

// This strongly depends on context managers to provide META information
// TODO: also make the ContextManager, WebAction and ContextProviders part of either iapetus or a generic AC implementation Java package
const generateContext = () => {
  // eslint-disable-next-line
  const JIRA = (window as any).JIRA || null;
  // eslint-disable-next-line
  const Confluence = (window as any).Confluence || null;

  if (JIRA) {
    return {
      jira: {
        issue: {
          id: getMetaData('issue-id'),
          issueType: {
            id: null
          },
          key: getMetaData('issue-key')
        },
        project: {
          id: getMetaData('project-id'),
          key: getMetaData('project-key')
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

const getMetaData = (key: string) => {
  return AJS?.Meta?.get(key) as string || null;
}