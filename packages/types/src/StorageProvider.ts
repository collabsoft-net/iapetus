
import { File } from './File';
import { QueryOptions } from './Repositories';

export interface StorageProvider {
  touch(name: string, options?: QueryOptions): Promise<File>;
  findOne(name: string, options?: QueryOptions): Promise<File|null>;
  findAll(options?: QueryOptions): Promise<Array<File>>;
  move(file: File, targetDirectory: string, options?: QueryOptions): Promise<void>;
  save(file: File, options?: QueryOptions): Promise<void>;
  setMetadata(name: string, metadata: Metadata, options?: QueryOptions): Promise<void>;
  getSignedUrl(path: string, options?: unknown): Promise<string>;
}

export type Metadata = Record<string, unknown>;
