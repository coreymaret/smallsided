// src/components/admin/AdminBlackouts.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import { ChevronLeft, ChevronRight, X, AlertCircle } from '../../components/Icons/Icons';
import ToastContainer from '../Toast/ToastContainer';
import { useToast } from '../../hooks/useToast';
import styles from './AdminBlackouts.module.scss';

// ─── Types ────────────────────────────────────────────────────────────────────

type BlackoutType = 'closure' | 'holiday' | 'maintenance' | 'private_event';

interface Blackout {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  type: BlackoutType;
  affects_bookings: boolean;
  notes: string | null;
  created_at: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<BlackoutType, { label: string; bg: string; color: string; border: string }> = {
  closure:       { label: 'Full Closure',    bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  holiday:       { label: 'Holiday',         bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  maintenance:   { label: 'Maintenance',     bg: '#f0fdf4', color: '#166534', border: '#86efac' },
  private_event: { label: 'Private Event',   bg: '#eff6ff', color: '#1d4ed8', border: '#93c5fd' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toISO = (d: Date) => {
  const y  = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${dy}`;
};

const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const fmtRange = (start: string, end: string) =>
  start === end ? fmtDate(start) : `${fmtDate(start)} – ${fmtDate(end)}`;

const daysBetween = (start: string, end: string) => {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end   + 'T00:00:00');
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

// ─── Type badge ───────────────────────────────────────────────────────────────

const TypeBadge = ({ type }: { type: BlackoutType }) => {
  const cfg = TYPE_CONFIG[type];
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      padding: '0.1875rem 0.625rem', borderRadius: 20,
      fontSize: '0.8125rem', fontWeight: 600,
    }}>
      {cfg.label}
    </span>
  );
};

// ─── Blackout drawer ──────────────────────────────────────────────────────────

interface BlackoutDrawerProps {
  blackout: Partial<Blackout> | null;
  isNew: boolean;
  defaultDate: string;
  canEdit: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  showToast: (msg: string, type?: any) => void;
}

const BlackoutDrawer = ({
  blackout, isNew, defaultDate, canEdit,
  onClose, onSave, onDelete, showToast,
}: BlackoutDrawerProps) => {
  const [title, setTitle]                   = useState(blackout?.title ?? '');
  const [startDate, setStartDate]           = useState(blackout?.start_date ?? defaultDate);
  const [endDate, setEndDate]               = useState(blackout?.end_date ?? defaultDate);
  const [type, setType]                     = useState<BlackoutType>(blackout?.type ?? 'closure');
  const [affectsBookings, setAffects]       = useState(blackout?.affects_bookings ?? true);
  const [notes, setNotes]                   = useState(blackout?.notes ?? '');
  const [isSaving, setIsSaving]             = useState(false);
  const [isDeleting, setIsDeleting]         = useState(false);
  const [errors, setErrors]                 = useState<Record<string, string>>({});

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handler); };
  }, [onClose]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim())  errs.title    = 'Title is required';
    if (!startDate)     errs.startDate = 'Start date required';
    if (!endDate)       errs.endDate   = 'End date required';
    if (startDate && endDate && endDate < startDate) errs.endDate = 'End must be on or after start';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const payload = { title, start_date: startDate, end_date: endDate, type, affects_bookings: affectsBookings, notes: notes || null };
      if (isNew) {
        const { error } = await (supabase as any).from('blackout_dates').insert(payload);
        if (error) throw error;
        showToast('Blackout date added.', 'success');
      } else {
        const { error } = await (supabase as any).from('blackout_dates')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', blackout?.id);
        if (error) throw error;
        showToast('Blackout date updated.', 'success');
      }
      onSave();
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to save.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!blackout?.id || !confirm('Delete this blackout date?')) return;
    setIsDeleting(true);
    try {
      const { error } = await (supabase as any).from('blackout_dates').delete().eq('id', blackout.id);
      if (error) throw error;
      showToast('Blackout date deleted.', 'success');
      onDelete(blackout.id);
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to delete.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const days = startDate && endDate ? daysBetween(startDate, endDate) : 0;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div className={styles.drawer} role="dialog" aria-modal="true">

        <div className={styles.drawerHeader}>
          <div>
            <h2>{isNew ? 'Add Blackout Date' : 'Edit Blackout Date'}</h2>
            {!isNew && <TypeBadge type={type} />}
          </div>
          <button className={styles.drawerClose} onClick={onClose}><X size={20} /></button>
        </div>

        <div className={styles.drawerBody}>

          <section className={styles.section}>
            <h3>Details</h3>
            <div className={styles.formField}>
              <label>Title <span className={styles.req}>*</span></label>
              <input
                className={`${styles.input} ${errors.title ? styles.inputErr : ''}`}
                value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Christmas Closure, Spring Cleaning…"
                autoFocus disabled={!canEdit}
              />
              {errors.title && <span className={styles.errMsg}>{errors.title}</span>}
            </div>

            <div className={styles.formField}>
              <label>Type</label>
              <div className={styles.typeGroup}>
                {(Object.keys(TYPE_CONFIG) as BlackoutType[]).map(t => {
                  const cfg = TYPE_CONFIG[t];
                  return (
                    <button
                      key={t}
                      className={`${styles.typeBtn} ${type === t ? styles.typeBtnActive : ''}`}
                      onClick={() => setType(t)}
                      disabled={!canEdit}
                      style={type === t ? { background: cfg.bg, color: cfg.color, borderColor: cfg.border } : {}}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Date Range</h3>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Start Date <span className={styles.req}>*</span></label>
                <input
                  type="date"
                  className={`${styles.input} ${errors.startDate ? styles.inputErr : ''}`}
                  value={startDate} onChange={e => { setStartDate(e.target.value); if (!endDate || e.target.value > endDate) setEndDate(e.target.value); }}
                  disabled={!canEdit}
                />
                {errors.startDate && <span className={styles.errMsg}>{errors.startDate}</span>}
              </div>
              <div className={styles.formField}>
                <label>End Date <span className={styles.req}>*</span></label>
                <input
                  type="date"
                  className={`${styles.input} ${errors.endDate ? styles.inputErr : ''}`}
                  value={endDate} onChange={e => setEndDate(e.target.value)}
                  min={startDate} disabled={!canEdit}
                />
                {errors.endDate && <span className={styles.errMsg}>{errors.endDate}</span>}
              </div>
            </div>
            {days > 0 && (
              <div className={styles.dayCount}>{days} {days === 1 ? 'day' : 'days'}</div>
            )}
          </section>

          <section className={styles.section}>
            <h3>Booking Impact</h3>
            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={affectsBookings}
                onChange={e => setAffects(e.target.checked)}
                disabled={!canEdit}
              />
              <span>
                <strong>Block new bookings</strong> during this period
                <br />
                <small>When enabled, the public booking forms will not allow customers to select these dates.</small>
              </span>
            </label>
          </section>

          <section className={styles.section}>
            <h3>Notes</h3>
            <textarea
              className={styles.textarea}
              value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Internal notes about this closure…"
              rows={3} disabled={!canEdit}
            />
          </section>

        </div>

        {canEdit && (
          <div className={styles.drawerFooter}>
            {!isNew && (
              <button className={styles.deleteBtn} onClick={handleDelete} disabled={isDeleting || isSaving}>
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            )}
            <button className={styles.cancelBtn} onClick={onClose} disabled={isSaving}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving…' : isNew ? 'Add Blackout' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ─── Mini calendar ────────────────────────────────────────────────────────────

const MiniCalendar = ({
  blackouts, onDayClick, onBlackoutClick,
}: {
  blackouts: Blackout[];
  onDayClick: (date: string) => void;
  onBlackoutClick: (b: Blackout) => void;
}) => {
  const [viewDate, setViewDate] = useState(new Date());
  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );
  const today = toISO(new Date());

  const getBlackoutsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return blackouts.filter(b => b.start_date <= dateStr && b.end_date >= dateStr);
  };

  return (
    <div className={styles.calWrap}>
      <div className={styles.calHeader}>
        <button className={styles.calNavBtn} onClick={() => setViewDate(new Date(year, month - 1, 1))}><ChevronLeft size={16} /></button>
        <span className={styles.calTitle}>{viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        <button className={styles.calNavBtn} onClick={() => setViewDate(new Date(year, month + 1, 1))}><ChevronRight size={16} /></button>
      </div>
      <div className={styles.calGrid}>
        {DAYS.map(d => <div key={d} className={styles.calDayLabel}>{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dayBlackouts = getBlackoutsForDay(day);
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday   = dateStr === today;
          const isBlocked = dayBlackouts.some(b => b.affects_bookings);
          return (
            <div
              key={day}
              className={`${styles.calCell} ${isToday ? styles.calToday : ''} ${isBlocked ? styles.calBlocked : ''}`}
              onClick={() => dayBlackouts.length === 0 && onDayClick(dateStr)}
            >
              <span className={`${styles.calDayNum} ${isToday ? styles.calDayNumToday : ''}`}>{day}</span>
              {dayBlackouts.map(b => {
                const cfg = TYPE_CONFIG[b.type];
                return (
                  <button
                    key={b.id}
                    className={styles.calEvent}
                    style={{ background: cfg.bg, color: cfg.color }}
                    onClick={e => { e.stopPropagation(); onBlackoutClick(b); }}
                    title={b.title}
                  >
                    {b.title}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const AdminBlackouts = () => {
  const { can }                             = useAdmin();
  const { toasts, showToast, removeToast } = useToast();
  const [blackouts, setBlackouts]           = useState<Blackout[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [selected, setSelected]             = useState<Partial<Blackout> | null>(null);
  const [isNew, setIsNew]                   = useState(false);
  const [defaultDate, setDefaultDate]       = useState(toISO(new Date()));
  const [filter, setFilter]                 = useState<BlackoutType | 'all'>('all');
  const canEdit = can('manage_settings');

  useEffect(() => { fetchBlackouts(); }, []);

  const fetchBlackouts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('blackout_dates')
        .select('*')
        .order('start_date', { ascending: true });
      if (error) throw error;
      setBlackouts(data || []);
    } catch {
      showToast('Failed to load blackout dates.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = useCallback(() => {
    setSelected(null);
    setIsNew(false);
    fetchBlackouts();
  }, []);

  const handleDelete = useCallback((id: string) => {
    setBlackouts(prev => prev.filter(b => b.id !== id));
    setSelected(null);
  }, []);

  const openNew = (date: string) => {
    setDefaultDate(date);
    setIsNew(true);
    setSelected({});
  };

  const openEdit = (b: Blackout) => {
    setIsNew(false);
    setSelected(b);
  };

  const now   = toISO(new Date());
  const upcoming = blackouts.filter(b => b.end_date >= now);
  const past     = blackouts.filter(b => b.end_date < now);
  const filtered = (list: Blackout[]) =>
    filter === 'all' ? list : list.filter(b => b.type === filter);

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Blackout Dates</h1>
          <p>{upcoming.length} upcoming {upcoming.length === 1 ? 'closure' : 'closures'}</p>
        </div>
        {canEdit && (
          <button className={styles.addBtn} onClick={() => openNew(toISO(new Date()))}>
            + Add Blackout Date
          </button>
        )}
      </div>

      {/* Warning banner if affects_bookings entries exist */}
      {upcoming.filter(b => b.affects_bookings).length > 0 && (
        <div className={styles.warningBanner}>
          <AlertCircle size={16} />
          <span>
            <strong>{upcoming.filter(b => b.affects_bookings).length}</strong> upcoming {upcoming.filter(b => b.affects_bookings).length === 1 ? 'period blocks' : 'periods block'} new customer bookings on the public site.
          </span>
        </div>
      )}

      <div className={styles.layout}>
        {/* Calendar */}
        <div className={styles.calSide}>
          <MiniCalendar
            blackouts={blackouts}
            onDayClick={canEdit ? openNew : () => {}}
            onBlackoutClick={openEdit}
          />
        </div>

        {/* List */}
        <div className={styles.listSide}>
          {/* Filter */}
          <div className={styles.filterRow}>
            <button className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`} onClick={() => setFilter('all')}>All</button>
            {(Object.keys(TYPE_CONFIG) as BlackoutType[]).map(t => (
              <button
                key={t}
                className={`${styles.filterBtn} ${filter === t ? styles.filterBtnActive : ''}`}
                onClick={() => setFilter(t)}
              >
                {TYPE_CONFIG[t].label}
              </button>
            ))}
          </div>

          {isLoading && <div className={styles.loading}>Loading…</div>}

          {!isLoading && filtered(upcoming).length === 0 && filtered(past).length === 0 && (
            <div className={styles.empty}>
              <p>No blackout dates found.</p>
              {canEdit && (
                <button className={styles.addBtn} onClick={() => openNew(toISO(new Date()))}>
                  Add your first blackout date
                </button>
              )}
            </div>
          )}

          {filtered(upcoming).length > 0 && (
            <div className={styles.group}>
              <div className={styles.groupTitle}>Upcoming</div>
              {filtered(upcoming).map(b => (
                <BlackoutCard key={b.id} blackout={b} onClick={() => openEdit(b)} />
              ))}
            </div>
          )}

          {filtered(past).length > 0 && (
            <div className={styles.group}>
              <div className={styles.groupTitle}>Past</div>
              {filtered(past).map(b => (
                <BlackoutCard key={b.id} blackout={b} onClick={() => openEdit(b)} past />
              ))}
            </div>
          )}
        </div>
      </div>

      {selected !== null && (
        <BlackoutDrawer
          blackout={selected} isNew={isNew} defaultDate={defaultDate}
          canEdit={canEdit}
          onClose={() => { setSelected(null); setIsNew(false); }}
          onSave={handleSave} onDelete={handleDelete}
          showToast={showToast}
        />
      )}
    </div>
  );
};

const BlackoutCard = ({ blackout: b, onClick, past }: { blackout: Blackout; onClick: () => void; past?: boolean }) => {
  const cfg  = TYPE_CONFIG[b.type];
  const days = daysBetween(b.start_date, b.end_date);
  return (
    <button
      className={`${styles.card} ${past ? styles.cardPast : ''}`}
      onClick={onClick}
      style={{ borderLeftColor: cfg.color }}
    >
      <div className={styles.cardTop}>
        <span className={styles.cardTitle}>{b.title}</span>
        <TypeBadge type={b.type} />
      </div>
      <div className={styles.cardMeta}>
        <span>{fmtRange(b.start_date, b.end_date)}</span>
        <span className={styles.cardDays}>{days}d</span>
        {b.affects_bookings && <span className={styles.cardBlocks}>Blocks bookings</span>}
      </div>
      {b.notes && <div className={styles.cardNote}>{b.notes}</div>}
    </button>
  );
};

export default AdminBlackouts;
