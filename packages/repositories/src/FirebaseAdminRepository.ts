import { MemoryEmitter } from '@collabsoft-net/emitters';
import { Entity, Event, EventListener, Paginated, QueryBuilder,QueryOptions, Repository, StorageProvider } from '@collabsoft-net/types';
import axios from 'axios';
import { app, AppOptions, auth, firestore, initializeApp } from 'firebase-admin';
import { getFunctions,TaskOptions } from 'firebase-admin/functions';
import uniqid from 'uniqid';

import { FirebaseAdminStorageProvider } from './FirebaseAdminStorageProvider';
import { QueryBuilder as QB } from './QueryBuilder';

export class FirebaseAdminRepository implements Repository {

  private fb: app.App;
  private firestore: firestore.Firestore;
  private storageProvider: StorageProvider;
  private emitter: MemoryEmitter = new MemoryEmitter();

  constructor(protected name: string, options?: AppOptions, protected readOnly?: boolean) {
    this.fb = initializeApp(options, name);

    this.firestore = this.fb.firestore();
    this.storageProvider = new FirebaseAdminStorageProvider(this.fb);
    this.readOnly = readOnly;
  }

  async on(event: typeof Event|string, listener: EventListener): Promise<void> {
    return this.emitter.on(event, listener);
  }

  async emit(event: Event): Promise<void> {
    return this.emitter.emit(event);
  }

  async close(): Promise<void> {
    await this.fb.delete();
  }

  get storage(): StorageProvider {
    return this.storageProvider;
  }

  // ==========================================================================

  async isAuthenticated(): Promise<boolean> {
    throw new Error('This feature is not supported in "admin" mode');
  }

  async authenticate(): Promise<boolean> {
    return Promise.reject('This feature is not supported in "admin" mode');
  }

  async verifyIdToken(token: string): Promise<auth.DecodedIdToken> {
    return await this.fb.auth().verifyIdToken(token);
  }

  async createCustomToken(uid: string): Promise<string> {
    return this.fb.auth().createCustomToken(uid);
  }

  async signOut(): Promise<void> {
    return Promise.reject('This feature is not supported in "admin" mode');
  }

  async enqueue<T>(task: string, data: T, options?: TaskOptions) {
    if (process.env.FUNCTIONS_EMULATOR === 'true') {
      const projectId = process.env.GCLOUD_PROJECT;
      const baseUrl = process.env.FUNCTIONS_EMULATOR_HOST;
      if (projectId && baseUrl) {
        await axios.post(`${baseUrl}/${projectId}/us-central1/${task}`, { data });
      } else {
        throw new Error('Required environment variables GCLOUD_PROJECT and/or FUNCTIONS_EMULATOR_HOST are missing or invalid');
      }
    } else {
      const queue = getFunctions(this.fb).taskQueue<T>(task);
      if (queue) {
        await queue.enqueue(data, options);
      } else {
        throw new Error(`Could not find task queue associated with ${task}`);
      }
    }
  }

  async count(options: FirebaseAdminQueryOptions = { path: '/' }): Promise<number> {
    await this.validateQueryOptions(options);

    if (options.path.split('/').length % 2 === 1) {
      throw new Error('You can only use count for collections, not individual documents');
    } else {
      const ref = await this.firestore.collection(options.path).count().get();
      return ref.data().count;
    }
  }

  async countByQuery(qb: QueryBuilder, options: FirebaseAdminQueryOptions): Promise<number>;
  async countByQuery(qb: (qb: QueryBuilder) => QueryBuilder, options: FirebaseAdminQueryOptions): Promise<number>;
  async countByQuery(qb: unknown, options: FirebaseAdminQueryOptions = { path: '/' }): Promise<number> {
    await this.validateQueryOptions(options);

    if (options.path.split('/').length % 2 === 1) {
      throw new Error('You can only use count for collections, not individual documents');
    }

    let collection: firestore.Query = this.firestore.collection(options.path);
    const queryBuilder: QueryBuilder = typeof qb === 'function' ? qb(new QB()) : qb;

    queryBuilder.conditions.forEach((condition) => {
      if (condition.key === 'orderBy') {
        collection = collection.orderBy(condition.value as string, condition.operator as 'asc' | 'desc' | undefined);
      } else if (condition.key === 'limit') {
        collection = collection.limit(condition.value as number);
      } else if (condition.key === 'offset') {
        collection = collection.startAfter(condition.value);
      } else if (!condition.value) {
        // Skip empty filter statement
      } else {
        collection = collection.where(condition.key, <FirebaseFirestore.WhereFilterOp>condition.operator, condition.value);
      }
    });

    const ref = await collection.count().get();
    return ref.data().count;
  }

