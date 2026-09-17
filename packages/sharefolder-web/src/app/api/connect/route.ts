import { NextRequest, NextResponse } from 'next/server';
import { getORMi } from 'orm';

export async function POST(request: NextRequest) {
  try {
    const { instanceId, folderId, peerId } = await request.json();
    
    if (!instanceId || !folderId || !peerId) {
      return NextResponse.json(
        { error: 'Missing required fields: instanceId, folderId, peerId' },
        { status: 400 }
      );
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB URI not configured' },
        { status: 500 }
      );
    }

    // Use the ORM library
    const orm = getORMi(process.env.MONGODB_URI);
    const connectModel = orm.getConnectModel();
    
    // Create connection record using the Connect schema
    const connection = new connectModel({
      instanceId,
      folderId,
      peerId,
      clientId: peerId, // Using peerId as clientId for now
      secret: Math.random().toString(36).substring(2, 15), // Generate a random secret
      timestamp: new Date()
    });

    const result = await connection.save();

    return NextResponse.json({
      success: true,
      connectionId: result.id,
      message: 'Connection established successfully'
    });

  } catch (error) {
    console.error('Error establishing connection:', error);
    return NextResponse.json(
      { error: 'Failed to establish connection' },
      { status: 500 }
    );
  }
}
