import { ACInstanceDTO } from '@collabsoft-net/dto';
import { ACInstance } from '@collabsoft-net/entities';
import { AbstractService } from '@collabsoft-net/services';
import { CustomEvent, EventEmitter, PubSubHandler, TenantAwareEvent } from '@collabsoft-net/types';
import { pubsub } from 'firebase-functions';
import { error, log } from 'firebase-functions/lib/logger';
import { injectable } from 'inversify';

@injectable()
export abstract class AbstractPubSubHandler<T extends TenantAwareEvent, X extends Session> implements PubSubHandler {

  abstract name: string;
  abstract topic: string;
  private _session?: X;

  get session(): X {
    return this._session || {} as X;
  }

  constructor(
    private instanceService: AbstractService<ACInstance, ACInstanceDTO>,
    protected eventEmitter: EventEmitter
  ) {}

  async process(message: pubsub.Message): Promise<void> {
    log(`==> Start processing ${this.name}`);
    try {
      const { name, data } = message.json as CustomEvent<T>;
      if (name !== this.topic) throw new Error(`Event ${name} does not match ${this.topic}, ignoring`);

      const instance = await this.instanceService.findById(data.tenantId) || await this.instanceService.findByProperty('clientId', data.tenantId);
      if (!instance) throw new Error(`Could not process event, cannot find instance for ID ${data.tenantId}`);
      if (!instance.active) throw new Error(`Customer instance ${data.tenantId} not active, skipping PubSub message`);
      this._session = await this.toSession(instance);
      await this.run(data);
    } catch (err) {
      error('======================== Event processing failed ========================');
      error(`==> Failed to process ${this.name}`, err);
      error('=========================================================================');
    } finally {
      log(`==> Finished processing ${this.name}`);
    }
  }

  abstract run(event: T): Promise<void>;

  protected abstract toSession(instance: ACInstance): Promise<X>;

}