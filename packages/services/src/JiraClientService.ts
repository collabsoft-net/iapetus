import { JiraRestClient } from '@collabsoft-net/clients';
import { Modes } from '@collabsoft-net/enums';
import { AtlasEndpoints } from '@collabsoft-net/types';
import { StatusCodes } from 'http-status-codes';
import { injectable } from 'inversify';

import { AbstractAtlasClientService } from '.';

@injectable()
export class JiraClientService extends AbstractAtlasClientService {

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

  async getProject(projectIdOrKey: string|number): Promise<Jira.Project> {
    const { data } = await this.client.get<Jira.Project>(this.getEndpointFor(this.endpoints.READ_PROJECT, { projectIdOrKey }));
    return data;
  }

  async getProjects(): Promise<Array<Jira.Project>> {
    const { data } = await this.client.get<Array<Jira.Project>>(this.getEndpointFor(this.endpoints.LIST_PROJECTS));
    return data;
  }

  async getVersion(id: string|number): Promise<Jira.Version> {
    const { data } = await this.client.get<Jira.Version>(this.getEndpointFor(this.endpoints.READ_VERSION, { id }));
    return data;
  }

  async getVersions(projectId: string|number): Promise<Array<Jira.Version>> {
    const { data } = await this.client.get<Array<Jira.Version>>(this.getEndpointFor(this.endpoints.LIST_VERSIONS, { projectIdOrKey: projectId }));
    return data;
  }

  async getVersionsPaginatedFor(projectId: string|number, startAt = 0, maxResults = 50, query?: string): Promise<Jira.PagedResponse2<Jira.Version>> {
    const { data } = await this.client.get<Jira.PagedResponse2<Jira.Version>>(this.getEndpointFor(this.endpoints.LIST_VERSIONS_PAGINATED, { projectIdOrKey: projectId }), { startAt, maxResults, query });
    return data;
  }

  async createVersion(version: Jira.Version): Promise<Jira.Version> {
    const { data } = await this.client.post<Jira.Version>(this.getEndpointFor(this.endpoints.VERSION_CREATE), version);
    return data;
  }

  async updateVersion(version: Jira.Version): Promise<Jira.Version> {
    const { data } = await this.client.put<Jira.Version>(this.getEndpointFor(this.endpoints.VERSION_UPDATE, { versionId: version.id }), version);
    return data;
  }

  async deleteVersion(id: string): Promise<void> {
    const { status } = await this.client.post(this.getEndpointFor(this.endpoints.VERSION_DELETE, { versionId: id }));
    if (status !== StatusCodes.NO_CONTENT) throw new Error();
  }

  async getAllReleases(projectKey: string): Promise<Array<Jira.Release>> {
    const { data } = await this.client.get<Array<Jira.Release>>(this.getEndpointFor(this.endpoints.ALL_RELEASES, { projectKey }));
    return data;
  }

  async getRelease(projectKey: string, versionId: string): Promise<Jira.Release> {
    const { data } = await this.client.get<Jira.Release>(this.getEndpointFor(this.endpoints.RELEASE_DETAILS, { projectKey, versionId }));
    return data;
  }

  async getComponentsFor(projectId: string|number): Promise<Array<Jira.Component>> {
    const { data } = await this.client.get<Array<Jira.Component>>(this.getEndpointFor(this.endpoints.LIST_COMPONENTS, { projectIdOrKey: projectId }));
    return data;
  }

  async getComponentsPaginatedFor(projectId: string|number, startAt = 0, maxResults = 50, query?: string): Promise<Jira.PagedResponse2<Jira.Component>> {
    const { data } = await this.client.get<Jira.PagedResponse2<Jira.Component>>(this.getEndpointFor(this.endpoints.LIST_COMPONENTS_PAGINATED, { projectIdOrKey: projectId }), { startAt, maxResults, query });
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
    const { data } = await this.client.put<Jira.Component>(this.getEndpointFor(this.endpoints.COMPONENT_UPDATE, { componentId: component.id }), component);
    return data;
  }

  async deleteComponent(id: string): Promise<void> {
    const { status } = await this.client.delete(this.getEndpointFor(this.endpoints.COMPONENT_DELETE, { componentId: id }));
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

  async getUserProperty<T>(propertyKey: string, userKeyOrAccountId?: string): Promise<Jira.EntityProperty<T>|null> {
    try {
      const userKeyOrAccountIdParam = this.mode === Modes.P2 ? 'userKey' : 'accountId';
      const params = { [userKeyOrAccountIdParam]: userKeyOrAccountId };

      const { data, status } = await this.client.get<Jira.EntityProperty<T>>(this.getEndpointFor(this.endpoints.USER_PROPERTY_BY_KEY, { propertyKey }), params);
      return status === StatusCodes.OK ? data : null;
    } catch (error) {
      return null;
    }
  }

  async setUserProperty<T>(property: Jira.EntityProperty<T>, userKeyOrAccountId?: string): Promise<void> {
    const userKeyOrAccountIdParam = this.mode === Modes.P2 ? 'userKey' : 'accountId';
    const params = { [userKeyOrAccountIdParam]: userKeyOrAccountId };

    const { status, statusText } = await this.client.put(this.getEndpointFor(this.endpoints.USER_PROPERTY_BY_KEY, { propertyKey: property.key }), property.value, params);
    if (status !== StatusCodes.OK && status !== StatusCodes.CREATED) {
      throw new Error(statusText);
    }
  }

  async hasPermissions(accountId?: string, projectPermissions?: Array<Jira.BulkProjectPermissions>, globalPermissions?: Array<string>): Promise<boolean> {
    if (!projectPermissions && !globalPermissions) return false;

    const { data } = await this.client.post<Jira.BulkPermissionGrants>(this.endpoints.PERMISSIONS_CHECK, {
      accountId,
      projectPermissions,
      globalPermissions
    });

    if (globalPermissions) {
      const hasAllGlobalPermissions = data.globalPermissions.every(globalPermissions.includes)
      if (!hasAllGlobalPermissions) return false;
    }

    if (projectPermissions) {
      const hasAllProjectPermissions = projectPermissions.every(projectPermission =>
        projectPermission.permissions.every(permission => {
          const hasPermission = data.projectPermissions.find(item => item.permission === permission);
          if (hasPermission) {

            if (hasPermission.projects && Array.isArray(hasPermission.projects)) {
              if (projectPermission.projects && Array.isArray(projectPermission.projects)) {
                const hasProjectPermission = projectPermission.projects.every(item => hasPermission.projects.includes(item));
                if (!hasProjectPermission) return false;
              }
            }

            if (hasPermission.issues && Array.isArray(hasPermission.issues)) {
              if (projectPermission.issues && Array.isArray(projectPermission.issues)) {
                const hasIssuePermission = projectPermission.issues.every(item => hasPermission.issues.includes(item));
                if (!hasIssuePermission) return false;
              }
            }

            return true;
          }

          return false;
        })
      );
      if (!hasAllProjectPermissions) return false;
    }

    return true;
  }

  protected getInstance(client: JiraRestClient, endpoints: AtlasEndpoints, mode: Modes): JiraClientService {
    return new JiraClientService(client, endpoints, mode);
  }

}
