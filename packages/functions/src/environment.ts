import { isProduction } from '@collabsoft-net/helpers';
import { load } from '@gdn/envify-nconf';
import * as firebase from 'firebase-admin';
import * as functions from 'firebase-functions';
import { logger } from 'firebase-functions';

export const setEnv = (): void => {
  let cwd = process.cwd();
  if (cwd.indexOf('/functions') >= 0) {
    cwd += cwd.endsWith('/') ? '../../' : '/../../';
  }
  load(cwd);

  process.env = { ...process.env, ...(functions.config().env || {}) };

  if (process.env.FIREBASE_CONFIG) {
    const config: Record<string, string> = JSON.parse(process.env.FIREBASE_CONFIG);
    Object.entries(config).forEach(([ key, value ]) => {
      process.env[`FB_${key.toUpperCase()}`] = value;
    });
  }

  Object.entries(process.env).forEach(([ key, value ]) => {
    if (!isProduction()) {
      logger.info(`[Environment] detected variable '${key.toUpperCase()}' from config`);
    }
    process.env[key.toUpperCase()] = value;
  });

  if (!process.env.FIREBASE_CONFIG) {
    if (!process.env.FB_ADMINKEY) throw new Error(`Required environment variable FB_ADMINKEY is undefined`);
    if (!process.env.FB_PROJECTID) throw new Error('Required environment variable FB_PROJECTID is undefined');
    if (!process.env.FB_DATABASEURL) throw new Error('Required environment variable FB_DATABASEURL is undefined');
  }

  if (process.env.FB_ADMINKEY) {
    logger.info('You are running Firebase Cloud Functions using service account credentials');
  }
}

export const getFirebaseAdminOptions = (): firebase.AppOptions|undefined => {
  return !process.env.FIREBASE_CONFIG ? {
    projectId: process.env.FB_PROJECTID,
    storageBucket: process.env.FB_STORAGEBUCKET,
    credential: process.env.FB_ADMINKEY ? firebase.credential.cert(JSON.parse(Buffer.from(process.env.FB_ADMINKEY, 'base64').toString('utf-8'))) : undefined,
  } : undefined;
}