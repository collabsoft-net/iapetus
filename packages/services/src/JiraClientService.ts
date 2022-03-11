import { JiraRestClient } from '@collabsoft-net/clients';
import { JiraCloudEndpoints, JiraServerEndpoints, Modes } from '@collabsoft-net/enums';
import { RestClient } from '@collabsoft-net/types';
import { StatusCodes } from 'http-status-codes';
import { injectable } from 'inversify';

import { AbstractAtlasClientService } from '.';

@injectable()
export class JiraClientService extends AbstractAtlasClientService {

  constructor(protected client: RestClient, protected mode: Modes) {
    super(client, mode);
    this.endpoints = mode === Modes.CONNECT ? JiraCloudEndpoints : JiraServerEndpoints;
  }

  async currentUser(): Promise<Jira.User> {
    const { data } = await this.client.get<Jira.User>(this.endpoints.CURRENTUSER);
    return data;
  }

  async getUser(accountId: string): Promise<Jira.User> {
    const { data } = this.mode === Modes.CONNECT
      ? await this.client.get<Jira.User>(this.endpoints.USER, { accountId })
      : await this.client.get<Jira.User>(this.endpoints.USER, { key: accountId });
    return data;
  }

  async getProject(projectIdOrKey: string|number, expand?: Array<'description'|'issueTypes'|'lead'|'projectKeys'|'issueTypeHierarchy'>): Promise<Jira.Project> {
    const { data } = await this.client.get<Jira.Project>(this.getEndpointFor(this.endpoints.READ_PROJECT, { projectIdOrKey }), { expand: expand?.join(',')});
    return data;
  }

  async getProjects(): Promise<Array<Jira.Project>> {
    const { data } = await this.client.get<Array<Jira.Project>>(this.getEndpointFor(this.endpoints.LIST_PROJECTS));
    return data;
  }

  async getStatuses(projectIdOrKey: string): Promise<Array<Jira.IssueTypeWithStatus>> {
    const { data } = await this.client.get<Array<Jira.IssueTypeWithStatus>>(this.getEndpointFor(this.endpoints.STATUSES, { projectIdOrKey }));
    return data;
  }

  async getStatus(idOrName: string): Promise<Jira.StatusDetails | null> {
    const { data } = await this.client.get<Jira.StatusDetails>(this.getEndpointFor(this.endpoints.STATUSDETAILS, { idOrName }));
    return data;
  }

  async getIssue(issueIdOrKey: string|number): Promise<Jira.Issue> {
    const { data } = await this.client.get<Jira.Issue>(this.getEndpointFor(this.endpoints.READ_ISSUE, { issueIdOrKey }));
    return data;
  }

  async createIssue(data: Jira.IssueRequest): Promise<Jira.CreatedIssue> {
    const { data: issue } = await this.client.post<Jira.CreatedIssue>(this.endpoints.ISSUE_CREATE, data);
    return issue;
  }

  async updateIssue(issueIdOrKey: string|number, data: Jira.IssueRequest, options?: Jira.EditIssueRequestParameters): Promise<void> {
    const { statusText, status } = await this.client.put(this.getEndpointFor(this.endpoints.ISSUE_UPDATE, { issueIdOrKey }), data, options as Record<string, string|number|boolean|undefined>);
    if (status !== StatusCodes.NO_CONTENT) {
      throw new Error(statusText);
    }
  }

  async searchIssues(jql: string, startAt = 0, maxResults = 50, validateQuery: 'strict'|'warn'|'none' = 'strict', fields = ['*navigable'], expand: Array<string> = [], properties: Array<string> = [], fieldsByKeys = false): Promise<Jira.SearchResults> {
    const { data } = await this.client.post<Jira.SearchResults>(this.getEndpointFor(this.endpoints.ISSUE_SEARCH), {
      jql,
      startAt,
      maxResults,
      validateQuery,
      fields,
      expand,
      properties,
      fieldsByKeys
    });
    return data;
  }

