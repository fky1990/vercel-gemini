import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Enable CORS for all origins
app.use(cors());

// Proxy requests to the Gemini API
const geminiProxy = createProxyMiddleware({
  target: 'https://generativelanguage.googleapis.com',
  changeOrigin: true,
  pathRewrite: {
    // Keep the path as is, e.g., /v1beta/models/...
  },
  on: {
    proxyReq: (proxyReq, req, res) => {
      // If the user hasn't provided an API key in the request, inject the server's key
      const hasApiKey = req.url.includes('key=') || req.headers['x-goog-api-key'];
      
      if (!hasApiKey && process.env.GEMINI_API_KEY) {
        proxyReq.setHeader('x-goog-api-key', process.env.GEMINI_API_KEY);
      }
    },
  },
});

// Route /v1beta and /v1alpha to the proxy
app.use('/v1beta', geminiProxy);
app.use('/v1alpha', geminiProxy);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Gemini Proxy is running on Vercel!' });
});

// Export the Express API
export default app;
