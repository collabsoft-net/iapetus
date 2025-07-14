import { setGlobalTheme } from '@atlaskit/tokens';

import { ensureDataTheme } from './ensureDataTheme';
import { isThemeAvailable } from './isThemeAvailable';
import { loadFallbackStyles } from './loadFallbackStyles';
import { Themes } from './themes';

export const ensureThemes = (themes: Themes|Array<Themes>): boolean => {
  try {
    const items = Array.isArray(themes) ? themes : [ themes ];

    for (const theme of items) {
      // Check if the theme is already available from CDN
      if (!isThemeAvailable(theme)) {
        // If not, load them from the official design system package
        setGlobalTheme({
          dark: theme === Themes.DARK ? 'dark' : undefined,
          light: theme === Themes.LIGHT ? 'light' : undefined,
          spacing: theme === Themes.SPACING ? 'spacing' : undefined,
          typography: theme === Themes.TYPOGRAPHY
            ? 'typography-adg3'
            : theme === Themes.TYPOGRAPHY_REFRESHED
              ? 'typography-refreshed'
              : undefined
        });

        // Check if we were able to load it from the official design system package
        if (!isThemeAvailable(theme)) {
          // If the theme is still not available, use our own fallback method
          loadFallbackStyles(theme);
        }
      }

      ensureDataTheme(theme);
    }
    return true;
  } catch {
    return false;
  }
}