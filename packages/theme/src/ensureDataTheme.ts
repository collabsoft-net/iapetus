
import { ThemeMutationObserver } from '@atlaskit/tokens/dist/es2019/theme-mutation-observer';

import { setDataTheme } from './setDataTheme';
import { Themes } from './themes';

export const ensureDataTheme = (theme: Themes) => {
  new ThemeMutationObserver(() => setDataTheme(theme)).observe();
  setTimeout(() => setDataTheme(theme), 500);
}