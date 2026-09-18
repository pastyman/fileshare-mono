import { ICE_SERVERS, corsPreflight, jsonOk } from '@/lib/signaling';

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET() {
  return jsonOk(ICE_SERVERS);
}
