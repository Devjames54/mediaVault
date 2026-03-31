import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const supabaseUrl = 'https://laguhturzseygswyaucx.supabase.co';

app.use('/supabase-proxy', createProxyMiddleware({
  target: supabaseUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/supabase-proxy': '',
  },
  on: {
    proxyReq: (proxyReq, req, res) => {
      console.log('Proxying request to:', proxyReq.protocol + '//' + proxyReq.host + proxyReq.path);
    },
    error: (err, req, res) => {
      console.error('Proxy Error:', err);
    }
  }
}));

app.listen(3001, () => {
  console.log('Test proxy running on 3001');
});
