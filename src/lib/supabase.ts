// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Type for admin users from database
type AdminUser = Database['public']['Tables']['admin_users']['Row'];

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Helper function to get current admin user
// Queries by auth.uid() (id) not email — required for RLS to resolve correctly.
// The RLS policy is: auth.uid() = id, so the query must filter by id.
export const getCurrentAdmin = async (): Promise<AdminUser | null> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: adminUser, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', user.id)        // ← use id, not email
    .eq('is_active', true)
    .single();

  if (error || !adminUser) return null;

  return adminUser;
};
