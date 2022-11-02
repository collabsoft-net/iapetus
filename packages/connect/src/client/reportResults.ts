import { waitForAP } from './waitForAP';

export const reportResults = (key: string, type: 'IFRAME'|'SYNTHETIC', status: 'SUCCESS'|'FAIL', callback: () => void = () => {}) => {
  // Report iframe loading back to Atlassian
  waitForAP()
    .then(({ request }) => request({
      url: `/rest/atlassian-connect/latest/addons-metrics/${key}/publish`,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify([{
        metricsType: type,
        status
      }]),
      success: callback,
      error: callback
    })).catch(() => {});
}
