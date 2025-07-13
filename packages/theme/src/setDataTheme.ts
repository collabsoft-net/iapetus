import { Themes } from './themes';

export const setDataTheme = (theme: Themes) => {
  const dataTheme = document.documentElement.getAttribute('data-theme');
  if (!dataTheme?.includes(theme)) {
    document.documentElement.setAttribute('data-theme', `${dataTheme} ${theme}`);
  }
}