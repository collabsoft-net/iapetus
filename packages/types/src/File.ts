import { Readable, Writable } from 'stream';

export interface File {
  name: string;
  createReadStream?: () => Readable;
  createWriteStream?: () => Writable;
  getMetadata: () => Promise<unknown>;
  getContents: () => Promise<Buffer>;
  isLocked: () => Promise<boolean>;
}
