import { ACInstanceDTO } from '@collabsoft-net/dto';
import { ACInstance } from '@collabsoft-net/entities';
import { AbstractService } from '@collabsoft-net/services';
import { decodeSymmetric, SymmetricAlgorithm } from 'atlassian-jwt';
import { injectable } from 'inversify';

import { AbstractBearerStrategy } from './AbstractBearerStrategy';

@injectable()
export abstract class AbstractAtlassianTokenBearerStrategy extends AbstractBearerStrategy {

  protected abstract get service(): AbstractService<ACInstance, ACInstanceDTO>;

  protected async process(token: string): Promise<Session> {
    const { iss, exp } = decodeSymmetric(token, '', SymmetricAlgorithm.HS256, true);

    const now = Math.round(new Date().getTime() / 1000);
    if (exp < now) throw new Error('Session expired');

    const instance = await this.service.findById(iss);
    if (instance) {
      const payload = decodeSymmetric(token, instance.sharedSecret, SymmetricAlgorithm.HS256);
      return this.toSession(payload, instance);
    } else {
      throw new Error('Customer instance not found');
    }
  }

  protected abstract toSession(payload: Atlassian.JWT, instance: ACInstance): Promise<Session>;

}