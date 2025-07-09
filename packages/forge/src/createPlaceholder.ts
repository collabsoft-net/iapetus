import { Property } from 'csstype';
import { view } from '@forge/bridge';

type ModuleType = 'page'|'editor'|'dialog'|'legacy';

interface CreatePlaceholderOptions {
  defaultModuleId?: string;
  defaultModuleType?: ModuleType;
  defaultHeight?: Property.Height;
  isApplicationRoot?: boolean;
  appendPlaceholder?: boolean;
}

export const createPlaceholder = async (options?: CreatePlaceholderOptions): Promise<HTMLDivElement|null> => {
  const { defaultModuleId, defaultModuleType, defaultHeight, isApplicationRoot = false, appendPlaceholder = true } = options || {};

  const context = await view.getContext();

  const moduleId = defaultModuleId || context.moduleKey;
  let moduleType = defaultModuleType;

  if (!moduleType) {
    if (context.extension.type === 'macro' && (context.extension.macro.isConfiguring || context.extension.macro.isInserting)) {
      moduleType = 'editor';
    } else if (context.extension.type === 'modal') {
      moduleType = 'dialog';
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
      document.body.prepend(placeholder);
    }

    return placeholder;
  }

  return null;
};
