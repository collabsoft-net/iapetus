import { JiraCloudEndpoints, JiraServerEndpoints, Modes } from '@collabsoft-net/enums';
import { RestClient } from '@collabsoft-net/types';
import FormData from 'form-data';
import { StatusCodes } from 'http-status-codes';
import { injectable } from 'inversify';

import { AbstractAtlasClientService } from '.';

@injectable()
export class JiraClientService extends AbstractAtlasClientService {

  constructor(protected client: RestClient, protected mode: Modes) {
    super(client, mode);
    this.endpoints = mode === Modes.CONNECT ? JiraCloudEndpoints : JiraServerEndpoints;
  }

  cached(duration: number) {
    return this.getInstance(this.client.cached(duration), this.mode);
  }

  async paginate<T>(nextPage: string): Promise<Jira.PagedResponse2<T>> {
    const { data } = await this.client.get<Jira.PagedResponse2<T>>(nextPage);
    return data;
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

  async getUserEmail(accountId: string): Promise<Jira.UnrestrictedUserEmail> {
    const { data } = await this.client.get<Jira.UnrestrictedUserEmail>(this.endpoints.USER_EMAIL, { accountId });
    return data;
  }

  async getUsersForPicker(query?: string, showAvatar?: boolean, avatarSize?: string, excludeAccountIds?: Array<string>, excludeConnectUsers?: boolean, maxResults?: number): Promise<Jira.FoundUsers> {
    const { data } = await this.client.get<Jira.FoundUsers>(this.endpoints.USERS_FOR_PICKER, { query, showAvatar, avatarSize, excludeAccountIds: excludeAccountIds?.join(','), excludeConnectUsers, maxResults });
    return data;
  }

  async getUsersForPermissions(permissions: Array<string>, query?: string, accountId?: string, issueKey?: string, projectKey?: string, startAt?: number,  maxResults?: number): Promise<Array<Jira.User>> {
    const { data } = await this.client.get<Array<Jira.User>>(this.endpoints.USERS_FOR_PERMISSION, { permissions: permissions.join(','), query, accountId, issueKey, projectKey, startAt, maxResults });
    return data;
  }

  async getProject(projectIdOrKey: string|number, expand?: Array<'description'|'issueTypes'|'lead'|'projectKeys'|'issueTypeHierarchy'>, properties?: Array<string>): Promise<Jira.Project> {
    const { data } = await this.client.get<Jira.Project>(this.getEndpointFor(this.endpoints.READ_PROJECT, { projectIdOrKey: `${projectIdOrKey}` }), { expand: expand?.join(','), properties: properties?.join(',') });
    return data;
  }

  async searchProjects(
    query?: string,
    id?: Array<string>,
    keys?: Array<string>,
    typeKey?: 'business'|'service_desk'|'software',
    category?: number,
    action?: 'view'|'browse'|'edit'|'create',
    expand?: Array<'description'|'projectKeys'|'lead'|'issueTypes'|'url'|'insight'>,
    properties?: Array<string>,
    startAt = 0,
    maxResults = 50,
    orderBy: 'category'|'-category'|'+category'|'key'|'-key'|'+key'|'name'|'-name'|'+name'|'owner'|'-owner'|'+owner'|'issueCount'|'-issueCount'|'+issueCount'|'lastIssueUpdatedDate'|'-lastIssueUpdatedDate'|'+lastIssueUpdatedDate'|'archivedDate'|'+archivedDate'|'-archivedDate'|'deletedDate'|'+deletedDate'|'-deletedDate' = 'key'
  ): Promise<Jira.PagedOfProjects> {
    const { data } = await this.client.get<Jira.PagedOfProjects>(this.getEndpointFor(this.endpoints.SEARCH_PROJECTS), {
      query,
      id: id?.join(','),
      keys: keys?.join(','),
      typeKey,
      category,
      action,
      expand: expand?.join(','),
      properties: properties?.join(','),
      startAt,
      maxResults,
      orderBy
    });
    return data;
  }

  async getProjects(): Promise<Array<Jira.Project>> {
    const { data } = await this.client.get<Array<Jira.Project>>(this.getEndpointFor(this.endpoints.LIST_PROJECTS));
    return data;
  }

  async getProjectRoles(projectIdOrKey: string): Promise<Record<string, string>> {
    const { data } = await this.client.get<Record<string, string>>(this.getEndpointFor(this.endpoints.LIST_PROJECT_ROLES, { projectIdOrKey }));
    return data;
  }

  async getProjectRole(projectIdOrKey: string, id: string): Promise<Jira.ProjectRole> {
    const { data } = await this.client.get<Jira.ProjectRole>(this.getEndpointFor(this.endpoints.READ_PROJECT_ROLE, { projectIdOrKey, id }));
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

  async getIssue(issueIdOrKey: string|number, expand?: Array<'renderedFields'|'names'|'schema'|'transitions'|'editmeta'|'changelog'|'versionedRepresentations'>): Promise<Jira.Issue> {
    const { data } = await this.client.get<Jira.Issue>(this.getEndpointFor(this.endpoints.READ_ISSUE, { issueIdOrKey }), { expand: expand?.join(',')});
    return data;
  }

  async createIssue(data: Jira.IssueRequest): Promise<Jira.CreatedIssue> {
    const { data: issue } = await this.client.post<Jira.CreatedIssue>(this.endpoints.ISSUE_CREATE, data);
    return issue;
  }

  async createIssueMetadata(projectIds?: Array<string|number>, projectKeys?: Array<string>, issuetypeIds?: Array<string|number>, issuetypeNames?: Array<string>, expand?: Array<'projects.issuetypes.fields'>) {
    const { data } = await this.client.get<Jira.IssueCreateMetadata>(this.endpoints.ISSUE_CREATEMETA, { projectIds: projectIds?.join(','), projectKeys: projectKeys?.join(','), issuetypeIds: issuetypeIds?.join(','), issuetypeNames: issuetypeNames?.join(','), expand: expand?.join(',') });
    return data;
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

  async getFields(): Promise<Array<Jira.FieldDetails>> {
    const { data } = await this.client.get<Array<Jira.FieldDetails>>(this.getEndpointFor(this.endpoints.LIST_FIELDS));
    return data;
  }

  async getFieldsPaginated(
    type?: Array<'custom'|'system'>,
    id?: Array<string>,
    query?: string,
    orderBy?: 'contextsCount'|'-contextsCount'|'+contextsCount'|'lastUsed'|'-lastUsed'|'+lastUsed'|'name'|'-name'|'+name'|'screensCount'|'-screensCount'|'+screensCount'|'projectsCount'|'-projectsCount'|'+projectsCount',
    expand?: Array<'key'|'lastUsed'|'screensCount'|'contextsCount'|'isLocked'|'searcherKey'>,
    startAt?: number,
    maxResults?: number
  ): Promise<Jira.PagedResponse2<Jira.Field>> {
    const { data } = await this.client.get<Jira.PagedResponse2<Jira.Field>>(this.getEndpointFor(this.endpoints.SEARCH_FIELDS), {
      type: type?.join(','), id: id?.join(','), query, orderBy, expand: expand?.join(','), startAt, maxResults
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

  async updateComment<T>(issueIdOrKey: string|number, commentId: string, body: string|Record<string, unknown>, properties?: Array<Atlassian.Connect.EntityProperty<T>>): Promise<Jira.Comment> {
    const { data } = await this.client.put<Jira.Comment>(this.getEndpointFor(this.endpoints.COMMENT_UPDATE, { issueIdOrKey, commentId }), { body, properties });
    return data;
  }

  async getComponentRelatedIssuesCount(id: string): Promise<Jira.ComponentIssuesCount> {
    const { data } = await this.client.get<Jira.ComponentIssuesCount>(this.getEndpointFor(this.endpoints.COMPONENT_ISSUE_COUNTS, { id }));
    return data;
  }

  async getAttachment(attachmentId: string): Promise<Jira.Attachment> {
    const { data } = await this.client.get<Jira.Attachment>(this.getEndpointFor(this.endpoints.READ_ATTACHMENT, { attachmentId }));
    return data;
  }

  async addAttachment(issueIdOrKey: string|number, content: string | Buffer, fileName?: string): Promise<Jira.Attachment> {
    const data = new FormData();
    data.append('file', content, fileName);
    const { data: result } = await this.client.post<Jira.Attachment>(this.getEndpointFor(this.endpoints.ADD_ATTACHMENT, { issueIdOrKey }), data, undefined, {
      headers: {
        'Accept': 'application/json',
        'X-Atlassian-Token': 'no-check',
        'Content-Type': 'multipart/form-data',
      }
    });
    return result;
  }

  async getVersion(id: string|number, expand?: Array<'operations'|'issuesstatus'>): Promise<Jira.Version> {
    const { data } = await this.client.get<Jira.Version>(this.getEndpointFor(this.endpoints.READ_VERSION, { id }), { expand: expand?.join(',') });
    return data;
  }

  async getVersions(projectIdOrKey: string|number, expand?: boolean): Promise<Array<Jira.Version>> {
    const { data } = await this.client.get<Array<Jira.Version>>(this.getEndpointFor(this.endpoints.LIST_VERSIONS, { projectIdOrKey }), { expand: expand ? 'operations' : undefined });
    return data;
  }

  async getVersionsPaginatedFor(projectIdOrKey: string|number, startAt = 0, maxResults = 50, query?: string, orderBy?: 'description'|'-description'|'+description'|'name'|'-name'|'+name'|'releaseDate'|'-releaseDate'|'+releaseDate'|'sequence'|'-sequence'|'+sequence'|'startDate'|'-startDate'|'+startDate', status?: Array<'released'|'unreleased'|'archived'>, expand?: Array<'operations'|'issuesstatus'>): Promise<Jira.PagedResponse2<Jira.Version>> {
    const { data } = await this.client.get<Jira.PagedResponse2<Jira.Version>>(this.getEndpointFor(this.endpoints.LIST_VERSIONS_PAGINATED, { projectIdOrKey }), { startAt, maxResults, query, orderBy, status: status?.join(','), expand: expand?.join(',') });
    return data;
  }

  async createVersion(createVersionRequest: Jira.CreateVersionRequest): Promise<Jira.Version> {
    const { data } = await this.client.post<Jira.Version>(this.getEndpointFor(this.endpoints.VERSION_CREATE), {
      archived: createVersionRequest.archived,
      description: createVersionRequest.description,
      name: createVersionRequest.name,
      projectId: createVersionRequest.projectId,
      releaseDate: createVersionRequest.releaseDate,
      startDate: createVersionRequest.startDate,
      expand: createVersionRequest.expand?.join(','),
    });
    return data;
  }

  async updateVersion(id: string, updateVersionRequest: Jira.UpdateVersionRequest): Promise<Jira.Version> {
    const { data } = await this.client.put<Jira.Version>(this.getEndpointFor(this.endpoints.VERSION_UPDATE, { id }), {
      archived: updateVersionRequest.archived,
      description: updateVersionRequest.description,
      name: updateVersionRequest.name,
      releaseDate: updateVersionRequest.releaseDate,
      released: updateVersionRequest.released,
      startDate: updateVersionRequest.startDate,
      moveUnfixedIssuesTo: updateVersionRequest.moveUnfixedIssuesTo,
      expand: updateVersionRequest.expand?.join(','),
    });
    return data;
  }

  async deleteVersion(id: string, options: Jira.DeleteVersionRequest = {}): Promise<void> {
    const { status } = await this.client.post(this.getEndpointFor(this.endpoints.VERSION_DELETE, { id: id }), options);
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

  async getRelease(projectKey: string, versionId: string): Promise<Jira.Release|Jira.VersionWithIssueStatus> {
    if (this.mode === Modes.CONNECT) {
      const result = await this.getVersion(versionId, [ 'issuesstatus' ]);
      return result as Jira.VersionWithIssueStatus
    } else {
      const { data } = await this.client.get<Jira.Release>(this.getEndpointFor(this.endpoints.RELEASE_DETAILS, { projectKey, versionId }));
      return data;
    }
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

  async createComponent(component: Jira.CreateComponentRequest): Promise<Jira.Component> {
    const { data, status } = await this.client.post<Jira.Component>(this.endpoints.COMPONENT_CREATE, component);
    if (status !== StatusCodes.CREATED) throw new Error();
    return data;
  }

  async updateComponent(id: string, component: Jira.UpdateComponentRequest): Promise<Jira.Component> {
    const { data } = await this.client.put<Jira.Component>(this.getEndpointFor(this.endpoints.COMPONENT_UPDATE, { id }), component);
    return data;
  }

  async deleteComponent(id: string, moveIssuesTo?: string|number): Promise<void> {
    const { status } = await this.client.delete(this.getEndpointFor(this.endpoints.COMPONENT_DELETE, { id: id }), undefined, { moveIssuesTo });
    if (status !== StatusCodes.NO_CONTENT) throw new Error();
  }

  async getAllIssueFieldOptions(fieldKey: string, startAt?: number, maxResults?: number): Promise<Jira.PagedResponse2<Jira.IssueFieldOption>> {
    const { data } = await this.client.get<Jira.PagedResponse2<Jira.IssueFieldOption>>(this.getEndpointFor(this.endpoints.ISSUE_FIELD_OPTIONS, { fieldKey }), { startAt, maxResults });
    return data;
  }

  async getIssueFieldOption(fieldKey: string, optionId: number): Promise<Jira.IssueFieldOption> {
    const { data } = await this.client.get<Jira.IssueFieldOption>(this.getEndpointFor(this.endpoints.ISSUE_FIELD_OPTION, { fieldKey, optionId }));
    return data;
  }

  async createIssueFieldOption(fieldKey: string, issueFieldOption: Omit<Jira.IssueFieldOption, 'id'>): Promise<Jira.IssueFieldOption> {
    const { data } = await this.client.post<Jira.IssueFieldOption>(this.getEndpointFor(this.endpoints.ISSUE_FIELD_OPTIONS, { fieldKey }), issueFieldOption);
    return data;
  }

  async updateIssueFieldOption(fieldKey: string, issueFieldOption: Jira.IssueFieldOption): Promise<Jira.IssueFieldOption> {
    const { data } = await this.client.put<Jira.IssueFieldOption>(this.getEndpointFor(this.endpoints.ISSUE_FIELD_OPTION, { fieldKey, optionId: issueFieldOption.id }), issueFieldOption);
    return data;
  }

  async deleteIssueFieldOption(fieldKey: string, optionId: number): Promise<boolean> {
    const { status } = await this.client.delete(this.getEndpointFor(this.endpoints.ISSUE_FIELD_OPTION, { fieldKey, optionId: optionId }));
    return status === StatusCodes.NO_CONTENT;
  }

  async getBoard(boardId: string): Promise<Jira.Board> {
    const { data } = await this.client.get<Jira.Board>(this.getEndpointFor(this.endpoints.BOARD, { boardId }));
    return data;
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

  async getSprint(sprintId: number): Promise<Jira.Sprint> {
    const { data } = await this.client.get<Jira.Sprint>(this.getEndpointFor(this.endpoints.SPRINT, { sprintId }));
    return data;
  }

  async getIssuesForSprint(sprintId: number, startAt?: number, maxResults?: number, jql?: string, validateQuery?: boolean, fields?: Array<string>, expand?: Array<'renderedFields'|'names'|'schema'|'transitions'|'editmeta'|'changelog'|'versionedRepresentations'>): Promise<Jira.IssuesForSprint> {
    const { data } = await this.client.get<Jira.IssuesForSprint>(this.getEndpointFor(this.endpoints.SPRINT_ISSUES, { sprintId }), { startAt, maxResults, jql, validateQuery, fields: fields?.join(','), expand: expand?.join(',')});
    return data;
  }

  async getProjectFeatures(projectIdOrKey: string|number): Promise<Jira.Features> {
    const { data } = await this.client.get<Jira.Features>(this.getEndpointFor(this.endpoints.LIST_PROJECT_FEATURES, { projectIdOrKey }));
    return data;
  }

  async getProjectFeature(projectIdOrKey: string|number, featureKey: string): Promise<Jira.Feature|undefined> {
    const { features } = await this.getProjectFeatures(projectIdOrKey);
    return features.find(item => item.feature === featureKey);
  }

  async setProjectFeature(projectIdOrKey: string|number, featureKey: string, state: 'ENABLED'|'DISABLED'|'COMING_SOON'): Promise<Jira.Features> {
    const { data } = await this.client.put<Jira.Features>(this.getEndpointFor(this.endpoints.UPDATE_PROJECT_FEATURE, { projectIdOrKey, featureKey }), { state });
    return data;
  }

  async getAppProperty<T>(addonKey: string, propertyKey: string): Promise<Atlassian.Connect.EntityProperty<T>|null> {
    try {
      const { data, status } = await this.client.get<Atlassian.Connect.EntityProperty<T>>(this.getEndpointFor(this.endpoints.APP_PROPERTY_BY_KEY, { addonKey, propertyKey }));
      return status === StatusCodes.OK ? data : null;
    } catch (error) {
      return null;
    }
  }

  async getUserProperty<T>(userKeyOrAccountId: string, propertyKey: string): Promise<Atlassian.Connect.EntityProperty<T>|null> {
    try {
      const userKeyOrAccountIdParam = this.mode === Modes.P2 ? 'userKey' : 'accountId';
      const params = { [userKeyOrAccountIdParam]: userKeyOrAccountId };

      const { data, status } = await this.client.get<Atlassian.Connect.EntityProperty<T>>(this.getEndpointFor(this.endpoints.USER_PROPERTY_BY_KEY, { propertyKey }), params);
      return status === StatusCodes.OK ? data : null;
    } catch (error) {
      return null;
    }
  }

  async getProjectProperty<T>(projectIdOrKey: string, propertyKey: string): Promise<Atlassian.Connect.EntityProperty<T>|null> {
    try {
      const { data, status } = await this.client.get<Atlassian.Connect.EntityProperty<T>>(this.getEndpointFor(this.endpoints.PROJECT_PROPERTY_BY_KEY, { projectIdOrKey, propertyKey }));
      return status === StatusCodes.OK ? data : null;
    } catch (error) {
      return null;
    }
  }

  async getIssueProperty<T>(issueIdOrKey: string, propertyKey: string): Promise<Atlassian.Connect.EntityProperty<T>|null> {
    try {
      const { data, status } = await this.client.get<Atlassian.Connect.EntityProperty<T>>(this.getEndpointFor(this.endpoints.ISSUE_PROPERTY_BY_KEY, { issueIdOrKey, propertyKey }));
      return status === StatusCodes.OK ? data : null;
    } catch (error) {
      return null;
    }
  }

  async getCommentProperty<T>(commentId: string, propertyKey: string): Promise<Atlassian.Connect.EntityProperty<T>|null> {
    try {
      const { data, status } = await this.client.get<Atlassian.Connect.EntityProperty<T>>(this.getEndpointFor(this.endpoints.COMMENT_PROPERTY_BY_KEY, { commentId, propertyKey }));
      return status === StatusCodes.OK ? data : null;
    } catch (error) {
      return null;
    }
  }

  async setProjectProperty<T>(projectIdOrKey: string, property: Atlassian.Connect.EntityProperty<T>): Promise<void> {
    const { status, statusText } = await this.client.put(this.getEndpointFor(this.endpoints.PROJECT_PROPERTY_BY_KEY, { projectIdOrKey, propertyKey: property.key }), property.value);
    if (status !== StatusCodes.OK && status !== StatusCodes.CREATED) {
      throw new Error(statusText);
    }
  }

  async setIssueProperty<T>(issueIdOrKey: string, property: Atlassian.Connect.EntityProperty<T>): Promise<void> {
    const { status, statusText } = await this.client.put(this.getEndpointFor(this.endpoints.ISSUE_PROPERTY_BY_KEY, { issueIdOrKey, propertyKey: property.key }), property.value);
    if (status !== StatusCodes.OK && status !== StatusCodes.CREATED) {
      throw new Error(statusText);
    }
  }

  async setCommentProperty<T>(commentId: string, property: Atlassian.Connect.EntityProperty<T>): Promise<void> {
    const { status, statusText } = await this.client.put(this.getEndpointFor(this.endpoints.COMMENT_PROPERTY_BY_KEY, { commentId, propertyKey: property.key }), property.value);
    if (status !== StatusCodes.OK && status !== StatusCodes.CREATED) {
      throw new Error(statusText);
    }
  }

  async deleteEntityProperty(entityType: 'user'|'project'|'issue'|'comment', entityId: string, propertyKey: string): Promise<void> {
    switch (entityType) {
      case 'user': return this.deleteUserProperty(entityId, propertyKey);
      case 'project': return this.deleteProjectProperty(entityId, propertyKey);
      case 'issue': return this.deleteIssueProperty(entityId, propertyKey);
      case 'comment': return this.deleteCommentProperty(entityId, propertyKey);
    }
  }

  async deleteProjectProperty(projectIdOrKey: string, propertyKey: string): Promise<void> {
    const { status, statusText } = await this.client.delete(this.getEndpointFor(this.endpoints.PROJECT_PROPERTY_BY_KEY, { projectIdOrKey, propertyKey }));
    if (status !== StatusCodes.NO_CONTENT) {
      throw new Error(statusText);
    }
  }

  async deleteIssueProperty(issueIdOrKey: string, propertyKey: string): Promise<void> {
    const { status, statusText } = await this.client.delete(this.getEndpointFor(this.endpoints.ISSUE_PROPERTY_BY_KEY, { issueIdOrKey, propertyKey }));
    if (status !== StatusCodes.NO_CONTENT) {
      throw new Error(statusText);
    }
  }

  async deleteCommentProperty(commentId: string, propertyKey: string): Promise<void> {
    const { status, statusText } = await this.client.delete(this.getEndpointFor(this.endpoints.COMMENT_PROPERTY_BY_KEY, { commentId, propertyKey }));
    if (status !== StatusCodes.NO_CONTENT) {
      throw new Error(statusText);
    }
  }

  // ==================================================================================================================================
  //
  // WARNING: here by dragons 🐲
  // These methods check for Jira permissions
  // If this is not properly implemented, the user might incorrectly end up with elevated priviledges
  // This poses a security issue and might result in data integrity / security incidents and/or bugcrowd vulnerability reports
  //
  // ==================================================================================================================================

  async hasAllPermissions(accountId: string, projectPermissions?: Array<Jira.BulkProjectPermissions>, globalPermissions?: Array<string>): Promise<boolean> {
    return this.hasPermissions(accountId, projectPermissions, globalPermissions, 'ALL');
  }

  async hasAnyPermissions(accountId: string, projectPermissions?: Array<Jira.BulkProjectPermissions>, globalPermissions?: Array<string>): Promise<boolean> {
    return this.hasPermissions(accountId, projectPermissions, globalPermissions, 'ANY');
  }

  async hasProjectPermission(accountId: string, projects: Array<number>, permission: string): Promise<Map<number, boolean>> {

    const result = new Map<number, boolean>();

    if (this.mode === Modes.CONNECT) {

      // Retrieve the permissions from the JIRA API.
      // This will return an array of permissions per project/issue. If the user has the requested permission, it will be listed in the array.
      // For global permissions, the response will be an array of each of the permissions that match the request
      const { data } = await this.client.post<Jira.BulkPermissionGrants>(this.endpoints.PERMISSIONS_CHECK, {
        accountId,
        projectPermissions: [{
          projects,
          permissions: [ permission ]
        }]
      });

      // Did we get any project/issue permissions returned, and if so, is this in the form of an Array?
      if (data.projectPermissions && Array.isArray(data.projectPermissions)) {

        // The Jira API returns an array with results per permission, but in this case we are only checking a single permission
        // We can extract that permission from the array to populate the result map
        const projectPermission = data.projectPermissions.find(item => item.permission === permission);
        if (projectPermission) {

          // The Jira API result will only contain projects that for which the user has the requested permission
          // This means that we need cross check the provided list of projects with the once in the response
          // If the project ID is in the response, the user has access, if not... they don't.
          projects.forEach(projectId => {
            result.set(projectId, projectPermission.projects.includes(projectId));
          });

        }

      }

    } else if (this.mode === Modes.P2) {

      // The Jira Server/DC API does not support bulk checking of permissions
      // We will just have to go over each project and ask if the user has the requested permission
      for await (const projectId of projects) {
        const { data } = await this.client.get<Jira.Permissions>(this.endpoints.MYPERMISSIONS, { projectId });
        const hasPermission = data.permissions[permission] && data.permissions[permission].havePermission;
        result.set(projectId, hasPermission);
      }

    }

    return result;
  }

  async hasPermissions(accountId: string, projectPermissions?: Array<Jira.BulkProjectPermissions>, globalPermissions?: Array<string>, mode: 'ALL'|'ANY' = 'ALL'): Promise<boolean> {
    const evaluator = mode === 'ALL' ? 'every' : 'some';
    if (!accountId || (!projectPermissions && !globalPermissions)) return false;

    if (this.mode === Modes.CONNECT) {

      // Retrieve the permissions from the JIRA API.
      // This will return an array of permissions per project/issue. If the user has the requested permission, it will be listed in the array.
      // For global permissions, the response will be an array of each of the permissions that match the request
      const { data } = await this.client.post<Jira.BulkPermissionGrants>(this.endpoints.PERMISSIONS_CHECK, {
        accountId,
        projectPermissions,
        globalPermissions
      });

      // Are we requesting any global permissions?
      if (globalPermissions && Array.isArray(globalPermissions) && globalPermissions.length > 0) {

        // Did we get any global permissions returned, and if so, is this in the form of an Array?
        if (data.globalPermissions && Array.isArray(data.globalPermissions)) {

          // Check if we have ALL or ANY of the global permissions by matching the response array with the request array
          // If we need ALL global permissions to exist, `evaluator` will be the `every()` method, otherwise it will be `some()`.
          const hasRequiredGlobalPermissions = globalPermissions[evaluator](item => data.globalPermissions.includes(item));

          // If the response does not include the required permissions (either all, or at least one), we will return "false" and abort further processing
          if (!hasRequiredGlobalPermissions) {
            return false;
          }

        // If we did not get any global permissions back in the response, it definitely does not match our request
        // given that we requested at least one global permission (globalPermissions.length > 0)
        // In this case we will return false and abort further processing
        } else {
          return false;
        }
      }

      // Are we requesting any project/issue permisions
      if (projectPermissions && Array.isArray(projectPermissions) && projectPermissions.length > 0) {

        // Did we get any project/issue permissions returned, and if so, is this in the form of an Array?
        if (data.projectPermissions && Array.isArray(data.projectPermissions)) {

          // The requested permissions is actually an array, which includes further arrays of permisions, projects and issues
          // We need to loop over every requested project permissions to check if the listed permissions match the listed project / issue
          // In addition, we need to check if we have ALL or ANY of the project/issue permissions
          // If we need ALL project/issue permissions to exist, `evaluator` will be the `every()` method, otherwise it will be `some()`.
          const hasRequiredProjectPermissions = projectPermissions[evaluator](projectPermission =>

            // Each iteration of requested project permissions need to be evaluated independenly
            // It consists of an array of permissions and to which projects/issues the permission applies
            // We evaluate based on the permissions, which is why we loop over each of the permissions in this iteration
            projectPermission.permissions[evaluator](permission => {

              // Let's start by checking if there is an entry in the response that applies to the permission in this iteration
              const hasPermission = data.projectPermissions.find(item => item.permission === permission);

              // If there is no permission, this iteration does not apply and we should return false for this iteration
              // This is because the iteration only evaluates true if it also includes the permission in the response
              if (!hasPermission) {
                return false;
              }

              // Check if we are looking for project permissions
              if (projectPermission.projects && Array.isArray(projectPermission.projects)) {
                // Check if the matched permission in the response applies to projects
                if (hasPermission.projects && Array.isArray(hasPermission.projects)) {
                  // Check if ALL or ANY of the projects in our request are also listed in the response
                  const hasProjectPermission = projectPermission.projects[evaluator](item => hasPermission.projects.includes(item));

                  // If the response does not include ANY or ALL of the requested projects, we return false for this iteration
                  if (!hasProjectPermission) {
                    return false;
                  }
                }
              }

              // Check if we are looking for issue permissions
              if (projectPermission.issues && Array.isArray(projectPermission.issues)) {
                // Check if the matched permission in the response applies to issues
                if (hasPermission.issues && Array.isArray(hasPermission.issues)) {
                  // Check if ALL or ANY of the issues in our request are also listed in the response
                  const hasIssuePermission = projectPermission.issues[evaluator](item => hasPermission.issues.includes(item));

                  // If the response does not include ANY or ALL of the requested issues, we return false for this iteration
                  if (!hasIssuePermission) {
                    return false;
                  }
                }
              }

              // If we reached this part, neither project nor issue permisions returned false
              // That means this iteration matches the requested permissions and we return true
              return true;
            })
          );

          // If the response does not include the required permissions (either all, or at least one), we will return "false" and abort further processing
          if (!hasRequiredProjectPermissions) {
            return false;
          }

        // If we did not get any project/issue permissions back in the response, it definitely does not match our request
        // given that we requested at least one project/issue permission (projectPermissions.length > 0)
        // In this case we will return false and abort further processing
        } else {
          return false;
        }
      }

      // If we reached this part, neither global or project specific permissions returned false
      // So you probably have access?!
      return true;

    } else if (this.mode === Modes.P2) {

      // TODO: we need to support `ANY` mode for Server
      if (mode === 'ANY') throw new Error('This method does not support `ANY` mode in Server/DC environments');

      let hasAllPermissions = true;

      for await (const bulkPermission of projectPermissions || []) {
        const { projects, issues, permissions } = bulkPermission || {};

        for await (const projectId of projects || []) {
          if (!hasAllPermissions) break;
          const { data } = await this.client.get<Jira.Permissions>(this.endpoints.MYPERMISSIONS, { projectId });
          hasAllPermissions = permissions[evaluator](permission => data.permissions[permission] && data.permissions[permission].havePermission);
        }

        for await (const issueId of issues || []) {
          if (!hasAllPermissions) break;
          const { data } = await this.client.get<Jira.Permissions>(this.endpoints.MYPERMISSIONS, { issueId });
          hasAllPermissions = permissions[evaluator](permission => data.permissions[permission] && data.permissions[permission].havePermission);
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

  async listDynamicModules(): Promise<Jira.DynamicModulesRequest> {
    const { data } = await this.client.get<Record<string, unknown>>(this.endpoints.LIST_DYNAMIC_MODULES);
    return data;
  }

  async registerDynamicModule(dynamicModules: Jira.DynamicModulesRequest): Promise<void> {
    await this.client.post(this.endpoints.REGISTER_DYNAMIC_MODULE, JSON.stringify(dynamicModules));
  }

  protected getInstance(client: RestClient, mode: Modes): JiraClientService {
    return new JiraClientService(client, mode);
  }

  static getIdentifier(): symbol {
    return Symbol.for('JiraClientService');
  }

}
