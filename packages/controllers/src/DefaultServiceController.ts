import { DTO, Entity, Paginated } from '@collabsoft-net/types';
import { injectable } from 'inversify';
import { httpDelete, httpGet, httpPost, requestBody, requestParam } from 'inversify-express-utils';
import { StatusCodeResult } from 'inversify-express-utils/lib/results';

import { AbstractServiceController } from '.';

@injectable()
export abstract class DefaultServiceController<T extends Entity, X extends DTO, Y extends Session> extends AbstractServiceController<T, X, Y> {

  @httpPost('/')
  async create(@requestBody() item: X): Promise<X|StatusCodeResult> {
    return super.create(item);
  }

  @httpGet('/:id?')
  async read(@requestParam('id') id?: string): Promise<X|StatusCodeResult|Paginated<X>> {
    return super.read(id);
  }

  @httpPost('/:id')
  async update(@requestParam('id') id: string, @requestBody() item: X): Promise<X|StatusCodeResult> {
    return super.update(id, item);
  }

  @httpDelete('/:id')
  async remove(@requestParam('id') id: string): Promise<StatusCodeResult> {
    return super.remove(id);
  }
}
