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
      getImageThumbnail: (
        folderPath: string,
        relativePath: string,
        maxWidth?: number
      ) => Promise<ArrayBuffer | null>;

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
      dbGetStatsSummary: (days?: number) => Promise<{
        folders: { total: number; live: number; passwordProtected: number };
        users: { total: number; active: number };
        connections7d: number;
        downloads7d: number;
        bytes7d: number;
        previews7d: number;
        previewBytes7d: number;
        connectionsByDay: Array<{ date: string; count: number }>;
        downloadsByDay: Array<{ date: string; count: number; bytes: number }>;
        previewsByDay: Array<{ date: string; count: number; bytes: number }>;
        liveSessions: Array<{
          id: string;
          peerId: string;
          folderId: string;
          folderPath?: string;
          connectedAt: number;
        }>;
        recentActivity: Array<{
          type: 'connection' | 'download' | 'preview';
          detail: string;
          folderId: string;
          bytes: number;
          createdAt: number;
        }>;
      }>;
      recordDownloadEvent: (
        folderId: string,
        relativePath: string,
        bytes: number
      ) => Promise<{ success: boolean }>;
      recordPreviewEvent: (
        folderId: string,
        relativePath: string,
        bytes: number
      ) => Promise<{ success: boolean }>;
      onStatsUpdated: (callback: (data: { at: number }) => void) => void;
    };
  }
}
