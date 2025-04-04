import { BambooServerEndpoints, Modes } from '@collabsoft-net/enums';
import { RestClient } from '@collabsoft-net/types';
import { injectable } from 'inversify';

import { AbstractAtlasClientService } from '.';

@injectable()
export class BambooClientService extends AbstractAtlasClientService<Modes.P2> {

  constructor(protected client: RestClient) {
    super(client, Modes.P2);
    this.endpoints = BambooServerEndpoints;
  }

  cached(duration: number) {
    return this.getInstance(this.client.cached(duration));
  }

  async getPlans(projectKey?: string): Promise<Array<Bamboo.Plan>> {
    const endpoint = this.getEndpointFor(this.endpoints.PLANS);
    const { data } = await this.client.get<Bamboo.Plans>(endpoint);
    return data.plans.plan
      .filter(plan => projectKey ? plan.key.startsWith(`${projectKey}-`) : true)
  }

  async getBuildStatus(projectKey: string): Promise<Bamboo.BuildStatus> {
    const endpoint = this.getEndpointFor(this.endpoints.BUILDSTATUS, { projectKey });
    const { data } = await this.client.get<Bamboo.BuildStatus>(endpoint);
    return data;
  }

  listDynamicModules(): Promise<unknown> {
    throw new Error('This method is not available for Atlassian Bamboo');
  }
  registerDynamicModule(): Promise<void> {
    throw new Error('This method is not available for Atlassian Bamboo');
  }

  protected getInstance(client: RestClient): BambooClientService {
    return new BambooClientService(client);
  }

  static getIdentifier(): symbol {
    return Symbol.for('BambooClientService');
  }

}
