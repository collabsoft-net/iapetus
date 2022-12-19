import { MemoryEmitter } from '@collabsoft-net/emitters';
import { Entity, Event, EventListener, Paginated, QueryOptions, Repository, StorageProvider } from '@collabsoft-net/types';
import { app, AppOptions, auth, firestore, initializeApp } from 'firebase-admin';
import uniqid from 'uniqid';

import { FirebaseAdminStorageProvider } from './FirebaseAdminStorageProvider';
import { QueryBuilder } from './QueryBuilder';

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
    const queryBuilder: QueryBuilder = typeof qb === 'function' ? qb(new QueryBuilder()) : qb;

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

  async findAll(options: FirebaseAdminQueryOptions = { path: '/' }): Promise<Paginated<Entity>> {
    await this.validateQueryOptions(options);

    let total = 0;

    const result: Array<Entity> = [];
    if (options.path.split('/').length % 2 === 1) {
      const ref = await this.firestore.doc(options.path).get();
      if (ref) {
        result.push(<Entity>ref.data());
        total = 1;
      }
    } else {
      const docRef = await this.firestore.collection(options.path).get();
      docRef.forEach((document) => result.push(<Entity>document.data()));

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

  async findAllByProperty(key: string, value: string|number|boolean, options: FirebaseAdminQueryOptions = { path: '/' }): Promise<Paginated<Entity>> {
    await this.validateQueryOptions(options);
    return this.findAllByQuery((ref) => ref.where(key, '==', value), options);
  }

  async findAllByQuery(qb: QueryBuilder, options: FirebaseAdminQueryOptions): Promise<Paginated<Entity>>;
  async findAllByQuery(qb: (qb: QueryBuilder) => QueryBuilder, options: FirebaseAdminQueryOptions): Promise<Paginated<Entity>>;
  async findAllByQuery(qb: unknown, options: FirebaseAdminQueryOptions = { path: '/' }): Promise<Paginated<Entity>> {
    await this.validateQueryOptions(options);

    if (options.path.split('/').length % 2 === 1) {
      throw new Error('You can only search within collections, not individual documents');
    }

    let collection: firestore.Query = this.firestore.collection(options.path);
    const queryBuilder: QueryBuilder = typeof qb === 'function' ? qb(new QueryBuilder()) : qb;

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

    const result: Array<Entity> = [];
    const docRef = await collection.get();
    docRef.forEach((document) => result.push(<Entity>document.data()));

    const countRef = await collection.count().get();
    const total = countRef.data().count;

    return {
      start: 0,
      size: result.length,
      total,
      values: result,
      last: true
    };
  }

  async findById(id: string, options: FirebaseAdminQueryOptions = { path: '/' }): Promise<Entity|null> {
    const ref = await this.firestore.doc(`${options.path}/${id}`).get();
    return ref ? <Entity>ref.data() : null;
  }

  async findByProperty(key: string, value: string|number|boolean, options: FirebaseAdminQueryOptions = { path: '/' }): Promise<Entity|null> {
    await this.validateQueryOptions(options);
    const { values } = await this.findAllByProperty(key, value, options);
    return values[0];
  }

  async findByQuery(qb: QueryBuilder, options: FirebaseAdminQueryOptions): Promise<Entity|null>;
  async findByQuery(qb: (qb: QueryBuilder) => QueryBuilder, options: FirebaseAdminQueryOptions): Promise<Entity|null>;
  async findByQuery(qb: unknown, options: FirebaseAdminQueryOptions = { path: '/' }): Promise<Entity|null> {
    await this.validateQueryOptions(options);

    const { values } = typeof qb === 'function'
      ? await this.findAllByQuery(qb as (qb: QueryBuilder) => QueryBuilder, options)
      : await this.findAllByQuery(qb as QueryBuilder, options);
    return values[0];
  }

  async saveAll(entities: Array<Entity>, options: FirebaseAdminQueryOptions = { path: '/' }): Promise<Array<Entity>> {
    if (this.readOnly) throw new Error('The repository has been initialized in read-only mode, mutations are not allowed');
    await this.validateQueryOptions(options);
    return Promise.all(entities.map((entity: Entity) => this.save(entity, options)));
  }

  async save(entity: Entity, options: FirebaseAdminQueryOptions = { path: '/' }): Promise<Entity> {
    if (this.readOnly) throw new Error('The repository has been initialized in read-only mode, mutations are not allowed');
    entity.id = entity.id || uniqid();
    await this.validateQueryOptions(options);

    // Make sure to remove undefined properties
    const fbObject = this.objectify(Object.assign({}, entity));
    await this.firestore.doc(`${options.path}/${entity.id}`).set(fbObject);
    return entity;
  }

  async deleteAll(options: FirebaseAdminQueryOptions): Promise<void>;
  async deleteAll(entities: Array<Entity>, options?: FirebaseAdminQueryOptions): Promise<void>;
  async deleteAll(entities: Array<Entity>|FirebaseAdminQueryOptions, options?: FirebaseAdminQueryOptions): Promise<void> {
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

  async delete(entity: Entity, options: FirebaseAdminQueryOptions): Promise<void> {
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
    for (const key in entity) {
      if (entity[key] === undefined) {
        delete entity[key];
        continue;
      }
      if (entity[key] && typeof entity[key] === 'object') {
        this.objectify(entity[key] as Record<string, unknown>);
        if (!Object.keys(entity[key] as Record<string, unknown>).length) {
          delete entity[key];
        }
      }
    }
    return entity;
  }

  static getIdentifier(): symbol {
    return Symbol.for('FirebaseAdminRepository');
  }

}

export interface FirebaseAdminQueryOptions extends QueryOptions {
  path: string;
}