import { corsPreflight, getOrm, jsonError, jsonOk } from '@/lib/signaling';

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const MessagingModel = getOrm().getMessagingModel();
    await MessagingModel.deleteMany({
      from: body.from,
      to: body.to,
    });
    return jsonOk({ message: 'cleaned' });
  } catch (error) {
    console.error('clean error', error);
    return jsonError('Failed to clean messages', 500);
  }
}
