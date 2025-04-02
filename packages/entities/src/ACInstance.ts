
import { Entity } from '@collabsoft-net/types';

export interface ACInstance extends Entity {
  key: string;
  clientId?: string;
  tenantId?: string;
  clientKey: string;
  sharedSecret: string;
  serverVersion: string;
  pluginsVersion: string;
  baseUrl: string;
  productType: 'jira'|'confluence';
  description: string;
  oauthClientId: string;
  serviceEntitlementNumber: string;
  eventType: 'installed' | 'uninstalled' | 'enabled' | 'disabled';
  active: boolean;
  lastActive: number;
}
