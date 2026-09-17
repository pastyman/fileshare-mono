#!/usr/bin/env node
require('reflect-metadata');
require('ts-node').register({
  project: require('path').join(__dirname, 'tsconfig.json'),
  transpileOnly: false,
  files: true,
});
require('tsconfig-paths').register({
  baseUrl: require('path').join(__dirname, '../..'),
  paths: {
    helpers: ['libs/helpers/src/index.ts'],
    orm: ['libs/orm/src/index.ts'],
    'rtc-client': ['libs/rtc-client/src/index.ts'],
    types: ['libs/types/src/index.ts'],
    'ui-components': ['libs/ui-components/src/index.ts'],
  },
});
require('./src/index.ts');
