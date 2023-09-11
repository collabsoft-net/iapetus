

import { isOfType } from '@collabsoft-net/helpers';
import { ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';
import { useEffect, useState } from 'react';

import { useCurrentUser } from './useCurrentUser';
import { useHostContext } from './useHostContext';
import { useHostService } from './useHostService';

export function usePermission(permissions: Array<string>, issueId?: number, accountId?: string): [ boolean|undefined, boolean, Error|undefined ];
export function usePermission(permissions: Confluence.ContentOperation, type: 'content', contentId?: string, accountId?: string): [ boolean|undefined, boolean, Error|undefined ];
export function usePermission(permissions: Confluence.ContentOperation, type: 'space', spaceKey?: string, accountId?: string): [ boolean|undefined, boolean, Error|undefined ];
export function usePermission(permissions: Array<string>|Confluence.ContentOperation, issueIdOrType?: number|'content'|'space', accountIdOrContentIdOrSpaceKey?: string, accountId?: string): [ boolean|undefined, boolean, Error|undefined ] {

  const service = useHostService();
  const [ context, isLoadingContext ] = useHostContext();
  const [ user, isLoadingUser, userError ] = useCurrentUser(typeof issueIdOrType === 'number' ? accountIdOrContentIdOrSpaceKey : accountId);

  const [ isLoading, setLoading ] = useState<boolean>(true);
  const [ hasPermissions, setHasPermissions ] = useState<boolean>();
  const [ error, setError ] = useState<Error>();

  useEffect(() => {
    if (!isLoadingContext && !isLoadingUser ) {

      if (!context) {
        setHasPermissions(undefined);
        setError(new Error('Cannot check for permissions, hook is executed outside of context of Atlassian host product'));
        setLoading(false);
      } else if (!service) {
        setHasPermissions(undefined);
        setError(new Error('Failed to connect to Atlassian API, either JiraClientService or ConfluenceClientService is missing'));
        setLoading(false);
      } else if (!user) {
        setHasPermissions(undefined);
        setError(userError);
        setLoading(false);
      } else {

        if (isOfType<AP.JiraContext>(context, 'jira')) {

          if (!Array.isArray(permissions)) {
            setHasPermissions(undefined);
            setError(new Error('Cannot check for permissions, the "permissions" parameter is invalid (Array expected)'));
            setLoading(false);
          } else if (issueIdOrType !== undefined && typeof issueIdOrType !== 'number') {
            setHasPermissions(undefined);
            setError(new Error('Cannot check for permissions, the "issueId" parameter is invalid'));
            setLoading(false);
          } else {
            const jiraClientService = service as JiraClientService;
            const entityId = issueIdOrType || context.jira.issue.id;

            if (!entityId) {
              setHasPermissions(undefined);
              setError(new Error('Cannot check for permissions, failed to determine issue ID'));
              setLoading(false);
            } else {
              jiraClientService.hasPermissions(user.accountId, [
                {
                  issues: [ Number(entityId) ],
                  permissions
                }
              ]).then(setHasPermissions).catch((err) => {
                setHasPermissions(undefined);
                setError(err);
              }).finally(() => setLoading(false));
            }
          }

        } else if (isOfType<AP.ConfluenceContext>(context, 'confluence')) {

          if (Array.isArray(permissions)) {
            setHasPermissions(undefined);
            setError(new Error('Cannot check for permissions, the "permissions" parameter is invalid (String expected)'));
            setLoading(false);
          } else {

            const confluenceClientService = service as ConfluenceClientService;

            if (issueIdOrType === 'content') {
              const contentId = accountIdOrContentIdOrSpaceKey || context.confluence.content.id;
              if (!contentId) {
                setHasPermissions(undefined);
                setError(new Error('Cannot check for permissions, failed to determine content ID'));
                setLoading(false);
              } else {
                confluenceClientService.hasContentPermission(contentId, { type: 'user', identifier: user.accountId }, permissions)
                .then(setHasPermissions)
                .catch((err) => {
                  setHasPermissions(false);
                  setError(err);
                }).finally(() => setLoading(false));
              }

            } else if (issueIdOrType === 'space') {
              const spaceKey = accountIdOrContentIdOrSpaceKey || context.confluence.space.key;
              if (!spaceKey) {
                setHasPermissions(undefined);
                setError(new Error('Cannot check for permissions, failed to determine space key'));
                setLoading(false);
              } else {
                confluenceClientService.hasSpacePermission(spaceKey, permissions)
                  .then(setHasPermissions)
                  .catch((err) => {
                    setHasPermissions(false);
                    setError(err);
                  }).finally(() => setLoading(false));
              }

            } else {
              setHasPermissions(undefined);
              setError(new Error('Cannot check for permissions, the "type" parameter is invalid (either "content" or "space" expected)'));
              setLoading(false);
            }
          }
        }
      }
    }
  }, [ isLoadingContext, isLoadingUser ]);

  return [ hasPermissions, isLoading, error ];
}