  async getComments(issueIdOrKey: string|number, startAt = 0, maxResults = 50, orderBy?: 'created'|'-created'|'+created', expand: Array<string> = [], fetchAll = true): Promise<Array<Jira.Comment>> {
    const result: Array<Jira.Comment> = [];
    const { data } = await this.client.get<Jira.PageOfComments>(this.getEndpointFor(this.endpoints.LIST_COMMENTS, { issueIdOrKey }), { startAt, maxResults, orderBy, expand: expand.join(',') });
    result.push(...data.comments);
    if (fetchAll && data.total > (data.startAt + data.maxResults)) {
      result.push(...await this.getComments(issueIdOrKey, (startAt + maxResults), maxResults, orderBy, expand, fetchAll));
    }
    return result;
  }

  async getComment(issueIdOrKey: string|number, commentId: string, options?: Jira.GetCommentRequestParameters): Promise<Jira.Comment> {
    const { data } = await this.client.get<Jira.Comment>(this.getEndpointFor(this.endpoints.READ_COMMENT, { issueIdOrKey, commentId }), options as Record<string, string|number|boolean|undefined>|undefined);
    return data;
  }

  async createComment(issueIdOrKey: string, body: string|Record<string, unknown>, expand: Array<string> = []): Promise<Jira.Comment> {
    const { data } = await this.client.post<Jira.Comment>(this.getEndpointFor(this.endpoints.COMMENT_CREATE, { issueIdOrKey }), { body }, { expand: expand.join(',') });
    return data;
  }

  async updateComment<T>(issueIdOrKey: string|number, commentId: string, body: string|Record<string, unknown>, properties?: Array<Jira.EntityProperty<T>>): Promise<Jira.Comment> {
    const { data } = await this.client.put<Jira.Comment>(this.getEndpointFor(this.endpoints.COMMENT_UPDATE, { issueIdOrKey, commentId }), { body, properties });
    return data;
  }

  async getAttachment(attachmentId: string): Promise<Jira.Attachment> {
    const { data } = await this.client.get<Jira.Attachment>(this.getEndpointFor(this.endpoints.READ_ATTACHMENT, { attachmentId }));
    return data;
  }

  async getVersion(id: string|number, expand?: Array<'operations'|'issuesstatus'>): Promise<Jira.Version> {
    const { data } = await this.client.get<Jira.Version>(this.getEndpointFor(this.endpoints.READ_VERSION, { id }), { expand: expand?.join(',') });
    return data;
  }

  async getVersions(projectIdOrKey: string|number): Promise<Array<Jira.Version>> {
    const { data } = await this.client.get<Array<Jira.Version>>(this.getEndpointFor(this.endpoints.LIST_VERSIONS, { projectIdOrKey }));
    return data;
  }

  async getVersionsPaginatedFor(projectIdOrKey: string|number, startAt = 0, maxResults = 50, query?: string): Promise<Jira.PagedResponse2<Jira.Version>> {
    const { data } = await this.client.get<Jira.PagedResponse2<Jira.Version>>(this.getEndpointFor(this.endpoints.LIST_VERSIONS_PAGINATED, { projectIdOrKey }), { startAt, maxResults, query });
    return data;
  }

  async createVersion(version: Jira.Version): Promise<Jira.Version> {
    const { data } = await this.client.post<Jira.Version>(this.getEndpointFor(this.endpoints.VERSION_CREATE), version);
    return data;
  }

  async updateVersion(version: Jira.Version): Promise<Jira.Version> {
    const { data } = await this.client.put<Jira.Version>(this.getEndpointFor(this.endpoints.VERSION_UPDATE, { id: version.id }), version);
    return data;
  }

  async deleteVersion(id: string): Promise<void> {
    const { status } = await this.client.post(this.getEndpointFor(this.endpoints.VERSION_DELETE, { id: id }), {});
    if (status !== StatusCodes.NO_CONTENT) throw new Error();
  }

