
import type { WindowWithAP } from './AP';
import { BambooInstance } from './client/Bamboo';
import { initBridge } from './client/Bridge';

(window as unknown as WindowWithAP<AP.BambooInstance>).AP = BambooInstance;

initBridge()