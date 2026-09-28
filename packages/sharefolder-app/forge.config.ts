import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import path from 'node:path';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const iconBase = path.resolve(__dirname, 'assets/icons/icon');
const iconPng = path.resolve(__dirname, 'assets/icons/icon.png');
const iconIco = path.resolve(__dirname, 'assets/icons/icon.ico');

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'ShareFolder',
    executableName: 'sharefolder',
    appBundleId: 'io.sharefolder.app',
    icon: iconBase,
    extraResource: [path.resolve(__dirname, 'assets/icons')],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'ShareFolder',
      setupIcon: iconIco,
    }),
    // Portable archives for every platform (CI renames to stable public filenames).
    new MakerZIP({}, ['darwin', 'linux', 'win32']),
    new MakerDeb({
      options: {
        name: 'sharefolder',
        productName: 'ShareFolder',
        genericName: 'ShareFolder',
        bin: 'sharefolder',
        icon: iconPng,
        description: 'Share a local folder over the web with peer-to-peer transfers',
        categories: ['Network', 'Utility'],
        maintainer: 'Paris Val Baker',
        homepage: 'https://sharefolder.io',
      },
    }),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      // Allow local signaling in dev, plus production sharefolder.io when linked via tunnel
      devContentSecurityPolicy:
        "default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' data:; connect-src 'self' http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:* https://sharefolder.io https://*.sharefolder.io wss://sharefolder.io wss://*.sharefolder.io; img-src 'self' data: blob:; media-src 'self' blob:;",
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.tsx',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
          {
            html: './src/index.html',
            js: './src/rtc-server.ts',
            name: 'rtc_server',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
