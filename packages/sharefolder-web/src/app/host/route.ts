import { NextRequest, NextResponse } from 'next/server';
import {
  corsPreflight,
  getOrm,
  jsonError,
  jsonOk,
  withCors,
} from '@/lib/signaling';

export async function OPTIONS() {
  return corsPreflight();
}

/** Electron registers as RTC host for a waiting web peer */
export async function POST(request: Request) {
  try {
    const { peerId, hostId, folderId } = await request.json();
    if (!peerId || !hostId) {
      return jsonError('peerId and hostId required', 400);
    }

    const HostModel = getOrm().getHostRegistrationModel();
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    await HostModel.deleteMany({ timestamp: { $lt: fiveMinsAgo } });

    await HostModel.findOneAndUpdate(
      { peerId },
      {
        peerId,
        hostId,
        folderId: folderId || '',
        timestamp: new Date(),
      },
      { upsert: true, new: true }
    );

    return jsonOk({ success: true });
  } catch (error) {
    console.error('host register error', error);
    return jsonError('Failed to register host', 500);
  }
}

/** Web polls until Electron host is ready */
export async function GET(request: NextRequest) {
  try {
    const peerId = request.nextUrl.searchParams.get('peerId');
    if (!peerId) {
      return jsonError('peerId required', 400);
    }

    const HostModel = getOrm().getHostRegistrationModel();
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    await HostModel.deleteMany({ timestamp: { $lt: fiveMinsAgo } });

    const entry = await HostModel.findOneAndDelete({ peerId });
    if (!entry) {
      return withCors(new NextResponse(null, { status: 204 }));
    }

    return jsonOk({
      hostId: entry.hostId,
      folderId: entry.folderId || '',
    });
  } catch (error) {
    console.error('host poll error', error);
    return jsonError('Failed to poll host', 500);
  }
}
