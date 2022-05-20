import { AbstractAtlasRestClient, ConfluenceRestClient } from '@collabsoft-net/clients';
import { ConfluenceCloudEndpoints, ConfluenceServerEndpoints, Modes } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { RestClient } from '@collabsoft-net/types';
import { injectable } from 'inversify';

import { AbstractAtlasClientService } from '.';

@injectable()
export class ConfluenceClientService extends AbstractAtlasClientService {

  constructor(protected client: RestClient, protected mode: Modes) {
    super(client, mode);
    this.endpoints = mode === Modes.CONNECT ? ConfluenceCloudEndpoints : ConfluenceServerEndpoints;
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

  protected getInstance(client: ConfluenceRestClient, mode: Modes): ConfluenceClientService {
    return new ConfluenceClientService(client, mode);
  }

  static getIdentifier(): symbol {
    return Symbol.for('ConfluenceClientService');
  }

}
