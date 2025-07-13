
import { ThemeMutationObserver } from '@atlaskit/tokens';

import { setDataTheme } from './setDataTheme';
import { Themes } from './themes';

export const ensureDataTheme = (theme: Themes) => {
  new ThemeMutationObserver(() => setDataTheme(theme)).observe();
  setTimeout(() => setDataTheme(theme), 500);
}