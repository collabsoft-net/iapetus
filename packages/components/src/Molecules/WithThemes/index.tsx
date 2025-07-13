import { Themes } from '@collabsoft-net/theme';
import React, { PropsWithChildren } from 'react';

import { useThemes } from '../../Hooks';

interface WithThemesProps {
  themes: Themes|Array<Themes>;
}

export const WithThemes = ({ themes, children }: PropsWithChildren<WithThemesProps>): JSX.Element => {
  const themesReady = useThemes(themes);
  return themesReady ?  <>{children}</> : <></>;
}