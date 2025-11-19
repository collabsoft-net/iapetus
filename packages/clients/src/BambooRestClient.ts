import { Applications } from '@collabsoft-net/enums';

import { AbstractAtlasRestClient } from '.';

export class BambooRestClient extends AbstractAtlasRestClient<Applications.BAMBOO> {

  cached(duration: number) {
    const instance = new BambooRestClient(this.instance, this.config, this.cacheService, duration);
    instance._accountId = this.accountId;
    return instance;
  }

  as(accountId: string): BambooRestClient {
    const instance = new BambooRestClient(this.instance, this.config, this.cacheService, this.duration);
    instance._accountId = accountId;
    return instance;
  }

  static getIdentifier(): symbol {
    return Symbol.for('BambooRestClient');
  }

}