  async findById<T extends Entity>(id: string, options: FirebaseAdminQueryOptions = { path: '/' }): Promise<T|null> {
    const ref = await this.firestore.doc(`${options.path}/${id}`).get();
    return ref ? <T>ref.data() : null;
  }

  async findByProperty<T extends Entity>(key: string, value: string|number|boolean, options: FirebaseAdminQueryOptions = { path: '/' }): Promise<T|null> {
    await this.validateQueryOptions(options);
    return this.findByQuery(qb => qb.where(key, '==', value), options);
  }

  async findByQuery<T extends Entity>(qb: QueryBuilder, options: FirebaseAdminQueryOptions): Promise<T|null>;
  async findByQuery<T extends Entity>(qb: (qb: QueryBuilder) => QueryBuilder, options: FirebaseAdminQueryOptions): Promise<T|null>;
  async findByQuery<T extends Entity>(qb: QueryBuilder|((qb: QueryBuilder) => QueryBuilder), options: FirebaseAdminQueryOptions = { path: '/' }): Promise<T|null> {
    await this.validateQueryOptions(options);

    const queryBuilder = typeof qb === 'function' ? qb(new QB()) : qb;
    const { values } = await this.findAllByQuery<T>(queryBuilder.limit(1), options);
    return values[0];
  }

  async findAll<T extends Entity>(options: FirebaseAdminQueryOptions = { path: '/' }): Promise<Paginated<T>> {
    await this.validateQueryOptions(options);

    let total = 0;

    const result: Array<T> = [];
    if (options.path.split('/').length % 2 === 1) {
      const ref = await this.firestore.doc(options.path).get();
      if (ref) {
        result.push(<T>ref.data());
        total = 1;
      }
    } else {
      const docRef = await this.firestore.collection(options.path).get();
      docRef.forEach((document) => result.push(<T>document.data()));

      const countRef = await this.firestore.collection(options.path).count().get();
      total = countRef.data().count;
    }

    return {
      start: 0,
      size: result.length,
      total,
      values: result,
      last: true
    };
  }

  async findAllByProperty<T extends Entity>(key: string, value: string|number|boolean, options: FirebaseAdminQueryOptions = { path: '/' }): Promise<Paginated<T>> {
    await this.validateQueryOptions(options);
    return this.findAllByQuery((ref) => ref.where(key, '==', value), options);
  }

  async findAllByQuery<T extends Entity>(qb: QueryBuilder, options: FirebaseAdminQueryOptions): Promise<Paginated<T>>;
  async findAllByQuery<T extends Entity>(qb: (qb: QueryBuilder) => QueryBuilder, options: FirebaseAdminQueryOptions): Promise<Paginated<T>>;
  async findAllByQuery<T extends Entity>(qb: unknown, options: FirebaseAdminQueryOptions = { path: '/' }): Promise<Paginated<T>> {
    await this.validateQueryOptions(options);

    if (options.path.split('/').length % 2 === 1) {
      throw new Error('You can only search within collections, not individual documents');
    }

    let collection: firestore.Query = this.firestore.collection(options.path);
    const queryBuilder: QueryBuilder = typeof qb === 'function' ? qb(new QB()) : qb;

    queryBuilder.conditions.forEach((condition) => {
      if (condition.key === 'orderBy') {
        collection = collection.orderBy(condition.value as string, condition.operator as 'asc' | 'desc' | undefined);
      } else if (condition.key === 'limit') {
        collection = collection.limit(condition.value as number);
      } else if (condition.key === 'offset') {
        collection = collection.startAfter(condition.value);
      } else if (!condition.value) {
        // Skip empty filter statement
      } else {
        collection = collection.where(condition.key, <FirebaseFirestore.WhereFilterOp>condition.operator, condition.value);
      }
    });

    const result: Array<T> = [];
    const docRef = await collection.get();
    docRef.forEach((document) => result.push(<T>document.data()));

    const total = await this.countByQuery({ ...queryBuilder, conditions: queryBuilder.conditions.filter(item => item.key !== 'limit' && item.key !== 'offset') }, options);

    return {
      start: 0,
      size: result.length,
      total,
      values: result,
      last: true
    };
  }

