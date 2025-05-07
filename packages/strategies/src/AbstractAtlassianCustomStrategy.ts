import '@collabsoft-net/functions';

import { ACInstanceDTO } from '@collabsoft-net/dto';
import { ACInstance } from '@collabsoft-net/entities';
import { AbstractService } from '@collabsoft-net/services';
import * as express from 'express';
import { injectable } from 'inversify';

import { AbstractCustomStrategy } from './AbstractCustomStrategy';

@injectable()
export abstract class AbstractAtlassianCustomStrategy<T extends ACInstance, X extends ACInstanceDTO, Y extends Session> extends AbstractCustomStrategy<T, X, Y> {

  protected abstract get service(): AbstractService<T, X>;

  protected abstract get clientIdentifierKey(): 'clientId'|'clientKey'|'tenantId';

  protected async process(request: express.Request): Promise<Y> {
    const identifier = await this.findIdentifier(request);
    if (identifier) {
      const instance = await this.service.findByProperty(this.clientIdentifierKey, identifier);
      if (instance) {
        await this.updateLastActive(instance, request);
        return this.toSession(request, instance);
      } else {
        throw new Error('Customer instance not found');
      }
    } else {
      throw new Error(`No supported client idenfitier found on request query, expected one of 'clientId', 'clientKey' or 'tenantId'`);
    }
  }

  protected abstract toSession(request: express.Request, instance: T): Promise<Y>;

  private async findIdentifier(request: express.Request): Promise<string|null> {
    const { clientId, clientKey, tenantId } = request.query;
    return (
      clientId && typeof clientId === 'string' ? clientId :
      clientKey && typeof clientKey === 'string' ? clientKey :
      tenantId && typeof tenantId === 'string' ? tenantId : null
    );
  }

}
