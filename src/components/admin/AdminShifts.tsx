// src/components/admin/AdminShifts.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import {
  ChevronLeft, ChevronRight, X, Copy, User
} from '../../components/Icons/Icons';
import ToastContainer from '../Toast/ToastContainer';
import { useToast } from '../../hooks/useToast';
import styles from './AdminShifts.module.scss';

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode   = 'day' | 'week' | 'month';
type ShiftType  = 'opening' | 'closing';

interface Shift {
  id: string;
  staff_id: string;
  shift_date: string;
  shift_type: ShiftType;
  start_time: string;
  end_time: string;
  notes: string | null;
  created_by: string | null;
  staff_name?: string;
}

interface StaffMember {
  id: string;
  full_name: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const SHIFT_CONFIG: Record<ShiftType, {
  label: string; bg: string; color: string;
  defaultStart: string; defaultEnd: string;
}> = {
  opening: { label: 'Opening', bg: '#eff6ff', color: '#1d4ed8', defaultStart: '09:30', defaultEnd: '17:00' },
  closing: { label: 'Closing', bg: '#fdf4ff', color: '#7e22ce', defaultStart: '17:00', defaultEnd: '00:00' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toISO = (d: Date) => {
  const y  = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${dy}`;
};

const fmtTime = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
};

const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const getWeekStart = (d: Date) => {
  const date = new Date(d);
  date.setDate(date.getDate() - date.getDay());
  return date;
};

const addDays = (d: Date, n: number) => {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
};

// ─── Shift badge ──────────────────────────────────────────────────────────────

const ShiftBadge = ({ type }: { type: ShiftType }) => {
  const cfg = SHIFT_CONFIG[type];
  return (
    <span style={{ background: cfg.bg, color: cfg.color, padding: '0.125rem 0.5rem', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700 }}>
      {cfg.label}
    </span>
  );
};

// ─── Shift form drawer ────────────────────────────────────────────────────────

interface ShiftDrawerProps {
  shift: Partial<Shift> | null;
  isNew: boolean;
  defaultDate: string;
  staffOptions: StaffMember[];
  currentAdminId: string;
  canEdit: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  showToast: (msg: string, type?: any) => void;
}

const ShiftDrawer = ({
  shift, isNew, defaultDate, staffOptions,
  currentAdminId, canEdit, onClose, onSave, onDelete, showToast,
}: ShiftDrawerProps) => {
  const [staffId, setStaffId]     = useState(shift?.staff_id ?? '');
  const [shiftDate, setShiftDate] = useState(shift?.shift_date ?? defaultDate);
  const [shiftType, setShiftType] = useState<ShiftType>(shift?.shift_type ?? 'opening');
  const [startTime, setStartTime] = useState(shift?.start_time ?? SHIFT_CONFIG.opening.defaultStart);
  const [endTime, setEndTime]     = useState(shift?.end_time ?? SHIFT_CONFIG.opening.defaultEnd);
  const [notes, setNotes]         = useState(shift?.notes ?? '');
  const [isSaving, setIsSaving]   = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handler); };
  }, [onClose]);

  // When shift type changes, update default times
  const handleTypeChange = (type: ShiftType) => {
    setShiftType(type);
    if (isNew) {
      setStartTime(SHIFT_CONFIG[type].defaultStart);
      setEndTime(SHIFT_CONFIG[type].defaultEnd);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!staffId)    errs.staffId   = 'Staff member required';
    if (!shiftDate)  errs.shiftDate = 'Date required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      if (isNew) {
        const { error } = await (supabase as any).from('shifts').insert({
          staff_id: staffId, shift_date: shiftDate, shift_type: shiftType,
          start_time: startTime, end_time: endTime,
          notes: notes || null, created_by: currentAdminId,
        });
        if (error) throw error;
        showToast('Shift created.', 'success');
      } else {
        const { error } = await (supabase as any).from('shifts').update({
          staff_id: staffId, shift_date: shiftDate, shift_type: shiftType,
          start_time: startTime, end_time: endTime,
          notes: notes || null, updated_at: new Date().toISOString(),
        }).eq('id', shift?.id);
        if (error) throw error;
        showToast('Shift updated.', 'success');
      }
      onSave();
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to save shift.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!shift?.id || !confirm('Delete this shift?')) return;
    setIsDeleting(true);
    try {
      const { error } = await (supabase as any).from('shifts').delete().eq('id', shift.id);
      if (error) throw error;
      showToast('Shift deleted.', 'success');
      onDelete(shift.id);
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to delete.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div className={styles.drawer} role="dialog" aria-modal="true">

        <div className={styles.drawerHeader}>
          <div>
            <h2>{isNew ? 'Add Shift' : 'Edit Shift'}</h2>
            {!isNew && <ShiftBadge type={shiftType} />}
          </div>
          <button className={styles.drawerClose} onClick={onClose}><X size={20} /></button>
        </div>

        <div className={styles.drawerBody}>

          <section className={styles.section}>
            <h3>Staff & Date</h3>
            <div className={styles.formField}>
              <label>Staff Member <span className={styles.req}>*</span></label>
              <select
                className={`${styles.input} ${errors.staffId ? styles.inputErr : ''}`}
                value={staffId} onChange={e => setStaffId(e.target.value)}
                disabled={!canEdit}
              >
                <option value="">Select staff member…</option>
                {staffOptions.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
              {errors.staffId && <span className={styles.errMsg}>{errors.staffId}</span>}
            </div>
            <div className={styles.formField}>
              <label>Date <span className={styles.req}>*</span></label>
              <input
                type="date"
                className={`${styles.input} ${errors.shiftDate ? styles.inputErr : ''}`}
                value={shiftDate} onChange={e => setShiftDate(e.target.value)}
                disabled={!canEdit}
              />
              {errors.shiftDate && <span className={styles.errMsg}>{errors.shiftDate}</span>}
            </div>
          </section>

          <section className={styles.section}>
            <h3>Shift Details</h3>
            <div className={styles.formField}>
              <label>Type</label>
              <div className={styles.typeGroup}>
                {(['opening', 'closing'] as ShiftType[]).map(t => (
                  <button
                    key={t}
                    className={`${styles.typeBtn} ${shiftType === t ? styles.typeBtnActive : ''}`}
                    onClick={() => handleTypeChange(t)}
                    disabled={!canEdit}
                    style={shiftType === t ? {
                      background: SHIFT_CONFIG[t].bg,
                      color: SHIFT_CONFIG[t].color,
                      borderColor: SHIFT_CONFIG[t].color,
                    } : {}}
                  >
                    {SHIFT_CONFIG[t].label}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Start Time</label>
                <input
                  type="time" className={styles.input}
                  value={startTime} onChange={e => setStartTime(e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className={styles.formField}>
                <label>End Time</label>
                <input
                  type="time" className={styles.input}
                  value={endTime} onChange={e => setEndTime(e.target.value)}
                  disabled={!canEdit}
                />
              </div>
            </div>
            <div className={styles.formField}>
              <label>Notes</label>
              <textarea
                className={styles.textarea}
                value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Any notes for this shift…" rows={2}
                disabled={!canEdit}
              />
            </div>
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
              {isSaving ? 'Saving…' : isNew ? 'Add Shift' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ─── Day view ─────────────────────────────────────────────────────────────────

const DayView = ({
  date, shifts, staff, canEdit, onAdd, onEdit,
}: {
  date: Date; shifts: Shift[]; staff: StaffMember[];
  canEdit: boolean; onAdd: (date: string) => void; onEdit: (s: Shift) => void;
}) => {
  const dateStr = toISO(date);
  const dayShifts = shifts.filter(s => s.shift_date === dateStr);
  const opening = dayShifts.filter(s => s.shift_type === 'opening');
  const closing = dayShifts.filter(s => s.shift_type === 'closing');

  return (
    <div className={styles.dayView}>
      <div className={styles.dayViewHeader}>
        <span>{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        {canEdit && (
          <button className={styles.addShiftBtn} onClick={() => onAdd(dateStr)}>+ Add Shift</button>
        )}
      </div>

      {(['opening', 'closing'] as ShiftType[]).map(type => {
        const typeShifts = type === 'opening' ? opening : closing;
        const cfg = SHIFT_CONFIG[type];
        return (
          <div key={type} className={styles.dayViewSection}>
            <div className={styles.dayViewSectionTitle} style={{ color: cfg.color }}>
              {cfg.label} · {fmtTime(cfg.defaultStart)} – {fmtTime(cfg.defaultEnd)}
            </div>
            {typeShifts.length === 0 ? (
              <div className={styles.dayViewEmpty}>No {type} shifts scheduled</div>
            ) : (
              typeShifts.map(shift => (
                <button key={shift.id} className={styles.dayShiftCard} onClick={() => onEdit(shift)}
                  style={{ borderLeftColor: cfg.color }}>
                  <div className={styles.dayShiftName}>{shift.staff_name}</div>
                  <div className={styles.dayShiftTime}>{fmtTime(shift.start_time)} – {fmtTime(shift.end_time)}</div>
                  {shift.notes && <div className={styles.dayShiftNote}>{shift.notes}</div>}
                </button>
              ))
            )}
          </div>
        );
      })}

      {dayShifts.length === 0 && (
        <div className={styles.dayViewNoShifts}>
          No shifts scheduled for this day.
          {canEdit && (
            <button className={styles.addShiftBtnInline} onClick={() => onAdd(dateStr)}>
              Add a shift
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Week view ────────────────────────────────────────────────────────────────

const WeekView = ({
  weekStart, shifts, staff, canEdit, onAdd, onEdit,
}: {
  weekStart: Date; shifts: Shift[]; staff: StaffMember[];
  canEdit: boolean; onAdd: (date: string) => void; onEdit: (s: Shift) => void;
}) => {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = toISO(new Date());

  return (
    <div className={styles.weekGrid}>
      {/* Day headers */}
      {days.map((day, i) => {
        const dateStr = toISO(day);
        const isToday = dateStr === today;
        return (
          <div key={i} className={`${styles.weekDayHeader} ${isToday ? styles.weekDayHeaderToday : ''}`}>
            <span className={styles.weekDayName}>{DAYS[i]}</span>
            <span className={styles.weekDayNum}>{day.getDate()}</span>
            {canEdit && (
              <button className={styles.weekAddBtn} onClick={() => onAdd(dateStr)} title="Add shift">+</button>
            )}
          </div>
        );
      })}

      {/* Shift cells */}
      {days.map((day, i) => {
        const dateStr = toISO(day);
        const dayShifts = shifts.filter(s => s.shift_date === dateStr);
        const isToday = dateStr === today;
        return (
          <div key={i} className={`${styles.weekCell} ${isToday ? styles.weekCellToday : ''}`}>
            {dayShifts.length === 0 ? (
              <div className={styles.weekEmptyCell} onClick={() => canEdit && onAdd(dateStr)} />
            ) : (
              dayShifts.map(shift => {
                const cfg = SHIFT_CONFIG[shift.shift_type];
                return (
                  <button
                    key={shift.id}
                    className={styles.weekShiftBlock}
                    style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.color }}
                    onClick={() => onEdit(shift)}
                  >
                    <span className={styles.weekShiftName}>{shift.staff_name?.split(' ')[0]}</span>
                    <span className={styles.weekShiftType}>{cfg.label}</span>
                  </button>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Month view ───────────────────────────────────────────────────────────────

const MonthView = ({
  viewDate, shifts, canEdit, onAdd, onEdit,
}: {
  viewDate: Date; shifts: Shift[];
  canEdit: boolean; onAdd: (date: string) => void; onEdit: (s: Shift) => void;
}) => {
  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );
  const today = toISO(new Date());

  return (
    <div className={styles.monthGrid}>
      {DAYS.map(d => <div key={d} className={styles.monthDayLabel}>{d}</div>)}
      {cells.map((day, i) => {
        if (!day) return <div key={`e-${i}`} className={styles.monthEmptyCell} />;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayShifts = shifts.filter(s => s.shift_date === dateStr);
        const isToday = dateStr === today;
        return (
          <div
            key={day}
            className={`${styles.monthCell} ${isToday ? styles.monthCellToday : ''}`}
            onClick={() => canEdit && onAdd(dateStr)}
          >
            <span className={`${styles.monthDayNum} ${isToday ? styles.monthDayNumToday : ''}`}>{day}</span>
            {dayShifts.map(shift => {
              const cfg = SHIFT_CONFIG[shift.shift_type];
              return (
                <button
                  key={shift.id}
                  className={styles.monthShiftDot}
                  style={{ background: cfg.bg, color: cfg.color }}
                  onClick={e => { e.stopPropagation(); onEdit(shift); }}
                  title={`${shift.staff_name} — ${cfg.label}`}
                >
                  {shift.staff_name?.split(' ')[0]} · {cfg.label}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const AdminShifts = () => {
  const { admin, can }                      = useAdmin();
  const { toasts, showToast, removeToast }  = useToast();
  const [viewMode, setViewMode]             = useState<ViewMode>('week');
  const [currentDate, setCurrentDate]       = useState(new Date());
  const [shifts, setShifts]                 = useState<Shift[]>([]);
  const [staff, setStaff]                   = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [isCopying, setIsCopying]           = useState(false);
  const [selectedShift, setSelectedShift]   = useState<Partial<Shift> | null>(null);
  const [isNew, setIsNew]                   = useState(false);
  const [defaultDate, setDefaultDate]       = useState(toISO(new Date()));
  const canEdit = can('manage_location_staff');

  // Compute date range to fetch based on view
  const getDateRange = () => {
    if (viewMode === 'day') {
      const d = toISO(currentDate);
      return { from: d, to: d };
    }
    if (viewMode === 'week') {
      const ws = getWeekStart(currentDate);
      return { from: toISO(ws), to: toISO(addDays(ws, 6)) };
    }
    // month
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const from = `${y}-${String(m + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m + 1, 0).getDate();
    const to = `${y}-${String(m + 1).padStart(2, '0')}-${lastDay}`;
    return { from, to };
  };

  useEffect(() => {
    fetchData();
  }, [viewMode, currentDate]);

  const fetchData = async () => {
    setIsLoading(true);
    const { from, to } = getDateRange();
    try {
      const [shiftsRes, staffRes] = await Promise.all([
        (supabase as any).from('shifts').select('*')
          .gte('shift_date', from).lte('shift_date', to)
          .order('shift_date').order('start_time'),
        (supabase as any).from('staff_members').select('id, full_name')
          .eq('is_active', true).order('full_name'),
      ]);
      if (shiftsRes.error) throw shiftsRes.error;
      if (staffRes.error)  throw staffRes.error;

      const staffMap: Record<string, string> = {};
      (staffRes.data ?? []).forEach((s: StaffMember) => { staffMap[s.id] = s.full_name; });

      const enriched = (shiftsRes.data ?? []).map((s: Shift) => ({
        ...s, staff_name: staffMap[s.staff_id] ?? 'Unknown',
      }));

      setShifts(enriched);
      setStaff(staffRes.data ?? []);
    } catch (err: any) {
      showToast('Failed to load shifts.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = useCallback(() => {
    setSelectedShift(null);
    setIsNew(false);
    fetchData();
  }, [viewMode, currentDate]);

  const handleDelete = useCallback((id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
    setSelectedShift(null);
    setIsNew(false);
  }, []);

  const openNewShift = (date: string) => {
    setDefaultDate(date);
    setIsNew(true);
    setSelectedShift({});
  };

  const openEditShift = (shift: Shift) => {
    setIsNew(false);
    setSelectedShift(shift);
  };

  // Copy last week's shifts to current week
  const handleCopyLastWeek = async () => {
    const weekStart = getWeekStart(currentDate);
    const lastWeekStart = addDays(weekStart, -7);
    const lastWeekEnd   = addDays(weekStart, -1);

    setIsCopying(true);
    try {
      const { data: lastWeekShifts, error } = await (supabase as any)
        .from('shifts').select('*')
        .gte('shift_date', toISO(lastWeekStart))
        .lte('shift_date', toISO(lastWeekEnd));
      if (error) throw error;
      if (!lastWeekShifts?.length) {
        showToast('No shifts found in the previous week.', 'info');
        return;
      }

      const newShifts = lastWeekShifts.map((s: Shift) => {
        const oldDate  = new Date(s.shift_date + 'T00:00:00');
        const dayOffset = Math.round((oldDate.getTime() - lastWeekStart.getTime()) / (1000 * 60 * 60 * 24));
        const newDate  = addDays(weekStart, dayOffset);
        return {
          staff_id:   s.staff_id,
          shift_date: toISO(newDate),
          shift_type: s.shift_type,
          start_time: s.start_time,
          end_time:   s.end_time,
          notes:      s.notes,
          created_by: admin?.id ?? null,
        };
      });

      const { error: insertError } = await (supabase as any).from('shifts').insert(newShifts);
      if (insertError) throw insertError;

      showToast(`Copied ${newShifts.length} shifts from last week.`, 'success');
      fetchData();
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to copy shifts.', 'error');
    } finally {
      setIsCopying(false);
    }
  };

  // Navigation
  const navigate = (direction: 1 | -1) => {
    const d = new Date(currentDate);
    if (viewMode === 'day')   d.setDate(d.getDate() + direction);
    if (viewMode === 'week')  d.setDate(d.getDate() + direction * 7);
    if (viewMode === 'month') d.setMonth(d.getMonth() + direction);
    setCurrentDate(d);
  };

  const getTitle = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (viewMode === 'week') {
      const ws = getWeekStart(currentDate);
      const we = addDays(ws, 6);
      const sameMonth = ws.getMonth() === we.getMonth();
      if (sameMonth) {
        return `${ws.toLocaleDateString('en-US', { month: 'long' })} ${ws.getDate()}–${we.getDate()}, ${ws.getFullYear()}`;
      }
      return `${ws.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${we.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isThisWeek = viewMode === 'week' &&
    toISO(getWeekStart(currentDate)) === toISO(getWeekStart(new Date()));

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Shift Schedule</h1>
          <p className={styles.subtitle}>{getTitle()}</p>
        </div>
        <div className={styles.headerActions}>
          {viewMode === 'week' && canEdit && (
            <button
              className={styles.copyBtn}
              onClick={handleCopyLastWeek}
              disabled={isCopying}
              title="Copy last week's shifts to this week"
            >
              <Copy size={15} />
              {isCopying ? 'Copying…' : 'Copy Last Week'}
            </button>
          )}
          {canEdit && (
            <button className={styles.addBtn} onClick={() => openNewShift(toISO(currentDate))}>
              + Add Shift
            </button>
          )}
        </div>
      </div>

      {/* View toggle + navigation */}
      <div className={styles.controls}>
        <div className={styles.navGroup}>
          <button className={styles.navBtn} onClick={() => navigate(-1)}><ChevronLeft size={18} /></button>
          <button
            className={`${styles.todayBtn} ${viewMode === 'day' && toISO(currentDate) === toISO(new Date()) ? styles.todayActive : ''} ${isThisWeek ? styles.todayActive : ''}`}
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </button>
          <button className={styles.navBtn} onClick={() => navigate(1)}><ChevronRight size={18} /></button>
        </div>

        <div className={styles.viewToggle}>
          {(['day', 'week', 'month'] as ViewMode[]).map(v => (
            <button
              key={v}
              className={`${styles.viewBtn} ${viewMode === v ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        {(['opening', 'closing'] as ShiftType[]).map(t => {
          const cfg = SHIFT_CONFIG[t];
          return (
            <div key={t} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: cfg.color }} />
              <span>{cfg.label}</span>
              <span className={styles.legendTime}>{fmtTime(cfg.defaultStart)} – {fmtTime(cfg.defaultEnd)}</span>
            </div>
          );
        })}
      </div>

      {/* View content */}
      <div className={styles.viewWrap}>
        {isLoading ? (
          <div className={styles.loading}>Loading shifts…</div>
        ) : (
          <>
            {viewMode === 'day' && (
              <DayView
                date={currentDate} shifts={shifts} staff={staff}
                canEdit={canEdit} onAdd={openNewShift} onEdit={openEditShift}
              />
            )}
            {viewMode === 'week' && (
              <WeekView
                weekStart={getWeekStart(currentDate)} shifts={shifts} staff={staff}
                canEdit={canEdit} onAdd={openNewShift} onEdit={openEditShift}
              />
            )}
            {viewMode === 'month' && (
              <MonthView
                viewDate={currentDate} shifts={shifts}
                canEdit={canEdit} onAdd={openNewShift} onEdit={openEditShift}
              />
            )}
          </>
        )}
      </div>

      {/* Drawer */}
      {selectedShift !== null && (
        <ShiftDrawer
          shift={selectedShift} isNew={isNew} defaultDate={defaultDate}
          staffOptions={staff} currentAdminId={admin?.id ?? ''}
          canEdit={canEdit}
          onClose={() => { setSelectedShift(null); setIsNew(false); }}
          onSave={handleSave} onDelete={handleDelete}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default AdminShifts;
