import { RestClient } from '@collabsoft-net/clients';
import { RestClientEndpoints } from '@collabsoft-net/enums';
import { isTypeOf } from '@collabsoft-net/helpers';
import { DTO, Paginated, Type } from '@collabsoft-net/types';
import { CancelTokenSource } from 'axios';
import { compile } from 'path-to-regexp';

export class AbstractRestClientService {

  constructor(private client: RestClient, private typeMappings: Map<string, Type<DTO>>) {}

  get abortController(): CancelTokenSource {
    return this.client.abortController;
  }

  async get<T extends DTO>(type: Type<T>, id: string, params: Record<string, string|number|boolean|undefined> = {}): Promise<T> {
    const { data } = await this.client.get<T>(this.getEndpointFor(RestClientEndpoints.READ, type, { id }), params);
    return new type(data);
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

  async createOrUpdate<T extends DTO>(type: Type<T>, item: T): Promise<T> {
    if (item.id === '-1') {
      delete item.id;
    }

    const url = !item.id
      ? this.getEndpointFor(RestClientEndpoints.CREATE, item)
      : this.getEndpointFor(RestClientEndpoints.UPDATE, item, { id: item.id });

    const { data } = await this.client.post<T>(url, item);
    return new type(data);
  }

  async remove<T extends DTO>(item: T): Promise<void> {
    const url = this.getEndpointFor(RestClientEndpoints.DELETE, item, { id: item.id });
    const { status, statusText } = await this.client.delete(url);
    if (status !== 204) {
      throw new Error(statusText);
    }
  }

  private getEndpointFor(endpoint: RestClientEndpoints): string;
  private getEndpointFor<T extends DTO>(endpoint: RestClientEndpoints, type: Type<T>|T): string;
  private getEndpointFor<T extends DTO>(endpoint: RestClientEndpoints, type: Type<T>|T, pathParams: Record<string, unknown>): string;
  private getEndpointFor<T extends DTO>(endpoint: RestClientEndpoints, type?: Type<T>|T, pathParams: Record<string, unknown> = {}): string {
    let name: string|null = null;

    if (type) {
      this.typeMappings.forEach((item, key) => {
        if (name) return;
        const mappings = Array.isArray(item) ? item : [ item ];
        mappings.forEach(mapping => {
          if (name) return;
          if (isTypeOf(type, mapping)) {
            name = key;
          }
        });
      });

      if (!name) {
        console.error(`Could not resolve type mapping`, type);
        throw new Error('Unsupported REST call');
      }
    }

    const compiler = compile(endpoint);
    return compiler(Object.assign({}, { name }, pathParams));
  }

}
