import { AbstractAtlasRestClient } from '@collabsoft-net/clients';
import { ConfluenceCloudEndpoints, ConfluenceServerEndpoints, Modes } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { RestClient } from '@collabsoft-net/types';
import { StatusCodes } from 'http-status-codes';
import { injectable } from 'inversify';

import { AbstractAtlasClientService } from '.';

@injectable()
export class ConfluenceClientService extends AbstractAtlasClientService {

  constructor(protected client: RestClient, protected mode: Modes) {
    super(client, mode);
    this.endpoints = mode === Modes.CONNECT ? ConfluenceCloudEndpoints : ConfluenceServerEndpoints;
  }

  cached(duration: number) {
    return this.getInstance(this.client.cached(duration), this.mode);
  }

  async currentUser(expand?: Array<string>): Promise<Confluence.User> {
    const { data } = await this.client.get<Confluence.User>(this.endpoints.CURRENTUSER, { expand: expand?.join(',') });
    return data;
  }

  async getUser(accountId: string, expand?: Array<string>): Promise<Confluence.User> {
    const { data } = this.mode === Modes.CONNECT
      ? await this.client.get<Confluence.User>(this.endpoints.USER, { accountId, expand: expand?.join(',') })
      : await this.client.get<Confluence.User>(this.endpoints.USER, { key: accountId });
    return data;
  }

  async getMacroBody(contentId: string, macroId: string, version = 0): Promise<Confluence.MacroInstance> {
    const { data } = await this.client.get<Confluence.MacroInstance>(`/rest/api/content/${contentId}/history/${version}/macro/id/${macroId}`);
    return data;
  }

  async getContent(contentId: number): Promise<Confluence.Content> {
    const { data } = await this.client.get<Confluence.Content>(`/rest/api/content/${contentId}`);
    return data;
  }

  async hasContentPermission(contentId: string, subject: Confluence.PermissionSubjectWithGroupId, operation: Confluence.ContentOperation): Promise<boolean> {
    const { data: permission } = await this.client.post<Confluence.PermissionCheckResponse>(this.getEndpointFor(this.endpoints.CONTENT_PERMISSIONS, { id: contentId }), {
      subject,
      operation
    });

    return permission.hasPermission;
  }

  async hasSpacePermission(spaceKey: string, operation: Confluence.ContentOperation, accountId?: string): Promise<boolean> {
    const { data: space } = await this.client.get<Confluence.Space>(this.getEndpointFor(this.endpoints.SPACE, { spaceKey }), { extend: 'permissions' });
    if (space && space.permissions) {
      const permission = space.permissions.find(item => item.operation.operation === operation && item.operation.targetType === 'space');
      if (permission) {
        if (accountId) {
          return permission.subjects.user.results.some(user => user.accountId === accountId);
        } else {
          return permission.anonymousAccess;
        }
      }
    }
    return false;
  }

  async getSpaceProperty<T>(spaceIdOrKey: string, propertyKey: string): Promise<Atlassian.Connect.EntityProperty<T>|null> {
    try {
      const { data, status } = await this.client.get<Atlassian.Connect.EntityProperty<T>>(this.getEndpointFor(this.endpoints.SPACE_PROPERTY_BY_KEY, { spaceIdOrKey, propertyKey }));
      return status === StatusCodes.OK ? data : null;
    } catch (error) {
      return null;
    }
  }

  async getContentProperty<T>(contentId: string, propertyKey: string): Promise<Atlassian.Connect.EntityProperty<T>|null> {
    try {
      const { data, status } = await this.client.get<Atlassian.Connect.EntityProperty<T>>(this.getEndpointFor(this.endpoints.CONTENT_PROPERTY_BY_KEY, { contentId, propertyKey }));
      return status === StatusCodes.OK ? data : null;
    } catch (error) {
      return null;
    }
  }

