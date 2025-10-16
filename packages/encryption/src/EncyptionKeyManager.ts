
interface Key {
  id: string;
  name: string;
  version: number;
  value: string;
}

export class EncryptionKeyManager {

  private pattern = /^ENCRYPTION_KEY_(.*)_V(.*)$/
  private keys = new Map<string, Map<number, Key>>();

  constructor();
  constructor(prefix: string);
  constructor(pattern: RegExp);
  constructor(prefixOrPattern?: string|RegExp) {
    if (typeof prefixOrPattern !== 'undefined') {
      if (typeof prefixOrPattern === 'string') {
        this.pattern = new RegExp(`^${prefixOrPattern}_(.*)_V(.*)`);
      } else {
        this.pattern = prefixOrPattern;
      }
    }

    this.loadFromEnv();
  }

  public loadFromEnv() {
    this.load(process.env);
  }

  public load(keys: Record<string, string>|NodeJS.Dict<string>) {
    Object.entries(keys).forEach(([ key, value ]) => {
      if (this.pattern.test(key) && value) {
        const matches = this.pattern.exec(key)
        if (matches && matches.length === 3) {
          const encryptionKey = {
            id: matches[0],
            name: matches[1].toUpperCase(),
            version: Number(matches[2]),
            value
          }

          const versions = this.keys.get(encryptionKey.name) || new Map<number, Key>();
          versions.set(encryptionKey.version, encryptionKey);
          this.keys.set(encryptionKey.name, versions);
        }
      }
    });
  }

  public get(name: string): string|null;
  public get(name: string, version: number): string|null;
  public get(name: string, version?: number): string|null {
    const key = this.getKey(name, version);
    return key ? key.value : null;
  }

  public fromHeader(header: string, options: { prefix?: string; delimiter?: string }): string|null {
    const prefix = options.prefix;
    const delimiter = options.delimiter || ':';

    const value = prefix ? header.replace(`${prefix}${delimiter}`, '') : header;
    const [ name, version ] = value.split(delimiter);

    const key = this.getKey(name, Number(version));
    return key ? key.value : null;
  }

  public toHeader(name: string, options: { prefix?: string, version?: number, delimiter?: string }): string|null {
    const prefix = options.prefix;
    const version = options.version;
    const delimiter = options.delimiter || ':';
    const key = this.getKey(name, version);

    return key
      ? prefix
        ? `${prefix}${delimiter}${key.name}${delimiter}${key.version}`
        : `${key.name}${delimiter}${key.version}`
      : null;
  }

  private getKey(name: string, version?: number): Key|null {
    const versions = this.keys.get(name.toUpperCase()) || new Map<number, Key>();
    if (typeof version === 'number') {
      const key = versions.get(version);
      return key ? key : null;
    } else {
      const latestVersion = Array.from(versions).reduce((result: Key|null, [ version, key ]) => (!result || result.version < version) ? key : result, null);
      return latestVersion ? latestVersion : null;
    }
  }
}