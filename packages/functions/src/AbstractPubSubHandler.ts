import { ACInstanceDTO } from '@collabsoft-net/dto';
import { ACInstance } from '@collabsoft-net/entities';
import { AbstractService } from '@collabsoft-net/services';
import { CustomEvent, EventEmitter, PubSubHandler, TenantAwareEvent } from '@collabsoft-net/types';
import { pubsub } from 'firebase-functions';
import { logger } from 'firebase-functions';
import { injectable } from 'inversify';

@injectable()
export abstract class AbstractPubSubHandler<T extends TenantAwareEvent, X extends Session> implements PubSubHandler {

  abstract name: string;
  abstract topic: string;
  timeoutSeconds = 540;
  requireActiveInstance = true;
  #session?: X;
  #timer?: NodeJS.Timeout;

  get session(): X {
    return this.#session || {} as X;
  }

  constructor(
    private instanceService: AbstractService<ACInstance, ACInstanceDTO>,
    protected eventEmitter: EventEmitter
  ) {}

  protected abstract run(event: T): Promise<void>;
  protected abstract toSession(instance: ACInstance): Promise<X>;
  protected abstract timeoutImminent(data: T): Promise<void>;

  async process(message: pubsub.Message): Promise<void> {
    const { log, error } = logger;

    this.startTimer(message);
    log(`==> Start processing ${this.name}`);

    try {
      const { name, data } = message.json as CustomEvent<T>;
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
      this.stopTimer();
    }
  }

  private startTimer(message: pubsub.Message) {
    const seconds = this.timeoutSeconds - 30;
    if (seconds > 0) {
      const { data } = message.json as CustomEvent<T>;
      this.#timer = setTimeout(() => this.timeoutImminent(data), seconds * 1000);
    }
  }

  private stopTimer() {
    if (this.#timer) {
      clearTimeout(this.#timer);
      this.#timer = undefined;
    }
  }

}