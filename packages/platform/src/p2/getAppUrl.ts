import { getMetaData } from '@collabsoft-net/connect';

const query = new URLSearchParams(window.location.search);

export const getAppUrl = (path: string, withContextPath = false): string => {
  if (withContextPath) {
    const contextPath = query.get('cp') || getMetaData('context-path') || getMetaData('jira-context-path') || getMetaData('confluence-context-path') || '';
    const contextPathWithTrailingSlash = contextPath.endsWith('/') ? contextPath : contextPath + '/';
    const pathWithoutLeadingSlash = path.startsWith('/') ? path.substring(1) : path;
    const fullPath = `${contextPathWithTrailingSlash}${pathWithoutLeadingSlash}`;

    const fullPathWithLeadingSlash = fullPath.startsWith('/') ? fullPath : `/${fullPath}`;
    return fullPathWithLeadingSlash;
  } else {
    const fullPath = path.startsWith('/') ? path : `/${path}`;
    return fullPath;
  }
};