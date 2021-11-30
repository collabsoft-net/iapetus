import { AbstractAtlasRestClient } from '@collabsoft-net/clients';
import { Modes } from '@collabsoft-net/enums';
import { AtlasEndpoints } from '@collabsoft-net/types';
import { injectable } from 'inversify';
import { compile } from 'path-to-regexp';

@injectable()
export abstract class AbstractAtlasClientService {

  constructor(
    protected client: AbstractAtlasRestClient,
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

  protected getEndpointFor(endpoint: string, pathParams: Record<string, unknown> = {}): string {
    const compiler = compile(endpoint);
    return compiler(pathParams);
  }

  protected abstract getInstance(impersonatedClient: AbstractAtlasRestClient, endpoints: AtlasEndpoints, mode: Modes): AbstractAtlasClientService;

}
