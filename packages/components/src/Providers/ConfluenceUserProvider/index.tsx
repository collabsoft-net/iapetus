import { useConfluenceUser } from 'src/Hooks';

interface ConfluenceUserProviderProps {
  accountId: string;
  loadingMessage?: JSX.Element;
  expiresInSeconds?: number;
  children: (args: {
    user?: Confluence.User;
    loading: boolean;
    errors?: Error|null;
  }) => JSX.Element;
}

export const ConfluenceUserProvider = ({ accountId, loadingMessage, expiresInSeconds, children }: ConfluenceUserProviderProps): JSX.Element => {
  const [ user, loading, error ] = useConfluenceUser(accountId, expiresInSeconds);
  return loading && loadingMessage ? loadingMessage : children({ user, loading, errors: error });
}