import { NextRequest } from 'next/server';
import { corsPreflight, getOrm, jsonError, jsonOk } from '@/lib/signaling';

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET(request: NextRequest) {
  const guid = request.nextUrl.searchParams.get('guid');

  if (!guid) {
    return jsonError('Missing guid parameter', 400, {
      message: 'Please provide a guid query parameter',
    });
  }

  const instanceId = guid;
  const oneMinAgo = new Date(Date.now() - 1 * 60 * 1000);

  try {
    const ConnectModel = getOrm().getConnectModel();

    const results = await ConnectModel.find({
      instanceId,
      timestamp: { $gt: oneMinAgo },
    });

    if (results.length > 0) {
      await ConnectModel.deleteMany({
        _id: { $in: results.map((result) => result._id) },
      });
    }

    const connections = results.map((result) => ({
      peerId: result.peerId,
      folderId: result.folderId,
    }));

    return jsonOk({
      status: 'connected',
      instanceId,
      timestamp: new Date().toISOString(),
      message: 'Instance connection verified',
      connections,
    });
  } catch (error) {
    console.error('Database error:', error);
    return jsonError('Database error', 500, {
      message: 'Failed to retrieve connections',
    });
  }
}
