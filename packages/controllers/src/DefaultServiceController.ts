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
    const result = isAllowed ? await super.getHeaders(id) : StatusCodes.NOT_FOUND;
    return this.statusCode(result);
  }

  @httpPost('/')
  async create(@requestBody() item: X): Promise<X|results.StatusCodeResult> {
    const isAllowed = await this.isAllowed('create', item);
    const result = isAllowed ? await super.doCreate(item) : StatusCodes.NOT_FOUND;
    return typeof result === 'number' ? this.statusCode(result) : result;
  }

  @httpGet('/:id?')
  async read(@requestParam('id') id?: string): Promise<X|results.StatusCodeResult|Paginated<X>> {
    const isAllowed = await this.isAllowed('read', id);
    const result = isAllowed ? await super.doRead(id) : StatusCodes.NOT_FOUND;
    return typeof result === 'number' ? this.statusCode(result) : result;
  }

  @httpPost('/:id')
  async update(@requestParam('id') id: string, @requestBody() item: X): Promise<X|results.StatusCodeResult> {
    const isAllowed = await this.isAllowed('update', item);
    const result = isAllowed ? await super.doUpdate(id, item) : StatusCodes.NOT_FOUND;
    return typeof result === 'number' ? this.statusCode(result) : result;
  }

  @httpDelete('/:id')
  async remove(@requestParam('id') id: string): Promise<results.StatusCodeResult> {
    const isAllowed = await this.isAllowed('remove', id);
    const result = isAllowed ? await super.doRemove(id) : StatusCodes.NOT_FOUND;
    return this.statusCode(result);
  }
}
