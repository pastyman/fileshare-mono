import { NextResponse } from 'next/server';
import { getORMi } from 'orm';

export function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }
  return uri;
}

export function getOrm() {
  return getORMi(getMongoUri());
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function withCors(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export function jsonOk(data: unknown, init?: ResponseInit): NextResponse {
  return withCors(NextResponse.json(data, init));
}

export function jsonError(
  error: string,
  status: number,
  extra?: Record<string, unknown>
): NextResponse {
  return withCors(NextResponse.json({ error, ...extra }, { status }));
}

export function corsPreflight(): NextResponse {
  return withCors(new NextResponse(null, { status: 204 }));
}
