
import { injectable } from 'inversify';

import { AbstractBackupPubSubHandler } from '.';

@injectable()
export class HourlyBackupPubSubHandler extends AbstractBackupPubSubHandler {

  name = 'HourlyBackupEventHandler';

  constructor(public schedule: string = '0 * * * *') {
    super();
  }

}