  async getVersionRelatedIssuesCount(id: string): Promise<Jira.VersionIssueCounts> {
    const { data } = await this.client.get<Jira.VersionIssueCounts>(this.getEndpointFor(this.endpoints.VERSION_ISSUE_COUNTS, { id }));
    return data;
  }

  async getAllReleases(projectKey: string): Promise<Array<Jira.Release>> {
    const { data } = await this.client.get<Array<Jira.Release>>(this.getEndpointFor(this.endpoints.ALL_RELEASES, { projectKey }));
    return data;
  }

  async getRelease(projectKey: string, versionId: string): Promise<Jira.Release> {
    const { data } = await this.client.get<Jira.Release>(this.getEndpointFor(this.endpoints.RELEASE_DETAILS, { projectKey, versionId }));
    return data;
  }

  async getComponents(projectIdOrKey: string|number): Promise<Array<Jira.Component>> {
    const { data } = await this.client.get<Array<Jira.Component>>(this.getEndpointFor(this.endpoints.LIST_COMPONENTS, { projectIdOrKey }));
    return data;
  }

  async getComponentsPaginated(projectIdOrKey: string|number, startAt = 0, maxResults = 50, query?: string): Promise<Jira.PagedResponse2<Jira.Component>> {
    const { data } = await this.client.get<Jira.PagedResponse2<Jira.Component>>(this.getEndpointFor(this.endpoints.LIST_COMPONENTS_PAGINATED, { projectIdOrKey }), { startAt, maxResults, query });
    return data;
  }

  async getComponent(id: string|number): Promise<Jira.Component> {
    const { data } = await this.client.get<Jira.Component>(this.getEndpointFor(this.endpoints.READ_COMPONENT, { id }));
    return data;
  }

  async createComponent(component: Jira.Component): Promise<Jira.Component> {
    const { data, status } = await this.client.post<Jira.Component>(this.endpoints.COMPONENT_CREATE, component);
    if (status !== StatusCodes.CREATED) throw new Error();
    return data;
  }

  async updateComponent(component: Jira.Component): Promise<Jira.Component> {
    const { data } = await this.client.put<Jira.Component>(this.getEndpointFor(this.endpoints.COMPONENT_UPDATE, { id: component.id }), component);
    return data;
  }

  async deleteComponent(id: string): Promise<void> {
    const { status } = await this.client.delete(this.getEndpointFor(this.endpoints.COMPONENT_DELETE, { id: id }));
    if (status !== StatusCodes.NO_CONTENT) throw new Error();
  }

  async getBoardsFor(
    startAt = 0,
    maxResults = 50,
    type?: string,
    name?: string,
    projectKeyOrId?: string|number,
    accountIdLocation?: string,
    projectLocation?: string,
    includePrivate?: boolean,
    negateLocationFiltering?: boolean,
    orderBy?: string,
    filterId?: number): Promise<Jira.PagedResponse2<Jira.Board>> {
    const { data } = await this.client.get<Jira.PagedResponse2<Jira.Board>>(this.getEndpointFor(this.endpoints.BOARDS), { startAt, maxResults, type, name, projectKeyOrId, accountIdLocation, projectLocation, includePrivate, negateLocationFiltering, orderBy, filterId });
    return data;
  }

  async getBoardFeatures(boardId: number): Promise<Jira.Features> {
    const { data } = await this.client.get<Jira.Features>(this.getEndpointFor(this.endpoints.BOARD_FEATURES, { boardId }));
    return data;
  }

  async getEntityProperty<T>(entityType: 'user'|'project'|'issue'|'comment', entityId: string, propertyKey: string): Promise<Jira.EntityProperty<T>|null> {
    switch (entityType) {
      case 'user': return this.getUserProperty(entityId, propertyKey);
      case 'project': return this.getProjectProperty(entityId, propertyKey);
      case 'issue': return this.getIssueProperty(entityId, propertyKey);
      case 'comment': return this.getCommentProperty(entityId, propertyKey);
    }
  }

