#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import semver from 'semver';

type TDependencyTypes = 'dependencies'|'devDependencies'|'peerDependencies'|'bundledDependencies'|'optionalDependencies';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

const sources = [ './package.json' ];
if (Array.isArray(pkg.workspaces?.packages)) {
  sources.push(...(pkg.workspaces?.packages as Array<string>).map(item => join(item, 'package.json')));
}

const syncedDeps: Record<TDependencyTypes, Map<string, string>> = {
  dependencies: new Map<string, string>(),
  devDependencies: new Map<string, string>(),
  peerDependencies: new Map<string, string>(),
  bundledDependencies: new Map<string, string>(),
  optionalDependencies: new Map<string, string>()
}

console.log('\n');

sources.forEach(source => {

  console.log(`  Processing ${source}...\n`);

  const pkg = JSON.parse(readFileSync(source, 'utf-8'));
  Object.keys(syncedDeps).forEach((type) => {

    const depType: TDependencyTypes = type as unknown as TDependencyTypes;
    const items = pkg[depType];

    if (items) {
      console.log(`    Found ${Object.keys(items).length} items in ${depType}`);
      Object.entries(items).forEach(([ key, value ]) => {
        const version = String(value).replaceAll('~', '').replaceAll('>', '');
        if (syncedDeps[depType].has(key)) {
          const currentVersion = syncedDeps[depType].get(key);
          if (currentVersion) {
            const newVersion = semver.parse(version);
            const oldVersion = semver.parse(currentVersion);

            if(!newVersion) {
              console.log(`    - Duplicate entry found for ${key}, preserving current version (no valid new version provided)`);
              syncedDeps[depType].set(key, currentVersion);
            } else if (oldVersion && newVersion?.compare(oldVersion) === -1) {
              console.log(`    - Duplicate entry found for ${key}, but version is lower than current version. Skipping.`);
            } else if (oldVersion && newVersion?.compare(oldVersion) === 0) {
              console.log(`    - Duplicate entry found for ${key}, but version is equal to current version. Skipping.`);
            } else if (oldVersion && newVersion?.compare(oldVersion) === 1) {
              if (pkg.resolutions && pkg.resolutions[key]) {
                console.log(`    - Duplicate entry found for ${key}, but version is set by package specific resolution override. Skipping.`);
              } else {
                console.log(`    - Duplicate entry found for ${key}, version ${newVersion.toString()} is greater than ${oldVersion?.toString()}`);
                syncedDeps[depType].set(key, version);
              }
            }
          }
        } else {
          console.log(`    - New dependency found: ${key} with version ${version}`);
          syncedDeps[depType].set(key, version);
        }
      });
      console.log(`\n`);
    }

  });
});

sources.forEach(source => {

  const pkg = JSON.parse(readFileSync(source, 'utf-8'));
  Object.keys(syncedDeps).forEach((type) => {
    const items: Record<string, string> = {};

    const depType: TDependencyTypes = type as unknown as TDependencyTypes;
    const sortedDependencies = new Map([...syncedDeps[depType].entries()].sort());

    sortedDependencies.forEach((version, key) => {
      if (pkg.resolutions && pkg.resolutions[key]) {
        items[key] = pkg.resolutions[key];
      } else {
        items[key] = version
      }
    });

    if (Object.keys(items).length > 0) {
      pkg[depType] = items;
    }

  });

  writeFileSync(source, JSON.stringify(pkg, null, 2), 'utf-8');

});



