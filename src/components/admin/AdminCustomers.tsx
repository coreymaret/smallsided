// src/components/admin/AdminCustomers.tsx
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import {
  User, Mail, Phone, DollarSign, AlertCircle,
  Calendar, Star, X, Check, ChevronRight
} from '../../components/Icons/Icons';
import ToastContainer from '../Toast/ToastContainer';
import { useToast } from '../../hooks/useToast';
import styles from './AdminCustomers.module.scss';

// ─── Types ────────────────────────────────────────────────────────────────────

type CustomerTag = 'vip' | 'problem' | 'regular' | 'new';

interface Customer {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  tag: CustomerTag;
  notes: string | null;
  is_flagged: boolean;
  no_show_count: number;
  total_spend: number;
  last_booking_date: string | null;
  created_at: string;
  booking_count?: number;
}

interface FamilyMember {
  id: string;
  customer_id: string;
  name: string;
  age: number | null;
  notes: string | null;
}

interface BookingHistory {
  id: string;
  booking_type: string;
  booking_date: string;
  total_amount: number;
  booking_status: string;
  payment_status: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TAG_CONFIG: Record<CustomerTag, { label: string; bg: string; color: string }> = {
  vip:     { label: 'VIP',     bg: '#fef3c7', color: '#92400e' },
  problem: { label: 'Problem', bg: '#fee2e2', color: '#991b1b' },
  regular: { label: 'Regular', bg: '#eff6ff', color: '#1d4ed8' },
  new:     { label: 'New',     bg: '#f0fdf4', color: '#166534' },
};

const SERVICE_LABELS: Record<string, string> = {
  field_rental: 'Field Rental', training: 'Training', camp: 'Camp',
  birthday: 'Birthday Party', league: 'League', pickup: 'Pickup',
};

const SERVICE_COLORS: Record<string, string> = {
  field_rental: '#3b82f6', training: '#8b5cf6', camp: '#f59e0b',
  birthday: '#ec4899', league: '#10b981', pickup: '#ef4444',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string | null) => {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ─── Tag badge ────────────────────────────────────────────────────────────────

const TagBadge = ({ tag }: { tag: CustomerTag }) => {
  const cfg = TAG_CONFIG[tag];
  return (
    <span style={{
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`,
      padding: '0.125rem 0.5rem', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700,
    }}>
      {cfg.label}
    </span>
  );
};

// ─── Customer drawer ──────────────────────────────────────────────────────────

interface CustomerDrawerProps {
  customer: Customer;
  onClose: () => void;
  onSave: () => void;
  showToast: (msg: string, type?: any) => void;
}

const CustomerDrawer = ({ customer, onClose, onSave, showToast }: CustomerDrawerProps) => {
  const [activeTab, setActiveTab]         = useState<'profile' | 'bookings' | 'family'>('profile');
  const [notes, setNotes]                 = useState(customer.notes ?? '');
  const [tag, setTag]                     = useState<CustomerTag>(customer.tag ?? 'new');
  const [isFlagged, setIsFlagged]         = useState(customer.is_flagged);
  const [isSaving, setIsSaving]           = useState(false);
  const [bookings, setBookings]           = useState<BookingHistory[]>([]);
  const [family, setFamily]               = useState<FamilyMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAge, setNewMemberAge]   = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handler); };
  }, [onClose]);

  useEffect(() => {
    if (activeTab === 'bookings') fetchBookings();
    if (activeTab === 'family')   fetchFamily();
  }, [activeTab]);

  const fetchBookings = async () => {
    const { data } = await (supabase as any)
      .from('bookings')
      .select('id, booking_type, booking_date, total_amount, booking_status, payment_status')
      .eq('customer_email', customer.email)
      .order('booking_date', { ascending: false });
    setBookings(data ?? []);
  };

  const fetchFamily = async () => {
    const { data } = await (supabase as any)
      .from('family_members')
      .select('*')
      .eq('customer_id', customer.id)
      .order('name');
    setFamily(data ?? []);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('customer_profiles')
        .update({ notes: notes || null, tag, is_flagged: isFlagged, updated_at: new Date().toISOString() })
        .eq('id', customer.id);
      if (error) throw error;
      showToast('Customer updated.', 'success');
      onSave();
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to save.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFamilyMember = async () => {
    if (!newMemberName.trim()) return;
    setIsAddingMember(true);
    try {
      const { error } = await (supabase as any).from('family_members').insert({
        customer_id: customer.id,
        name: newMemberName.trim(),
        age: newMemberAge ? parseInt(newMemberAge) : null,
      });
      if (error) throw error;
      setNewMemberName('');
      setNewMemberAge('');
      fetchFamily();
      showToast('Family member added.', 'success');
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to add.', 'error');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveFamilyMember = async (id: string) => {
    const { error } = await (supabase as any).from('family_members').delete().eq('id', id);
    if (!error) {
      setFamily(prev => prev.filter(m => m.id !== id));
      showToast('Removed.', 'success');
    }
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div className={styles.drawer} role="dialog" aria-modal="true">

        {/* Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.drawerHeaderInner}>
            <div className={styles.drawerAvatar}>{customer.full_name.charAt(0).toUpperCase()}</div>
            <div>
              <h2>{customer.full_name}</h2>
              <div className={styles.drawerHeaderMeta}>
                <TagBadge tag={tag} />
                {isFlagged && <span className={styles.flaggedTag}>⚑ Flagged</span>}
              </div>
            </div>
          </div>
          <button className={styles.drawerClose} onClick={onClose}><X size={20} /></button>
        </div>

        {/* Quick stats */}
        <div className={styles.quickStats}>
          <div className={styles.quickStat}>
            <span className={styles.quickStatValue}>{fmtCurrency(customer.total_spend)}</span>
            <span className={styles.quickStatLabel}>Lifetime spend</span>
          </div>
          <div className={styles.quickStat}>
            <span className={styles.quickStatValue}>{customer.booking_count ?? 0}</span>
            <span className={styles.quickStatLabel}>Bookings</span>
          </div>
          <div className={styles.quickStat}>
            <span className={`${styles.quickStatValue} ${customer.no_show_count > 0 ? styles.noShowRed : ''}`}>
              {customer.no_show_count}
            </span>
            <span className={styles.quickStatLabel}>No-shows</span>
          </div>
          <div className={styles.quickStat}>
            <span className={styles.quickStatValue}>{fmtDate(customer.last_booking_date)}</span>
            <span className={styles.quickStatLabel}>Last booking</span>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {(['profile', 'bookings', 'family'] as const).map(t => (
            <button key={t}
              className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.drawerBody}>

          {/* Profile tab */}
          {activeTab === 'profile' && (
            <div>
              <section className={styles.section}>
                <h3>Contact</h3>
                <div className={styles.contactRow}><Mail size={14} /><span>{customer.email}</span></div>
                {customer.phone && <div className={styles.contactRow}><Phone size={14} /><span>{customer.phone}</span></div>}
              </section>

              <section className={styles.section}>
                <h3>Tag</h3>
                <div className={styles.tagGroup}>
                  {(Object.keys(TAG_CONFIG) as CustomerTag[]).map(t => {
                    const cfg = TAG_CONFIG[t];
                    return (
                      <button key={t}
                        className={`${styles.tagBtn} ${tag === t ? styles.tagBtnActive : ''}`}
                        onClick={() => setTag(t)}
                        style={tag === t ? { background: cfg.bg, color: cfg.color, borderColor: cfg.color } : {}}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className={styles.section}>
                <h3>Flag</h3>
                <label className={styles.checkLabel}>
                  <input type="checkbox" checked={isFlagged} onChange={e => setIsFlagged(e.target.checked)} />
                  <span>Flag this customer for staff attention</span>
                </label>
              </section>

              <section className={styles.section}>
                <h3>Internal Notes</h3>
                <textarea
                  className={styles.textarea}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Notes visible to staff only…"
                />
              </section>
            </div>
          )}

          {/* Bookings tab */}
          {activeTab === 'bookings' && (
            <div className={styles.bookingList}>
              {bookings.length === 0 ? (
                <div className={styles.empty}>No bookings found for this customer.</div>
              ) : bookings.map(b => (
                <div key={b.id} className={styles.bookingItem}>
                  <div className={styles.bookingDot} style={{ background: SERVICE_COLORS[b.booking_type] ?? '#667eea' }} />
                  <div className={styles.bookingInfo}>
                    <span className={styles.bookingService}>{SERVICE_LABELS[b.booking_type] ?? b.booking_type}</span>
                    <span className={styles.bookingDate}>{fmtDate(b.booking_date)}</span>
                  </div>
                  <div className={styles.bookingRight}>
                    <span className={styles.bookingAmount}>{fmtCurrency(b.total_amount)}</span>
                    <span className={`${styles.bookingStatus} ${b.booking_status === 'no_show' ? styles.noShowBadge : ''}`}>
                      {b.booking_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Family tab */}
          {activeTab === 'family' && (
            <div>
              <section className={styles.section}>
                <h3>Add Family Member</h3>
                <div className={styles.addMemberRow}>
                  <input
                    className={styles.input}
                    placeholder="Name"
                    value={newMemberName}
                    onChange={e => setNewMemberName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddFamilyMember()}
                  />
                  <input
                    className={`${styles.input} ${styles.inputSmall}`}
                    placeholder="Age"
                    type="number" min="1" max="99"
                    value={newMemberAge}
                    onChange={e => setNewMemberAge(e.target.value)}
                  />
                  <button className={styles.addMemberBtn} onClick={handleAddFamilyMember} disabled={isAddingMember || !newMemberName.trim()}>
                    Add
                  </button>
                </div>
              </section>

              {family.length === 0 ? (
                <div className={styles.empty}>No family members added yet.</div>
              ) : (
                <div className={styles.familyList}>
                  {family.map(m => (
                    <div key={m.id} className={styles.familyItem}>
                      <div className={styles.familyAvatar}>{m.name.charAt(0).toUpperCase()}</div>
                      <div className={styles.familyInfo}>
                        <span className={styles.familyName}>{m.name}</span>
                        {m.age && <span className={styles.familyAge}>{m.age} yrs</span>}
                      </div>
                      <button className={styles.removeMemberBtn} onClick={() => handleRemoveFamilyMember(m.id)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        {activeTab === 'profile' && (
          <div className={styles.drawerFooter}>
            <button className={styles.cancelBtn} onClick={onClose} disabled={isSaving}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const AdminCustomers = () => {
  const { can }                             = useAdmin();
  const { toasts, showToast, removeToast } = useToast();
  const [customers, setCustomers]           = useState<Customer[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [isSyncing, setIsSyncing]           = useState(false);
  const [selected, setSelected]             = useState<Customer | null>(null);
  const [searchQ, setSearchQ]               = useState('');
  const [filterTag, setFilterTag]           = useState<CustomerTag | 'all' | 'flagged'>('all');
  const [sortBy, setSortBy]                 = useState<'spend' | 'bookings' | 'recent' | 'name'>('recent');

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('customer_profiles')
        .select('*')
        .order('last_booking_date', { ascending: false, nullsFirst: false });
      if (error) throw error;

      // Also fetch booking counts
      const { data: countData } = await (supabase as any)
        .from('bookings')
        .select('customer_email');

      const countMap: Record<string, number> = {};
      (countData ?? []).forEach((b: any) => {
        countMap[b.customer_email] = (countMap[b.customer_email] ?? 0) + 1;
      });

      setCustomers((data ?? []).map((c: Customer) => ({
        ...c,
        booking_count: countMap[c.email] ?? 0,
      })));
    } catch {
      showToast('Failed to load customers.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Sync customers from bookings — creates profiles for any email not yet in customer_profiles
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const { data: bookings } = await (supabase as any)
        .from('bookings')
        .select('customer_email, customer_name, customer_phone, booking_date, total_amount, booking_status, payment_status');

      const { data: existing } = await (supabase as any)
        .from('customer_profiles')
        .select('email');

      const existingEmails = new Set((existing ?? []).map((e: any) => e.email));

      // Build per-email stats
      const emailMap: Record<string, {
        name: string; phone: string | null;
        spend: number; noShows: number; lastDate: string | null;
      }> = {};

      (bookings ?? []).forEach((b: any) => {
        if (!b.customer_email) return;
        if (!emailMap[b.customer_email]) {
          emailMap[b.customer_email] = { name: b.customer_name, phone: b.customer_phone, spend: 0, noShows: 0, lastDate: null };
        }
        const e = emailMap[b.customer_email];
        if (b.payment_status === 'paid') e.spend += Number(b.total_amount);
        if (b.booking_status === 'no_show') e.noShows++;
        if (!e.lastDate || b.booking_date > e.lastDate) e.lastDate = b.booking_date;
      });

      // Insert new profiles
      const newProfiles = Object.entries(emailMap)
        .filter(([email]) => !existingEmails.has(email))
        .map(([email, data]) => ({
          email,
          full_name:         data.name,
          phone:             data.phone,
          total_spend:       data.spend,
          no_show_count:     data.noShows,
          last_booking_date: data.lastDate,
          tag:               'new',
        }));

      // Update existing profiles with latest stats
      const updates = Object.entries(emailMap)
        .filter(([email]) => existingEmails.has(email))
        .map(([email, data]) => ({
          email,
          total_spend:       data.spend,
          no_show_count:     data.noShows,
          last_booking_date: data.lastDate,
          updated_at:        new Date().toISOString(),
        }));

      if (newProfiles.length > 0) {
        await (supabase as any).from('customer_profiles').insert(newProfiles);
      }

      for (const u of updates) {
        await (supabase as any).from('customer_profiles')
          .update({ total_spend: u.total_spend, no_show_count: u.no_show_count, last_booking_date: u.last_booking_date, updated_at: u.updated_at })
          .eq('email', u.email);
      }

      showToast(`Synced ${newProfiles.length} new + ${updates.length} updated customers.`, 'success');
      fetchCustomers();
    } catch (err: any) {
      showToast(err?.message ?? 'Sync failed.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = useCallback(() => {
    setSelected(null);
    fetchCustomers();
  }, []);

  // Filter + sort
  const filtered = customers
    .filter(c => {
      if (filterTag === 'flagged') return c.is_flagged;
      if (filterTag !== 'all') return c.tag === filterTag;
      return true;
    })
    .filter(c => {
      if (!searchQ) return true;
      const q = searchQ.toLowerCase();
      return c.full_name.toLowerCase().includes(q) ||
             c.email.toLowerCase().includes(q) ||
             (c.phone ?? '').includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'spend')    return b.total_spend - a.total_spend;
      if (sortBy === 'bookings') return (b.booking_count ?? 0) - (a.booking_count ?? 0);
      if (sortBy === 'name')     return a.full_name.localeCompare(b.full_name);
      // recent
      if (!a.last_booking_date) return 1;
      if (!b.last_booking_date) return -1;
      return b.last_booking_date.localeCompare(a.last_booking_date);
    });

  const totalSpend    = customers.reduce((s, c) => s + c.total_spend, 0);
  const flaggedCount  = customers.filter(c => c.is_flagged).length;
  const noShowCount   = customers.filter(c => c.no_show_count > 0).length;

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Customers</h1>
          <p>{customers.length} profiles · {fmtCurrency(totalSpend)} total lifetime spend</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.syncBtn} onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? 'Syncing…' : '↻ Sync from Bookings'}
          </button>
        </div>
      </div>

      {/* Summary pills */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryPill}>
          <User size={14} />
          <span>{customers.length} total</span>
        </div>
        <div className={styles.summaryPill}>
          <Star size={14} />
          <span>{customers.filter(c => c.tag === 'vip').length} VIP</span>
        </div>
        {flaggedCount > 0 && (
          <div className={`${styles.summaryPill} ${styles.summaryPillAlert}`}>
            <AlertCircle size={14} />
            <span>{flaggedCount} flagged</span>
          </div>
        )}
        {noShowCount > 0 && (
          <div className={`${styles.summaryPill} ${styles.summaryPillWarn}`}>
            <Calendar size={14} />
            <span>{noShowCount} with no-shows</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filterRow}>
        <div className={styles.searchBox}>
          <User size={15} />
          <input
            className={styles.searchInput}
            placeholder="Search by name, email, or phone…"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          {(['all', 'vip', 'regular', 'new', 'problem', 'flagged'] as const).map(t => (
            <button key={t}
              className={`${styles.filterBtn} ${filterTag === t ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterTag(t)}>
              {t === 'all' ? 'All' : t === 'flagged' ? '⚑ Flagged' : TAG_CONFIG[t as CustomerTag].label}
            </button>
          ))}
        </div>
        <select className={styles.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
          <option value="recent">Most Recent</option>
          <option value="spend">Highest Spend</option>
          <option value="bookings">Most Bookings</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && <div className={styles.loading}>Loading customers…</div>}

      {/* Empty */}
      {!isLoading && customers.length === 0 && (
        <div className={styles.emptyState}>
          <User size={40} className={styles.emptyIcon} />
          <p>No customer profiles yet.</p>
          <p className={styles.emptySub}>Click "Sync from Bookings" to import customers from your existing bookings.</p>
          <button className={styles.syncBtn} onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? 'Syncing…' : '↻ Sync from Bookings'}
          </button>
        </div>
      )}

      {/* Customer table */}
      {!isLoading && filtered.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Tag</th>
                <th>Bookings</th>
                <th>No-shows</th>
                <th>Lifetime Spend</th>
                <th>Last Booking</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr
                  key={c.id}
                  className={`${styles.tableRow} ${c.is_flagged ? styles.flaggedRow : ''}`}
                  onClick={() => setSelected(c)}
                >
                  <td>
                    <div className={styles.customerCell}>
                      <div className={styles.customerAvatar}>{c.full_name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className={styles.customerName}>
                          {c.full_name}
                          {c.is_flagged && <span className={styles.flagIcon}>⚑</span>}
                        </div>
                        <div className={styles.customerEmail}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><TagBadge tag={c.tag ?? 'new'} /></td>
                  <td className={styles.tdCenter}>{c.booking_count ?? 0}</td>
                  <td className={styles.tdCenter}>
                    {c.no_show_count > 0
                      ? <span className={styles.noShowCount}>{c.no_show_count}</span>
                      : <span className={styles.tdMuted}>—</span>
                    }
                  </td>
                  <td className={styles.tdBold}>{fmtCurrency(c.total_spend)}</td>
                  <td className={styles.tdMuted}>{fmtDate(c.last_booking_date)}</td>
                  <td><ChevronRight size={16} className={styles.rowChevron} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer */}
      {selected && (
        <CustomerDrawer
          customer={selected}
          onClose={() => setSelected(null)}
          onSave={handleSave}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default AdminCustomers;
