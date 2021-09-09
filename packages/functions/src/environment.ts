
let cwd = process.cwd();
if (cwd.indexOf('/functions') >= 0) {
  cwd += cwd.endsWith('/') ? '../../' : '/../../';
}

import { load } from '@gdn/envify-nconf';
load(cwd);

import * as functions from 'firebase-functions';

process.env = Object.assign({}, process.env, functions.config().env || {});
Object.keys(process.env).forEach((key) => { process.env[key.toUpperCase()] = process.env[key] });

if (!process.env.AC_BASEURL) throw new Error('Required environment variable AC_BASEURL is missing');
