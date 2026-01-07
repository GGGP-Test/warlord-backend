import express, { Express, Request, Response } from 'express';
import './config/firebase'; // Initialize Firebase on startup

const app: Express = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// Health check endpoint (REQUIRED for Cloud Run)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'warlord-backend',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'WARLORD Backend is running',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// Basic API endpoint
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API endpoint',
    features: [
      'Firebase Admin integration',
      'Express server',
      'Health monitoring'
    ]
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🚀 API: http://localhost:${PORT}/api`);
});

export { app };
