
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const windowWithAJS = window as unknown as Window & { AJS: any };
const contextPath = windowWithAJS.AJS.contextPath;

const query = new URLSearchParams(window.location.search);
const cp = query.get('cp');

export const getContextPath = (): string => {
  // Try to use the querystring baseUrl
  if (cp && typeof cp === 'string') {
    return cp;
  }

  // Try to get it from the META tag
  const contextPathMeta = document.querySelector('meta[name="ajs-context-path"]');
  if (contextPathMeta) {
    const content = contextPathMeta.getAttribute('content');
    if (content) {
      return content;
    }
  }

  // Try to get it from the META tag
  const baseUrlMeta = document.querySelector('meta[name="ajs-base-url"]');
  if (baseUrlMeta) {
    const content = baseUrlMeta.getAttribute('content');
    if (content) {
      return content;
    }
  }

  // Try to use the WRM contextPath
  if (contextPath && typeof contextPath === 'function') {
    return contextPath();
  }

  // Ok, we give up
  return '';
};
