import { AbstractAtlasRestClient } from '.';


export class ConfluenceRestClient extends AbstractAtlasRestClient {

  as(accountId: string): ConfluenceRestClient {
    const instance = new ConfluenceRestClient(this.instance, this.config);
    instance._accountId = accountId;
    return instance;
  }

  static getIdentifier(): symbol {
    return Symbol.for('ConfluenceRestClient');
  }

}