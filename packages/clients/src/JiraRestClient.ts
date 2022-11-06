import { AbstractAtlasRestClient } from '.';


export class JiraRestClient extends AbstractAtlasRestClient {

  cached(duration: number) {
    const instance = new JiraRestClient(this.instance, this.config, this.cacheService, duration);
    instance._accountId = this.accountId;
    return instance;
  }

  as(accountId: string): JiraRestClient {
    const instance = new JiraRestClient(this.instance, this.config, this.cacheService, this.duration);
    instance._accountId = accountId;
    return instance;
  }

  static getIdentifier(): symbol {
    return Symbol.for('JiraRestClient');
  }

}