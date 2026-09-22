/** Public ShareFolder desktop downloads (GitHub Releases). */
export const SHAREFOLDER_RELEASE_BASE =
  'https://github.com/pastyman/fileshare-mono/releases/latest/download';

export type ShareFolderDownload = {
  id: string;
  label: string;
  file: string;
  hint: string;
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
    file: 'ShareFolder-mac-arm64.zip',
    hint: 'Apple Silicon',
  },
  {
    id: 'windows',
    label: 'Windows',
    file: 'ShareFolder-windows-x64-setup.exe',
    hint: 'Installer (.exe)',
  },
];

export function sharefolderDownloadUrl(file: string): string {
  return `${SHAREFOLDER_RELEASE_BASE}/${file}`;
}
