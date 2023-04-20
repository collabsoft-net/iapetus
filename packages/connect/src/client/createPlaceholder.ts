import { Property } from 'csstype';

import { isValidConnectRequest } from './isValidConnectRequest';
import { waitForAP } from './waitForAP';

export const createPlaceholder = async (defaultModuleId?: string, defaultModuleType = 'page', defaultHeight?: Property.Height, isApplicationRoot = false): Promise<void> => {
  const AP = await waitForAP();

  const connect = isValidConnectRequest();

  const moduleId = connect?.moduleId || defaultModuleId;
  const moduleType = connect?.moduleType || defaultModuleType;

  if (moduleId) {
    const placeholder = document.createElement('div');
    placeholder.setAttribute('id', moduleType !== 'legacy' ? `${moduleType}-${moduleId}` : moduleId);

    // If this is the application root element, we should add the Atlassian Javascript API identifier (ac-content)
    if (isApplicationRoot) {
      placeholder.setAttribute('class', 'ac-content');
    }

    // If default height is set, we do not change display type and set height accordingly
    // If default height is not set but the placeholder is the application root, we do not change display type and set height to 100%
    // If default height is not set and placeholder is not the application root, we adjust the display to match that of the direct content
    placeholder.setAttribute('style', defaultHeight ? `height: ${defaultHeight}` : isApplicationRoot ? 'height: 100%' : 'display: contents');

    // Append the placeholder to the document body
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
