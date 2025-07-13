import { ensureThemes, Themes } from '@collabsoft-net/theme';
import { useQuery } from '@tanstack/react-query';

export const useThemes = (themes: Themes|Array<Themes>) => {
  const { data: isReady, isLoading } = useQuery({
    queryKey: [ 'ensureTheme()' ],
    queryFn: () => ensureThemes(themes)
  });

  return !isLoading && isReady;
}