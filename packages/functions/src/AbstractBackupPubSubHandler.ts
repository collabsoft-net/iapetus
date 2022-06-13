import firestore from '@google-cloud/firestore';
import { error,info } from 'firebase-functions/lib/logger';

import { AbstractScheduledPubSubHandler } from '.';
import { getFirebaseAdminOptions } from './environment';

export abstract class AbstractBackupPubSubHandler extends AbstractScheduledPubSubHandler {

  schedule = '0 * * * *';
  name = 'HourlyBackupEventHandler';

  get projectId(): string|undefined {
    const options = getFirebaseAdminOptions();
    return options?.projectId || process.env.FB_PROJECTID || process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
  }

  get bucketName(): string|undefined {
    const options = getFirebaseAdminOptions();
    return options?.storageBucket;
  }

  async run(): Promise<void> {
    try {
      if (!this.projectId) throw new Error('Failed to determine the project ID. Please make sure that either FB_PROJECTID, GCP_PROJECT or GCLOUD_PROJECT environment variable is set');
      if (!this.bucketName) throw new Error('The required environment variable FB_BACKUPBUCKET is undefined');

      info(`==> Scheduling export of Firestore database for project ${this.projectId}`);
      const exportOperationId = await this.backup(this.projectId, `gs://${this.bucketName}`);
      if (!exportOperationId) throw new Error(`Failed to schedule export Firestore database for project ${this.projectId}`);
      info(`==> Finished scheduling export of Firestore database for project ${this.projectId}. Export operation ID: ${exportOperationId}`);
    } catch (err) {
      error(`==> An error occurred while trying to scheduling export of Firestore database`, err);
    }
  }

  private async backup(projectId: string, outputUriPrefix: string): Promise<string|undefined> {
    const client = new firestore.v1.FirestoreAdminClient();
    const [ response ] = await client.exportDocuments({
      name: client.databasePath(projectId, '(default)'),
      outputUriPrefix,
      collectionIds: []
    });
    return response?.name;
  }

}
