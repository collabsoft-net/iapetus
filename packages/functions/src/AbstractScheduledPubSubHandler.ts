import { ScheduledPubSubHandler } from '@collabsoft-net/types';
import { logger } from 'firebase-functions';
import { injectable } from 'inversify';

@injectable()
export abstract class AbstractScheduledPubSubHandler implements ScheduledPubSubHandler {

  abstract name: string;
  abstract schedule: string;
  timeZone: string = 'Etc/UTC';
  timeoutSeconds = 540;
  #timer?: NodeJS.Timeout;

  async process(): Promise<void> {
    const { log, error } = logger;

    try {
      this.startTimer();
      log(`==> Start processing ${this.name}`);
      await this.run();
    } catch (err) {
      error('======================== Event processing failed ========================');
      error(`==> Failed to process ${this.name}`, err);
      error('=========================================================================');
    } finally {
      this.stopTimer();
      log(`==> Finished processing ${this.name}`);
    }
  }

  abstract run(): Promise<void>;
  protected abstract timeoutImminent(): Promise<void>;

  private startTimer() {
    const seconds = this.timeoutSeconds - 30;
    if (seconds > 0) {
      this.#timer = setTimeout(() => this.timeoutImminent(), seconds * 1000);
    }
  }

  private stopTimer() {
    if (this.#timer) {
      clearTimeout(this.#timer);
      this.#timer = undefined;
    }
  }

}