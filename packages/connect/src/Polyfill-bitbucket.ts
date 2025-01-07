
import type { WindowWithAP } from './AP';
import { BitbucketInstance } from './client/Bitbucket';
import { initBridge } from './client/Bridge';

(window as unknown as WindowWithAP<AP.BitbucketInstance>).AP = BitbucketInstance;

initBridge()