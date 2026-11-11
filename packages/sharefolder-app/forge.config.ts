import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerWix } from '@electron-forge/maker-wix';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const iconBase = path.resolve(__dirname, 'assets/icons/icon');
const iconIco = path.resolve(__dirname, 'assets/icons/icon.ico');
const iconIcns = path.resolve(__dirname, 'assets/icons/icon.icns');
const linuxIcons = path.resolve(__dirname, 'assets/linux/icons');
const linuxAssets = path.resolve(__dirname, 'assets/linux');
const appLicense = path.resolve(__dirname, 'LICENSE');

const shortDescription =
  'Share a local folder over the web with peer-to-peer transfers';

const productDescription = [
  'ShareFolder turns a folder on your computer into a private download link.',
  'Recipients get files directly from your machine over an encrypted peer-to-peer',
  'connection — nothing is uploaded to a central server.',
  '',
  'Features:',
  ' - Share any local folder with a link you control',
  ' - Peer-to-peer transfers with live progress',
  ' - Stop sharing anytime by closing the app',
  '',
  'Homepage: https://sharefolder.io',
].join('\n');

/** electron-installer-debian accepts a resolution→path map for hicolor icons. */
const debIcons: Record<string, string> = {
  scalable: path.join(linuxIcons, 'scalable/apps/sharefolder.svg'),
  '16x16': path.join(linuxIcons, '16x16/apps/sharefolder.png'),
  '24x24': path.join(linuxIcons, '24x24/apps/sharefolder.png'),
  '32x32': path.join(linuxIcons, '32x32/apps/sharefolder.png'),
  '48x48': path.join(linuxIcons, '48x48/apps/sharefolder.png'),
  '64x64': path.join(linuxIcons, '64x64/apps/sharefolder.png'),
  '128x128': path.join(linuxIcons, '128x128/apps/sharefolder.png'),
  '256x256': path.join(linuxIcons, '256x256/apps/sharefolder.png'),
  '512x512': path.join(linuxIcons, '512x512/apps/sharefolder.png'),
};

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
    new MakerWix({
      name: 'ShareFolder',
      description: shortDescription,
      manufacturer: 'ShareFolder',
      exe: 'sharefolder.exe',
      icon: iconIco,
      language: 1033,
      // Stable across releases so later MSIs upgrade this install. Do not change.
      upgradeCode: '3621a6d3-30a9-4145-862b-849870ab2242',
      programFilesFolderName: 'ShareFolder',
      shortcutFolderName: 'ShareFolder',
      shortcutName: 'ShareFolder',
      defaultInstallMode: 'perMachine',
      ui: {
        chooseDirectory: true,
      },
    }),
    // Standard macOS install: open DMG, drag ShareFolder into Applications.
    new MakerDMG({
      name: 'ShareFolder',
      title: 'Install ShareFolder',
      icon: iconIcns,
      format: 'ULFO',
      overwrite: true,
    }),
    // Portable archives for Linux/Windows (CI renames to stable public filenames).
    new MakerZIP({}, ['linux', 'win32']),
    new MakerDeb({
      options: {
        name: 'sharefolder',
        productName: 'ShareFolder',
        genericName: 'File Sharing',
        bin: 'sharefolder',
        // Runtime supports a size map; forge types only declare string.
        icon: debIcons as unknown as string,
        description: shortDescription,
        productDescription,
        section: 'net',
        priority: 'optional',
        categories: ['Network', 'Utility'],
        maintainer: 'Paris Val Baker <parisvalbaker@yahoo.co.uk>',
        homepage: 'https://sharefolder.io',
        desktopTemplate: path.join(linuxAssets, 'sharefolder.desktop.ejs'),
        scripts: {
          postinst: path.join(linuxAssets, 'debian/postinst'),
          postrm: path.join(linuxAssets, 'debian/postrm'),
        },
      },
    }),
  ],
  hooks: {
    // electron-installer-debian copies <app>/LICENSE into /usr/share/doc/.../copyright.
    // Replace Electron's bundled LICENSE with ShareFolder's MIT text.
    packageAfterCopy: async (_forgeConfig, buildPath) => {
      await fs.promises.copyFile(appLicense, path.join(buildPath, 'LICENSE'));
    },
    // Inject AppStream metainfo so Ubuntu App Center shows icon, license, long description.
    postMake: async (_forgeConfig, makeResults) => {
      const enrich = path.resolve(__dirname, '../../scripts/enrich-sharefolder-deb.sh');
      for (const result of makeResults) {
        for (const artifact of result.artifacts) {
          if (!artifact.endsWith('.deb')) continue;
          execFileSync('bash', [enrich, artifact], { stdio: 'inherit' });
        }
      }
    },
  },
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
    // Fuses are used to enable/disable Electron functionality
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
