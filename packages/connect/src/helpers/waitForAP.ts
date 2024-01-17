import { WindowWithAP } from '../AP';

const windowWithAP = window as unknown as WindowWithAP;

export const waitForAP = async <T extends AP.JiraInstance|AP.ConfluenceInstance> (): Promise<T> => {
  let count = 0;
  while (!windowWithAP.AP || count > 10) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    count++;
  }
  if (!windowWithAP.AP) {
    throw new Error('Atlassian Javascript API (AP) is not available, please verify if you have added a reference to `all.js`');
  }
  return { ...windowWithAP.AP } as T;
};
