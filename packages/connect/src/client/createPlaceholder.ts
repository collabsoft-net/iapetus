import { isValidConnectRequest } from './isValidConnectRequest';
import { waitForAP } from './waitForAP';

export const createPlaceholder = async (): Promise<void> => {
  const AP = await waitForAP();

  const connect = isValidConnectRequest();
  if (connect?.moduleId) {
    const placeholder = document.createElement('div');
    placeholder.setAttribute('id', connect.moduleType !== 'legacy' ? `${connect.moduleType}-${connect.moduleId}` : connect.moduleId);
    placeholder.setAttribute('class', 'ac-content');
    placeholder.setAttribute('style', 'height: 100%');
    document.body.prepend(placeholder);

    // For some reason, Atlassian overrides the margin on the body element
    // When in a dialog, it adds 10px. Let's undo this in order to keep control
    // https://bitbucket.org/atlassian/atlassian-connect-js/src/1ee59cbf2ea51ca74e2ab0e7c713d9a955692cdf/src/plugin/index.js?at=master#lines-39

    const options = AP && AP._data && AP._data.options as Record<string, unknown>;
    if (options && options.isDialog) {
      new MutationObserver(() => {
        if (document.body.getAttribute('style') !== 'margin: 0px !important') {
          document.body.setAttribute('style', 'margin: 0px !important');
        }
      }).observe(document.body, { attributes: true });
      document.body.setAttribute('style', 'margin: 0px !important');
    }
  }
};
