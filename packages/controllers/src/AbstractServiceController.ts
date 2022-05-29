import { PageDTO } from '@collabsoft-net/dto';
import { DefaultService, DTO, Entity, Paginated, QueryBuilder } from '@collabsoft-net/types';
import { captureException } from '@sentry/minimal';
import { StatusCodes } from 'http-status-codes';
import { injectable } from 'inversify';
import { requestBody, requestParam } from 'inversify-express-utils';
import { StatusCodeResult } from 'inversify-express-utils/lib/results';

import { AbstractController } from './AbstractController';

@injectable()
export abstract class AbstractServiceController<T extends Entity, X extends DTO, Y extends Session> extends AbstractController<Y> {

  protected abstract service: DefaultService<T, X>;

  async create(@requestBody() item: X): Promise<X|StatusCodeResult> {
    try {
      if (item.id && item.id !== '-1' || !this.service.isValidEntity(item)) throw new Error('IllegalArgumentException');
      const result = await this.service.save(item);
      return this.service.toDTO(result);
    } catch (error) {
      captureException(error);
      return this.statusCode(StatusCodes.BAD_REQUEST);
    }
  }

  async read(@requestParam('id') id?: string): Promise<X|StatusCodeResult|Paginated<X>> {
    if (id) {
      const result = await this.service.findById(id);
      return result ? this.service.toDTO(result) : this.statusCode(StatusCodes.NOT_FOUND);
    } else {
      const { query } = this.httpContext.request;
      if (query && Object.keys(query).length > 0) {
        const result = await this.service.findAllByQuery(qb => {
          let queryBuilder = qb;
          Object.keys(query).forEach((key) => {
            const value = query[key];
            if (value && typeof value === 'string') {
              queryBuilder = this.toQuery(key, value, queryBuilder);
            }
          });
          return queryBuilder;
        });
        return new PageDTO(result.values.map(item => this.service.toDTO(item)));
      } else {
        const result = await this.service.findAll();
        return { ...result, values: result.values.map(item => this.service.toDTO(item)) };
      }
    }
  }

  async update(@requestParam('id') id: string, @requestBody() item: X): Promise<X|StatusCodeResult> {
    try {
      if (!id || item.id !== id || !this.service.isValidEntity(item)) throw new Error('IllegalArgumentException');
      const result = await this.service.save(item);
      return this.service.toDTO(result);
    } catch (error) {
      captureException(error);
      return this.statusCode(StatusCodes.BAD_REQUEST);
    }
  }

  async remove(@requestParam('id') id: string): Promise<StatusCodeResult> {
    try {
      if (!id) return this.statusCode(StatusCodes.BAD_REQUEST);
      await this.service.deleteById(id);
      return this.statusCode(StatusCodes.NO_CONTENT);
    } catch (error) {
      captureException(error);
      return this.statusCode(StatusCodes.BAD_REQUEST);
    }
  }

  protected toQuery(key: string, value: string|number|boolean, query: QueryBuilder): QueryBuilder {
    return this.defaultQuery(key, value, query);
  }

  protected defaultQuery(key: string, value: string|number|boolean, query: QueryBuilder): QueryBuilder {
    return query.where(key, '==', value);
  }
}