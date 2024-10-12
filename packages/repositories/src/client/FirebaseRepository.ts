/* eslint-disable @typescript-eslint/no-empty-interface */

import { MemoryEmitter } from '@collabsoft-net/emitters';
import { isOfType } from '@collabsoft-net/helpers';
import { Entity, Event, EventListener, Paginated, QueryBuilder, QueryOptions, Repository, StorageProvider, User } from '@collabsoft-net/types';
import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import { Auth, getAuth, signInWithCustomToken, signOut } from 'firebase/auth';
import { collection, deleteDoc, doc, Firestore, GeoPoint, getCountFromServer, getDoc, getDocs, getFirestore, limit, orderBy, Primitive, query, QueryConstraint, setDoc, startAfter, Timestamp, updateDoc, where } from 'firebase/firestore';
import uniqid from 'uniqid';

import { QueryBuilder as QB } from '../QueryBuilder';

type FirestorePrimitive = Primitive|GeoPoint|Timestamp;
interface FirestoreArray extends Array<FirestorePrimitive|FirestoreObject|FirestoreArray> {}
interface FirestoreObject extends Record<string, FirestorePrimitive|FirestoreObject|FirestoreArray|undefined> {}

export class FirebaseRepository implements Repository {

  private fb: FirebaseApp;
  private auth: Auth;
  private firestore: Firestore;
  private emitter: MemoryEmitter = new MemoryEmitter();

  constructor(protected name: string, options: FirebaseOptions, protected readOnly?: boolean) {
    this.fb = initializeApp(options, name);
    this.fb.automaticDataCollectionEnabled = false;

    this.firestore = getFirestore(this.fb);
    this.auth = getAuth(this.fb);
    this.readOnly = readOnly;
  }

  async on(event: typeof Event|string, listener: EventListener): Promise<void> {
    return this.emitter.on(event, listener);
  }

  async emit(event: Event): Promise<void> {
    return this.emitter.emit(event);
  }

  async close(): Promise<void> {
    throw new Error('This feature is not supported in "client" mode');
  }

  get storage(): StorageProvider {
    throw new Error('This feature is not supported in "client" mode');
  }

  // ==========================================================================

  async isAuthenticated(): Promise<boolean> {
    return this.auth.currentUser !== null;
  }

  async currentUser(): Promise<User|null> {
    const user = this.auth.currentUser;
    return user ? {
      id: user.uid,
      name: user.displayName,
      email: user.email
    } : null;
  }

  async authenticate(token: string): Promise<boolean> {
    await signInWithCustomToken(this.auth, token);
    return true;
  }

  async verifyIdToken(): Promise<never> {
    throw new Error('This feature is not supported in "client" mode');
  }

  async createCustomToken(): Promise<string> {
    throw new Error('This feature is not supported in "client" mode');
  }

  async signOut(): Promise<void> {
    return signOut(this.auth);
  }

  async enqueue() {
    throw new Error('This feature is not supported in "client" mode');
  }

  async count(options: FirebaseQueryOptions = { path: '/' }): Promise<number> {
    await this.validateQueryOptions(options);

    if (options.path.split('/').length % 2 === 1) {
      throw new Error('You can only use count for collections, not individual documents');
    } else {
      const ref = collection(this.firestore, options.path);
      const snapshot = await getCountFromServer(ref);
      return snapshot.data().count;
    }
  }

  async countByQuery(qb: QueryBuilder, options: FirebaseQueryOptions): Promise<number>;
  async countByQuery(qb: (qb: QueryBuilder) => QueryBuilder, options: FirebaseQueryOptions): Promise<number>;
  async countByQuery(qb: unknown, options: FirebaseQueryOptions = { path: '/' }): Promise<number> {
    await this.validateQueryOptions(options);

    if (options.path.split('/').length % 2 === 1) {
      throw new Error('You can only use count for collections, not individual documents');
    }

    const queryBuilder: QueryBuilder = typeof qb === 'function' ? qb(new QB()) : qb;
    const constraints = this.toConstraints(queryBuilder);

    const ref = collection(this.firestore, options.path);
    const snapshot = await getCountFromServer(query(ref, ...constraints));
    return snapshot.data().count;
  }

  async findById<T extends Entity>(id: string, options: FirebaseQueryOptions = { path: '/' }): Promise<T|null> {
    const ref = doc(this.firestore, `${options.path}/${id}`);
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? <T>snapshot.data() : null;
  }

  async findByProperty<T extends Entity>(key: string, value: string|number|boolean, options: FirebaseQueryOptions = { path: '/' }): Promise<T|null> {
    await this.validateQueryOptions(options);
    return this.findByQuery(qb => qb.where(key, '==', value), options);
  }

