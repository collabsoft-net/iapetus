import { Property } from 'csstype';
import { view, router } from '@forge/bridge';
import { isOfType } from '@collabsoft-net/helpers';
import { FullContext } from '@forge/bridge/out/types';

type ModuleType = 'page'|'editor'|'dialog'|'legacy';

interface CreatePlaceholderOptions {
  defaultModuleId?: string;
  defaultModuleType?: ModuleType;
  defaultHeight?: Property.Height;
  isApplicationRoot?: boolean;
  appendPlaceholder?: boolean;
}

const getModuleKey = async (context?: FullContext) => {
  context = context || await view.getContext();
  let moduleKey = context.moduleKey;

  // When opening a modal, the moduleKey context is set to the parent module
  // This is because modals do not have their own modules, they only have resources
  // This is why Dialog options are required to provide the 'moduleKey' in the modal context
  if (isOfType(context.extension.modal, 'moduleKey')) {
    moduleKey = context.extension.modal.moduleKey

  // When opening an jira:adminPage module subpage, the moduleKey context is set to the parent
  // The `route` property is added to the end of the URL, so we will use this as moduleKey
  } else if (isOfType(context.extension, 'type') && context.extension.type === 'jira:adminPage') {
    if (isOfType(context.extension, 'location')) {
      try {
        const location = new URL(context.extension.location);
        const route = location.pathname.split('/').pop();
        if (route) {
          moduleKey = route;
        }
      } catch (_ignored) {}
    }
  }

  return moduleKey;
}

export const createPlaceholder = async (options?: CreatePlaceholderOptions): Promise<HTMLDivElement|null> => {
  const { defaultModuleId, defaultModuleType, defaultHeight, isApplicationRoot = false, appendPlaceholder = true } = options || {};

  const context = await view.getContext();

  const moduleKey = await getModuleKey(context);
  const moduleId = defaultModuleId || moduleKey;
  let moduleType = defaultModuleType;

  if (!moduleType) {
    // Make sure to check for modal context data first
    // Modals do not have a module type, only a resource
    // The only way to know we are opening is modal is because of the modal context
    if (isOfType(context.extension.modal, 'moduleKey')) {
      moduleType = 'dialog';
    } else if (context.extension.type === 'macro' && (context.extension.macro.isConfiguring || context.extension.macro.isInserting)) {
      moduleType = 'editor';
    } else {
      moduleType = 'page';
    }
  }

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
    if (appendPlaceholder) {

      // If we are appending the placeholder, we are also taking on the responsibility to act as router
      // https://developer.atlassian.com/platform/forge/add-routing-to-a-full-page-app/
      const history = await view.createHistory();
      history.listen(async () => {
        const currentModuleKey = await getModuleKey();
        if (moduleKey !== currentModuleKey) {
          router.reload();
        }
      });

      // Add the placeholder to the document
      document.body.prepend(placeholder);
    }

    // Return the placeholder either way
    return placeholder;
  }

  return null;
};
