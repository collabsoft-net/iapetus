

export * from './ensureDataTheme';
export * from './ensureTheme';
export * from './isThemeAvailable';
export * from './loadFallbackStyles';
export * from './setDataTheme';
export * from './themes';

// Atlassian has made these utility functions private
// We are exposing them again as they are pretty useful
export { setGlobalTheme } from '@atlaskit/tokens/dist/es2019/set-global-theme';
export { ThemeMutationObserver } from '@atlaskit/tokens/dist/es2019/theme-mutation-observer';