  async getUserProperty<T>(userKeyOrAccountId: string, propertyKey: string): Promise<Jira.EntityProperty<T>|null> {
    try {
      const userKeyOrAccountIdParam = this.mode === Modes.P2 ? 'userKey' : 'accountId';
      const params = { [userKeyOrAccountIdParam]: userKeyOrAccountId };

      const { data, status } = await this.client.get<Jira.EntityProperty<T>>(this.getEndpointFor(this.endpoints.USER_PROPERTY_BY_KEY, { propertyKey }), params);
      return status === StatusCodes.OK ? data : null;
    } catch (error) {
      return null;
    }
  }

  async getProjectProperty<T>(projectIdOrKey: string, propertyKey: string): Promise<Jira.EntityProperty<T>|null> {
    try {
      const { data, status } = await this.client.get<Jira.EntityProperty<T>>(this.getEndpointFor(this.endpoints.PROJECT_PROPERTY_BY_KEY, { projectIdOrKey, propertyKey }));
      return status === StatusCodes.OK ? data : null;
    } catch (error) {
      return null;
    }
  }

  async getIssueProperty<T>(issueIdOrKey: string, propertyKey: string): Promise<Jira.EntityProperty<T>|null> {
    try {
      const { data, status } = await this.client.get<Jira.EntityProperty<T>>(this.getEndpointFor(this.endpoints.ISSUE_PROPERTY_BY_KEY, { issueIdOrKey, propertyKey }));
      return status === StatusCodes.OK ? data : null;
    } catch (error) {
      return null;
    }
  }

  async getCommentProperty<T>(commentId: string, propertyKey: string): Promise<Jira.EntityProperty<T>|null> {
    try {
      const { data, status } = await this.client.get<Jira.EntityProperty<T>>(this.getEndpointFor(this.endpoints.COMMENT_PROPERTY_BY_KEY, { commentId, propertyKey }));
      return status === StatusCodes.OK ? data : null;
    } catch (error) {
      return null;
    }
  }

  async setEntityProperty<T>(entityType: 'user'|'project'|'issue'|'comment', entityId: string, property: Jira.EntityProperty<T>): Promise<void> {
    switch (entityType) {
      case 'user': return this.setUserProperty(entityId, property);
      case 'project': return this.setProjectProperty(entityId, property);
      case 'issue': return this.setIssueProperty(entityId, property);
      case 'comment': return this.setCommentProperty(entityId, property);
    }
  }

  async setUserProperty<T>(userKeyOrAccountId: string, property: Jira.EntityProperty<T>): Promise<void> {
    const userKeyOrAccountIdParam = this.mode === Modes.P2 ? 'userKey' : 'accountId';
    const params = { [userKeyOrAccountIdParam]: userKeyOrAccountId };

    const { status, statusText } = await this.client.put(this.getEndpointFor(this.endpoints.USER_PROPERTY_BY_KEY, { propertyKey: property.key }), property.value, params);
    if (status !== StatusCodes.OK && status !== StatusCodes.CREATED) {
      throw new Error(statusText);
    }
  }

  async setProjectProperty<T>(projectIdOrKey: string, property: Jira.EntityProperty<T>): Promise<void> {
    const { status, statusText } = await this.client.put(this.getEndpointFor(this.endpoints.PROJECT_PROPERTY_BY_KEY, { projectIdOrKey, propertyKey: property.key }), property.value);
    if (status !== StatusCodes.OK && status !== StatusCodes.CREATED) {
      throw new Error(statusText);
    }
  }

  async setIssueProperty<T>(issueIdOrKey: string, property: Jira.EntityProperty<T>): Promise<void> {
    const { status, statusText } = await this.client.put(this.getEndpointFor(this.endpoints.ISSUE_PROPERTY_BY_KEY, { issueIdOrKey, propertyKey: property.key }), property.value);
    if (status !== StatusCodes.OK && status !== StatusCodes.CREATED) {
      throw new Error(statusText);
    }
  }

