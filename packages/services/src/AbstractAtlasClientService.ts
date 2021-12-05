import { AbstractAtlasRestClient } from '@collabsoft-net/clients';
import { CloudEndpoints, Modes, ServerEndpoints } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { AtlasEndpoints, RestClient } from '@collabsoft-net/types';
import { injectable } from 'inversify';
import { compile } from 'path-to-regexp';

@injectable()
export abstract class AbstractAtlasClientService {

  protected endpoints: AtlasEndpoints;

  constructor(protected client: RestClient, protected mode: Modes) {
    this.endpoints = mode === Modes.CONNECT ? CloudEndpoints : ServerEndpoints;
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

  protected getEndpointFor(endpoint: string, pathParams: Record<string, unknown> = {}): string {
    const compiler = compile(endpoint);
    return compiler(pathParams);
  }

  protected abstract getInstance(impersonatedClient: AbstractAtlasRestClient, mode: Modes): AbstractAtlasClientService;

}
