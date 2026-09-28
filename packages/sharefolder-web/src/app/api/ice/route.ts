import { resolveIceServers } from 'types';
import { corsPreflight, jsonOk } from '@/lib/signaling';
import { trackDaily } from '@/lib/usage';

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET() {
  trackDaily('iceRequests');
  return jsonOk(await resolveIceServers());
}
