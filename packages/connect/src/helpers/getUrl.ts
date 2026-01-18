import { getContextPath } from '../host/ContextPath';

const query = new URLSearchParams(window.location.search);
const baseUrl = query.get('xdm_e') || '/';

export const getUrl = (path: string, withContextPath: boolean = false, toAbsolute: boolean = false): string => {
  let fullPathWithoutLeadingSlash = path.startsWith('/') ? path.substring(1) : path;
  let fullPathWithLeadingSlash = path.startsWith('/') ? path : `/${path}`;

  if (withContextPath) {
    const contextPath = getContextPath();
    const contextPathWithTrailingSlash = contextPath.endsWith('/') ? contextPath : contextPath + '/';
    const pathWithoutLeadingSlash = path.startsWith('/') ? path.substring(1) : path;
    const fullPath = `${contextPathWithTrailingSlash}${pathWithoutLeadingSlash}`;

    fullPathWithoutLeadingSlash = fullPath.startsWith('/') ? fullPath.substring(1) : fullPath;
    fullPathWithLeadingSlash = fullPath.startsWith('/') ? fullPath : `/${fullPath}`;
  }

  return toAbsolute
    ? baseUrl === '/' || baseUrl.endsWith('/')
      ? `${baseUrl}${fullPathWithoutLeadingSlash}`
      : `${baseUrl}${fullPathWithLeadingSlash}`
    : fullPathWithLeadingSlash;
};
