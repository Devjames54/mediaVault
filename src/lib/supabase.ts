import { createClient } from '@supabase/supabase-js';

export let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://laguhturzseygswyaucx.supabase.co';
if (supabaseUrl.endsWith('.com')) {
  supabaseUrl = supabaseUrl.replace('.com', '.co');
}
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhZ3VodHVyenNleWdzd3lhdWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4Njg1MzksImV4cCI6MjA5MDQ0NDUzOX0.s1dcSreEIvOD29bnzuUaJbctVOjWncyWX-Z9DF_SMVM';

// If running in the browser, use the proxy URL to bypass strict network firewalls (like school Wi-Fi)
// The Express server will forward requests from /supabase-proxy to the actual Supabase URL.
const isBrowser = typeof window !== 'undefined';
const proxyUrl = isBrowser ? `${window.location.origin}/supabase-proxy` : supabaseUrl;

export const supabase = createClient(proxyUrl, supabaseAnonKey);

export const getFixedUrl = (url: string | undefined | null) => {
  if (!url) return '';
  if (url.includes('/supabase-proxy')) {
    return url.replace(/^.*\/supabase-proxy/, supabaseUrl);
  }
  return url;
};
