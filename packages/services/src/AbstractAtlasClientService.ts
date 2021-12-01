import { AbstractAtlasRestClient } from '@collabsoft-net/clients';
import { Modes } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { AtlasEndpoints, RestClient } from '@collabsoft-net/types';
import { injectable } from 'inversify';
import { compile } from 'path-to-regexp';

@injectable()
export abstract class AbstractAtlasClientService {

  constructor(
    protected client: RestClient,
    protected endpoints: AtlasEndpoints,
    protected mode: Modes) {}

  as(accountId: string, oauthClientId: string, sharedSecret: string): AbstractAtlasClientService {
    if (isOfType<AbstractAtlasRestClient>(this.client, 'as')) {
      const impersonatedClient = this.client.as(accountId, oauthClientId, sharedSecret);
      return this.getInstance(impersonatedClient, this.endpoints, this.mode);
    } else {
      throw new Error('The provided REST client implementation does not support impersonation');
    }
  }

  async getApp(): Promise<UPM.App> {
    const { data } = await this.client.get<UPM.App>(this.endpoints.APP);
    return data;
  }

  protected getEndpointFor(endpoint: string, pathParams: Record<string, unknown> = {}): string {
    const compiler = compile(endpoint);
    return compiler(pathParams);
  }

  protected abstract getInstance(impersonatedClient: AbstractAtlasRestClient, endpoints: AtlasEndpoints, mode: Modes): AbstractAtlasClientService;

}
