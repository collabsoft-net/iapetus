import { ActiveThemeState } from '@atlaskit/tokens';

import { Events } from './Events';
import { eventListeners } from './Listeners';
import { CallbackHandler } from './Types';

type Theme = 'dark'|'light'|'spacing'|'typography';

const LIGHT_THEME_STYLING = process.env.LIGHT_THEME_STYLING;
const DARK_THEME_STYLING = process.env.DARK_THEME_STYLING;
const SPACING_STYLING = process.env.SPACING_STYLING;
const TYPOGRAPHY_STYLING = process.env.TYPOGRAPHY_STYLING;

export const InitializeThemingEventHandler = () => {
  if (document.head) {
    createInlineStyle('dark');
    createInlineStyle('light');
    createInlineStyle('spacing');
    createInlineStyle('typography');

    createLinkElement('dark');
    createLinkElement('light');
    createLinkElement('spacing');
    createLinkElement('typography');

    const surfacesStyles = document.createElement('link');
    surfacesStyles.setAttribute('rel', 'stylesheet');
    surfacesStyles.setAttribute('href', 'https://connect-cdn.atl-paas.net/surfaces.css');
    surfacesStyles.setAttribute('data-surface', 'raised');
    document.head.appendChild(surfacesStyles);
  }

  // Register event listener for updated theme
  const listener: CallbackHandler<{ theme: Partial<ActiveThemeState> }> = (data) => {
    if (data) {
      updateTheme(data.theme);
    }
  }

  eventListeners.set(listener, {
    name: Events.AP_THEMING_UPDATED,
    once: false,
    listener
  });
}

const updateTheme = (theme: Partial<ActiveThemeState>) => {
  const htmlNode = document.querySelector('html');
  if (htmlNode) {
    htmlNode.setAttribute('data-color-mode', theme.colorMode || 'light');
  }
}

const createInlineStyle = (theme: Theme) => {
  const content =
    theme === 'dark'
      ? DARK_THEME_STYLING
      : theme === 'light'
        ? LIGHT_THEME_STYLING
        : theme === 'spacing'
          ? SPACING_STYLING
          : TYPOGRAPHY_STYLING;

  if (content) {
    const style = document.createElement('style');
    style.setAttribute('data-theme', theme);
    style.textContent = content;
    document.head.appendChild(style);
  }
}

const createLinkElement = (theme: Theme) => {
  const link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', `https://connect-cdn.atl-paas.net/themes/atlaskit-tokens_${theme}.css`);
  link.setAttribute('data-theme', theme);
  document.head.appendChild(link);
};