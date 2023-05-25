
export const isValidConnectRequest = () => {
  if (window && document && document.head) {
    const query = new URLSearchParams(window.location.search);
    const pageId = query.get('p');
    const dialogId = query.get('d');
    const editorId = query.get('e');

    // Also keep legacy moduleId (s) for backwards compatibility
    const moduleId = query.get('s');

    return {
      moduleId: moduleId || pageId || dialogId || editorId,
      moduleType: pageId ? 'page' : dialogId ? 'dialog' : editorId ? 'editor' : 'legacy'
    }
  }
  return null;
};
