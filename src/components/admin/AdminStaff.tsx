// src/components/admin/AdminStaff.tsx
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import {
  User, Phone, Mail, Calendar, Shield, X, Check, AlertCircle
} from '../../components/Icons/Icons';
import ToastContainer from '../Toast/ToastContainer';
import { useToast } from '../../hooks/useToast';
import styles from './AdminStaff.module.scss';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StaffMember {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  hire_date: string | null;
  is_active: boolean;
  emergency_contact: string | null;
  notes: string | null;
  created_at: string;
}

const ROLE_OPTIONS = [
  { value: 'front_desk', label: 'Front Desk'  },
  { value: 'coach',      label: 'Coach'        },
  { value: 'referee',    label: 'Referee'      },
  { value: 'manager',    label: 'Manager'      },
];

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  front_desk: { bg: '#eff6ff', color: '#1d4ed8' },
  coach:      { bg: '#f0fdf4', color: '#166534' },
  referee:    { bg: '#fdf4ff', color: '#7e22ce' },
  manager:    { bg: '#fff7ed', color: '#c2410c' },
};

const emptyForm = (): Partial<StaffMember> => ({
  full_name: '', email: '', phone: '', role: 'front_desk',
  hire_date: '', emergency_contact: '', notes: '', is_active: true,
});

// ─── Sub-components ───────────────────────────────────────────────────────────

const RoleBadge = ({ role }: { role: string }) => {
  const cfg = ROLE_COLORS[role] ?? { bg: '#f3f4f6', color: '#374151' };
  const label = ROLE_OPTIONS.find(r => r.value === role)?.label ?? role;
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      padding: '0.1875rem 0.625rem', borderRadius: 20,
      fontSize: '0.8125rem', fontWeight: 600,
    }}>
      {label}
    </span>
  );
};

// ─── Staff Form Drawer ────────────────────────────────────────────────────────

interface StaffDrawerProps {
  staff: Partial<StaffMember> | null;
  isNew: boolean;
  onClose: () => void;
  onSave: () => void;
  showToast: (msg: string, type?: any) => void;
  canEdit: boolean;
}

