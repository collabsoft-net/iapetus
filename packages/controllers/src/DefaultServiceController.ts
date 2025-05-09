import { Entity, EntityDTO, Paginated } from '@collabsoft-net/types';
import { injectable } from 'inversify';
import { httpDelete, httpGet, httpHead, httpPost, requestBody, requestParam } from 'inversify-express-utils';
import { results } from 'inversify-express-utils';

import { AbstractServiceController } from '.';

@injectable()
export abstract class DefaultServiceController<T extends Entity, X extends EntityDTO<T>, Y extends Session> extends AbstractServiceController<T, X, Y> {

  @httpPost('/')
  async create(@requestBody() item: X): Promise<X|results.StatusCodeResult> {
    return super.create(item);
  }

  @httpHead('/:id?')
  async headers(@requestParam('id') id?: string): Promise<results.StatusCodeResult> {
    return super.headers(id);
  }

  @httpGet('/:id?')
  async read(@requestParam('id') id?: string): Promise<X|results.StatusCodeResult|Paginated<X>> {
    return super.read(id);
  }

  @httpPost('/:id')
  async update(@requestParam('id') id: string, @requestBody() item: X): Promise<X|results.StatusCodeResult> {
    return super.update(id, item);
  }

  @httpDelete('/:id')
  async remove(@requestParam('id') id: string): Promise<results.StatusCodeResult> {
    return super.remove(id);
  }
}
