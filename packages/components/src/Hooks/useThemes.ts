import { ensureThemes, Themes } from '@collabsoft-net/theme';
import { useQuery } from '@tanstack/react-query';

export const useThemes = (theme: Themes) => {
  const { isLoading } = useQuery({
    queryKey: [ 'ensureTheme()' ],
    queryFn: () => ensureThemes(theme)
  });

  return !isLoading;
}