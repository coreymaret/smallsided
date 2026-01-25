import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-application-name': 'small-sided-soccer',
    },
  },
});

// Helper function to check if user is authenticated admin
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Helper function to get current admin user
export const getCurrentAdmin = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', session.user.email)
    .eq('is_active', true)
    .single();

  return adminUser;
};

// Helper function to sign out
export const signOut = async () => {
  await supabase.auth.signOut();
};
