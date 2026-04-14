import { DTO } from '@collabsoft-net/types';


export class TokenExchangeDTO extends DTO {

  tenantId: string;
  token: string;
  expires: number;

  constructor(data: TokenExchangeDTO) {
    super(data.id);
    this.tenantId = data.tenantId;
    this.token = data.token;
    this.expires = data.expires;
  }
}