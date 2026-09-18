import mongoose from 'mongoose';
import { corsPreflight, getOrm, jsonError, jsonOk } from '@/lib/signaling';

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const MessagingModel = getOrm().getMessagingModel();

    const sixMinsAgo = Date.now() - 6 * 60 * 1000;
    await MessagingModel.deleteMany({ timestamp: { $lt: sixMinsAgo } });

    const messages = await MessagingModel.find({
      from: body.from,
      to: body.to,
    }).sort({ order: 'asc' });

    const ids = messages.map((msg) => new mongoose.Types.ObjectId(msg.id));
    if (ids.length > 0) {
      await MessagingModel.deleteMany({ _id: { $in: ids } });
    }

    return jsonOk(messages);
  } catch (error) {
    console.error('recieve error', error);
    return jsonError('Failed to receive messages', 500);
  }
}
