import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Enable CORS for all origins
app.use(cors());

// Proxy requests from OpenAI format (/v1/*) to Gemini's OpenAI compatible endpoint
const openaiToGeminiProxy = createProxyMiddleware({
  target: 'https://generativelanguage.googleapis.com',
  changeOrigin: true,
  pathRewrite: {
    '^/v1/': '/v1beta/openai/',
  },
  on: {
    proxyReq: (proxyReq, req, res) => {
      // The user sends their Gemini API key via the standard OpenAI Authorization header:
      // Authorization: Bearer <GEMINI_API_KEY>
      // Gemini's OpenAI compatibility layer natively accepts this header,
      // so we just pass it through without needing any Vercel environment variables.
    },
  },
});

// Route /v1 to the proxy
app.use('/v1', openaiToGeminiProxy);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'OpenAI to Gemini Proxy is running on Vercel!' });
});

// Export the Express API
export default app;
