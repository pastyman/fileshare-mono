import type { Configuration, WebpackPluginInstance, ModuleOptions } from 'webpack';
import * as path from 'path';

import { plugins as basePlugins } from './webpack.plugins';

const libAliases = {
  helpers: path.resolve(__dirname, '../../libs/helpers/src'),
  'rtc-client': path.resolve(__dirname, '../../libs/rtc-client/src'),
  types: path.resolve(__dirname, '../../libs/types/src'),
  orm: path.resolve(__dirname, '../../libs/orm/src'),
  'ui-components': path.resolve(__dirname, '../../libs/ui-components/src'),
};

const rendererRules: Required<ModuleOptions>['rules'] = [
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
      },
    },
  },
  {
    test: /\.css$/,
    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
  },
];

export const rendererConfig: Configuration = {
  module: {
    rules: rendererRules,
  },
  plugins: [...basePlugins] as WebpackPluginInstance[],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    alias: libAliases,
    fallback: {
      fs: false,
      path: false,
      os: false,
      util: require.resolve('util/'),
      child_process: false,
      crypto: false,
      stream: false,
      buffer: false,
      events: false,
      assert: false,
      constants: false,
      domain: false,
      http: false,
      https: false,
      net: false,
      querystring: false,
      url: false,
      zlib: false,
    },
  },
};
