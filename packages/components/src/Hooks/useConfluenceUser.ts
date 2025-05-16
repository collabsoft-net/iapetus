import { useCurrentUser } from './useCurrentUser';
import { useUser } from './useUser';

export const useConfluenceUser = (accountId?: string, expiresInSeconds?: number): [ Confluence.User|undefined, boolean, Error|null ] => {
  const [ user, loading, error ] = accountId ? useUser<Confluence.User>(accountId, expiresInSeconds) : useCurrentUser<Confluence.User>(expiresInSeconds);
  return [ user, loading, error ];
}