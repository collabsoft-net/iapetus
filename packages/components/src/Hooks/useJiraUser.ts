import { useCurrentUser } from './useCurrentUser';
import { useUser } from './useUser';

export const useJiraUser = (accountId?: string, expiresInSeconds?: number): [ Jira.User|undefined, boolean, Error|null ] =>
  accountId
    ? useUser<Jira.User>(accountId, expiresInSeconds)
    : useCurrentUser<Jira.User>(expiresInSeconds);