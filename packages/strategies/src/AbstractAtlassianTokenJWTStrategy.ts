import { ACInstanceDTO } from '@collabsoft-net/dto';
import { ACInstance } from '@collabsoft-net/entities';
import { AbstractService } from '@collabsoft-net/services';
import { decodeSymmetric, SymmetricAlgorithm } from 'atlassian-jwt';
import { injectable } from 'inversify';
import { ExtractJwt, StrategyOptions } from 'passport-jwt';

import { AbstractJWTStrategy } from './AbstractJWTStrategy';

@injectable()
export abstract class AbstractAtlassianTokenJWTStrategy extends AbstractJWTStrategy<Atlassian.JWT> {

  protected abstract get service(): AbstractService<ACInstance, ACInstanceDTO>;

  protected get strategyOptions(): StrategyOptions {
    return {
      secretOrKeyProvider: async (_: Express.Request, rawJwtToken: string, done: (err: Error|null, payload?: string) => void) => {
        try {
          const payload = decodeSymmetric(rawJwtToken, '', SymmetricAlgorithm.HS256, true);
          const instance = await this.service.findById(payload.iss);
          if (!instance) throw new Error('Could not find customer instance, unauthorized access not allowed');
          done(null, instance.sharedSecret);
        } catch (error) {
          done(error as Error);
        }
      },
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('jwt')
    };
  }

  protected async process(payload: Atlassian.JWT): Promise<Session> {
    const { iss } = payload;

    const instance = await this.service.findById(iss);
    if (instance) {
      return this.toSession(payload, instance);
    } else {
      throw new Error('Customer instance not found');
    }
  }

  protected abstract toSession(payload: Atlassian.JWT, instance: ACInstance): Promise<Session>;

}
