import type { Configuration } from 'webpack';
import * as path from 'path';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

const libAliases = {
  helpers: path.resolve(__dirname, '../../libs/helpers/src'),
  'rtc-client': path.resolve(__dirname, '../../libs/rtc-client/src'),
  types: path.resolve(__dirname, '../../libs/types/src'),
  orm: path.resolve(__dirname, '../../libs/orm/src'),
  'ui-components': path.resolve(__dirname, '../../libs/ui-components/src'),
};

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/index.ts',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    alias: libAliases,
  },
};
