import { ServerRestClient } from '@collabsoft-net/clients';
import { createBridge as createConnectBridge } from '../connect/createBridge';
import { Applications, Modes } from '@collabsoft-net/enums';
import { AbstractRestClientService, BitbucketClientService, ConfluenceClientService, JiraClientService } from '@collabsoft-net/services';
import { getAppUrl } from './getAppUrl';

export const createBridge: Platform.CreateBridge = async <T extends Applications, X extends AbstractRestClientService> (product: T, service: X) => ({

    ...createConnectBridge(product, service),
    platform: Modes.P2,
    isCloud: false,

    client: (product === 'jira'
      ? new JiraClientService(new ServerRestClient(getAppUrl('/', true), { headers: { 'X-Atlassian-Token': 'no-check' } }), Modes.P2)
      : product === 'confluence'
        ? new ConfluenceClientService(new ServerRestClient(getAppUrl('/', true), { headers: { 'X-Atlassian-Token': 'no-check' } }), Modes.P2)
        : new BitbucketClientService(new ServerRestClient(getAppUrl('/', true), { headers: { 'X-Atlassian-Token': 'no-check' } }), Modes.P2)
    ) as Platform.ClientService<T>,

});