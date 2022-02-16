import { AbstractAtlasRestClient } from '@collabsoft-net/clients';
import { ConfluenceCloudEndpoints, ConfluenceServerEndpoints,JiraCloudEndpoints, JiraServerEndpoints, Modes } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { RestClient } from '@collabsoft-net/types';
import { injectable } from 'inversify';
import { compile } from 'path-to-regexp';

@injectable()
export abstract class AbstractAtlasClientService {

  protected endpoints: Record<string, string>;

  constructor(protected client: RestClient, protected mode: Modes) {
    this.endpoints = mode === Modes.CONNECT ? {...ConfluenceCloudEndpoints, ...JiraCloudEndpoints} : {...ConfluenceServerEndpoints, ...JiraServerEndpoints};
  }

  as(accountId: string, oauthClientId: string, sharedSecret: string): AbstractAtlasClientService {
    if (isOfType<AbstractAtlasRestClient>(this.client, 'as')) {
      const impersonatedClient = this.client.as(accountId, oauthClientId, sharedSecret);
      return this.getInstance(impersonatedClient, this.mode);
    } else {
      throw new Error('The provided REST client implementation does not support impersonation');
    }
  }

  async getApp(appKey: string): Promise<UPM.App> {
    const { data } = await this.client.get<UPM.App>(this.getEndpointFor(this.endpoints.APP, { appKey }));
    return data;
  }

  async listDynamicModules(): Promise<Record<string, unknown>> {
    const { data } = await this.client.get<Record<string, unknown>>(this.endpoints.LIST_DYNAMIC_MODULES);
    return data;
  }

  async registerDynamicModule(dynamicModules: Record<string, unknown>): Promise<void> {
    await this.client.post(this.endpoints.REGISTER_DYNAMIC_MODULES, JSON.stringify(dynamicModules));
  }

  async unregisterDynamicModule(moduleKey: string): Promise<void> {
    await this.client.delete(this.endpoints.UNREGISTER_DYNAMIC_MODULES, undefined, { moduleKey });
  }

  protected getEndpointFor(endpoint: string, pathParams: Record<string, unknown> = {}): string {
    const compiler = compile(endpoint);
    return compiler(pathParams);
  }

  protected abstract getInstance(impersonatedClient: AbstractAtlasRestClient, mode: Modes): AbstractAtlasClientService;

}
