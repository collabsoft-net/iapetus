import { useJiraUser } from '../../Hooks';

interface JiraUserProviderProps {
  accountId: string;
  loadingMessage?: JSX.Element;
  expiresInSeconds?: number;
  children: (args: {
    user?: Jira.User|null;
    loading: boolean;
    errors: Error|null;
  }) => JSX.Element;
}

export const JiraUserProvider = ({ accountId, loadingMessage, expiresInSeconds, children }: JiraUserProviderProps): JSX.Element => {
  const [ user, loading, error ] = useJiraUser(accountId, expiresInSeconds);
  return loading && loadingMessage ? loadingMessage : children({ user, loading, errors: error });
}