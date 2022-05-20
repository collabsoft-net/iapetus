import { File, QueryOptions, StorageProvider } from '@collabsoft-net/types';
import { Bucket, File as BucketFile, GetSignedUrlConfig } from '@google-cloud/storage';
import * as Firebase from 'firebase-admin';

export class FirebaseAdminStorageProvider implements StorageProvider {

  private storage: Bucket;

  constructor(firebase: Firebase.app.App, bucket?: string) {
    let name;
    if (bucket) {
      name = bucket.startsWith('gs://') ? bucket.substr(5) : bucket;
    }

    this.storage = firebase.storage().bucket(name);
  }

  // ==========================================================================

  async touch(name: string, options: FirebaseAdminStorageQueryOptions): Promise<File> {
    await this.validateQueryOptions(options);
    const directory = this.pathToDirectory(options.path);
    const file = this.storage.file(`${directory}/${name}`);
    return this.toFile(file);
  }

  async findOne(name: string, options: FirebaseAdminStorageQueryOptions): Promise<File|null> {
    await this.validateQueryOptions(options);
    const [ files ] = await this.storage.getFiles({
      directory: options.path,
      prefix: name
    });
    const file = files[0];
    return file ? this.toFile(file) : null;
  }

  async findAll(options: FirebaseAdminStorageQueryOptions = { path: '' }): Promise<Array<File>> {
    await this.validateQueryOptions(options);
    const directory = this.pathToDirectory(options.path);
    const [ files ] = await this.storage.getFiles({ directory });
    return files.map(this.toFile);
  }

  async move(file: File, targetDirectory: string, options: FirebaseAdminStorageQueryOptions = { path: '' }): Promise<void> {
    const directory = this.pathToDirectory(options.path);
    const target = this.pathToDirectory(targetDirectory);
    await this.storage.file(`${directory}/${file.name}`).move(`${target}/${file.name}`);
  }

  async setMetadata(name: string, metadata: unknown, options: FirebaseAdminStorageQueryOptions = { path: '' }): Promise<void> {
    await this.validateQueryOptions(options);
    const directory = this.pathToDirectory(options.path);
    await this.storage.file(`${directory}/${name}`).setMetadata(metadata);
  }

  async save(file: File, options: FirebaseAdminStorageQueryOptions = { path: '' }): Promise<void> {
    await this.validateQueryOptions(options);
    const metadata = await file.getMetadata();
    const contents = await file.getContents();
    const directory = this.pathToDirectory(options.path);

    const outputFile = this.storage.file(`${directory}/${file.name}`);
    await new Promise<void>((resolve) => outputFile.createWriteStream().end(contents, resolve));
    await outputFile.setMetadata(metadata);
  }

  async getSignedUrl(path: string, options?: GetSignedUrlConfig): Promise<string> {
    const file = this.storage.file(path);
    const config = options || {
      action: 'read',
      expires: new Date().getTime() + (1 * 60 * 1000)
    };
    const [ url ] = await file.getSignedUrl(config);
    return url;
  }

  private toFile(file: BucketFile): File {
    return {
      name: file.name,
      createReadStream: () => file.createReadStream(),
      createWriteStream: () => file.createWriteStream(),
      getMetadata: async () => {
        const [ metadata ] = await file.getMetadata();
        return metadata;
      },
      getContents: async () => {
        const [ contents ] = await file.download();
        return contents;
      },
      isLocked: async () => {
        const [ metadata ] = await file.getMetadata();
        return metadata.locked > new Date().getTime();
      },
    };
  }

  private validateQueryOptions(options: FirebaseAdminStorageQueryOptions): Promise<void> {
    if (!options.path) {
      return Promise.reject(new Error('`path` is a required option for firebase storage'));
    }
    return Promise.resolve();
  }

  private pathToDirectory(path: string) {
    const directory = path.startsWith('/') ? path.substr(1) : path;
    return directory.endsWith('/') ? directory.substr(0, path.length - 1) : directory;
  }

  static getIdentifier(): symbol {
    return Symbol.for('FirebaseAdminStorageProvider');
  }

}

export interface FirebaseAdminStorageQueryOptions extends QueryOptions {
  path: string;
}