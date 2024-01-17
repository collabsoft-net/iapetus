
import type { WindowWithAP } from './AP';
import { initBridge } from './client/Bridge';
import { ConfluenceInstance } from './client/Confluence';

(window as unknown as WindowWithAP<AP.ConfluenceInstance>).AP = ConfluenceInstance;

initBridge()