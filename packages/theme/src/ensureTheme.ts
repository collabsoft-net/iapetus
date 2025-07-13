import { ensureDataTheme } from './ensureDataTheme';
import { isThemeAvailable } from './isThemeAvailable';
import { loadFallbackStyles } from './loadFallbackStyles';
import { Themes } from './themes';

export const ensureThemes = async (themes: Themes|Array<Themes>): Promise<boolean> => {
  try {
    const items = Array.isArray(themes) ? themes : [ themes ];
    for await (const theme of items) {
      if (!isThemeAvailable(theme)) {
        await loadFallbackStyles(theme);
      }
      ensureDataTheme(theme);
    }
    return true;
  } catch {
    return false;
  }
}