  async setSpaceProperty<T>(spaceIdOrKey: string, property: Atlassian.Connect.EntityProperty<T>): Promise<void> {
    const { status, statusText } = await this.client.put(this.getEndpointFor(this.endpoints.SPACE_PROPERTY_BY_KEY, { spaceIdOrKey, propertyKey: property.key }), property.value);
    if (status !== StatusCodes.OK && status !== StatusCodes.CREATED) {
      throw new Error(statusText);
    }
  }

  async setContentProperty<T>(contentId: string, property: Atlassian.Connect.EntityProperty<T>): Promise<void> {
    const { status, statusText } = await this.client.put(this.getEndpointFor(this.endpoints.CONTENT_PROPERTY_BY_KEY, { contentId, propertyKey: property.key }), property.value);
    if (status !== StatusCodes.OK && status !== StatusCodes.CREATED) {
      throw new Error(statusText);
    }
  }

  async deleteEntityProperty(entityType: 'app'|'user'|'space'|'content', entityId: string, propertyKey: string): Promise<void> {
    switch (entityType) {
      case 'app': return this.deleteAppProperty(entityId, propertyKey);
      case 'user': return this.deleteUserProperty(entityId, propertyKey);
      case 'space': return this.deleteSpaceProperty(entityId, propertyKey);
      case 'content': return this.deleteContentProperty(entityId, propertyKey);
    }
  }

  async deleteSpaceProperty(spaceIdOrKey: string, propertyKey: string): Promise<void> {
    const { status, statusText } = await this.client.delete(this.getEndpointFor(this.endpoints.SPACE_PROPERTY_BY_KEY, { spaceIdOrKey, propertyKey }));
    if (status !== StatusCodes.NO_CONTENT) {
      throw new Error(statusText);
    }
  }

  async deleteContentProperty(contentId: string, propertyKey: string): Promise<void> {
    const { status, statusText } = await this.client.delete(this.getEndpointFor(this.endpoints.CONTENT_PROPERTY_BY_KEY, { contentId, propertyKey }));
    if (status !== StatusCodes.NO_CONTENT) {
      throw new Error(statusText);
    }
  }

  async hasApplicationPermission(accountId: string, operation: Confluence.ContentOperation): Promise<boolean> {
    const user = await this.getUser(accountId, [ 'operations' ]);
    return user && user.operations
      ? user.operations
        .filter(({ targetType }) => targetType === 'application')
        .some(permission => permission.operation.toLowerCase() === operation.toLowerCase())
      : false;
  }

  async memberOf(groupName: string): Promise<boolean>;
  async memberOf(accountId: string, groupName: string): Promise<boolean>;
  async memberOf(accountIdOrGroupname: string, groupName?: string): Promise<boolean> {
    let accountId = isOfType<AbstractAtlasRestClient>(this.client, 'as') ? this.client.accountId : undefined;
    if (!accountId && groupName !== undefined) accountId = accountIdOrGroupname;
    if (!accountId) throw new Error('Required parameter accountId is missing, please either run this method using impersonation or provide accountId');
    const name = groupName !== undefined ? groupName : accountIdOrGroupname;

    const { data } = await this.client.get<Confluence.GroupArray>(this.getEndpointFor(this.endpoints.MEMBEROF), { accountId });
    return data.results.some(group => group.name === name);
  }

  async listDynamicModules(): Promise<Record<string, unknown>> {
    const { data } = await this.client.get<Record<string, unknown>>(this.endpoints.LIST_DYNAMIC_MODULES);
    return data;
  }

  async registerDynamicModule(dynamicModules: Record<string, unknown>): Promise<void> {
    await this.client.post(this.endpoints.REGISTER_DYNAMIC_MODULE, JSON.stringify(dynamicModules));
  }

  protected getInstance(client: RestClient, mode: Modes): ConfluenceClientService {
    return new ConfluenceClientService(client, mode);
  }

  static getIdentifier(): symbol {
    return Symbol.for('ConfluenceClientService');
  }

}
