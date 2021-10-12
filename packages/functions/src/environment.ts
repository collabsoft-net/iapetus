import { load } from '@gdn/envify-nconf';
import * as functions from 'firebase-functions';
import { info } from 'firebase-functions/lib/logger';

export const setEnv = (): void => {
  let cwd = process.cwd();
  if (cwd.indexOf('/functions') >= 0) {
    cwd += cwd.endsWith('/') ? '../../' : '/../../';
  }
  load(cwd);

  process.env = Object.assign({}, process.env, functions.config().env || {});
  Object.keys(process.env).forEach((key) => {
    info(`[Environment] detected variable '${key.toUpperCase()}' from config`);
    process.env[key.toUpperCase()] = process.env[key];
  });
}