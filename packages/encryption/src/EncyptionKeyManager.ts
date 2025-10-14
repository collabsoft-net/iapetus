
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

  public fromHeader(header: string, delimiter?: string): string|null;
  public fromHeader(header: string, prefix: string, delimiter?: string): string|null;
  public fromHeader(header: string, prefixOrDelimiter?: string, delimiter?: string): string|null {
    delimiter = typeof delimiter === 'string' ? delimiter : typeof prefixOrDelimiter === 'string' ? prefixOrDelimiter : ':';
    const prefix = typeof delimiter === 'string' ? prefixOrDelimiter : undefined;

    const value = prefix ? header.replace(`${prefix}${delimiter}`, '') : header;
    const [ name, version ] = value.split(delimiter);

    const key = this.getKey(name, Number(version));
    return key ? key.value : null;
  }

  public toHeader(name: string, delimiter?: string): string|null;
  public toHeader(prefix: string, name: string, delimiter?: string): string|null;
  public toHeader(prefix: string, name: string, version: number, delimiter?: string): string|null;
  public toHeader(nameOrPrefix: string, nameOrDelimiter?: string, versionOrDelimiter?: number|string, delimiter?: string): string|null {
    const options: {
      name: string;
      prefix?: string;
      version?: number;
      delimiter: string;
    } = {} as {
      name: string;
      prefix?: string;
      version?: number;
      delimiter: string;
    };

    if (typeof nameOrPrefix === 'string' && typeof nameOrDelimiter === 'string' && typeof versionOrDelimiter === 'number') {
      options.name = nameOrDelimiter;
      options.prefix = nameOrPrefix;
      options.version = versionOrDelimiter;
      options.delimiter = delimiter || ':';
    } else if (typeof nameOrPrefix === 'string' && typeof nameOrDelimiter === 'string' && typeof versionOrDelimiter !== 'number') {
      options.name = nameOrDelimiter;
      options.prefix = nameOrPrefix;
      options.delimiter = versionOrDelimiter || ':';
    } else if (typeof nameOrPrefix === 'string' && typeof nameOrDelimiter === 'string') {
      options.name = nameOrDelimiter;
      options.prefix = nameOrPrefix;
      options.delimiter = ':';
    } else if (typeof nameOrDelimiter === 'undefined') {
      options.name = nameOrPrefix;
      options.delimiter = ';';
    }

    const key = this.getKey(options.name, options.version);
    if (key) {
      return options.prefix ? `${options.prefix}${options.delimiter}${key.name}${options.delimiter}${key.version}` : `${key.name}${options.delimiter}${key.version}`;
    }

    return null;
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