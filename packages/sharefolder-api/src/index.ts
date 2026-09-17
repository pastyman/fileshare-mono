import 'reflect-metadata';
import { getORMi } from 'orm';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'sharefolder-api'
  });
});

// API routes
app.get('/api/v1/folders', (req, res) => {
  res.json({ message: 'Folders endpoint - coming soon!' });
});

app.get('/api/v1/instances/:instanceId', (req, res) => {
  const { instanceId } = req.params;
  res.json({ 
    message: 'Instance endpoint - coming soon!', 
    instanceId 
  });
});

// Connection status endpoint for the ShareFolder app
app.get('/connections', async (req, res) => {
  const { guid } = req.query;
  
  if (!guid) {
    return res.status(400).json({ 
      error: 'Missing guid parameter',
      message: 'Please provide a guid query parameter'
    });
  }

  // Check what clients (from the web) are trying to connect to this sharefolder instance
  const instanceId = guid as string;

  // Get connections from the last minute
  const oneMinAgo = new Date(Date.now() - 1 * 60 * 1000);
  console.log("oneMinAgo", oneMinAgo);

  try {
    const ormi = getORMi(process.env.MONGODB_URI!);
    const ConnectModel = ormi.getConnectModel();
    
    const results = await ConnectModel.find({
      instanceId,
      timestamp: { $gt: oneMinAgo }
    });

    // Delete processed connections
    if (results.length > 0) {
      await ConnectModel.deleteMany({ 
        _id: { $in: results.map(result => result._id) } 
      });
    }
    
    // Return the format the app expects: [{peerId, folderId}]
    const connections = results.map(result => ({
      peerId: result.peerId,
      folderId: result.folderId
    }));
    
    res.json({
      status: 'connected',
      instanceId,
      timestamp: new Date().toISOString(),
      message: 'Instance connection verified',
      connections
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Database error',
      message: 'Failed to retrieve connections'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`ShareFolder API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
