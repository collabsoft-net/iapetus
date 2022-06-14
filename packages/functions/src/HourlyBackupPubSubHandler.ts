
import { injectable } from 'inversify';

import { AbstractBackupPubSubHandler } from '.';

@injectable()
export class HourlyBackupPubSubHandler extends AbstractBackupPubSubHandler {

  schedule = '0 * * * *';
  name = 'HourlyBackupEventHandler';

}
