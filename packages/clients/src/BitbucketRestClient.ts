import { ForgeInstance } from '@collabsoft-net/entities';
import { Applications } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { CachingService } from '@collabsoft-net/types';

import { AbstractAtlasRestClient } from './AbstractAtlasRestClient';


export class BitbucketRestClient extends AbstractAtlasRestClient<Applications.BITBUCKET> {

  cached(cacheService: CachingService, duration: number) {
    const instance = isOfType<ForgeInstance>(this.instance, 'apiBaseUrl')
      ? new BitbucketRestClient(this.instance, String(this.appSystemToken), this.config, cacheService, duration)
      : new BitbucketRestClient(this.instance, this.config, cacheService, duration)
    return instance;
  }

  as(accountId: string): BitbucketRestClient {
    const instance = isOfType<ForgeInstance>(this.instance, 'apiBaseUrl')
      ? new BitbucketRestClient(this.instance, String(this.appSystemToken), this.config, this.cacheService, this.duration)
      : new BitbucketRestClient(this.instance, this.config, this.cacheService, this.duration)
    instance._accountId = accountId;
    return instance;
  }

  static getIdentifier(): symbol {
    return Symbol.for('BitbucketRestClient');
  }

}