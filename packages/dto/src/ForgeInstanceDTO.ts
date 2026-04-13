
import { ConnectInstance, ForgeInstance } from '@collabsoft-net/entities';
import { isOfType } from '@collabsoft-net/helpers';

import { ConnectInstanceDTO } from './ConnectInstanceDTO';

export class ForgeInstanceDTO extends ConnectInstanceDTO implements Omit<ForgeInstance, 'id'> {

  salt: string;
  oauthClientId: string;
  installationId: string;
  cloudId?: string;
  apiBaseUrl: string;
  appToken?: string|null;
  userToken?: string|null;
  product: 'jira'|'confluence'|'bitbucket'|'compass';

  constructor(data: ForgeInstance|ForgeInstanceDTO) {
    super(data as ConnectInstance);
    this.salt = data.salt;
    this.oauthClientId = data.oauthClientId;
    this.installationId = data.installationId;
    this.cloudId = data.cloudId;
    this.apiBaseUrl = data.apiBaseUrl;
    this.appToken = isOfType(data, 'appToken') ? data.appToken : undefined;
    this.userToken = isOfType(data, 'userToken') ? data.userToken : undefined;
    this.product = data.product;
  }

}
