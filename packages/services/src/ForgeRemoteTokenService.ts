import { TokenExchangeDTO } from '@collabsoft-net/dto';
import { ForgeInstance } from '@collabsoft-net/entities';
import { ForgeRemoteToken } from '@collabsoft-net/types';
import { createHash } from 'crypto';
import jwt from 'jwt-simple';

export class ForgeRemoteTokenService {

  static generate(token: Atlassian.FIT, instance: ForgeInstance) {
    try {
      const ttl = 15 * 60;
      const expires = new Date().getTime() + (ttl * 1000);
      const hash = this.getHash(instance);

      const payload: ForgeRemoteToken = {
        iss: instance.id,
        sub: token.principal || token.context?.accountId as string,
        iat: new Date().getTime(),
        exp: expires,
        appSystemTokenKey: instance.appSystemTokenKey,
        appUserTokenKey: instance.appUserTokenKey
      };

      const result = jwt.encode(payload, hash);

      return new TokenExchangeDTO({
        appId: instance.id,
        token: result,
        expires
      });
    } catch(_ignored) {
      return null
    }
  }

  static getHash(instance: ForgeInstance) {
    if (!instance.id) throw new Error('Unable to create hash for entity that has not been persisted to the database');
    if (!instance.salt) throw new Error('Unable to create hash for entity that is not suitable for encryption ("salt" property is missing)');

    const pepper = createHash('sha256').update(instance.salt).digest('hex');
    const hash = createHash('sha256').update(`${instance.id}-${instance.salt}-${pepper}`).digest('hex');
    return hash;
  }


}