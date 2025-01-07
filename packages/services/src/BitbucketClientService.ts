import { BitbucketServerEndpoints, Modes } from '@collabsoft-net/enums';
import { RestClient } from '@collabsoft-net/types';
import { injectable } from 'inversify';

import { AbstractAtlasClientService } from '.';

@injectable()
export class BitbucketClientService extends AbstractAtlasClientService {

  constructor(protected client: RestClient) {
    super(client, Modes.P2);
    this.endpoints = BitbucketServerEndpoints;
  }

  cached(duration: number) {
    return this.getInstance(this.client.cached(duration));
  }

  listDynamicModules(): Promise<unknown> {
    throw new Error('This method is not available for Atlassian Bitbucket');
  }
  registerDynamicModule(): Promise<void> {
    throw new Error('This method is not available for Atlassian Bitbucket');
  }

  protected getInstance(client: RestClient): BitbucketClientService {
    return new BitbucketClientService(client);
  }

  static getIdentifier(): symbol {
    return Symbol.for('BitbucketClientService');
  }

}
