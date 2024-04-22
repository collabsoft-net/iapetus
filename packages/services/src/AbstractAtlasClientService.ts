import { AbstractAtlasRestClient } from '@collabsoft-net/clients';
import { ConfluenceCloudEndpoints, ConfluenceServerEndpoints,JiraCloudEndpoints, JiraServerEndpoints, Modes } from '@collabsoft-net/enums';
import { isOfType } from '@collabsoft-net/helpers';
import { RestClient } from '@collabsoft-net/types';
import { StatusCodes } from 'http-status-codes';
import { injectable } from 'inversify';
import { compile } from 'path-to-regexp';

import type { ConfluenceClientService } from './ConfluenceClientService';
import type { JiraClientService } from './JiraClientService';

@injectable()
export abstract class AbstractAtlasClientService {

  protected endpoints: Record<string, string>;

  constructor(protected client: RestClient, protected mode: Modes) {
    this.endpoints = mode === Modes.CONNECT ? {...ConfluenceCloudEndpoints, ...JiraCloudEndpoints} : {...ConfluenceServerEndpoints, ...JiraServerEndpoints};
  }

  abstract cached(duration: number): AbstractAtlasClientService;

  as(accountId: string, oauthClientId: string, sharedSecret: string): AbstractAtlasClientService {
    if (isOfType<AbstractAtlasRestClient>(this.client, 'as')) {
      const impersonatedClient = this.client.as(accountId, oauthClientId, sharedSecret);
      return this.getInstance(impersonatedClient, this.mode);
    } else {
      throw new Error('The provided REST client implementation does not support impersonation');
    }
  }

  async getApp(appKey: string): Promise<UPM.App> {
    const { data } = await this.client.get<UPM.App>(this.getEndpointFor(this.endpoints.APP, { appKey }));
    return data;
  }

  async getEntityProperty<T>(entityType: Jira.EntityType|Confluence.EntityType, entityId: string, propertyKey: string): Promise<Atlassian.Connect.EntityProperty<T>|null> {
    if (isOfType<JiraClientService>(this, 'getIssue')) {
      switch (entityType) {
        case 'app': return this.getAppProperty(entityId, propertyKey);
        case 'user': return this.getUserProperty(entityId, propertyKey);
        case 'project': return this.getProjectProperty(entityId, propertyKey);
        case 'issue': return this.getIssueProperty(entityId, propertyKey);
        case 'comment': return this.getCommentProperty(entityId, propertyKey);
      }
    } else if (isOfType<ConfluenceClientService>(this, 'getContent')) {
      switch (entityType) {
        case 'app': return this.getAppProperty(entityId, propertyKey);
        case 'user': return this.getUserProperty(entityId, propertyKey);
        case 'space': return this.getSpaceProperty(entityId, propertyKey);
        case 'content': return this.getContentProperty(entityId, propertyKey);
      }
    } else {
      throw new Error('Entity properties are not supported on this service implementation');
    }
    return null;
  }

  async getAppProperty<T>(addonKey: string, propertyKey: string): Promise<Atlassian.Connect.EntityProperty<T>|null> {
    try {
      const { data, status } = await this.client.get<Atlassian.Connect.EntityProperty<T>>(this.getEndpointFor(this.endpoints.APP_PROPERTY_BY_KEY, { addonKey, propertyKey }));
      return status === StatusCodes.OK ? data : null;
    } catch (error) {
      return null;
    }
  }

  async getUserProperty<T>(userKeyOrAccountId: string, propertyKey: string): Promise<Atlassian.Connect.EntityProperty<T>|null> {
    try {
      const userKeyOrAccountIdParam = this.mode === Modes.P2 ? 'userKey' : 'accountId';
      const params = { [userKeyOrAccountIdParam]: userKeyOrAccountId };

      const { data, status } = await this.client.get<Atlassian.Connect.EntityProperty<T>>(this.getEndpointFor(this.endpoints.USER_PROPERTY_BY_KEY, { propertyKey }), params);
      return status === StatusCodes.OK ? data : null;
    } catch (error) {
      return null;
    }
  }

  async setEntityProperty<T>(entityType: Jira.EntityType|Confluence.EntityType, entityId: string, property: Atlassian.Connect.EntityProperty<T>): Promise<void> {
    if (isOfType<JiraClientService>(this, 'getIssue')) {
      switch (entityType) {
        case 'app': return this.setAppProperty(entityId, property);
        case 'user': return this.setUserProperty(entityId, property);
        case 'project': return this.setProjectProperty(entityId, property);
        case 'issue': return this.setIssueProperty(entityId, property);
        case 'comment': return this.setCommentProperty(entityId, property);
      }
    } else if (isOfType<ConfluenceClientService>(this, 'getContent')) {
      switch (entityType) {
        case 'app': return this.setAppProperty(entityId, property);
        case 'user': return this.setUserProperty(entityId, property);
        case 'space': return this.setSpaceProperty(entityId, property);
        case 'content': return this.setContentProperty(entityId, property);
      }
    } else {
      throw new Error('Entity properties are not supported on this service implementation');
    }
  }

  async setAppProperty<T>(addonKey: string, property: Atlassian.Connect.EntityProperty<T>): Promise<void> {
    const { status, statusText } = await this.client.put(this.getEndpointFor(this.endpoints.APP_PROPERTY_BY_KEY, { addonKey, propertyKey: property.key }), property.value, undefined, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (status !== StatusCodes.OK && status !== StatusCodes.CREATED) {
      throw new Error(statusText);
    }
  }

  async setUserProperty<T>(userKeyOrAccountId: string, property: Atlassian.Connect.EntityProperty<T>): Promise<void> {
    const userKeyOrAccountIdParam = this.mode === Modes.P2 ? 'userKey' : 'accountId';
    const params = { [userKeyOrAccountIdParam]: userKeyOrAccountId };

    const { status, statusText } = await this.client.put(this.getEndpointFor(this.endpoints.USER_PROPERTY_BY_KEY, { propertyKey: property.key }), property.value, params, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (status !== StatusCodes.OK && status !== StatusCodes.CREATED) {
      throw new Error(statusText);
    }
  }

  async deleteAppProperty(addonKey: string, propertyKey: string): Promise<void> {
    const { status, statusText } = await this.client.delete(this.getEndpointFor(this.endpoints.APP_PROPERTY_BY_KEY, { addonKey, propertyKey }));
    if (status !== StatusCodes.NO_CONTENT) {
      throw new Error(statusText);
    }
  }

  async deleteUserProperty(userKeyOrAccountId: string, propertyKey: string): Promise<void> {
    const userKeyOrAccountIdParam = this.mode === Modes.P2 ? 'userKey' : 'accountId';
    const params = { [userKeyOrAccountIdParam]: userKeyOrAccountId };

    const { status, statusText } = await this.client.delete(this.getEndpointFor(this.endpoints.USER_PROPERTY_BY_KEY, { propertyKey }), params);
    if (status !== StatusCodes.NO_CONTENT) {
      throw new Error(statusText);
    }
  }

  abstract listDynamicModules(): Promise<unknown>;
  abstract registerDynamicModule(dynamicModules: unknown): Promise<void>;

  async unregisterDynamicModule(moduleKey: string): Promise<void> {
    await this.client.delete(this.endpoints.UNREGISTER_DYNAMIC_MODULE, undefined, { moduleKey });
  }

  protected getEndpointFor(endpoint: string, pathParams: Record<string, unknown> = {}): string {
    const compiler = compile(endpoint);
    return compiler(pathParams);
  }

  protected abstract getInstance(client: RestClient, mode: Modes): AbstractAtlasClientService;

}
