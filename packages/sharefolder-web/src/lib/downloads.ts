/** Public ShareFolder desktop downloads (GitHub Releases). */
export const SHAREFOLDER_RELEASE_BASE =
  'https://github.com/pastyman/fileshare-mono/releases/latest/download';

export const SHAREFOLDER_RELEASES_URL =
  'https://github.com/pastyman/fileshare-mono/releases';

export type ShareFolderDownload = {
  id: string;
  label: string;
  file: string;
  hint: string;
};

export type ShareFolderInstallGuide = {
  id: string;
  label: string;
  steps: string[];
};

export const SHAREFOLDER_DOWNLOADS: ShareFolderDownload[] = [
  {
    id: 'linux-deb',
    label: 'Linux',
    file: 'ShareFolder-linux-amd64.deb',
    hint: 'Ubuntu / Debian (.deb)',
  },
  {
    id: 'linux-zip',
    label: 'Linux portable',
    file: 'ShareFolder-linux-x64.zip',
    hint: 'Zip archive',
  },
  {
    id: 'mac-arm',
    label: 'macOS',
    file: 'ShareFolder-mac-arm64.dmg',
    hint: 'Installer (.dmg)',
  },
  {
    id: 'windows',
    label: 'Windows',
    file: 'ShareFolder-windows-x64.msi',
    hint: 'Installer (.msi)',
  },
];

export const SHAREFOLDER_INSTALL_GUIDES: ShareFolderInstallGuide[] = [
  {
    id: 'linux',
    label: 'Linux',
    steps: [
      'Prefer the .deb on Ubuntu or Debian: open it in App Center, or run sudo apt install ./ShareFolder-linux-amd64.deb.',
      'Or unpack the portable zip and run the ShareFolder binary.',
      'To remove: use Remove in App Center, or run sudo apt remove sharefolder.',
    ],
  },
  {
    id: 'mac',
    label: 'macOS',
    steps: [
      'Download the .dmg.',
      'Open it and drag ShareFolder into Applications.',
      'If macOS blocks it the first time, right-click the app → Open.',
    ],
  },
  {
    id: 'windows',
    label: 'Windows',
    steps: [
      'Download the .msi installer.',
      'Open it and follow the setup steps.',
      'Launch ShareFolder from the Start menu.',
    ],
  },
];

export function sharefolderDownloadUrl(file: string): string {
  return `${SHAREFOLDER_RELEASE_BASE}/${file}`;
}
