type Theme = 'dark'|'light'|'spacing';

const LIGHT_THEME_STYLING = process.env.LIGHT_THEME_STYLING;
const DARK_THEME_STYLING = process.env.DARK_THEME_STYLING;
const SPACING_STYLING = process.env.SPACING_STYLING;

export const InitializeThemingEventHandler = () => {
  if (document.head) {
    createInlineStyle('dark');
    createInlineStyle('light');
    createInlineStyle('spacing');

    createLinkElement('dark');
    createLinkElement('light');
    createLinkElement('spacing');

    const surfacesStyles = document.createElement('link');
    surfacesStyles.setAttribute('rel', 'stylesheet');
    surfacesStyles.setAttribute('href', 'https://connect-cdn.atl-paas.net/surfaces.css');
    surfacesStyles.setAttribute('data-surface', 'raised');
    document.head.appendChild(surfacesStyles);
  }
}

const createInlineStyle = (theme: Theme) => {
  const content =
    theme === 'dark'
      ? DARK_THEME_STYLING
      : theme === 'light'
        ? LIGHT_THEME_STYLING
        : SPACING_STYLING;

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