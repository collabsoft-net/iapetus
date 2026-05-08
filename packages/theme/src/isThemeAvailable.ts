import { Themes } from './themes';

export const isThemeAvailable = (theme: Themes): boolean => {

  const styles = window.getComputedStyle(document.body);

  switch (theme) {
    case Themes.LIGHT: {
      const colorMode = document.documentElement.getAttribute('data-color-mode');
      const property = styles.getPropertyValue('color-scheme');
      return colorMode === 'light' && property === 'light';
    }

    case Themes.DARK: {
      const colorMode = document.documentElement.getAttribute('data-color-mode');
      const property = styles.getPropertyValue('color-scheme');
      return colorMode === 'dark' && property === 'dark';
    }

    case Themes.SPACING: {
      const property = styles.getPropertyValue('--ds-space-0');
      return property === '0rem';
    }

    case Themes.TYPOGRAPHY: {
      const property = styles.getPropertyValue('--ds-font-family-body');
      return property.includes('Atlassian Sans')
    }

  }

}
