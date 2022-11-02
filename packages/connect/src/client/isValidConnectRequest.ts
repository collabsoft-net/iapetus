import { isNullOrEmpty } from '@collabsoft-net/helpers';

export const isValidConnectRequest = () => {
  if (window && document && document.head) {
    const query = new URLSearchParams(window.location.search);
    const moduleId = query.get('s');
    return !isNullOrEmpty(moduleId) ? {
      moduleId: moduleId as string
    } : null;
  }
  return null;
};
