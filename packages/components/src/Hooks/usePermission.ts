import { isOfType } from '@collabsoft-net/helpers';
import { ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';
import { useEffect, useState } from 'react';

import { useCurrentUser } from './useCurrentUser';
import { useHostContext } from './useHostContext';
import { useHostService } from './useHostService'


const getJiraPermissionFor = (type: 'container'|'entity', permission: 'view'|'edit'|'administer', context: AP.JiraContext, bulkCheckIds?: Array<string|number>): Array<Jira.BulkProjectPermissions> => {
  if (type === 'container') {
    const projects = bulkCheckIds ? bulkCheckIds.map(item => Number(item)) : [ Number(context.jira.project.id) ];
    const permissions = permission === 'view' ? [ 'BROWSE_PROJECT' ] : [ 'ADMINISTER_PROJECT' ];
    return [{ projects, permissions }];
  } else {
    const issues = bulkCheckIds ? bulkCheckIds.map(item => Number(item)) : [ Number(context.jira.issue.id) ];
    const permissions = permission === 'view' ? [ 'BROWSE_PROJECT' ] : permission === 'edit' ? [ 'EDIT_ISSUES' ] : [ 'ADMINISTER_PROJECT' ];
    return [{ issues, permissions }];
  }
}

const getConfluencePermissionFor = (permission: 'view'|'edit'|'administer'): Confluence.ContentOperation => {
  return permission === 'view' ? 'read' : permission === 'edit' ? 'update' : 'administer';
}


export function usePermission(type: 'container'|'entity', permission: 'view'|'edit'|'administer', accountId?: string): [ boolean|undefined, boolean, Error|undefined ];
export function usePermission(type: 'container'|'entity', permission: 'view'|'edit'|'administer', bulkCheckIds?: Array<string|number>): [ boolean|undefined, boolean, Error|undefined ];
export function usePermission(type: 'container'|'entity', permission: 'view'|'edit'|'administer', bulkCheckIds?: Array<string|number>, accountId?: string): [ boolean|undefined, boolean, Error|undefined ];
export function usePermission(type: 'container'|'entity', permission: 'view'|'edit'|'administer', accountIdOrBulkCheckIds?: Array<string|number>|string, accountId?: string): [ boolean|undefined, boolean, Error|undefined ] {

  const service = useHostService();
  const [ context, isLoadingContext ] = useHostContext();
  const [ user, isLoadingUser, userError ] = useCurrentUser(!Array.isArray(accountIdOrBulkCheckIds) ? accountIdOrBulkCheckIds : accountId);

  const [ isLoading, setLoading ] = useState<boolean>(true);
  const [ hasPermission, setHasPermission ] = useState<boolean>();
  const [ error, setError ] = useState<Error>();

  useEffect(() => {
    if (!isLoadingContext && !isLoadingUser ) {

      if (!context) {
        setHasPermission(undefined);
        setError(new Error('Cannot check for permissions, hook is executed outside of context of Atlassian host product'));
        setLoading(false);
      } else if (!service) {
        setHasPermission(undefined);
        setError(new Error('Failed to connect to Atlassian API, either JiraClientService or ConfluenceClientService is missing'));
        setLoading(false);
      } else if (!user) {
        setHasPermission(undefined);
        setError(userError);
        setLoading(false);
      } else {

        const bulkCheckIds = Array.isArray(accountIdOrBulkCheckIds) ? accountIdOrBulkCheckIds : undefined;

        if (isOfType<AP.JiraContext>(context, 'jira')) {

          const jiraClientService = service as JiraClientService;

          if (type === 'container' && !bulkCheckIds && !context.jira.project.id) {
            setHasPermission(undefined);
            setError(new Error('Cannot check for permissions, hook is executed outside of context of Atlassian Jira project'));
            setLoading(false);
          } else if (type === 'entity' && !bulkCheckIds && !context.jira.issue.id) {
            setHasPermission(undefined);
            setError(new Error('Cannot check for permissions, hook is executed outside of context of Atlassian Jira issue'));
            setLoading(false);
          } else {
            const projectPermissions = getJiraPermissionFor(type, permission, context, bulkCheckIds);
            const accountId = user?.accountId || (isOfType<Jira.User>(user, 'key') ? user?.key : user?.userKey);
            jiraClientService.hasPermissions(accountId, projectPermissions, undefined, 'ALL').then(result => {
              setHasPermission(result);
              setError(undefined);
            }).catch((err) => {
              setHasPermission(undefined);
              setError(err);
            }).finally(() => setLoading(false))
          }

        } else if (isOfType<AP.ConfluenceContext>(context, 'confluence')) {

          const confluenceClientService = service as ConfluenceClientService;

          if (type === 'container' && !bulkCheckIds && !context.confluence.space.key) {
            setHasPermission(undefined);
            setError(new Error('Cannot check for permissions, hook is executed outside of context of Atlassian Confluence space'));
            setLoading(false);
          } else if (type === 'entity' && !bulkCheckIds && !context.confluence.content.id) {
            setHasPermission(undefined);
            setError(new Error('Cannot check for permissions, hook is executed outside of context of Atlassian Confluence content'));
            setLoading(false);
          } else {
            const contentOperation = getConfluencePermissionFor(permission);
            const spaceKeyOrContentIds = bulkCheckIds || type === 'container' ? [ context.confluence.space.key ] : [ context.confluence.content.id ];
            const accountId = user?.accountId || (isOfType<Jira.User>(user, 'key') ? user?.key : user?.userKey);

            Promise.all(spaceKeyOrContentIds.map(spaceKeyOrContentId => type === 'container'
              ? confluenceClientService.hasSpacePermission(spaceKeyOrContentId, contentOperation, accountId)
              : confluenceClientService.hasContentPermission(spaceKeyOrContentId, { type: 'user', identifier: accountId }, contentOperation)
            )).then(result => {
              const hasAllPermissions = result.every(item => item === true);
              setHasPermission(hasAllPermissions);
              setError(undefined);
            }).catch((err) => {
              setHasPermission(undefined);
              setError(err);
            }).finally(() => setLoading(false));
          }
        } else {
          setHasPermission(undefined);
          setError(new Error('Cannot check for permissions, hook is executed outside of context of Atlassian Jira or Confluence'));
          setLoading(false);
        }

      }
    }
  }, [ isLoadingUser, isLoadingContext ]);

  return [ hasPermission, isLoading, error ];
}