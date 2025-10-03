import { DTO } from '@collabsoft-net/types';


export class TokenExchangeDTO extends DTO {

  appId: string;
  token: string;

  constructor(data: TokenExchangeDTO) {
    super(data.id);
    this.appId = data.appId;
    this.token = data.token;
  }
}