  async saveAll<T extends Entity>(entities: Array<T>, options: FirebaseAdminQueryOptions = { path: '/' }): Promise<Array<T>> {
    if (this.readOnly) throw new Error('The repository has been initialized in read-only mode, mutations are not allowed');
    await this.validateQueryOptions(options);
    return Promise.all(entities.map(entity => this.save(entity, options)));
  }

  async save<T extends Entity>(entity: T, options: FirebaseAdminQueryOptions = { path: '/' }): Promise<T> {
    if (this.readOnly) throw new Error('The repository has been initialized in read-only mode, mutations are not allowed');
    entity.id = entity.id || uniqid();
    await this.validateQueryOptions(options);

    // Make sure to remove undefined properties
    const fbObject = this.objectify(entity);
    await this.firestore.doc(`${options.path}/${entity.id}`).set(fbObject);
    return entity;
  }

  async deleteAll(options: FirebaseAdminQueryOptions): Promise<void>;
  async deleteAll<T extends Entity>(entities: Array<T>, options?: FirebaseAdminQueryOptions): Promise<void>;
  async deleteAll<T extends Entity>(entities: Array<T>|FirebaseAdminQueryOptions, options?: FirebaseAdminQueryOptions): Promise<void> {
    if (this.readOnly) throw new Error('The repository has been initialized in read-only mode, mutations are not allowed');
    const _options = (!options) ? entities as FirebaseAdminQueryOptions : options;

    if (Array.isArray(entities)) {
      return this.validateQueryOptions(_options)
        .then(() => Promise.all(entities.map((entity: Entity) => this.delete(entity, _options))))
        .then(() => Promise.resolve());
    } else {
      return this.validateQueryOptions(_options)
        .then(() => this.firestore.doc(_options.path).delete())
        .then(() => Promise.resolve());
    }
  }

  async delete<T extends Entity>(entity: T, options: FirebaseAdminQueryOptions): Promise<void> {
    if (this.readOnly) throw new Error('The repository has been initialized in read-only mode, mutations are not allowed');
    return this.deleteById(entity.id, options);
  }

  async deleteById(id: string, options: FirebaseAdminQueryOptions): Promise<void> {
    if (this.readOnly) throw new Error('The repository has been initialized in read-only mode, mutations are not allowed');

    if (!id) {
      return Promise.reject('`id` is a required parameter');
    }

    return this.validateQueryOptions(options)
      .then(() => this.firestore.doc(`${options.path}/${id}`).delete())
      .then(() => Promise.resolve());
  }

  async deleteFromStorage(): Promise<void> {
    return Promise.reject('This feature is not supported in "admin" mode');
  }

  private validateQueryOptions(options: FirebaseAdminQueryOptions): Promise<void> {
    if (!options.path) {
      return Promise.reject(new Error('`path` is a required option for firebase repositories'));
    }
    return Promise.resolve();
  }

  // Make sure to remove undefined properties
  private objectify(entity: Record<string, unknown>) {
    const {...item} = entity;
    for (const key in item) {
      if (item[key] === undefined) {
        delete item[key];
        continue;
      }
      if (item[key] && typeof item[key] === 'object') {
        item[key] = this.objectify(item[key] as Record<string, unknown>);
        if (!Object.keys(item[key] as Record<string, unknown>).length) {
          delete item[key];
        }
      }
    }
    return item;
  }

  static getIdentifier(): symbol {
    return Symbol.for('FirebaseAdminRepository');
  }

}

export interface FirebaseAdminQueryOptions extends QueryOptions {
  path: string;
}