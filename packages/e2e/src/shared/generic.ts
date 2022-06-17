

import { loginToConfluence } from './confluence';

// Only call this once the test has finished
export const reportResult = async (host: 'jira'|'confluence', username: string, password: string, appKey: string, contextUrl: string, passed: boolean): Promise<void> => {
  try {

    // Open the Get Started page
    if (host === 'confluence') {
      await loginToConfluence(username, password);
    }

    // Navigate to the context URL to get access to AP
    await browser.open(contextUrl);

    // Switch to our iframe to enable submission of test result
    await browser.use(`iframe[id^="${appKey}"]`);

    // eslint-disable-next-line
    // @ts-ignore
    await browser.executeAsync((key: string, passed: boolean, done: () => void) => {
      // eslint-disable-next-line
      // @ts-ignore
      window.AP.request({
          url: `/rest/atlassian-connect/latest/addons-metrics/${key}/publish`,
          type: 'PUT',
          contentType: 'application/json',
          data: JSON.stringify([{
            metricsType: 'SYNTHETIC',
            status: passed ? 'SUCCESS' : 'FAIL'
          }]),
          success: done,
          error: done
      });
    }, appKey, passed);
  } catch (error) {
    console.log(error);
  }
}