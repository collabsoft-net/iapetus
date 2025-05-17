import { Modes } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';
import { useQuery } from '@tanstack/react-query';

import { useACJS } from './useACJS';
import { useProductClientService } from './useProductClientService';

export const useUser = <T extends Jira.User|Confluence.User> (accountId: string, expiresInSeconds?: number): [ T|undefined, boolean, Error|null ] => {
  const AP = useACJS<AP.JiraInstance|AP.ConfluenceInstance>();
  const service = useProductClientService<JiraClientService<Modes>|ConfluenceClientService<Modes>>();

  const { data: user, isLoading, error } = useQuery<T, Error>({
    queryKey: [ isOfType<AP.JiraInstance>(AP, 'jira') ? 'JiraClientService.getUser()' : 'ConfluenceClientService.getUser()', accountId ],
    queryFn: async () => service.getUser(accountId) as Promise<T>,
    staleTime: expiresInSeconds ? expiresInSeconds * 1000 : undefined,
    enabled: isOfType<AP.JiraInstance>(AP, 'jira') || isOfType<AP.ConfluenceInstance>(AP, 'confluence')
  });

  return [ user, isLoading, error ];
}