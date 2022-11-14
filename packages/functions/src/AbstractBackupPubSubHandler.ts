import { ScheduledPubSubHandler } from '@collabsoft-net/types';
import firestore from '@google-cloud/firestore';
import { AppOptions } from 'firebase-admin';
import { logger } from 'firebase-functions';
import { injectable } from 'inversify';

@injectable()
export abstract class AbstractBackupPubSubHandler implements ScheduledPubSubHandler {

  abstract name: string;
  abstract schedule: string;
  timeZone: string = 'Etc/UTC';

  get options(): AppOptions|undefined {
    if (process.env.FIREBASE_CONFIG) {
      try {
        return JSON.parse(process.env.FIREBASE_CONFIG) as AppOptions;
      } catch (err) {
        return undefined;
      }
    }
    return undefined;
  }

  get projectId(): string|undefined {
    return this.options?.projectId || process.env.FB_PROJECTID || process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
  }

  get bucketName(): string|undefined {
    return this.options?.storageBucket || process.env.FB_STORAGEBUCKET;
  }

  async process(): Promise<void> {
    try {
      logger.info(`==> Start processing ${this.name}`);
      await this.run();
    } catch (err) {
      logger.error('======================== Event processing failed ========================');
      logger.error(`==> Failed to process ${this.name}`, err);
      logger.error('=========================================================================');
    } finally {
      logger.info(`==> Finished processing ${this.name}`);
    }
  }

  async run(): Promise<void> {
    try {
      if (!this.projectId) throw new Error('Failed to determine the project ID. Please make sure that either FB_PROJECTID, GCP_PROJECT or GCLOUD_PROJECT environment variable is set');
      if (!this.bucketName) throw new Error('The required environment variable FB_BACKUPBUCKET is undefined');

      logger.info(`==> Scheduling export of Firestore database for project ${this.projectId}`);
      const exportOperationId = await this.backup(this.projectId, `gs://${this.bucketName}`);
      if (!exportOperationId) throw new Error(`Failed to schedule export Firestore database for project ${this.projectId}`);
      logger.info(`==> Finished scheduling export of Firestore database for project ${this.projectId}. Export operation ID: ${exportOperationId}`);
    } catch (err) {
      logger.error(`==> An error occurred while trying to scheduling export of Firestore database`, err);
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
