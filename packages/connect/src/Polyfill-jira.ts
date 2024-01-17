
import type { WindowWithAP } from './AP';
import { initBridge } from './client/Bridge';
import { JiraInstance } from './client/Jira';

(window as unknown as WindowWithAP<AP.JiraInstance>).AP = JiraInstance;

initBridge();