  async setCommentProperty<T>(commentId: string, property: Jira.EntityProperty<T>): Promise<void> {
    const { status, statusText } = await this.client.put(this.getEndpointFor(this.endpoints.COMMENT_PROPERTY_BY_KEY, { commentId, propertyKey: property.key }), property.value);
    if (status !== StatusCodes.OK && status !== StatusCodes.CREATED) {
      throw new Error(statusText);
    }
  }

  async hasPermissions(accountId?: string, projectPermissions?: Array<Jira.BulkProjectPermissions>, globalPermissions?: Array<string>): Promise<boolean> {
    if (!projectPermissions && !globalPermissions) return false;

    if (this.mode === Modes.CONNECT) {
      const { data } = await this.client.post<Jira.BulkPermissionGrants>(this.endpoints.PERMISSIONS_CHECK, {
        accountId,
        projectPermissions,
        globalPermissions
      });

      if (globalPermissions && Array.isArray(globalPermissions) && globalPermissions.length > 0) {
        if (data.globalPermissions && Array.isArray(data.globalPermissions)) {
          const hasAllGlobalPermissions = globalPermissions.every(item => data.globalPermissions.includes(item));
          if (!hasAllGlobalPermissions) {
            return false;
          }
        } else {
          return false;
        }
      }

      if (projectPermissions && Array.isArray(projectPermissions) && projectPermissions.length > 0) {
        if (data.projectPermissions && Array.isArray(data.projectPermissions)) {
          const hasAllProjectPermissions = projectPermissions.every(projectPermission =>
            projectPermission.permissions.every(permission => {
              const hasPermission = data.projectPermissions.find(item => item.permission === permission);
              if (!hasPermission) {
                return false;
              }

              if (hasPermission.projects && Array.isArray(hasPermission.projects)) {
                if (projectPermission.projects && Array.isArray(projectPermission.projects)) {
                  const hasProjectPermission = projectPermission.projects.every(item => hasPermission.projects.includes(item));
                  if (!hasProjectPermission) {
                    return false;
                  }
                }
              }

              if (hasPermission.issues && Array.isArray(hasPermission.issues)) {
                if (projectPermission.issues && Array.isArray(projectPermission.issues)) {
                  const hasIssuePermission = projectPermission.issues.every(item => hasPermission.issues.includes(item));
                  if (!hasIssuePermission) {
                    return false;
                  }
                }
              }

              return true;
            })
          );

          if (!hasAllProjectPermissions) {
            return false;
          }
        } else {
          return false;
        }
      }

      // If we reached this part, nether global or project specific permissions returned false
      // So you probably have access?!
      return true;

    } else if (this.mode === Modes.P2) {
      let hasAllPermissions = true;

      for await (const bulkPermission of projectPermissions || []) {
        const { projects, issues, permissions } = bulkPermission || {};

        for await (const projectId of projects || []) {
          if (!hasAllPermissions) break;
          const { data } = await this.client.get<Jira.Permissions>(this.endpoints.MYPERMISSIONS, { projectId });
          hasAllPermissions = permissions.every(permission => data.permissions[permission] && data.permissions[permission].havePermission);
        }

        for await (const issueId of issues || []) {
          if (!hasAllPermissions) break;
          const { data } = await this.client.get<Jira.Permissions>(this.endpoints.MYPERMISSIONS, { issueId });
          hasAllPermissions = permissions.every(permission => data.permissions[permission] && data.permissions[permission].havePermission);
        }
      }

      for await (const permission of globalPermissions || []) {
        if (!hasAllPermissions) break;
        const { data } = await this.client.get<Jira.Permissions>(this.endpoints.MYPERMISSIONS);
        hasAllPermissions = data.permissions[permission] && data.permissions[permission].havePermission;
      }

      return hasAllPermissions;
    }

    return false;
  }

  protected getInstance(client: JiraRestClient, mode: Modes): JiraClientService {
    return new JiraClientService(client, mode);
  }

}
