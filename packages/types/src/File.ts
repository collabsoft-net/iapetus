import { FileMetadata } from '@google-cloud/storage';
import { Readable, Writable } from 'stream';

export interface File {
  name: string;
  createReadStream?: () => Readable;
  createWriteStream?: () => Writable;
  getMetadata: () => Promise<FileMetadata>;
  getContents: () => Promise<Buffer>;
  isLocked: () => Promise<boolean>;
}
