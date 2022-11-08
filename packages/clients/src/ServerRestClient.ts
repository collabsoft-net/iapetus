import { CachingService, RestClient as IRestClient } from '@collabsoft-net/types';
import { AxiosRequestConfig } from 'axios';

import { AbstractRestClient } from './AbstractRestClient';

export class ServerRestClient extends AbstractRestClient implements IRestClient {

  constructor(baseURL: string, config: AxiosRequestConfig = {}, cacheService?: CachingService, cacheDuration?: number) {
    super(baseURL, config, cacheService, cacheDuration);
  }

  cached(duration: number) {
    return new ServerRestClient(this.baseURL, this.config, this.cacheService, duration);
  }

  static getIdentifier(): symbol {
    return Symbol.for('ServerRestClient');
  }

}
