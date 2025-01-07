import { AbstractAtlasRestClient } from '.';


export class BitbucketRestClient extends AbstractAtlasRestClient {

  cached(duration: number) {
    const instance = new BitbucketRestClient(this.instance, this.config, this.cacheService, duration);
    instance._accountId = this.accountId;
    return instance;
  }

  as(accountId: string): BitbucketRestClient {
    const instance = new BitbucketRestClient(this.instance, this.config, this.cacheService, this.duration);
    instance._accountId = accountId;
    return instance;
  }

  static getIdentifier(): symbol {
    return Symbol.for('BitbucketRestClient');
  }

}