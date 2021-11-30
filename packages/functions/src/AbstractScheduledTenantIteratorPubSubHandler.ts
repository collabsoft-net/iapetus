import { ACInstance } from '@collabsoft-net/entities';
import { AbstractService } from '@collabsoft-net/services';
import { Repository } from '@collabsoft-net/types';
import { log } from 'firebase-functions/lib/logger';
import { injectable } from 'inversify';

import { ACInstanceDTO } from '../../dto/dist/types';
import { AbstractScheduledPubSubHandler } from './AbstractScheduledPubSubHandler';

@injectable()
export abstract class AbstractScheduledTenantIteratorPubSubHandler extends AbstractScheduledPubSubHandler {

  constructor(
    protected repository: Repository,
    protected instanceService: AbstractService<ACInstance, ACInstanceDTO>
  ) {
    super();
  }

  async run(): Promise<void> {
    const { values: instances } = await this.instanceService.findAll();
    for await (const instance of instances) {
      log(`==> Start processing tenant ${instance.clientKey}`, instance);
      await this.startTaskFor(instance);
      log(`==> Finished processing tenant ${instance.clientKey}`, instance);
    }
  }

  protected abstract startTaskFor(instance: ACInstance): Promise<void>;

}