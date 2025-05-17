import { useQuery } from '@tanstack/react-query';

import { useACJS } from './useACJS';

export const useCurrentAccountId = (): [ string|undefined, boolean, Error|null ] => {
  const AP = useACJS<AP.JiraInstance|AP.ConfluenceInstance>();

  const { data: accountId, isLoading, error } = useQuery<string, Error>({
    queryKey: [ 'AP.user.getCurrentUser', 'atlassianAccountId' ],
    queryFn: async () => new Promise<string>(resolve => AP.user.getCurrentUser(({ atlassianAccountId }) => resolve(atlassianAccountId)))
  });

  return [ accountId, isLoading, error ];
}