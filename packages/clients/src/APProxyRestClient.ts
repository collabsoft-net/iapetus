import { CachingService, RestClient } from '@collabsoft-net/types';

import { APRestClient } from './APRestClient';

export class APProxyRestClient extends APRestClient implements RestClient {

  constructor(AP: AP.BitbucketInstance, cacheService?: CachingService) {
    super(AP, cacheService);
  }

  protected get client(): Promise<AP.Request> {
    return new Promise<AP.Request>((resolve) => (this.AP as AP.BitbucketInstance).require<AP.Request>('proxyRequest', resolve))
  }

  static getIdentifier(): symbol {
    return Symbol.for('APProxyRestClient');
  }

}
