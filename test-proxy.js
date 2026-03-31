import http from 'http';

http.get('http://localhost:3000/supabase-proxy/auth/v1/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', data));
});
