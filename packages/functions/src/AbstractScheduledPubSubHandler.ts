import { ScheduledPubSubHandler } from '@collabsoft-net/types';
import { error, log } from 'firebase-functions/lib/logger';
import { injectable } from 'inversify';

@injectable()
export abstract class AbstractScheduledPubSubHandler implements ScheduledPubSubHandler {

  abstract name: string;
  abstract schedule: string;
  timeZone: string = 'utc';

  async process(): Promise<void> {
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