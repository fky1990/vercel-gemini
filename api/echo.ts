import express from 'express';

const app = express();

app.all('*', (req, res) => {
  res.json({
    url: req.url,
    originalUrl: req.originalUrl,
    path: req.path,
    query: req.query,
    headers: req.headers,
  });
});

export default app;
