import { createClient } from '@supabase/supabase-js';

export let supabase = null;
export let supabaseConfigured = false;

function initialiseSupabase(url, key) {
  if (!url || !key) return false;
  supabase = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  supabaseConfigured = true;
  return true;
}

// Prefer Vite build variables when present; otherwise obtain the browser-safe
// publishable configuration from the Cloudflare Worker at runtime.
export async function configureSupabase() {
  const buildUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const buildKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
  if (initialiseSupabase(buildUrl, buildKey)) return;

  try {
    const response = await fetch('/api/config', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });
    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw new Error(details.error || `Runtime configuration request failed (${response.status}).`);
    }
    const config = await response.json();
    if (!initialiseSupabase(config.supabaseUrl, config.supabasePublishableKey)) {
      throw new Error('The runtime configuration did not include the required public Supabase settings.');
    }
  } catch (error) {
    console.error('Chef Godwin Supabase configuration:', error);
    throw error;
  }
}
