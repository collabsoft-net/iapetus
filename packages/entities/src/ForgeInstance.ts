import { ConnectInstance } from './ConnectInstance';

export interface ForgeInstance extends Partial<ConnectInstance> {
  id: string;
  salt: string;
  oauthClientId: string;
  installationId: string;
  cloudId?: string;
  apiBaseUrl: string;
  appSystemTokenKey?: string;
  appUserTokenKey?: string;
  product: 'jira'|'confluence'|'bitbucket'|'compass';
  isForge?: boolean;
}