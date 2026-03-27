import { ACInstance } from './ACInstance';

export interface ForgeInstance extends Partial<ACInstance> {
  id: string;
  salt: string;
  oauthClientId: string;
  installationId: string;
  cloudId?: string;
  apiBaseUrl: string;
  appToken?: string|null;
  userToken?: string|null;
  product: 'jira'|'confluence'|'bitbucket'|'compass';
  isForge?: boolean;
}