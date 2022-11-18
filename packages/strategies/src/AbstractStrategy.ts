import '@collabsoft-net/functions';

import { ACInstanceDTO } from '@collabsoft-net/dto';
import { ACInstance } from '@collabsoft-net/entities';
import { AbstractService } from '@collabsoft-net/services';
import * as express from 'express';
import { injectable } from 'inversify';

@injectable()
export abstract class AbstractStrategy<T, X extends Session> {

  protected abstract get service(): AbstractService<ACInstance, ACInstanceDTO>;

  protected abstract process(request: express.Request): Promise<X>;
  protected abstract process(request: express.Request, token?: T): Promise<X>;

  next(_req: express.Request, _res: express.Response, next: express.NextFunction): void {
    next();
  }

  protected async updateLastActive(instance: ACInstance, { headers }: express.Request) {
    if (headers && typeof headers['X-Collabsoft-UpdateLastActive'] === 'string' && headers['X-Collabsoft-UpdateLastActive'] === 'true') {
      // Only update the lastActive if non-existant or less than 24 hours ago
      if (!instance.lastActive || instance.lastActive < (new Date().getTime() - (24 * 60 * 60 * 1000))) {
        instance.lastActive = new Date().getTime();
        await this.service.save(instance);
      }
    }
  }

}
