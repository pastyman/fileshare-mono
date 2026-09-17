// src/renderer/config.ts

export function getFolderWebUrl(instanceId: string, folderId: string): string {
  if (process.env.NODE_ENV === 'development' || DEV_WEB_BASE) {
    const base = (DEV_WEB_BASE || 'http://localhost:3010').replace(/\/$/, '');
    return `${base}/${instanceId}/${folderId}`;
  }
  return `https://sharefolder.io/${instanceId}/${folderId}`;
}

export const CONNECTION_CONFIG = {
  endpoint: 'https://api.sharefolder.io/connections',
  pollInterval: 3000,
  requestTimeout: 5000,
} as const;

export let DEV_API_ENDPOINT: string | null = null;
export let DEV_WEB_BASE: string | null = null;
export let DEV_SIGNALING_BASE: string | null = null;

export function setDevApiEndpoint(endpoint: string) {
  DEV_API_ENDPOINT = endpoint;
}

export function setDevWebBase(base: string) {
  DEV_WEB_BASE = base;
}

export function setDevSignalingBase(base: string) {
  DEV_SIGNALING_BASE = base;
}

export function getConnectionEndpoint(): string {
  return DEV_API_ENDPOINT || CONNECTION_CONFIG.endpoint;
}

export function getSignalingBaseUrl(): string {
  if (DEV_SIGNALING_BASE) return DEV_SIGNALING_BASE.replace(/\/$/, '');
  if (DEV_API_ENDPOINT) {
    return DEV_API_ENDPOINT.replace(/\/connections\/?$/, '');
  }
  return 'https://api.sharefolder.io';
}
