// src/renderer/types/global.d.ts
export {};

declare global {
  interface Window {
    electronAPI: {
      testPing: () => Promise<string>;
      selectFolder: () => Promise<string | null>;
      openExternal: (url: string) => Promise<void>;
      startConnectionPolling: (guid: string) => Promise<{ success: boolean }>;
      stopConnectionPolling: () => Promise<{ success: boolean }>;
      onConnectionStatusUpdate: (callback: (data: {
        status: string;
        lastCheck: string;
        error?: string;
        connections?: Array<{ peerId: string; folderId: string }>;
      }) => void) => void;
      onRTCConnectionInfo: (callback: (data: {
        peerId: string;
        folderId: string;
        folderPath: string;
        signalingBaseUrl: string;
      }) => void) => void;
      closeRtcWindow: () => void;
      sendNewConnections: (connections: Array<{ peerId: string; folderId: string }>) => void;
      listDir: (
        folderPath: string,
        relativePath?: string,
        offset?: number,
        limit?: number
      ) => Promise<{
        entries: Array<{
          name: string;
          type: 'file' | 'dir';
          size?: number;
          relativePath: string;
        }>;
        offset: number;
        limit: number;
        total: number;
        hasMore: boolean;
      }>;
      readFileRange: (
        folderPath: string,
        relativePath: string,
        start: number,
        end: number
      ) => Promise<ArrayBuffer>;

      dbGetInstance: () => Promise<string>;
      dbListUsers: () => Promise<any[]>;
      dbAddUser: (userData: any) => Promise<number>;
      dbUpdateUser: (id: number, updates: any) => Promise<{ success: boolean }>;
      dbRemoveUser: (id: number) => Promise<{ success: boolean }>;
      dbGetUser: (id: number) => Promise<any>;
      dbListFolders: () => Promise<any[]>;
      dbAddFolder: (path: string, guid?: string) => Promise<number>;
      dbRemoveFolder: (id: number) => Promise<{ success: boolean }>;
      dbUpdateFolder: (id: number, updates: any) => Promise<{ success: boolean }>;
      dbDebug: () => Promise<any>;
    };
  }
}
