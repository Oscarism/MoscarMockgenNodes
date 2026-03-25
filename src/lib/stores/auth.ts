// ============================================
// Auth Store - Supabase Authentication State
// ============================================

import { writable, derived, get } from 'svelte/store';
import { supabase, isSupabaseConfigured } from '$lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { toasts } from './toasts';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  initialized: false
};

// Login event callbacks — avoids circular dependency with generation store
const _onLoginCallbacks: Array<(user: User) => void | Promise<void>> = [];

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,

    /**
     * Initialize auth state and listen for changes
     */
    async initialize() {
      if (!isSupabaseConfigured) {
        update(s => ({ ...s, loading: false, initialized: true }));
        return;
      }

      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth initialization error:', error);
        }

        set({
          user: session?.user ?? null,
          session: session,
          loading: false,
          initialized: true
        });

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (_event, session) => {
          set({
            user: session?.user ?? null,
            session: session,
            loading: false,
            initialized: true
          });

          // Notify listeners (e.g. generation store) without direct import
          if (session?.user && _event === 'SIGNED_IN') {
            for (const cb of _onLoginCallbacks) {
              try { await cb(session.user); } catch {}
            }
          }
        });

      } catch (error) {
        console.error('Auth initialization failed:', error);
        update(s => ({ ...s, loading: false, initialized: true }));
      }
    },

    /**
     * Sign in with email and password
     */
    async signInWithEmail(email: string, password: string): Promise<{ error: AuthError | null }> {
      update(s => ({ ...s, loading: true }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        update(s => ({ ...s, loading: false }));
        toasts.error(error.message);
        return { error };
      }

      toasts.success('Signed in successfully!');
      return { error: null };
    },

    /**
     * Sign up with email and password
     */
    async signUpWithEmail(email: string, password: string): Promise<{ error: AuthError | null }> {
      update(s => ({ ...s, loading: true }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        update(s => ({ ...s, loading: false }));
        console.error('[Auth] signUp error:', error);
        toasts.error(error.message);
        return { error };
      }

      toasts.success('Account created! Check your email to confirm.');
      update(s => ({ ...s, loading: false }));
      return { error: null };
    },

    /**
     * Sign in with OAuth provider
     */
    async signInWithProvider(provider: 'google' | 'github') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        toasts.error(error.message);
      }
    },

    /**
     * Sign out
     */
    async signOut() {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toasts.error(error.message);
      } else {
        toasts.success('Signed out successfully');
        set({ ...initialState, loading: false, initialized: true });
      }
    },

    /**
     * Get current user
     */
    getUser(): User | null {
      return get({ subscribe }).user;
    },

    /**
     * Check if user is logged in
     */
    isLoggedIn(): boolean {
      return get({ subscribe }).user !== null;
    },

    /**
     * Register a callback for login events.
     * Use this instead of importing generation store (avoids circular dependency).
     */
    onLogin(cb: (user: User) => void | Promise<void>) {
      _onLoginCallbacks.push(cb);
    }
  };
}

export const auth = createAuthStore();

// Derived stores for convenience
export const user = derived(auth, $auth => $auth.user);
export const isLoggedIn = derived(auth, $auth => $auth.user !== null);
export const isAuthLoading = derived(auth, $auth => $auth.loading);
