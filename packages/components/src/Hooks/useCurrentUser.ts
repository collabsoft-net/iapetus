import { Modes } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';
import { useQuery } from '@tanstack/react-query';

import { useACJS } from './useACJS';
import { useCurrentAccountId } from './useCurrentAccountId';
import { useProductClientService } from './useProductClientService';

export const useCurrentUser = <T extends Jira.User|Confluence.User> (expiresInSeconds?: number): [ T|undefined, boolean, Error|null ] => {
  const ACJS = useACJS();
  const [ accountId, isLoadingAccountId, accountIdError ] = useCurrentAccountId();
  const service = useProductClientService<JiraClientService<Modes>|ConfluenceClientService<Modes>>();

  const { data: user, isLoading: isLoadingUser, isFetching: isFetchingUser, error: userError } = useQuery<T, Error>({
    queryKey: [ isOfType<AP.JiraInstance>(ACJS, 'jira') ? 'JiraClientService.getUser()' : 'ConfluenceClientService.getUser()', accountId ],
    queryFn: () => service.getUser(accountId as string) as Promise<T>,
    staleTime: expiresInSeconds ? expiresInSeconds * 1000 : undefined,
    enabled: typeof accountId !== 'undefined' && (isOfType<AP.JiraInstance>(ACJS, 'jira') || isOfType<AP.ConfluenceInstance>(ACJS, 'confluence'))
  });

  const isLoading = isLoadingUser || isFetchingUser || isLoadingAccountId;
  const error = userError || accountIdError;

  return [ user, isLoading, error ];
}