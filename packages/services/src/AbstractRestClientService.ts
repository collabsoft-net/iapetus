import { RestClientEndpoints } from '@collabsoft-net/enums';
import { isTypeOf } from '@collabsoft-net/helpers';
import { DTO, Paginated, RestClient, Type } from '@collabsoft-net/types';
import { injectable } from 'inversify';
import { compile } from 'path-to-regexp';

@injectable()
export class AbstractRestClientService {

  constructor(protected client: RestClient, private typeMappings: Map<string, Type<DTO>>) {}

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
  protected getEndpointFor<T extends DTO>(endpoint: RestClientEndpoints|string, type: Type<T>|T): string;
  protected getEndpointFor<T extends DTO>(endpoint: RestClientEndpoints|string, type: Type<T>|T, pathParams: Record<string, unknown>): string;
  protected getEndpointFor<T extends DTO>(endpoint: RestClientEndpoints|string, type?: Type<T>|T, pathParams: Record<string, unknown> = {}): string {
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
