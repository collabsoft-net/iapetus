import { ScheduledPubSubHandler } from '@collabsoft-net/types';
import { logger } from 'firebase-functions';
import { injectable } from 'inversify';

@injectable()
export abstract class AbstractScheduledPubSubHandler implements ScheduledPubSubHandler {

  abstract name: string;
  abstract schedule: string;
  timeZone = 'Etc/UTC';
  timeoutSeconds = 540;

  async process(): Promise<void> {
    const { log, error } = logger;

    try {
      log(`==> Start processing ${this.name}`);
      await this.run();
    } catch (err) {
      error('======================== Event processing failed ========================');
      error(`==> Failed to process ${this.name}`, err);
      error('=========================================================================');
    } finally {
      log(`==> Finished processing ${this.name}`);
    }
  }

  abstract run(): Promise<void>;

}