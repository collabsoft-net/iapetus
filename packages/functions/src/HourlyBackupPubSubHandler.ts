
import { AbstractBackupPubSubHandler } from '.';

export class HourlyBackupPubSubHandler extends AbstractBackupPubSubHandler {

  schedule = '0 * * * *';
  name = 'HourlyBackupEventHandler';

}
