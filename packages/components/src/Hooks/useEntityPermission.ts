

import { isOfType } from '@collabsoft-net/helpers';
import { useContext, useEffect, useState } from 'react';

import { ConfluenceClientService, JiraClientService } from '../Contexts';
import { useCurrentUser } from './useCurrentUser';
import { useHostContext } from './useHostContext';

export function usePermission(permissions: Array<string>, issueId?: string, accountId?: string): [ boolean|undefined, boolean ];
export function usePermission(permissions: Confluence.ContentOperation, contentId?: string, accountId?: string): [ boolean|undefined, boolean ];
export function usePermission(permissions: Confluence.ContentOperation, spaceKey?: string, accountId?: string): [ boolean|undefined, boolean ];
export function usePermission(permissions: Array<string>|Confluence.ContentOperation, issueIdOrContentIdOrSpaceKey?: string, accountId?: string): [ boolean|undefined, boolean ] {

  const jiraService = useContext(JiraClientService);
  const confluenceService = useContext(ConfluenceClientService);

  const [ user ] = useCurrentUser(accountId);
  const [ context ] = useHostContext();

  const [ isLoading, setLoading ] = useState<boolean>(true);
  const [ hasPermissions, setHasPermissions ] = useState<boolean>();

  useEffect(() => {
    if (context && user) {
      if (isOfType<AP.JiraContext>(context, 'jira') && Array.isArray(permissions)) {
        const entityId = issueIdOrContentIdOrSpaceKey || context.jira.issue.id;
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
      } else if (isOfType<AP.ConfluenceContext>(context, 'confluence') && !Array.isArray(permissions)) {
        const contentId = issueIdOrContentIdOrSpaceKey || context.confluence.content.id;
        const spaceKey = issueIdOrContentIdOrSpaceKey || context.confluence.space.key;

        if (confluenceService) {
          confluenceService.hasContentPermission(contentId, { type: 'user', identifier: user.accountId }, permissions)
            .then(setHasPermissions)
            .catch(() => confluenceService.hasSpacePermission(spaceKey, permissions)
                .then(setHasPermissions)
                .catch(() => setHasPermissions(false))
            ).finally(() => setLoading(false));
        } else {
          setHasPermissions(undefined);
          setLoading(false);
        }
      }
    }
  }, [ jiraService, confluenceService, user, context ]);

  return [ hasPermissions, isLoading ];
}