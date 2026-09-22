import type { IceResponse } from './responses';

export type IceServer = IceResponse['iceServers'][number];

/**
 * Public STUN endpoints that answered a binding request from this environment.
 * Keep the list short — each entry can delay ICE gathering.
 */
export const PUBLIC_STUN_SERVERS: IceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
  { urls: 'stun:stun.relay.metered.ca:80' },
  { urls: 'stun:stun.freeswitch.org:3478' },
  { urls: 'stun:stun.nextcloud.com:3478' },
];

/**
 * Metered Open Relay — historically the main free public TURN.
 * Creds are shared/demo-grade; prefer METERED_DOMAIN + METERED_API_KEY when available.
 * Covers UDP/TCP on 80/443 plus TURNS for strict TLS-only networks.
 */
export const PUBLIC_TURN_SERVERS: IceServer[] = [
  {
    urls: [
      'turn:openrelay.metered.ca:80',
      'turn:openrelay.metered.ca:80?transport=tcp',
      'turn:openrelay.metered.ca:443',
      'turn:openrelay.metered.ca:443?transport=tcp',
      'turns:openrelay.metered.ca:443',
      'turns:openrelay.metered.ca:443?transport=tcp',
    ],
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

/** Static public ICE config used when no Metered API key is configured. */
export const PUBLIC_ICE_SERVERS: IceResponse = {
  iceServers: [...PUBLIC_STUN_SERVERS, ...PUBLIC_TURN_SERVERS],
};

function meteredCredentialsUrl(
  env: NodeJS.ProcessEnv = process.env
): string | null {
  const explicit = env['METERED_TURN_CREDENTIALS_URL']?.trim();
  if (explicit) return explicit;

  const apiKey = env['METERED_API_KEY']?.trim();
  const domain = env['METERED_DOMAIN']?.trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
  if (!apiKey || !domain) return null;

  return `https://${domain}/api/v1/turn/credentials?apiKey=${encodeURIComponent(apiKey)}`;
}

/**
 * Resolve ICE servers for signaling APIs.
 * If Metered free-tier env is set, prefer those (geo-routed + account quotas);
 * always keep public STUNs as a fallback for host/srflx candidates.
 */
export async function resolveIceServers(
  env: NodeJS.ProcessEnv = process.env
): Promise<IceResponse> {
  const url = meteredCredentialsUrl(env);
  if (!url) return PUBLIC_ICE_SERVERS;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.warn(
        `Metered TURN credentials fetch failed (${res.status}); using public ICE list`
      );
      return PUBLIC_ICE_SERVERS;
    }

    const data = (await res.json()) as IceServer[] | IceResponse;
    const meteredServers = Array.isArray(data)
      ? data
      : Array.isArray(data?.iceServers)
        ? data.iceServers
        : [];

    if (meteredServers.length === 0) {
      console.warn('Metered TURN credentials empty; using public ICE list');
      return PUBLIC_ICE_SERVERS;
    }

    return {
      iceServers: [...PUBLIC_STUN_SERVERS, ...meteredServers],
    };
  } catch (error) {
    console.warn('Metered TURN credentials fetch error; using public ICE list', error);
    return PUBLIC_ICE_SERVERS;
  }
}
