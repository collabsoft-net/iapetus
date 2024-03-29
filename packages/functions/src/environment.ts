import { isNullOrEmpty, isProduction } from '@collabsoft-net/helpers';
import { load } from '@gdn/envify-nconf';
import * as firebase from 'firebase-admin';
import { logger } from 'firebase-functions';
import { defineSecret, defineString } from 'firebase-functions/params';

export const setEnv = (params: Array<string> = [], secrets: Array<string> = []): void => {
  let cwd = process.cwd();
  if (cwd.indexOf('/functions') >= 0) {
    cwd += cwd.endsWith('/') ? '../../' : '/../../';
  }
  load(cwd);

  if (process.env.FIREBASE_CONFIG) {
    const config: Record<string, string> = JSON.parse(process.env.FIREBASE_CONFIG);
    Object.entries(config).forEach(([ key, value ]) => {
      process.env[`FB_${key.toUpperCase()}`] = value;
    });
  }

  params.forEach(key => {
    const param = defineString(key, { default: '' });
    const value = param.value();
    if (!isNullOrEmpty(value)) {
      process.env[key] = value;
    }
  });

  secrets.forEach(key => {
    try {
      const secret = defineSecret(key);
      const value = secret.value();
      if (!isNullOrEmpty(value)) {
        process.env[key] = value;
      }
    } catch(ignored) {
      // Ignore this error
    }
  });

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