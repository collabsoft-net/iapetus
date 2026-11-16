import { Host } from '../Host';

export const getUrl = (path: string, AC: Host): string => {
  const contextPath = AC.options.contextPath || '';
  const contextPathWithTrailingSlash = contextPath.endsWith('/') ? contextPath : contextPath + '/';
  const pathWithoutLeadingSlash = path.startsWith('/') ? path.substr(1) : path;
  return `${contextPathWithTrailingSlash}${pathWithoutLeadingSlash}`;
};
