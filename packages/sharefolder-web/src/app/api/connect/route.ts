import { corsPreflight, getOrm, jsonError, jsonOk } from '@/lib/signaling';

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  try {
    const { instanceId, folderId, peerId } = await request.json();

    if (!instanceId || !folderId || !peerId) {
      return jsonError(
        'Missing required fields: instanceId, folderId, peerId',
        400
      );
    }

    const connectModel = getOrm().getConnectModel();

    const connection = new connectModel({
      instanceId,
      folderId,
      peerId,
      clientId: peerId,
      secret: Math.random().toString(36).substring(2, 15),
      timestamp: new Date(),
    });

    const result = await connection.save();

    return jsonOk({
      success: true,
      connectionId: result.id,
      message: 'Connection established successfully',
    });
  } catch (error) {
    console.error('Error establishing connection:', error);
    return jsonError('Failed to establish connection', 500);
  }
}
