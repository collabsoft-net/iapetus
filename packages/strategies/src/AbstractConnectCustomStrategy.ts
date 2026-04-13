import '@collabsoft-net/functions';

import { ConnectInstanceDTO } from '@collabsoft-net/dto';
import { ConnectInstance } from '@collabsoft-net/entities';
import { AbstractService } from '@collabsoft-net/services';
import * as express from 'express';
import { injectable } from 'inversify';

import { AbstractCustomStrategy } from './AbstractCustomStrategy';

@injectable()
export abstract class AbstractAtlassianCustomStrategy<T extends ConnectInstance, X extends ConnectInstanceDTO, Y extends AtlasSession> extends AbstractCustomStrategy<string, Y> {

  protected async process(request: express.Request): Promise<Y> {
    const identifier = this.findIdentifier(request);
    const clientIdentifierKey = this.findIdentifierKey(request);
    if (clientIdentifierKey && identifier) {
      const service = await this.toConnectInstanceService(identifier);
      let instance = await service.findByProperty(clientIdentifierKey, identifier);
      if (instance) {
        instance = this.updateLastActive(instance, request);
        instance = await service.save(instance);
        return this.toSession(request, instance);
      } else {
        throw new Error('Customer instance not found');
      }
    } else {
      throw new Error(`No supported client idenfitier found on request query, expected one of 'clientId', 'clientKey' or 'tenantId'`);
    }
  }

  protected abstract toConnectInstanceService(identifier: string): Promise<AbstractService<T, X>>;
  protected abstract toSession(request: express.Request, instance: T): Promise<Y>;

  private findIdentifierKey(request: express.Request): keyof T|null {
    const { clientId, clientKey, tenantId } = request.query;
    return (
      clientId && typeof clientId === 'string' ? 'clientId' :
      clientKey && typeof clientKey === 'string' ? 'clientKey' :
      tenantId && typeof tenantId === 'string' ? 'tenantId' : null
    );
  }

  private findIdentifier(request: express.Request): string|null {
    const { clientId, clientKey, tenantId } = request.query;
    return (
      clientId && typeof clientId === 'string' ? clientId :
      clientKey && typeof clientKey === 'string' ? clientKey :
      tenantId && typeof tenantId === 'string' ? tenantId : null
    );
  }

  protected updateLastActive(instance: T, request: express.Request): T {
    const { headers } = request;
    if (headers && typeof headers['X-Collabsoft-UpdateLastActive'] === 'string' && headers['X-Collabsoft-UpdateLastActive'] === 'true') {
      // Only update the lastActive if non-existant or less than 24 hours ago
      if (!instance.lastActive || instance.lastActive < (new Date().getTime() - (24 * 60 * 60 * 1000))) {
        instance.lastActive = new Date().getTime();
      }
    }
    return instance;
  }


}
