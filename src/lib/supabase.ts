// ============================================
// Supabase Client Configuration
// ============================================

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabaseUrl = PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Warn once when running without Supabase
let _mockWarned = false;

// Create a mock client for when Supabase is not configured
const createMockClient = (): SupabaseClient => {
  if (!_mockWarned) {
    _mockWarned = true;
    console.warn('[Supabase] Not configured — running with mock client. Auth, storage, and database features are disabled.');
  }
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signInWithOAuth: async () => ({ data: { provider: '', url: '' }, error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      update: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      delete: () => ({ data: null, error: { message: 'Supabase not configured' } })
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    }
  } as unknown as SupabaseClient;
};

// Single client instance (using browser client which handles SSR properly)
export const supabase: SupabaseClient = isSupabaseConfigured 
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

// Re-export the singleton — kept for call-site compatibility
export function createSupabaseBrowserClient() {
  return supabase;
}
