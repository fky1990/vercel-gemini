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
  pathRewrite: (path, req) => {
    // Vercel rewrites /v1/:path* to /api/index?path=:path*
    // Local dev server might pass the original path or stripped path
    let targetPath = req.query.path || path.replace(/^\/v1\//, '');
    // Ensure no leading slash on targetPath to avoid double slashes
    targetPath = targetPath.toString().replace(/^\//, '');
    return `/v1beta/openai/${targetPath}`;
  },
  on: {
    proxyReq: (proxyReq, req, res) => {
      console.log(`[Proxy] Rewriting ${req.originalUrl} -> ${proxyReq.path}`);
      // The user sends their Gemini API key via the standard OpenAI Authorization header:
      // Authorization: Bearer <GEMINI_API_KEY>
      // Gemini's OpenAI compatibility layer natively accepts this header,
      // so we just pass it through without needing any Vercel environment variables.
    },
  },
});

// Route /v1 to the proxy (for local dev)
app.use('/v1', openaiToGeminiProxy);

// Route /api/index to the proxy (for Vercel rewrites)
app.use('/api/index', openaiToGeminiProxy);

// Also handle root in case Vercel routes directly
app.use('/', (req, res, next) => {
  if (req.query.path) {
    return openaiToGeminiProxy(req, res, next);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'OpenAI to Gemini Proxy is running on Vercel!' });
});

// Export the Express API
export default app;
