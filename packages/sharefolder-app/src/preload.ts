// src/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  testPing: async (): Promise<string> => {
    return ipcRenderer.invoke('test-ping');
  },
  selectFolder: async (): Promise<string | null> => {
    return ipcRenderer.invoke('select-folder');
  },
  openExternal: async (url: string): Promise<void> => {
    return ipcRenderer.invoke('open-external', url);
  },
  startConnectionPolling: async (guid: string): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke('start-connection-polling', guid);
  },
  stopConnectionPolling: async (): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke('stop-connection-polling');
  },
  onConnectionStatusUpdate: (callback: (data: {
    status: string;
    lastCheck: string;
    error?: string;
    connections?: Array<{ peerId: string; folderId: string }>;
  }) => void) => {
    ipcRenderer.on('connection-status-update', (_event, data) => callback(data));
  },
  onRTCConnectionInfo: (callback: (data: {
    peerId: string;
    folderId: string;
    folderPath: string;
    signalingBaseUrl: string;
    isPasswordProtected?: boolean;
  }) => void) => {
    ipcRenderer.on('rtc-connection-info', (_event, data) => callback(data));
  },
  rtcHostReady: () => {
    ipcRenderer.send('rtc-host-ready');
  },
  closeRtcWindow: () => {
    ipcRenderer.send('close-rtc-window');
  },
  sendNewConnections: (connections: Array<{ peerId: string; folderId: string }>) => {
    ipcRenderer.send('new-connections', connections);
  },
  listDir: async (
    folderPath: string,
    relativePath = '',
    offset = 0,
    limit = 100
  ) => {
    return ipcRenderer.invoke('list-dir', folderPath, relativePath, offset, limit);
  },
  readFileRange: async (
    folderPath: string,
    relativePath: string,
    start: number,
    end: number
  ) => {
    return ipcRenderer.invoke('read-file-range', folderPath, relativePath, start, end);
  },
  getImageThumbnail: async (
    folderPath: string,
    relativePath: string,
    maxWidth = 512
  ): Promise<ArrayBuffer | null> => {
    return ipcRenderer.invoke('get-image-thumbnail', folderPath, relativePath, maxWidth);
  },

  // Database operations
  dbGetInstance: async (): Promise<string> => {
    return ipcRenderer.invoke('db-get-instance');
  },
  dbListUsers: async (): Promise<any[]> => {
    return ipcRenderer.invoke('db-list-users');
  },
  dbAddUser: async (userData: any): Promise<number> => {
    return ipcRenderer.invoke('db-add-user', userData);
  },
  dbUpdateUser: async (id: number, updates: any): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke('db-update-user', id, updates);
  },
  dbRemoveUser: async (id: number): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke('db-remove-user', id);
  },
  dbGetUser: async (id: number): Promise<any> => {
    return ipcRenderer.invoke('db-get-user', id);
  },
  dbAuthenticateUser: async (
    email: string,
    password: string
  ): Promise<{ id: number; email: string; fullName: string } | null> => {
    return ipcRenderer.invoke('db-authenticate-user', email, password);
  },
  dbListFolders: async (): Promise<any[]> => {
    return ipcRenderer.invoke('db-list-folders');
  },
  dbAddFolder: async (path: string, guid?: string): Promise<number> => {
    return ipcRenderer.invoke('db-add-folder', path, guid);
  },
  dbRemoveFolder: async (id: number): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke('db-remove-folder', id);
  },
  dbUpdateFolder: async (id: number, updates: any): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke('db-update-folder', id, updates);
  },
  dbDebug: async (): Promise<any> => {
    return ipcRenderer.invoke('db-debug');
  },
  dbGetStatsSummary: async (days = 14): Promise<any> => {
    return ipcRenderer.invoke('db-get-stats-summary', days);
  },
  recordDownloadEvent: async (
    folderId: string,
    relativePath: string,
    bytes: number
  ): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke(
      'db-record-download-event',
      folderId,
      relativePath,
      bytes
    );
  },
  recordPreviewEvent: async (
    folderId: string,
    relativePath: string,
    bytes: number
  ): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke(
      'db-record-preview-event',
      folderId,
      relativePath,
      bytes
    );
  },
  onStatsUpdated: (callback: (data: { at: number }) => void) => {
    ipcRenderer.on('stats-updated', (_event, data) => callback(data));
  },
});
