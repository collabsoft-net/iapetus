
import type { WindowWithAP } from './AP';
import { initBridge } from './client/Bridge';
import { PlatformInstance } from './client/Platform';

(window as unknown as WindowWithAP<AP.PlatformInstance>).AP = PlatformInstance;

initBridge()