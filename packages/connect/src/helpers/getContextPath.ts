import { isNullOrEmpty } from '@collabsoft-net/helpers';

import { getMetaData } from '.';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const windowWithAJS = window as unknown as Window & { AJS: any };
const contextPath = windowWithAJS.AJS?.contextPath;

const query = new URLSearchParams(window.location.search);
const cp = query.get('cp');

export const getContextPath = (): string => {
  // Try to use the querystring baseUrl
  if (cp && typeof cp === 'string' && !isNullOrEmpty(cp)) {
    return cp;
  }

  // Try to use the WRM contextPath
  if (contextPath && typeof contextPath === 'function') {
    const wrmContextPath = contextPath();
    if (wrmContextPath && typeof wrmContextPath === 'string' && !isNullOrEmpty(wrmContextPath)) {
      return wrmContextPath;
    }
  }

  // Finally try to get it from the META tag, or just give up
  return getMetaData('context-path') ||
    getMetaData('confluence-context-path') ||
    getMetaData('jira-context-path') ||
    getMetaData('bitbucket-context-path') ||
    getMetaData('bamboo-context-path') ||
    '';
};
