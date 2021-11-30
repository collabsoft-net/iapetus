import { AbstractAtlasRestClient } from '.';


export class JiraRestClient extends AbstractAtlasRestClient {

  as(accountId: string): JiraRestClient {
    const instance = new JiraRestClient(this.instance, this.config);
    instance._accountId = accountId;
    return instance;
  }

}