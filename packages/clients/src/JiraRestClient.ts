import { ForgeInstance } from '@collabsoft-net/entities';
import { Applications } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { CachingService } from '@collabsoft-net/types';

import { AbstractAtlasRestClient } from '.';

export class JiraRestClient extends AbstractAtlasRestClient<Applications.JIRA> {

  cached(cacheService: CachingService, duration: number) {
    const instance = isOfType<ForgeInstance>(this.instance, 'apiBaseUrl')
      ? new JiraRestClient(this.instance, String(this.appSystemToken), this.config, cacheService, duration)
      : new JiraRestClient(this.instance, this.config, cacheService, duration)
    return instance;
  }

  as(accountId: string): JiraRestClient {
    const instance = isOfType<ForgeInstance>(this.instance, 'apiBaseUrl')
      ? new JiraRestClient(this.instance, String(this.appSystemToken), this.config, this.cacheService, this.duration)
      : new JiraRestClient(this.instance, this.config, this.cacheService, this.duration)
    instance._accountId = accountId;
    return instance;
  }

  static getIdentifier(): symbol {
    return Symbol.for('JiraRestClient');
  }

}