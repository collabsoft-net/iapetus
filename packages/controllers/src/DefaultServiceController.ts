import { Entity, EntityDTO, Paginated } from '@collabsoft-net/types';
import { StatusCodes } from 'http-status-codes';
import { injectable } from 'inversify';
import { httpDelete, httpGet, httpHead, httpPost, requestBody, requestParam } from 'inversify-express-utils';
import { results } from 'inversify-express-utils';

import { AbstractServiceController } from '.';

@injectable()
export abstract class DefaultServiceController<T extends Entity, X extends EntityDTO<T>, Y extends Record<string, unknown>> extends AbstractServiceController<T, X, Y> {

  protected abstract isAllowed(method: 'create'|'update', item: X): Promise<boolean>;
  protected abstract isAllowed(method: 'headers'|'read', id?: string): Promise<boolean>;
  protected abstract isAllowed(method: 'remove', id: string): Promise<boolean>;

  @httpHead('/:id?')
  async headers(@requestParam('id') id?: string): Promise<results.StatusCodeResult> {
    const isAllowed = await this.isAllowed('headers', id);
    return isAllowed ?  super.headers(id) : this.statusCode(StatusCodes.NOT_FOUND);
  }

  @httpPost('/')
  async create(@requestBody() item: X): Promise<X|results.StatusCodeResult> {
    const isAllowed = await this.isAllowed('create', item);
    return isAllowed ? super.create(item) : this.statusCode(StatusCodes.NOT_FOUND);
  }

  @httpGet('/:id?')
  async read(@requestParam('id') id?: string): Promise<X|results.StatusCodeResult|Paginated<X>> {
    const isAllowed = await this.isAllowed('read', id);
    return isAllowed ? super.read(id) : this.statusCode(StatusCodes.NOT_FOUND);
  }

  @httpPost('/:id')
  async update(@requestParam('id') id: string, @requestBody() item: X): Promise<X|results.StatusCodeResult> {
    const isAllowed = await this.isAllowed('update', item);
    return isAllowed ? super.update(id, item) : this.statusCode(StatusCodes.NOT_FOUND);
  }

  @httpDelete('/:id')
  async remove(@requestParam('id') id: string): Promise<results.StatusCodeResult> {
    const isAllowed = await this.isAllowed('remove', id);
    return isAllowed ? super.remove(id) : this.statusCode(StatusCodes.NOT_FOUND);
  }
}
