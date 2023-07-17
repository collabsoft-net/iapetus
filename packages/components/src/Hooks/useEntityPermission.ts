

import { isOfType } from '@collabsoft-net/helpers';
import { useContext, useEffect, useState } from 'react';

import { ConfluenceClientService, JiraClientService } from '../Contexts';
import { useCurrentUser } from './useCurrentUser';
import { useHostContext } from './useHostContext';

export function usePermission(permissions: Array<string>, issueId?: number, accountId?: string): [ boolean|undefined, boolean ];
export function usePermission(permissions: Confluence.ContentOperation, type: 'content', contentId?: string, accountId?: string): [ boolean|undefined, boolean ];
export function usePermission(permissions: Confluence.ContentOperation, type: 'space', spaceKey?: string, accountId?: string): [ boolean|undefined, boolean ];
export function usePermission(permissions: Array<string>|Confluence.ContentOperation, issueIdOrType?: number|'content'|'space', accountIdOrContentIdOrSpaceKey?: string, accountId?: string): [ boolean|undefined, boolean ] {

  const jiraService = useContext(JiraClientService);
  const confluenceService = useContext(ConfluenceClientService);

  const [ user ] = useCurrentUser(typeof issueIdOrType === 'number' ? accountIdOrContentIdOrSpaceKey : accountId);
  const [ context ] = useHostContext();

  const [ isLoading, setLoading ] = useState<boolean>(true);
  const [ hasPermissions, setHasPermissions ] = useState<boolean>();

  useEffect(() => {
    if (context && user) {
      if (isOfType<AP.JiraContext>(context, 'jira') && Array.isArray(permissions) && typeof issueIdOrType === 'number') {
        const entityId = issueIdOrType || context.jira.issue.id;
        if (jiraService && entityId) {
          jiraService.hasPermissions(user.accountId, [
            {
              issues: [ Number(entityId) ],
              permissions
            }
          ]).then(setHasPermissions).catch(() => setHasPermissions(false)).finally(() => setLoading(false));
        } else {
          setHasPermissions(undefined);
          setLoading(false);
        }
      } else if (isOfType<AP.ConfluenceContext>(context, 'confluence') && !Array.isArray(permissions) && issueIdOrType === 'content') {
        const contentId = accountIdOrContentIdOrSpaceKey || context.confluence.content.id;

        if (confluenceService && contentId) {
          confluenceService.hasContentPermission(contentId, { type: 'user', identifier: user.accountId }, permissions)
            .then(setHasPermissions)
            .catch(() => setHasPermissions(false))
            .finally(() => setLoading(false));
        } else {
          setHasPermissions(undefined);
          setLoading(false);
        }
      } else if (isOfType<AP.ConfluenceContext>(context, 'confluence') && !Array.isArray(permissions) && issueIdOrType === 'space') {
        const spaceKey = accountIdOrContentIdOrSpaceKey || context.confluence.space.key;

        if (confluenceService && spaceKey) {
          confluenceService.hasSpacePermission(spaceKey, permissions)
            .then(setHasPermissions)
            .catch(() => setHasPermissions(false))
            .finally(() => setLoading(false));
        } else {
          setHasPermissions(undefined);
          setLoading(false);
        }
      }
    }
  }, [ jiraService, confluenceService, user, context ]);

  return [ hasPermissions, isLoading ];
}