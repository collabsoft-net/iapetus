import '@collabsoft-net/functions';

import { ACInstanceDTO } from '@collabsoft-net/dto';
import { ACInstance } from '@collabsoft-net/entities';
import { AbstractService } from '@collabsoft-net/services';
import * as express from 'express';
import { injectable } from 'inversify';

import { AbstractCustomStrategy } from './AbstractCustomStrategy';

@injectable()
export abstract class AbstractAtlassianCustomStrategy<T extends Session> extends AbstractCustomStrategy<T> {

  protected abstract get service(): AbstractService<ACInstance, ACInstanceDTO>;

  protected abstract get clientIdentifierKey(): string;

  protected async process(request: express.Request): Promise<T> {
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

  protected abstract toSession(request: express.Request, instance: ACInstance): Promise<T>;

  private async findIdentifier(request: express.Request): Promise<string|null> {
    const { clientId, clientKey, tenantId } = request.query;
    return (
      clientId && typeof clientId === 'string' ? clientId :
      clientKey && typeof clientKey === 'string' ? clientKey :
      tenantId && typeof tenantId === 'string' ? tenantId : null
    );
  }

}