const StaffDrawer = ({ staff, isNew, onClose, onSave, showToast, canEdit }: StaffDrawerProps) => {
  const [form, setForm]         = useState<Partial<StaffMember>>(staff ?? emptyForm());
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (key: keyof StaffMember, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.full_name?.trim()) errs.full_name = 'Name is required';
    if (!form.email?.trim())     errs.email     = 'Email is required';
    if (!form.role)              errs.role      = 'Role is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      if (isNew) {
        const { error } = await (supabase as any).from('staff_members').insert({
          full_name:         form.full_name,
          email:             form.email,
          phone:             form.phone || null,
          role:              form.role,
          hire_date:         form.hire_date || null,
          is_active:         form.is_active ?? true,
          emergency_contact: form.emergency_contact || null,
          notes:             form.notes || null,
        });
        if (error) throw error;
        showToast('Staff member added.', 'success');
      } else {
        const { error } = await (supabase as any).from('staff_members')
          .update({
            full_name:         form.full_name,
            email:             form.email,
            phone:             form.phone || null,
            role:              form.role,
            hire_date:         form.hire_date || null,
            is_active:         form.is_active ?? true,
            emergency_contact: form.emergency_contact || null,
            notes:             form.notes || null,
            updated_at:        new Date().toISOString(),
          })
          .eq('id', form.id);
        if (error) throw error;
        showToast('Staff member updated.', 'success');
      }
      onSave();
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to save.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!form.id) return;
    const newVal = !form.is_active;
    setForm(prev => ({ ...prev, is_active: newVal }));
    const { error } = await (supabase as any).from('staff_members')
      .update({ is_active: newVal, updated_at: new Date().toISOString() })
      .eq('id', form.id);
    if (error) {
      setForm(prev => ({ ...prev, is_active: !newVal }));
      showToast('Failed to update status.', 'error');
    } else {
      showToast(newVal ? 'Staff member reactivated.' : 'Staff member deactivated.', 'success');
      onSave();
    }
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div className={styles.drawer} role="dialog" aria-modal="true">

        {/* Header */}
        <div className={styles.drawerHeader}>
          <div>
            <h2>{isNew ? 'Add Staff Member' : form.full_name}</h2>
            {!isNew && <RoleBadge role={form.role ?? 'front_desk'} />}
          </div>
          <button className={styles.drawerClose} onClick={onClose}><X size={20} /></button>
        </div>

        {/* Body */}
        <div className={styles.drawerBody}>

          {/* Status toggle (edit mode only) */}
          {!isNew && (
            <div className={styles.statusRow}>
              <span className={form.is_active ? styles.activeTag : styles.inactiveTag}>
                {form.is_active ? '● Active' : '○ Inactive'}
              </span>
              {canEdit && (
                <button className={styles.toggleBtn} onClick={handleToggleActive}>
                  {form.is_active ? 'Deactivate' : 'Reactivate'}
                </button>
              )}
            </div>
          )}

          {/* Personal info */}
          <section className={styles.drawerSection}>
            <h3>Personal Info</h3>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Full Name <span className={styles.req}>*</span></label>
                <input
                  className={`${styles.input} ${errors.full_name ? styles.inputErr : ''}`}
                  value={form.full_name ?? ''}
                  onChange={e => set('full_name', e.target.value)}
                  disabled={!canEdit}
                  placeholder="Full name"
                  autoFocus
                />
                {errors.full_name && <span className={styles.errMsg}>{errors.full_name}</span>}
              </div>
              <div className={styles.formField}>
                <label>Role <span className={styles.req}>*</span></label>
                <select
                  className={styles.input}
                  value={form.role ?? 'front_desk'}
                  onChange={e => set('role', e.target.value)}
                  disabled={!canEdit}
                >
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Email <span className={styles.req}>*</span></label>
                <input
                  className={`${styles.input} ${errors.email ? styles.inputErr : ''}`}
                  type="email"
                  value={form.email ?? ''}
                  onChange={e => set('email', e.target.value)}
                  disabled={!canEdit}
                  placeholder="email@example.com"
                />
                {errors.email && <span className={styles.errMsg}>{errors.email}</span>}
              </div>
              <div className={styles.formField}>
                <label>Phone</label>
                <input
                  className={styles.input}
                  type="tel"
                  value={form.phone ?? ''}
                  onChange={e => set('phone', e.target.value)}
                  disabled={!canEdit}
                  placeholder="(555) 555-5555"
                />
              </div>
            </div>
            <div className={styles.formField}>
              <label>Hire Date</label>
              <input
                className={styles.input}
                type="date"
                value={form.hire_date ?? ''}
                onChange={e => set('hire_date', e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </section>

          {/* Emergency contact */}
          <section className={styles.drawerSection}>
            <h3>Emergency Contact</h3>
            <div className={styles.formField}>
              <label>Name & Phone</label>
              <input
                className={styles.input}
                value={form.emergency_contact ?? ''}
                onChange={e => set('emergency_contact', e.target.value)}
                disabled={!canEdit}
                placeholder="e.g. Jane Doe — (555) 555-5555"
              />
            </div>
          </section>

          {/* Notes */}
          <section className={styles.drawerSection}>
            <h3>Notes</h3>
            <textarea
              className={styles.textarea}
              value={form.notes ?? ''}
              onChange={e => set('notes', e.target.value)}
              disabled={!canEdit}
              rows={3}
              placeholder="Certifications, availability notes, etc."
            />
          </section>

        </div>

        {/* Footer */}
        {canEdit && (
          <div className={styles.drawerFooter}>
            <button className={styles.cancelBtn} onClick={onClose} disabled={isSaving}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving…' : isNew ? 'Add Staff Member' : 'Save Changes'}
            </button>
          </div>
        )}

      </div>
    </>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const AdminStaff = () => {
  const { can }                             = useAdmin();
  const { toasts, showToast, removeToast } = useToast();
  const [staff, setStaff]                  = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading]          = useState(true);
  const [selectedStaff, setSelectedStaff]  = useState<Partial<StaffMember> | null>(null);
  const [isNew, setIsNew]                  = useState(false);
  const [showInactive, setShowInactive]    = useState(false);
  const [searchQ, setSearchQ]              = useState('');

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('staff_members')
        .select('*')
        .order('full_name', { ascending: true });
      if (error) throw error;
      setStaff(data || []);
    } catch (err: any) {
      showToast('Failed to load staff.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = useCallback(() => {
    setSelectedStaff(null);
    setIsNew(false);
    fetchStaff();
  }, []);

  const filtered = staff.filter(s => {
    if (!showInactive && !s.is_active) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      return (
        s.full_name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const active   = filtered.filter(s => s.is_active);
  const inactive = filtered.filter(s => !s.is_active);

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Staff</h1>
          <p>{staff.filter(s => s.is_active).length} active staff members</p>
        </div>
        {can('manage_location_staff') && (
          <button className={styles.addStaffBtn} onClick={() => { setIsNew(true); setSelectedStaff(emptyForm()); }}>
            + Add Staff Member
          </button>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <User size={16} />
          <input
            placeholder="Search by name, email, or role…"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={showInactive}
            onChange={e => setShowInactive(e.target.checked)}
          />
          Show inactive
        </label>
      </div>

      {/* Loading */}
      {isLoading && <div className={styles.loading}>Loading staff…</div>}

      {/* Empty state */}
      {!isLoading && staff.length === 0 && (
        <div className={styles.empty}>
          <User size={40} className={styles.emptyIcon} />
          <p>No staff members yet.</p>
          {can('manage_location_staff') && (
            <button className={styles.addStaffBtn} onClick={() => { setIsNew(true); setSelectedStaff(emptyForm()); }}>
              Add your first staff member
            </button>
          )}
        </div>
      )}

      {/* Active staff */}
      {active.length > 0 && (
        <div className={styles.group}>
          <h2 className={styles.groupTitle}>Active ({active.length})</h2>
          <div className={styles.cardGrid}>
            {active.map(s => (
              <button key={s.id} className={styles.staffCard} onClick={() => { setIsNew(false); setSelectedStaff(s); }}>
                <div className={styles.cardAvatar}>
                  {s.full_name.charAt(0).toUpperCase()}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardName}>{s.full_name}</div>
                  <div className={styles.cardRole}><RoleBadge role={s.role} /></div>
                  <div className={styles.cardContact}>
                    <span><Mail size={12} /> {s.email}</span>
                    {s.phone && <span><Phone size={12} /> {s.phone}</span>}
                  </div>
                  {s.hire_date && (
                    <div className={styles.cardHire}>
                      <Calendar size={12} /> Hired {new Date(s.hire_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                </div>
                <div className={styles.cardActive}>
                  <span className={styles.activeDot} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Inactive staff */}
      {showInactive && inactive.length > 0 && (
        <div className={styles.group}>
          <h2 className={styles.groupTitle}>Inactive ({inactive.length})</h2>
          <div className={styles.cardGrid}>
            {inactive.map(s => (
              <button key={s.id} className={`${styles.staffCard} ${styles.staffCardInactive}`} onClick={() => { setIsNew(false); setSelectedStaff(s); }}>
                <div className={`${styles.cardAvatar} ${styles.cardAvatarInactive}`}>
                  {s.full_name.charAt(0).toUpperCase()}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardName}>{s.full_name}</div>
                  <div className={styles.cardRole}><RoleBadge role={s.role} /></div>
                  <div className={styles.cardContact}>
                    <span><Mail size={12} /> {s.email}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Drawer */}
      {selectedStaff !== null && (
        <StaffDrawer
          staff={selectedStaff}
          isNew={isNew}
          onClose={() => { setSelectedStaff(null); setIsNew(false); }}
          onSave={handleSave}
          showToast={showToast}
          canEdit={can('manage_location_staff')}
        />
      )}
    </div>
  );
};

export default AdminStaff;
