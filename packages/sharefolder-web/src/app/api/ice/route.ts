import { resolveIceServers } from 'types';
import { corsPreflight, jsonOk } from '@/lib/signaling';

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET() {
  return jsonOk(await resolveIceServers());
}
