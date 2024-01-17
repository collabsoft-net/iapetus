import { getContextPath } from './ContextPath';

export const getUrl = (path: string): string => {
  const contextPath = getContextPath();
  const contextPathWithTrailingSlash = contextPath.endsWith('/') ? contextPath : contextPath + '/';
  const pathWithoutLeadingSlash = path.startsWith('/') ? path.substr(1) : path;
  return `${contextPathWithTrailingSlash}${pathWithoutLeadingSlash}`;
};
