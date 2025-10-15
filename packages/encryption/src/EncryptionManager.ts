import { createCipheriv, createDecipheriv, createHash, scryptSync } from 'crypto';

import { EncryptionKeyManager } from './EncyptionKeyManager';

export interface EncryptionManagerOptions {
  key: {
    name: string;
    version?: number;
    matcher?: string|RegExp;
    header?: {
      prefix?: string;
      delimiter?: string;
    }
  }
}

export class EncryptionManager {

  private keyManager: EncryptionKeyManager;

  private get key(): string|null {
    return typeof this.options.key.version === 'undefined'
      ? this.keyManager.get(this.options.key.name)
      : this.keyManager.get(this.options.key.name, this.options.key.version);
  }

  private get header(): string|null {
    return (this.options.key.header?.prefix && this.options.key.version)
      ? this.keyManager.toHeader(this.options.key.header.prefix, this.options.key.name, this.options.key.version, this.options.key.header.delimiter)
      : (this.options.key.header?.prefix && !this.options.key.version)
        ? this.keyManager.toHeader(this.options.key.header.prefix, this.options.key.name, this.options.key.header.delimiter)
        : this.keyManager.toHeader(this.options.key.name, this.options.key.header?.delimiter);
  }

  constructor(private options: EncryptionManagerOptions) {
    this.keyManager = typeof options.key.matcher !== 'undefined'
      ? typeof options.key.matcher === 'string'
        ? new EncryptionKeyManager(options.key.matcher)
        : new EncryptionKeyManager(options.key.matcher)
      : new EncryptionKeyManager();
  }

  public isEncrypted(value: string): boolean {
    const checkIfEncrypted = new RegExp(`^(V\\d@)?${this.header};`);
    return checkIfEncrypted.test(value);
  }

  /*
  // Warning: here be dragons 🐉
  //
  // This encrypt/decrypt methods become immutable as soon as they are used in production environments
  // If there is any reason to adjust the logic of these methods, please follow these steps:
  //
  // - Create a new version of both the encrypt and decrypt methods (with V[x] suffix)
  // - Make the required changes to the encrypt/decrypt logic
  // - Make sure that the encrypt logic prepends the `V[x]@` identifier to the value
  // - Update the public encrypt() method to start using the new `V[x]` method
  // - Update the public decrypt() method to detect the new `V[x]` identifier and use the appropriate method
  //
  */

  public encrypt<T>(value: T, salt: string, nonce: Buffer<ArrayBufferLike>): string {
    return this.encryptV1(value, salt, nonce);
  }

  public decrypt<T>(value: string, salt: string, nonce: string): T {
    const [ version, ...encryptedValue ] = value.split('@');
    if (version.toUpperCase() === 'V1') {
      return this.decryptV1(encryptedValue.join('@'), salt, nonce);
    }
    throw new Error(`Unable to decrypt: unsupported encryption version '${version}'`);
  }

  /* ==================================================================================================
  //                              Encryption Methods
  // =============================================================================================== */

  private encryptV1<T>(value: T, salt: string, nonce: Buffer<ArrayBufferLike>): string {
    // Check if we have an encryption key
    if (!this.key) {
      throw new Error(`Unable to encrypt: could not find encryption key '${this.options.key.name}'`);
    }

    // Make sure that the provided input is not already encrypted
    if (typeof value === 'string') {
      const isEncrypted = this.isEncrypted(value);
      if (isEncrypted) {
        throw new Error('Unable to encrypt: provided input is already encrypted');
      }
    }

    // Create the actual encryption key using the provided salt, generated pepper
    // and the appropriate environment variable as provided by the key manager
    const pepper = createHash('sha256').update(salt).digest('hex');
    const encryptionKey = scryptSync(`${this.key}-${pepper}`, salt, 32);

    // Let's encrypt!
    const cipher = createCipheriv('aes-256-cbc', encryptionKey, nonce);
    const payload = JSON.stringify(value);
    const encryptedValue = cipher.update(payload, 'utf8', 'hex') + cipher.final('hex');

    // Prepend the encryption method version (V1) and the header to the output
    return `V1@${this.header};${encryptedValue}`;
  }

  /* ==================================================================================================
  //                              Decryption Methods
  // =============================================================================================== */

  private decryptV1<T>(value: string, salt: string, nonce: string): T {
    const [ header, ...encryptedValue ] = value.split(';');

    const encryptionKey = this.options.key.header?.prefix
      ? this.keyManager.fromHeader(header, this.options.key.header.prefix, this.options.key.header.delimiter)
      : this.keyManager.fromHeader(header, this.options.key.header?.delimiter);
    if (!encryptionKey) throw new Error(`Unable to decrypt: could not find encryption key '${this.options.key.name}'`);

    const pepper = createHash('sha256').update(salt).digest('hex');
    const cipherKey = scryptSync(`${encryptionKey}-${pepper}`, salt, 32);

    const decipher = createDecipheriv('aes-256-cbc', cipherKey, Buffer.from(nonce, 'hex'));
    const decryptedValue = decipher.update(encryptedValue.join(';'), 'hex', 'utf8') + decipher.final('utf8');
    return JSON.parse(decryptedValue);
  }

}