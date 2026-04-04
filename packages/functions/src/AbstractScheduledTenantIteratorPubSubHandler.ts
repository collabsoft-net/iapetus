import { ACInstanceDTO, ForgeInstanceDTO } from '@collabsoft-net/dto';
import { ACInstance, ForgeInstance } from '@collabsoft-net/entities';
import { AbstractService } from '@collabsoft-net/services';
import { logger } from 'firebase-functions';
import { injectable } from 'inversify';

import { AbstractScheduledPubSubHandler } from './AbstractScheduledPubSubHandler';

@injectable()
export abstract class AbstractScheduledTenantIteratorPubSubHandler<T extends ACInstance|ForgeInstance, X extends ACInstanceDTO|ForgeInstanceDTO> extends AbstractScheduledPubSubHandler {

  constructor(
    protected instanceService: AbstractService<T, X>
  ) {
    super();
  }

  async run(): Promise<void> {
    const { values: instances } = await this.instanceService.findAll();
    for await (const instance of instances) {
      logger.log(`==> Start processing tenant ${instance.clientKey}`, instance);
      await this.startTaskFor(instance);
      logger.log(`==> Finished processing tenant ${instance.clientKey}`, instance);
    }
  }

  protected abstract startTaskFor(instance: ACInstance|ForgeInstance): Promise<void>;

}