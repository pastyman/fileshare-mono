import { corsPreflight, getOrm, jsonError, jsonOk } from '@/lib/signaling';

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const MessagingModel = getOrm().getMessagingModel();
    await MessagingModel.create({
      order: body.order,
      from: body.from,
      to: body.to,
      data: body.data,
      rtcid: parseInt(body.rtcid, 10),
      timestamp: Date.now(),
    });
    return jsonOk({ message: 'message sent' });
  } catch (error) {
    console.error('send error', error);
    return jsonError('Failed to send message', 500);
  }
}
