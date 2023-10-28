import { ACInstanceDTO } from '@collabsoft-net/dto';
import { ACInstance } from '@collabsoft-net/entities';
import { AbstractService } from '@collabsoft-net/services';
import { CustomEvent, EventEmitter, PubSubHandler, TenantAwareEvent } from '@collabsoft-net/types';
import { logger } from 'firebase-functions';
import { CloudEvent } from 'firebase-functions/v2';
import { MessagePublishedData } from 'firebase-functions/v2/pubsub';
import { injectable } from 'inversify';

@injectable()
export abstract class AbstractPubSubHandler<T extends TenantAwareEvent, X extends Session> implements PubSubHandler<T> {

  abstract name: string;
  abstract topic: string;
  timeoutSeconds = 540;
  requireActiveInstance = true;
  #session?: X;

  get session(): X {
    return this.#session || {} as X;
  }

  constructor(
    private instanceService: AbstractService<ACInstance, ACInstanceDTO>,
    protected eventEmitter: EventEmitter
  ) {}

  protected abstract run(event: T): Promise<void>;
  protected abstract toSession(instance: ACInstance): Promise<X>;

  async process(event: CloudEvent<MessagePublishedData<CustomEvent<T>>>): Promise<void> {
    const { log, error } = logger;

    log(`==> Start processing ${this.name}`);

    try {
      const { name, data } = event.data.message.json;
      if (name !== this.topic) throw new Error(`Event ${name} does not match ${this.topic}, ignoring`);

      const instance = await this.instanceService.findById(data.tenantId) || await this.instanceService.findByProperty('clientId', data.tenantId);
      if (!instance) throw new Error(`Could not process event, cannot find instance for ID ${data.tenantId}`);
      if (this.requireActiveInstance && !instance.active) throw new Error(`Customer instance ${data.tenantId} not active, skipping PubSub message`);
      this.#session = await this.toSession(instance);
      await this.run(data);
    } catch (err) {
      error('======================== Event processing failed ========================');
      error(`==> Failed to process ${this.name}`, err);
      error('=========================================================================');
    } finally {
      log(`==> Finished processing ${this.name}`);
    }
  }

}