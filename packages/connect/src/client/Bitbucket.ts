
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
  }

}