import express, { Express } from 'express';
import { questionAnswerSubmitted } from './functions/questionAnswerSubmitted';

const app: Express = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// Health check endpoint (REQUIRED for Cloud Run)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'galactly-backend',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WARLORD Backend is running',
    endpoints: {
      health: '/health',
      qa: '/api/qa'
    }
  });
});

// Question & Answer endpoint
app.post('/api/qa', async (req, res) => {
  try {
    const result = await questionAnswerSubmitted(req, res);
    return result;
  } catch (error) {
    console.error('Error in /api/qa:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 404 handler
app.use((req, res) => {
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
});

export { app };
