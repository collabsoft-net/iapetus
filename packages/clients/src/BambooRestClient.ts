import { ForgeInstance } from '@collabsoft-net/entities';
import { Applications } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { CachingService } from '@collabsoft-net/types';

import { AbstractAtlasRestClient } from './AbstractAtlasRestClient';

export class BambooRestClient extends AbstractAtlasRestClient<Applications.BAMBOO> {

  cached(cacheService: CachingService, duration: number) {
    const instance = isOfType<ForgeInstance>(this.instance, 'apiBaseUrl')
      ? new BambooRestClient(this.instance, String(this.appSystemToken), this.config, cacheService, duration)
      : new BambooRestClient(this.instance, this.config, cacheService, duration)
    return instance;
  }

  as(accountId: string): BambooRestClient {
    const instance = isOfType<ForgeInstance>(this.instance, 'apiBaseUrl')
      ? new BambooRestClient(this.instance, String(this.appSystemToken), this.config, this.cacheService, this.duration)
      : new BambooRestClient(this.instance, this.config, this.cacheService, this.duration)
    instance._accountId = accountId;
    return instance;
  }

  static getIdentifier(): symbol {
    return Symbol.for('BambooRestClient');
  }

}