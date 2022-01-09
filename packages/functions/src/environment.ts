import { isProduction } from '@collabsoft-net/helpers';
import { load } from '@gdn/envify-nconf';
import * as functions from 'firebase-functions';
import { info } from 'firebase-functions/lib/logger';

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
    if (!isProduction) {
      info(`[Environment] detected variable '${key.toUpperCase()}' from config`);
    }
    process.env[key.toUpperCase()] = value;
  });
}