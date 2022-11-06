import { AbstractAtlasRestClient } from '.';


export class ConfluenceRestClient extends AbstractAtlasRestClient {

  cached(duration: number): ConfluenceRestClient {
    const instance = new ConfluenceRestClient(this.instance, this.config, this.cacheService, duration);
    instance._accountId = this._accountId;
    return instance;
  }

  as(accountId: string): ConfluenceRestClient {
    const instance = new ConfluenceRestClient(this.instance, this.config, this.cacheService, this.duration);
    instance._accountId = accountId;
    return instance;
  }

  static getIdentifier(): symbol {
    return Symbol.for('ConfluenceRestClient');
  }

}