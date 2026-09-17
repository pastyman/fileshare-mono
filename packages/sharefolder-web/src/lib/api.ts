// API utility functions for ShareFolder

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface FolderInfo {
  id: string;
  name: string;
  path: string;
  guid: string;
  createdAt: string;
  updatedAt: string;
}

export interface InstanceInfo {
  id: string;
  guid: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export class ShareFolderAPI {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_BASE_URL;
  }

  async getInstanceInfo(instanceId: string): Promise<InstanceInfo> {
    const response = await fetch(`${this.baseUrl}/api/v1/instances/${instanceId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch instance info: ${response.status}`);
    }
    
    return response.json();
  }

  async getFolderInfo(instanceId: string, folderId: string): Promise<FolderInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/instances/${instanceId}/folders/${folderId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch folder info: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      // Fallback for when API endpoints don't exist yet
      console.warn('API endpoint not available, using fallback data');
      return {
        id: folderId,
        name: `Folder ${folderId}`,
        path: `/path/to/folder/${folderId}`,
        guid: `guid-${folderId}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  }

  async listInstanceFolders(instanceId: string): Promise<FolderInfo[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/instances/${instanceId}/folders`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch folders: ${response.status}`);
    }
    
    return response.json();
  }

  async checkConnectionStatus(instanceId: string): Promise<{ status: string; connections: Array<{ peerId: string; folderId: string }> }> {
    const response = await fetch(`${this.baseUrl}/connections?guid=${instanceId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to check connection: ${response.status}`);
    }
    
    return response.json();
  }
}

// Export a default instance
export const api = new ShareFolderAPI();
