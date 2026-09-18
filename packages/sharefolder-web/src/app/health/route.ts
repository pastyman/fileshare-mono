import { corsPreflight, jsonOk } from '@/lib/signaling';

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET() {
  return jsonOk({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'sharefolder-web',
  });
}
