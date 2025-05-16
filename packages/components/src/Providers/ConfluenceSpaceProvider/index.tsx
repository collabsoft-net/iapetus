import { useConfluenceSpace, useConfluenceUser } from '../../Hooks';

interface ConfluenceSpaceProviderProps {
  spaceIdOrKey: string|number;
  requiredPermission?: Confluence.ContentOperation;
  requiredPermissionsMode?: 'ALL'|'ANY';
  options?: Confluence.SpaceV2RequestOptions|Confluence.SpaceRequestOptions;
  loadingMessage?: JSX.Element;
  expiresInSeconds?: number;
  children: (args: {
    space?: Confluence.Space|Confluence.SpaceV2;
    permitted?: boolean;
    loading: boolean;
    errors?: Error|null;
  }) => JSX.Element;
}

export const ConfluenceSpaceProvider = ({ spaceIdOrKey, requiredPermission, requiredPermissionsMode, options, loadingMessage, expiresInSeconds, children }: ConfluenceSpaceProviderProps): JSX.Element => {
  const [ user, isLoadingUser ] = requiredPermission ? useConfluenceUser() : [ undefined, false ];
  const accountId = user?.accountId || user?.userKey;

  const [ space, permitted, isLoadingProject, error ] = !isLoadingUser
    ? useConfluenceSpace(spaceIdOrKey, requiredPermission, accountId, requiredPermissionsMode, options, expiresInSeconds)
    : [ undefined, undefined, true, null ];

  const loading = isLoadingUser || isLoadingProject;
  return loading && loadingMessage ? loadingMessage : children({ space, permitted, loading, errors: error });

}