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

  protected async process(request: express.Request): Promise<T> {
    const instance = await this.findInstanceFromRequest(request);
    if (instance) {
      // Only update the lastActive if non-existant or less than 24 hours ago
      if (!instance.lastActive || instance.lastActive < (new Date().getTime() - (24 * 60 * 60 * 1000))) {
        instance.lastActive = new Date().getTime();
        await this.service.save(instance);
      }

      return this.toSession(request, instance);
    } else {
      throw new Error('Customer instance not found');
    }
  }

  protected abstract toSession(request: express.Request, instance: ACInstance): Promise<T>;

  private async findInstanceFromRequest(request: express.Request): Promise<ACInstance|null> {
    const { clientId, clientKey, tenantId } = request.query;
    if (clientId && typeof clientId === 'string') {
      return this.service.findById(clientId) || this.service.findByProperty('clientKey', clientId);
    } else if (clientKey && typeof clientKey === 'string') {
      return this.service.findByProperty('clientKey', clientKey) || this.service.findById(clientKey);
    } else if (tenantId && typeof tenantId === 'string') {
      return this.service.findByProperty('clientKey', tenantId) || this.service.findById(tenantId);
    }
    return null;
  }

}
