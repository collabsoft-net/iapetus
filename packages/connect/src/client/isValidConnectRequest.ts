
export const isValidConnectRequest = () => {
  if (window && document && document.head) {
    const query = new URLSearchParams(window.location.search);
    const pageId = query.get('p');
    const dialogId = query.get('d');

    // Also keep legacy moduleId (s) for backwards compatibility
    const moduleId = query.get('s');

    return {
      moduleId: moduleId || pageId || dialogId,
      moduleType: pageId ? 'page' : dialogId ? 'dialog' : 'legacy'
    }
  }
  return null;
};
