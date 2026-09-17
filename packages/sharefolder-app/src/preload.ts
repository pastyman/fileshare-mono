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
  }) => void) => {
    ipcRenderer.on('rtc-connection-info', (_event, data) => callback(data));
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
  }
});
