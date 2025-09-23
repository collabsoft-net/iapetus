import { ACInstanceDTO } from '@collabsoft-net/dto';
import { ACInstance } from '@collabsoft-net/entities';
import { AbstractService } from '@collabsoft-net/services';
import { StatusCodes } from 'http-status-codes';
import { injectable } from 'inversify';
import { requestBody } from 'inversify-express-utils';
import { results } from 'inversify-express-utils';

import { AbstractController } from './AbstractController';

@injectable()
export abstract class AbstractLifecycleController<T extends ACInstance, X extends ACInstanceDTO, Y extends Record<string, unknown>> extends AbstractController<Y> {

  protected abstract get service(): AbstractService<T, X>;

  async InstallHandler(@requestBody() instance: T|X): Promise<results.StatusCodeResult> {
    await this.createOrUpdate(instance, true);
    return this.statusCode(StatusCodes.NO_CONTENT);
  }

  async UninstallHandler(@requestBody() instance: T|X): Promise<results.StatusCodeResult> {
    await this.createOrUpdate(instance, false);
    return this.statusCode(StatusCodes.NO_CONTENT);
  }

  async EnabledHandler(@requestBody() instance: T|X): Promise<results.StatusCodeResult> {
    await this.createOrUpdate(instance, true);
    return this.statusCode(StatusCodes.NO_CONTENT);
  }

  async DisabledHandler(@requestBody() instance: T|X): Promise<results.StatusCodeResult> {
    await this.createOrUpdate(instance, false);
    return this.statusCode(StatusCodes.NO_CONTENT);
  }

  protected async createOrUpdate(instance: T|X, active: boolean): Promise<void> {
    const current = await this.service.findById(instance.clientKey) || {} as T;
    await this.service.save({ ...current, ...instance, active, lastActive: new Date().getTime() });
  }

}