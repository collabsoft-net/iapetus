
import { PlatformInstance } from './Platform'

/***********************************************************************
 *
 * AP (Bitbucket)
 * This is the Bitbucket specific implemenentation of AP
 *
 *********************************************************************** */
export const BitbucketInstance: AP.BitbucketInstance = {

  ...PlatformInstance,

  bitbucket: {
    name: 'bitbucket'
  },

  require: <T>(name: string, callback: (result: T) => void) => {
    const result = (BitbucketInstance as unknown as Record<string, unknown>)[name];
    callback(result as T);
  }

}