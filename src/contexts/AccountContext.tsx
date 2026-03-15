// src/contexts/AccountContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface CustomerProfile {
  id: string;
  auth_user_id: string;
  email: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface AccountContextValue {
  user: User | null;
  session: Session | null;
  profile: CustomerProfile | null;
  isLoading: boolean;
  isCustomer: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AccountContext = createContext<AccountContextValue>({
  user: null, session: null, profile: null, isLoading: true, isCustomer: false,
  refreshProfile: async () => {}, signOut: async () => {},
});

export const useAccount = () => useContext(AccountContext);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]           = useState<User | null>(null);
  const [session, setSession]     = useState<Session | null>(null);
  const [profile, setProfile]     = useState<CustomerProfile | null>(null);
  const [isCustomer, setIsCustomer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setIsCustomer(false); setIsLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
  console.log('fetchProfile called with userId:', userId);
  try {
    const { data, error } = await (supabase as any)
      .from('customer_profiles')
      .select('*')
      .eq('auth_user_id', userId);

    console.log('fetchProfile result:', { data, error });

    const row = Array.isArray(data) ? data[0] : data;

    if (row && !error) {
      setProfile(row);
      setIsCustomer(true);
    } else {
      setProfile(null);
      setIsCustomer(false);
    }
  } catch {
    setProfile(null);
    setIsCustomer(false);
  } finally {
    setIsLoading(false);
  }
};

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null); setSession(null); setProfile(null); setIsCustomer(false);
  };

  return (
    <AccountContext.Provider value={{ user, session, profile, isLoading, isCustomer, refreshProfile, signOut }}>
      {children}
    </AccountContext.Provider>
  );
};
