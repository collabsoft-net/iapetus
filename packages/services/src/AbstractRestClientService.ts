import { RestClientEndpoints } from '@collabsoft-net/enums';
import { isNullOrEmpty, isTypeOf } from '@collabsoft-net/helpers';
import { DTO, Paginated, RestClient, Type } from '@collabsoft-net/types';
import { injectable } from 'inversify';
import { compile } from 'path-to-regexp';

@injectable()
export abstract class AbstractRestClientService {

  constructor(protected client: RestClient, private typeMappings: Map<string, Type<DTO>>) {}

  async count<T extends DTO>(type: Type<T>, params: Record<string, string|number|boolean|undefined> = {}): Promise<number|undefined> {
    const { headers } = await this.client.head<void>(this.getEndpointFor(RestClientEndpoints.LIST, type), params);
    const totalCount = headers['X-Total-Count'] || headers['x-total-count'];
    return totalCount && !isNaN(Number(totalCount)) ? Number(totalCount) : undefined;
  }

  async get<T extends DTO>(type: Type<T>, id: string, params: Record<string, string|number|boolean|undefined> = {}): Promise<T|null> {
    const { data } = await this.client.get<T>(this.getEndpointFor(RestClientEndpoints.READ, type, { id }), params);
    return data ? new type(data) : null;
  }

  async findOne<T extends DTO>(type: Type<T>, params: Record<string, string|number|boolean|undefined> = {}): Promise<T|null> {
    const { data } = await this.client.get<Paginated<T>>(this.getEndpointFor(RestClientEndpoints.READ, type), {...params, limit: 1 });
    const [ result ] = data.values;
    return result ? new type(result) : null;
  }

  async findAll<T extends DTO>(type: Type<T>, params: Record<string, string|number|boolean|undefined> = {}): Promise<Paginated<T>> {
    const { data } = await this.client.get<Paginated<T>>(this.getEndpointFor(RestClientEndpoints.LIST, type), params);
    return { ...data, values: data.values.map(item => new type(item)) };
  }

  async createOrUpdate<T extends DTO>(type: Type<T>, item: T, params: Record<string, string|number|boolean|undefined> = {}): Promise<T> {
    if (item.id === '-1') {
      delete item.id;
    }

    const url = !item.id
      ? this.getEndpointFor(RestClientEndpoints.CREATE, item)
      : this.getEndpointFor(RestClientEndpoints.UPDATE, item, { id: item.id });

    const { data } = await this.client.post<T>(url, item, params);
    return new type(data);
  }

  async remove<T extends DTO>(item: T, params: Record<string, string|number|boolean|undefined> = {}): Promise<void> {
    const url = this.getEndpointFor(RestClientEndpoints.DELETE, item, { id: item.id });
    const { status, statusText } = await this.client.delete(url, undefined, params);
    if (status !== 204) {
      throw new Error(statusText);
    }
  }

  protected getEndpointFor(endpoint: RestClientEndpoints|string): string;
  protected getEndpointFor(endpoint: RestClientEndpoints|string, pathParams: Record<string, string|undefined>): string;
  protected getEndpointFor<T extends DTO>(endpoint: RestClientEndpoints|string, type: Type<T>|T): string;
  protected getEndpointFor<T extends DTO>(endpoint: RestClientEndpoints|string, type: Type<T>|T, pathParams: Record<string, string|undefined>): string;
  protected getEndpointFor<T extends DTO>(endpoint: RestClientEndpoints|string, typeOrpathParams?: Type<T>|T|Record<string, string|undefined>, pathParams?: Record<string, string|undefined>): string {
    const name = this.findNameForType(typeOrpathParams);
    const params = pathParams ? pathParams : isNullOrEmpty(name) ? typeOrpathParams as Record<string, string|undefined> : {};
    const compiler = compile(endpoint);
    return compiler({ name, ...params });
  }

  private findNameForType<T>(type: Type<T>|T) {
    const mappings = this.typeMappings ? Array.from(this.typeMappings) : [];
    return mappings.reduce((name: string|null, [ key, mapping ]) => {
      if (name) return name;
      return isTypeOf(type, mapping) ? key : null;
    }, null);
  }

}
