
import { ACInstance } from '@collabsoft-net/entities';
import { DTO } from '@collabsoft-net/types';

export class ACInstanceDTO extends DTO implements Omit<ACInstance, 'id'> {

  key: string;
  clientKey: string;
  sharedSecret: string;
  serverVersion: string;
  pluginsVersion: string;
  baseUrl: string;
  productType: 'jira'|'confluence';
  description: string;
  serviceEntitlementNumber: string;
  eventType: 'installed' | 'uninstalled' | 'enabled' | 'disabled';
  oauthClientId: string;
  lastActive: number;

  constructor(data: ACInstance|ACInstanceDTO) {
    super(data.id);
    this.key = data.key;
    this.clientKey = data.clientKey;
    this.sharedSecret = data.sharedSecret;
    this.serverVersion = data.serverVersion;
    this.pluginsVersion = data.pluginsVersion;
    this.baseUrl = data.baseUrl;
    this.productType = data.productType;
    this.description = data.description;
    this.serviceEntitlementNumber = data.serviceEntitlementNumber;
    this.eventType = data.eventType;
    this.oauthClientId = data.oauthClientId;
    this.lastActive = data.lastActive;
  }

}
