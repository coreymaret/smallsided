// src/contexts/AdminContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type AdminUser = Database['public']['Tables']['admin_users']['Row'];
type AdminRole = AdminUser['role'];

// ─────────────────────────────────────────────────────────────────────────────
// Permission map
// Every permission key maps to the roles that are allowed to perform it.
// Add new permissions here as features are built — never check role strings
// directly in components, always go through can().
// ─────────────────────────────────────────────────────────────────────────────
const PERMISSIONS = {
  // ── Financial ──────────────────────────────────────────────
  view_revenue:           ['super_admin', 'manager'],
  view_stripe_details:    ['super_admin'],
  issue_refunds:          ['super_admin'],
  export_data:            ['super_admin', 'manager'],

  // ── Bookings ───────────────────────────────────────────────
  view_bookings:          ['super_admin', 'manager', 'staff', 'readonly'],
  edit_bookings:          ['super_admin', 'manager', 'staff'],
  delete_bookings:        ['super_admin'],
  change_booking_status:  ['super_admin', 'manager', 'staff'],
  add_booking_notes:      ['super_admin', 'manager', 'staff'],

  // ── Staff / HR ─────────────────────────────────────────────
  manage_staff:           ['super_admin'],
  manage_location_staff:  ['super_admin', 'manager'],
  approve_timeoff:        ['super_admin', 'manager'],
  view_all_schedules:     ['super_admin', 'manager'],
  view_own_schedule:      ['super_admin', 'manager', 'staff'],
  submit_timeoff:         ['super_admin', 'manager', 'staff'],

  // ── Facility ───────────────────────────────────────────────
  manage_settings:        ['super_admin'],
  manage_calendar:        ['super_admin', 'manager'],
  manage_leagues:         ['super_admin', 'manager'],
  view_facility_schedule: ['super_admin', 'manager', 'staff', 'readonly'],

  // ── Locations ──────────────────────────────────────────────
  view_all_locations:     ['super_admin'],
  switch_locations:       ['super_admin'],
  manage_locations:       ['super_admin'],

  // ── Communications ─────────────────────────────────────────
  send_communications:    ['super_admin', 'manager'],
  view_communications:    ['super_admin', 'manager', 'staff'],

  // ── Audit ──────────────────────────────────────────────────
  view_audit_log:         ['super_admin'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

// ─────────────────────────────────────────────────────────────────────────────
// Context types
// ─────────────────────────────────────────────────────────────────────────────
interface AdminContextValue {
  admin: AdminUser | null;
  isLoading: boolean;
  /** Returns true if the current admin has the given permission */
  can: (permission: Permission) => boolean;
  /**
   * Returns true if the current admin has the permission AND is assigned
   * to the given location (or is a super_admin with global access).
   */
  canAtLocation: (permission: Permission, locationId: string) => boolean;
  /** True if the current admin is a super_admin */
  isSuperAdmin: boolean;
  /** Refresh the admin record from the database */
  refreshAdmin: () => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider = ({ children }: AdminProviderProps) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        setAdmin(null);
        return;
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', user.id)      // query by id — matches RLS policy auth.uid() = id
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setAdmin(null);
        return;
      }

      setAdmin(data);
    } catch {
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();

    // Re-fetch if auth state changes (e.g. token refresh, sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchAdmin();
    });

    return () => subscription.unsubscribe();
  }, []);

  const can = (permission: Permission): boolean => {
    if (!admin) return false;
    const allowed = PERMISSIONS[permission] as readonly string[];
    return allowed.includes(admin.role);
  };

  const canAtLocation = (permission: Permission, locationId: string): boolean => {
    if (!can(permission)) return false;
    if (admin?.role === 'super_admin') return true;
    if (!admin?.location_id) return false; // no location assigned
    return admin.location_id === locationId;
  };

  const isSuperAdmin = admin?.role === 'super_admin';

  return (
    <AdminContext.Provider value={{
      admin,
      isLoading,
      can,
      canAtLocation,
      isSuperAdmin,
      refreshAdmin: fetchAdmin,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
export const useAdmin = (): AdminContextValue => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider. Wrap your admin routes with <AdminProvider>.');
  }
  return context;
};

export default AdminContext;
