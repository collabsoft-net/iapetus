import { ACInstanceDTO } from '@collabsoft-net/dto';
import { ACInstance } from '@collabsoft-net/entities';
import { AbstractService } from '@collabsoft-net/services';
import { StatusCodes } from 'http-status-codes';
import { injectable } from 'inversify';
import { requestBody } from 'inversify-express-utils';
import { StatusCodeResult } from 'inversify-express-utils/dts/results';

import { AbstractController } from './AbstractController';

@injectable()
export abstract class AbstractLifecycleController<T extends Session> extends AbstractController<T> {

  protected abstract get service(): AbstractService<ACInstance, ACInstanceDTO>;

  async InstallHandler(@requestBody() instance: ACInstance): Promise<StatusCodeResult> {
    await this.createOrUpdate(instance, true);
    return this.statusCode(StatusCodes.NO_CONTENT);
  }

  async UninstallHandler(@requestBody() instance: ACInstance): Promise<StatusCodeResult> {
    await this.createOrUpdate(instance, false);
    return this.statusCode(StatusCodes.NO_CONTENT);
  }

  async EnabledHandler(@requestBody() instance: ACInstance): Promise<StatusCodeResult> {
    await this.createOrUpdate(instance, true);
    return this.statusCode(StatusCodes.NO_CONTENT);
  }

  async DisabledHandler(@requestBody() instance: ACInstance): Promise<StatusCodeResult> {
    await this.createOrUpdate(instance, false);
    return this.statusCode(StatusCodes.NO_CONTENT);
  }

  protected async createOrUpdate(instance: ACInstance, active: boolean): Promise<void> {
    const current = await this.service.findById(instance.clientKey) || {};
    await this.service.save({ ...current, ...instance,  active });
  }

}