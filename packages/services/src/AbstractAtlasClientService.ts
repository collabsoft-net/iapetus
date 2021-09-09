import { AtlasRestClient } from '@collabsoft-net/clients';
import { Modes, SupportedPermissions } from '@collabsoft-net/enums';
import { AtlasEndpoints } from '@collabsoft-net/types';
import { injectable } from 'inversify';
import { compile } from 'path-to-regexp';

@injectable()
export abstract class AbstractAtlasClientService {

  constructor(
    protected client: AtlasRestClient,
    protected endpoints: AtlasEndpoints,
    protected mode: Modes) {}

  as(accountId: string, oauthClientId: string, sharedSecret: string): AbstractAtlasClientService {
    const impersonatedClient = this.client.as(accountId, oauthClientId, sharedSecret);
    return this.getInstance(impersonatedClient, this.endpoints, this.mode);
  }

  async getApp(): Promise<UPM.App> {
    const { data } = await this.client.get<UPM.App>(this.endpoints.APP);
    return data;
  }

  async currentUser(): Promise<Jira.User|Confluence.User> {
    const { data } = await this.client.get<Jira.User|Confluence.User>(this.endpoints.CURRENTUSER);
    return data;
  }

  async getUser(accountId: string): Promise<Jira.User|Confluence.User> {
    const { data } = this.mode === Modes.CONNECT
      ? await this.client.get<Jira.User|Confluence.User>(this.endpoints.USER, { accountId })
      : await this.client.get<Jira.User|Confluence.User>(this.endpoints.USER, { key: accountId });
    return data;
  }

  async hasPermissions(requiredPermissions: SupportedPermissions[], projectId?: string): Promise<boolean> {
    const { data } = await this.client.get<Jira.Permissions>(this.getEndpointFor(this.endpoints.MYPERMISSIONS), { permissions: requiredPermissions.join(','), projectId });
    return requiredPermissions.every(perm => data.permissions[perm] && data.permissions[perm].havePermission);
  }

  async memberOf(groupName: string): Promise<boolean>;
  async memberOf(accountId: string, groupName: string): Promise<boolean>;
  async memberOf(accountIdOrGroupname: string, groupName?: string): Promise<boolean> {

    let accountId = this.client.accountId;
    if (!accountId && groupName !== undefined) accountId = accountIdOrGroupname;
    if (!accountId) throw new Error('Required parameter accountId is missing, please either run this method using impersonation or provide accountId');
    const name = groupName !== undefined ? groupName : accountIdOrGroupname;

    const { data } = await this.client.get<Confluence.GroupArray>(this.getEndpointFor(this.endpoints.MEMBEROF), { accountId });
    return data.results.some(group => group.name === name);
  }

  protected getEndpointFor(endpoint: string, pathParams: Record<string, unknown> = {}): string {
    const compiler = compile(endpoint);
    return compiler(pathParams);
  }

  protected abstract getInstance(impersonatedClient: AtlasRestClient, endpoints: AtlasEndpoints, mode: Modes): AbstractAtlasClientService;

}
