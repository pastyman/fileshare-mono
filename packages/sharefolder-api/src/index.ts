import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { getORMi } from 'orm';
import { IceResponse } from 'types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const ICE_SERVERS: IceResponse = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};

/** web peerId -> host registration (Electron ready for RTC) */
const hostRegistry = new Map<
  string,
  { hostId: string; folderId: string; timestamp: number }
>();

const pruneHosts = () => {
  const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
  for (const [peerId, entry] of hostRegistry.entries()) {
    if (entry.timestamp < fiveMinsAgo) {
      hostRegistry.delete(peerId);
    }
  }
};

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'sharefolder-api',
  });
});

app.get('/api/ice', (_req, res) => {
  res.status(200).json(ICE_SERVERS);
});

app.post('/api/send', async (req, res) => {
  try {
    const body = req.body;
    const ormi = getORMi(process.env.MONGODB_URI!);
    const MessagingModel = ormi.getMessagingModel();
    await MessagingModel.create({
      order: body.order,
      from: body.from,
      to: body.to,
      data: body.data,
      rtcid: parseInt(body.rtcid, 10),
      timestamp: Date.now(),
    });
    res.status(200).json({ message: 'message sent' });
  } catch (error) {
    console.error('send error', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.post('/api/recieve', async (req, res) => {
  try {
    const body = req.body;
    const ormi = getORMi(process.env.MONGODB_URI!);
    const MessagingModel = ormi.getMessagingModel();

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

    res.status(200).json(messages);
  } catch (error) {
    console.error('recieve error', error);
    res.status(500).json({ error: 'Failed to receive messages' });
  }
});

app.post('/api/clean', async (req, res) => {
  try {
    const body = req.body;
    const ormi = getORMi(process.env.MONGODB_URI!);
    const MessagingModel = ormi.getMessagingModel();
    await MessagingModel.deleteMany({
      from: body.from,
      to: body.to,
    });
    res.status(200).json({ message: 'cleaned' });
  } catch (error) {
    console.error('clean error', error);
    res.status(500).json({ error: 'Failed to clean messages' });
  }
});

/** Electron registers as RTC host for a waiting web peer */
app.post('/host', (req, res) => {
  pruneHosts();
  const { peerId, hostId, folderId } = req.body || {};
  if (!peerId || !hostId) {
    return res.status(400).json({ error: 'peerId and hostId required' });
  }
  hostRegistry.set(peerId, {
    hostId,
    folderId: folderId || '',
    timestamp: Date.now(),
  });
  res.json({ success: true });
});

/** Web polls until Electron host is ready */
app.get('/host', (req, res) => {
  pruneHosts();
  const peerId = req.query.peerId as string;
  if (!peerId) {
    return res.status(400).json({ error: 'peerId required' });
  }
  const entry = hostRegistry.get(peerId);
  if (!entry) {
    return res.status(204).send();
  }
  // One-shot consume so reconnects need a fresh host registration
  hostRegistry.delete(peerId);
  res.json({
    hostId: entry.hostId,
    folderId: entry.folderId,
  });
});

app.get('/connections', async (req, res) => {
  const { guid } = req.query;

  if (!guid) {
    return res.status(400).json({
      error: 'Missing guid parameter',
      message: 'Please provide a guid query parameter',
    });
  }

  const instanceId = guid as string;
  const oneMinAgo = new Date(Date.now() - 1 * 60 * 1000);

  try {
    const ormi = getORMi(process.env.MONGODB_URI!);
    const ConnectModel = ormi.getConnectModel();

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

    res.json({
      status: 'connected',
      instanceId,
      timestamp: new Date().toISOString(),
      message: 'Instance connection verified',
      connections,
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Failed to retrieve connections',
    });
  }
});

app.use((_req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: _req.originalUrl,
  });
});

app.listen(PORT, () => {
  console.log(`ShareFolder API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