  async findByQuery<T extends Entity>(qb: QueryBuilder, options: FirebaseQueryOptions): Promise<T|null>;
  async findByQuery<T extends Entity>(qb: (qb: QueryBuilder) => QueryBuilder, options: FirebaseQueryOptions): Promise<T|null>;
  async findByQuery<T extends Entity>(qb: QueryBuilder|((qb: QueryBuilder) => QueryBuilder), options: FirebaseQueryOptions = { path: '/' }): Promise<T|null> {
    await this.validateQueryOptions(options);

    const queryBuilder = typeof qb === 'function' ? qb(new QB()) : qb;
    const result = await this.findAllByQuery<T>(queryBuilder.limit(1), options);

    // Do not assume deconstruction, make sure that we actually get expected Paginated<T> returned
    if (!isOfType<Paginated<T>>(result, 'values')) {
      throw new Error('Unexpected argument exception: findAllByQuery did not return paginated list of results');
    }

    return result.values[0];
  }

  async findAll<T extends Entity>(options: FirebaseQueryOptions = { path: '/' }): Promise<Paginated<T>> {
    await this.validateQueryOptions(options);

    let total = 0;

    const result: Array<T> = [];
    if (options.path.split('/').length % 2 === 1) {
      const ref = doc(this.firestore, options.path);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        result.push(<T>snapshot.data());
        total = 1;
      }
    } else {
      const ref = collection(this.firestore, options.path);
      const snapshots = await getDocs(ref);
      snapshots.forEach((document) => result.push(<T>document.data()));

      const countRef = await getCountFromServer(ref);
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

  async findAllByProperty<T extends Entity>(key: string, value: string|number|boolean, options: FirebaseQueryOptions = { path: '/' }): Promise<Paginated<T>> {
    await this.validateQueryOptions(options);
    return this.findAllByQuery((ref) => ref.where(key, '==', value), options);
  }

  async findAllByQuery<T extends Entity>(qb: QueryBuilder, options: FirebaseQueryOptions): Promise<Paginated<T>>;
  async findAllByQuery<T extends Entity>(qb: (qb: QueryBuilder) => QueryBuilder, options: FirebaseQueryOptions): Promise<Paginated<T>>;
  async findAllByQuery<T extends Entity>(qb: unknown, options: FirebaseQueryOptions = { path: '/' }): Promise<Paginated<T>> {
    await this.validateQueryOptions(options);

    if (options.path.split('/').length % 2 === 1) {
      throw new Error('You can only search within collections, not individual documents');
    }

    const queryBuilder: QueryBuilder = typeof qb === 'function' ? qb(new QB()) : qb;
    const constraints = this.toConstraints(queryBuilder);

    const ref = collection(this.firestore, options.path);
    const snapshots = await getDocs(query(ref, ...constraints));

    const result: Array<T> = [];
    snapshots.forEach((document) => result.push(<T>document.data()));

    const total = await this.countByQuery({ ...queryBuilder, conditions: queryBuilder.conditions.filter(item => item.key !== 'limit' && item.key !== 'offset') }, options);

    return {
      start: 0,
      size: result.length,
      total,
      values: result,
      last: true
    };
  }

  async saveAll<T extends Entity>(entities: Array<T>, options: FirebaseQueryOptions = { path: '/' }): Promise<Array<T>> {
    if (this.readOnly) throw new Error('The repository has been initialized in read-only mode, mutations are not allowed');
    await this.validateQueryOptions(options);
    return Promise.all(entities.map(entity => this.save(entity, options)));
  }

  async save<T extends Entity>(entity: T, options: FirebaseQueryOptions = { path: '/' }): Promise<T> {
    if (this.readOnly) throw new Error('The repository has been initialized in read-only mode, mutations are not allowed');
    entity.id = entity.id || uniqid();
    await this.validateQueryOptions(options);

    // Make sure to remove undefined properties
    const fbObject = this.objectify(entity);
    if (fbObject) {
      const ref = doc(this.firestore, `${options.path}/${entity.id}`);
      const snapshot = await getDoc(ref);
      if (!snapshot.exists()) {
        await setDoc(ref, fbObject);
      } else {
        await updateDoc(ref, fbObject);
      }
    }
    return entity;
  }

  async deleteAll(options: FirebaseQueryOptions): Promise<void>;
  async deleteAll<T extends Entity>(entities: Array<T>, options?: FirebaseQueryOptions): Promise<void>;
  async deleteAll<T extends Entity>(entities: Array<T>|FirebaseQueryOptions, options?: FirebaseQueryOptions): Promise<void> {
    if (this.readOnly) throw new Error('The repository has been initialized in read-only mode, mutations are not allowed');
    const _options = (!options) ? entities as FirebaseQueryOptions : options;

    // Remove entities
    if (Array.isArray(entities)) {
      return this.validateQueryOptions(_options)
        .then(() => Promise.all(entities.map((entity: Entity) => this.delete(entity, _options))))
        .then(() => Promise.resolve());

    // Remove single document
    } else if (_options.path.split('/').length % 2 === 1) {
      await this.validateQueryOptions(_options);
      const ref = doc(this.firestore, _options.path);
      await deleteDoc(ref);

    // We are not going to support removing collections client-side, as this is resource intensive
    } else {
      throw new Error('You can delete individual documents, not collections');
    }
  }

  async delete<T extends Entity>(entity: T, options: FirebaseQueryOptions): Promise<void> {
    if (this.readOnly) throw new Error('The repository has been initialized in read-only mode, mutations are not allowed');
    return this.deleteById(entity.id, options);
  }

  async deleteById(id: string, options: FirebaseQueryOptions): Promise<void> {
    if (this.readOnly) throw new Error('The repository has been initialized in read-only mode, mutations are not allowed');

    if (!id) {
      return Promise.reject('`id` is a required parameter');
    }

    await this.validateQueryOptions(options);
    const ref = doc(this.firestore, `${options.path}/${id}`);
    await deleteDoc(ref);
  }

  async deleteFromStorage(): Promise<void> {
    return Promise.reject('This feature is not supported in "admin" mode');
  }

  private validateQueryOptions(options: FirebaseQueryOptions): Promise<void> {
    if (!options.path) {
      return Promise.reject(new Error('`path` is a required option for firebase repositories'));
    }
    return Promise.resolve();
  }

  private toConstraints(queryBuilder: QueryBuilder): Array<QueryConstraint> {
    const constraints: Array<QueryConstraint> = [];

    queryBuilder.conditions.forEach((condition) => {
      if (condition.key === 'orderBy') {
        constraints.push(orderBy(condition.value as string, condition.operator as 'asc' | 'desc' | undefined));
      } else if (condition.key === 'limit') {
        constraints.push(limit(condition.value as number));
      } else if (condition.key === 'offset') {
        constraints.push(startAfter(condition.value));
      } else if (!condition.value) {
        // Skip empty filter statement
      } else {
        constraints.push(where(condition.key, <FirebaseFirestore.WhereFilterOp>condition.operator, condition.value));
      }
    });

    return constraints;
  }

  // Make sure to remove undefined properties
  // Also turn objects into the right format for Firebase
  // Firebase supports primitives (string, number, boolean, null) and structures (array, map, GeoPoint, Timestamp and Reference)
  private objectify(entity: unknown): FirestoreObject {

    // If this is an object map, we should loop over each item in the object and apply the same formatting rules for each item
    if (entity !== null && typeof entity === 'object' && Object.keys(entity).length > 0) {
      const {...item} = entity as FirestoreObject;
      for (const key in item) {
        item[key] = this.objectifyNestedObjects(item[key]);
        if (item[key] === undefined) {
          delete item[key];
        }
      }
      return item;
    }

    // If the entity is not a firebase primitive or supported structure, throw an error
    throw new Error('Unsupported format');
  }

  // Make sure to remove undefined properties
  // Also turn objects into the right format for Firebase
  // Firebase supports primitives (string, number, boolean, null) and structures (array, map, GeoPoint, Timestamp and Reference)
  private objectifyNestedObjects(entity: unknown): FirestorePrimitive|FirestoreObject|FirestoreArray|undefined {

    // If this is a firestore primitive (string, boolean, number) or predefined structure (GeoPoint / Timestamp) just return the object
    // We are adding NULL here because otherwise Typescript freaks out even though the NULL is also part of the isFirestorePrimitive() check
    if (entity === null || this.isFirestorePrimitive(entity)) {
      return entity;

    // If this is an array, we should loop over each item in the array and apply the same formatting rules for each item
    } else if (Array.isArray(entity)) {
      return (entity
        // Remove entries that do not match the supported formats
        .filter(item => item === null || this.isFirestorePrimitive(item) || Array.isArray(item) || (typeof item === 'object' && Object.keys(item).length > 0))
        // Recursively apply the same formatting rules for each item in the array
        .map(this.objectifyNestedObjects.bind(this)) as FirestoreArray);

    // If this is an object map, we should loop over each item in the object and apply the same formatting rules for each item
    } else if (typeof entity === 'object' && Object.keys(entity).length > 0) {
      const {...item} = entity as FirestoreObject;
      for (const key in item) {
        const value = this.objectifyNestedObjects(item[key]);
        if (value === undefined || (value !== null && typeof value === 'object' && Object.keys(value).length <= 0)) {
          delete item[key];
        } else {
          item[key] = value;
        }
      }
      return item;
    }

    // If the entity is not a firebase primitive or supported structure, it should be removed
    return undefined;
  }

  private isFirestorePrimitive(entity: unknown): entity is FirestorePrimitive {
    return entity === null ||
      typeof entity === 'string' ||
      typeof entity === 'boolean' ||
      typeof entity === 'number' ||
      isOfType<GeoPoint>(entity, 'latitude') ||
      isOfType<Timestamp>(entity, 'seconds')
  }

  static getIdentifier(): symbol {
    return Symbol.for('FirebaseAdminRepository');
  }

}

export interface FirebaseQueryOptions extends QueryOptions {
  path: string;
}
