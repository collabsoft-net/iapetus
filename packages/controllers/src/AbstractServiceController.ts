import { PageDTO } from '@collabsoft-net/dto';
import { DefaultService, Entity, EntityDTO, Paginated, QueryBuilder } from '@collabsoft-net/types';
import { captureException } from '@sentry/minimal';
import { StatusCodes } from 'http-status-codes';
import { injectable } from 'inversify';

import { AbstractController } from './AbstractController';

@injectable()
export abstract class AbstractServiceController<T extends Entity, X extends EntityDTO<T>, Y extends Record<string, unknown>> extends AbstractController<Y> {

  protected abstract service: DefaultService<T, X>;

  protected async $headers(id?: string): Promise<StatusCodes> {
    if (id) {
      const result = await this.service.findById(id);
      return result ? StatusCodes.OK : StatusCodes.NOT_FOUND;
    } else {
      const { query } = this.httpContext.request;
      if (query && Object.keys(query).length > 0) {
        const result = await this.service.countByQuery(qb => {
          let queryBuilder = qb;
          Object.keys(query).forEach((key) => {
            const value = query[key];
            if (value && typeof value === 'string') {
              queryBuilder = this.toQuery(key as keyof T, value, queryBuilder);
            }
          });
          return queryBuilder;
        });
        this.httpContext.response.setHeader('X-Total-Count', result);
        return StatusCodes.OK;
      } else {
        const result = await this.service.count();
        this.httpContext.response.setHeader('X-Total-Count', result);
        return StatusCodes.OK;
      }
    }
  }

  protected async $create(item: X): Promise<X|StatusCodes> {
    try {
      if (item.id && item.id !== '-1' || !this.service.isValidEntity(item)) throw new Error('IllegalArgumentException');
      const result = await this.service.save(item);
      return this.service.toDTO(result);
    } catch (error) {
      captureException(error);
      return StatusCodes.BAD_REQUEST;
    }
  }

  protected async $read(id?: string): Promise<X|StatusCodes|Paginated<X>> {
    if (id) {
      const result = await this.service.findById(id);
      return result ? this.service.toDTO(result) : StatusCodes.NOT_FOUND;
    } else {
      const { query } = this.httpContext.request;
      if (query && Object.keys(query).length > 0) {
        const result = await this.service.findAllByQuery(qb => {
          let queryBuilder = qb;
          Object.keys(query).forEach((key) => {
            const value = query[key];
            if (value && typeof value === 'string') {
              queryBuilder = this.toQuery(key as keyof T, value, queryBuilder);
            }
          });
          return queryBuilder;
        });
        this.httpContext.response.setHeader('X-Total-Count', result.total);
        return new PageDTO({ ...result, values: result.values.map(item => this.service.toDTO(item)) });
      } else {
        const result = await this.service.findAll();
        this.httpContext.response.setHeader('X-Total-Count', result.total);
        return { ...result, values: result.values.map(item => this.service.toDTO(item)) };
      }
    }
  }

  protected async $update(id: string, item: X): Promise<X|StatusCodes> {
    try {
      if (!id || item.id !== id || !this.service.isValidEntity(item)) throw new Error('IllegalArgumentException');
      const result = await this.service.save(item);
      return this.service.toDTO(result);
    } catch (error) {
      captureException(error);
      return StatusCodes.BAD_REQUEST;
    }
  }

  protected async $remove(id: string): Promise<StatusCodes> {
    try {
      if (!id) return StatusCodes.BAD_REQUEST;
      await this.service.deleteById(id);
      return StatusCodes.NO_CONTENT;
    } catch (error) {
      captureException(error);
      return StatusCodes.BAD_REQUEST;
    }
  }

  protected toQuery(key: keyof T, value: string|number|boolean, query: QueryBuilder<T>): QueryBuilder<T> {
    return this.defaultQuery(key, value, query);
  }

  protected defaultQuery(key: keyof T, value: string|number|boolean, query: QueryBuilder<T>): QueryBuilder<T> {
    return query.where(key, '==', value);
  }
}