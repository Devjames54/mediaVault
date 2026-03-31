import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // The user accidentally set VITE_SUPABASE_URL to .com instead of .co in their settings
  let supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://laguhturzseygswyaucx.supabase.co';
  if (supabaseUrl.endsWith('.com')) {
    supabaseUrl = supabaseUrl.replace('.com', '.co');
  }

  // Proxy all requests starting with /supabase-proxy to the actual Supabase URL
  // This bypasses strict network firewalls by making the requests look like they
  // are going to the same domain as the app.
  app.use('/supabase-proxy', createProxyMiddleware({
    target: supabaseUrl,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      '^/supabase-proxy': '', // remove base path
    },
    ws: true, // proxy websockets for Supabase Realtime
    on: {
      proxyReq: (proxyReq, req, res) => {
        // Log proxy requests for debugging
        console.log(`[PROXY] ${req.method} ${req.url} -> ${supabaseUrl}${proxyReq.path}`);
      },
      error: (err, req, res) => {
        console.error('[PROXY ERROR]', err);
      }
    }
  }));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
