// src/components/admin/AdminShifts.tsx
import { useEffect, useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import { ChevronLeft, ChevronRight, X } from '../../components/Icons/Icons';
import ToastContainer from '../Toast/ToastContainer';
import { useToast } from '../../hooks/useToast';
import styles from './AdminShifts.module.scss';

type ShiftType = 'opening' | 'closing';
type ViewMode  = 'day' | 'week' | 'month';

interface Shift {
  id: string;
  staff_id: string;
  shift_date: string;
  shift_type: ShiftType;
  start_time: string;
  end_time: string;
  notes: string | null;
  staff_name?: string;
}

interface StaffMember {
  id: string;
  full_name: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SHIFT_CONFIG: Record<ShiftType, { label: string; bg: string; color: string; defaultStart: string; defaultEnd: string }> = {
  opening: { label: 'Opening', bg: '#eff6ff', color: '#1d4ed8', defaultStart: '09:30', defaultEnd: '17:00' },
  closing: { label: 'Closing', bg: '#fdf4ff', color: '#7e22ce', defaultStart: '17:00', defaultEnd: '00:00' },
};

const toISO = (d: Date) => {
  const y = d.getFullYear(), mo = String(d.getMonth()+1).padStart(2,'0'), dy = String(d.getDate()).padStart(2,'0');
  return `${y}-${mo}-${dy}`;
};
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const getWeekStart = (d: Date) => {
  const r = new Date(d);
  const diff = r.getDay() === 0 ? -6 : 1 - r.getDay();
  r.setDate(r.getDate() + diff);
  return r;
};
const fmtTime = (t: string) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

// ─── Shift Drawer ─────────────────────────────────────────────────────────────

interface ShiftDrawerProps {
  shift: Partial<Shift> | null;
  isNew: boolean;
  defaultDate: string;
  staff: StaffMember[];
  canEdit: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete?: (id: string) => void;
  showToast: (msg: string, type?: any) => void;
}

const ShiftDrawer = ({ shift, isNew, defaultDate, staff, canEdit, onClose, onSave, onDelete, showToast }: ShiftDrawerProps) => {
  const [staffId, setStaffId]     = useState(shift?.staff_id ?? '');
  const [shiftDate, setShiftDate] = useState(shift?.shift_date ?? defaultDate);
  const [shiftType, setShiftType] = useState<ShiftType>(shift?.shift_type ?? 'opening');
  const [startTime, setStartTime] = useState(shift?.start_time ?? SHIFT_CONFIG.opening.defaultStart);
  const [endTime, setEndTime]     = useState(shift?.end_time ?? SHIFT_CONFIG.opening.defaultEnd);
  const [notes, setNotes]         = useState(shift?.notes ?? '');
  const [isSaving, setIsSaving]   = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', h); };
  }, [onClose]);

  const handleTypeChange = (type: ShiftType) => {
    setShiftType(type);
    setStartTime(SHIFT_CONFIG[type].defaultStart);
    setEndTime(SHIFT_CONFIG[type].defaultEnd);
  };

  const handleSave = async () => {
    if (!staffId) { showToast('Select a staff member.', 'error'); return; }
    setIsSaving(true);
    try {
      const payload = { staff_id: staffId, shift_date: shiftDate, shift_type: shiftType, start_time: startTime, end_time: endTime, notes: notes || null };
      if (isNew) {
        const { error } = await (supabase as any).from('shifts').insert(payload);
        if (error) throw error;
        showToast('Shift added.', 'success');
      } else {
        const { error } = await (supabase as any).from('shifts').update(payload).eq('id', shift?.id);
        if (error) throw error;
        showToast('Shift updated.', 'success');
      }
      onSave();
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to save.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!shift?.id || !confirm('Delete this shift?')) return;
    const { error } = await (supabase as any).from('shifts').delete().eq('id', shift.id);
    if (!error) { showToast('Shift deleted.', 'success'); onDelete?.(shift.id); }
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.drawer} role="dialog">
        <div className={styles.drawerHeader}>
          <h2>{isNew ? 'Add Shift' : 'Edit Shift'}</h2>
          <button className={styles.drawerClose} onClick={onClose}><X size={20} /></button>
        </div>
        <div className={styles.drawerBody}>
          <section className={styles.section}>
            <h3>Staff Member</h3>
            <select className={styles.input} value={staffId} onChange={e => setStaffId(e.target.value)} disabled={!canEdit} autoFocus>
              <option value="">Select staff…</option>
              {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </section>
          <section className={styles.section}>
            <h3>Shift Type</h3>
            <div className={styles.typeGroup}>
              {(['opening', 'closing'] as ShiftType[]).map(t => {
                const cfg = SHIFT_CONFIG[t];
                return (
                  <button key={t} disabled={!canEdit}
                    className={`${styles.typeBtn} ${shiftType === t ? styles.typeBtnActive : ''}`}
                    onClick={() => handleTypeChange(t)}
                    style={shiftType === t ? { background: cfg.bg, color: cfg.color, borderColor: cfg.color } : {}}>
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </section>
          <section className={styles.section}>
            <h3>Date & Time</h3>
            <div className={styles.formField}>
              <label>Date</label>
              <input type="date" className={styles.input} value={shiftDate} onChange={e => setShiftDate(e.target.value)} disabled={!canEdit} />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Start</label>
                <input type="time" className={styles.input} value={startTime} onChange={e => setStartTime(e.target.value)} disabled={!canEdit} />
              </div>
              <div className={styles.formField}>
                <label>End</label>
                <input type="time" className={styles.input} value={endTime} onChange={e => setEndTime(e.target.value)} disabled={!canEdit} />
              </div>
            </div>
          </section>
          <section className={styles.section}>
            <h3>Notes</h3>
            <textarea className={styles.textarea} value={notes} onChange={e => setNotes(e.target.value)} rows={2} disabled={!canEdit} />
          </section>
        </div>
        {canEdit && (
          <div className={styles.drawerFooter}>
            {!isNew && <button className={styles.deleteBtn} onClick={handleDelete}>Delete</button>}
            <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving…' : isNew ? 'Add Shift' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ─── Draggable Shift Block ────────────────────────────────────────────────────

const DraggableShiftBlock = ({ shift, canEdit, onEdit }: {
  shift: Shift; canEdit: boolean; onEdit: (s: Shift) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: shift.id,
    data: { type: 'shift', dateStr: shift.shift_date },
  });
  const cfg = SHIFT_CONFIG[shift.shift_type];

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 }}
      {...attributes}
    >
      <button
        className={`${styles.weekShiftBlock} ${canEdit ? styles.weekShiftBlockDraggable : ''}`}
        style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.color }}
        onClick={() => !isDragging && onEdit(shift)}
        {...(canEdit ? listeners : {})}
      >
        <span className={styles.weekShiftName}>{shift.staff_name?.split(' ')[0]}</span>
        <span className={styles.weekShiftType}>{cfg.label}</span>
        {canEdit && <span className={styles.dragHandle}>⠿</span>}
      </button>
    </div>
  );
};

// ─── Droppable Day Cell ───────────────────────────────────────────────────────
// Uses useDroppable so empty cells are valid drop targets

const DroppableCell = ({ dateStr, shifts, canEdit, onAdd, onEdit, isOver, isToday }: {
  dateStr: string; shifts: Shift[]; canEdit: boolean;
  onAdd: (d: string) => void; onEdit: (s: Shift) => void;
  isOver: boolean; isToday: boolean;
}) => {
  const { setNodeRef } = useDroppable({
    id: `cell-${dateStr}`,
    data: { type: 'cell', dateStr },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${styles.weekCell} ${isToday ? styles.weekCellToday : ''} ${isOver ? styles.weekCellOver : ''}`}
    >
      <SortableContext items={shifts.map(s => s.id)} strategy={verticalListSortingStrategy}>
        {shifts.length === 0 ? (
          <div className={styles.weekEmptyCell} onClick={() => canEdit && onAdd(dateStr)} />
        ) : (
          shifts.map(shift => (
            <DraggableShiftBlock key={shift.id} shift={shift} canEdit={canEdit} onEdit={onEdit} />
          ))
        )}
      </SortableContext>
      {canEdit && shifts.length > 0 && (
        <button className={styles.weekCellAddBtn} onClick={() => onAdd(dateStr)}>+</button>
      )}
    </div>
  );
};

// ─── Week View ────────────────────────────────────────────────────────────────

const WeekView = ({ weekStart, shifts, staff, canEdit, onAdd, onEdit, onShiftMove }: {
  weekStart: Date; shifts: Shift[]; staff: StaffMember[];
  canEdit: boolean; onAdd: (d: string) => void; onEdit: (s: Shift) => void;
  onShiftMove: (shiftId: string, newDate: string) => void;
}) => {
  const days    = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today   = toISO(new Date());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overDateStr, setOverDateStr] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeShift = activeId ? shifts.find(s => s.id === activeId) : null;

  const getTargetDate = (over: any): string | null => {
    if (!over) return null;
    // Drop on a cell droppable
    if (over.data?.current?.type === 'cell') return over.data.current.dateStr;
    // Drop on another shift — get its date
    if (over.data?.current?.type === 'shift') return over.data.current.dateStr;
    // Fallback: parse cell id format "cell-YYYY-MM-DD"
    const id = String(over.id);
    if (id.startsWith('cell-')) return id.replace('cell-', '');
    return null;
  };

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const handleDragOver = (e: DragOverEvent) => {
    const date = getTargetDate(e.over);
    setOverDateStr(date);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    setOverDateStr(null);
    if (!over) return;

    const newDate = getTargetDate(over);
    if (!newDate) return;

    const draggedShift = shifts.find(s => s.id === String(active.id));
    if (draggedShift && draggedShift.shift_date !== newDate) {
      onShiftMove(String(active.id), newDate);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.weekGrid}>
        {days.map((day, i) => {
          const dateStr = toISO(day);
          const isToday = dateStr === today;
          return (
            <div key={i} className={`${styles.weekDayHeader} ${isToday ? styles.weekDayHeaderToday : ''}`}>
              <span className={styles.weekDayName}>{DAYS[i]}</span>
              <span className={styles.weekDayNum}>{day.getDate()}</span>
              {canEdit && <button className={styles.weekAddBtn} onClick={() => onAdd(dateStr)} title="Add shift">+</button>}
            </div>
          );
        })}

        {days.map((day, i) => {
          const dateStr   = toISO(day);
          const dayShifts = shifts.filter(s => s.shift_date === dateStr);
          const isToday   = dateStr === today;
          const isOver    = overDateStr === dateStr;
          return (
            <DroppableCell key={i} dateStr={dateStr} shifts={dayShifts}
              canEdit={canEdit} onAdd={onAdd} onEdit={onEdit}
              isOver={isOver} isToday={isToday} />
          );
        })}
      </div>

      <DragOverlay>
        {activeShift ? (() => {
          const cfg = SHIFT_CONFIG[activeShift.shift_type];
          return (
            <div className={styles.dragOverlay} style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.color }}>
              <span className={styles.weekShiftName}>{activeShift.staff_name?.split(' ')[0]}</span>
              <span className={styles.weekShiftType}>{cfg.label}</span>
            </div>
          );
        })() : null}
      </DragOverlay>
    </DndContext>
  );
};

// ─── Day View ─────────────────────────────────────────────────────────────────

const DayView = ({ date, shifts, canEdit, onAdd, onEdit }: {
  date: Date; shifts: Shift[]; canEdit: boolean;
  onAdd: (d: string) => void; onEdit: (s: Shift) => void;
}) => {
  const dateStr   = toISO(date);
  const dayShifts = shifts.filter(s => s.shift_date === dateStr);
  const opening   = dayShifts.filter(s => s.shift_type === 'opening');
  const closing   = dayShifts.filter(s => s.shift_type === 'closing');

  return (
    <div className={styles.dayView}>
      <span>{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
      {canEdit && <button className={styles.addShiftBtn} onClick={() => onAdd(dateStr)}>+ Add Shift</button>}
      {(['opening', 'closing'] as ShiftType[]).map(type => {
        const group = type === 'opening' ? opening : closing;
        const cfg   = SHIFT_CONFIG[type];
        return (
          <div key={type} className={styles.shiftGroup}>
            <div className={styles.shiftGroupTitle} style={{ color: cfg.color }}>{cfg.label} Shift</div>
            {group.length === 0 ? (
              <div className={styles.noShift}>No {type} shift scheduled</div>
            ) : (
              group.map(shift => (
                <button key={shift.id} className={styles.shiftCard}
                  style={{ borderLeftColor: cfg.color, background: cfg.bg }}
                  onClick={() => onEdit(shift)}>
                  <div className={styles.shiftCardName}>{shift.staff_name}</div>
                  <div className={styles.shiftCardTime}>{fmtTime(shift.start_time)} – {fmtTime(shift.end_time)}</div>
                  {shift.notes && <div className={styles.shiftCardNote}>{shift.notes}</div>}
                </button>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Month View ───────────────────────────────────────────────────────────────

const MonthView = ({ viewDate, shifts, canEdit, onAdd, onEdit }: {
  viewDate: Date; shifts: Shift[]; canEdit: boolean;
  onAdd: (d: string) => void; onEdit: (s: Shift) => void;
}) => {
  const year = viewDate.getFullYear(), month = viewDate.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1);
  const today = toISO(new Date());

  return (
    <div className={styles.monthGrid}>
      {DAYS.map(d => <div key={d} className={styles.monthDayLabel}>{d}</div>)}
      {cells.map((day, i) => {
        if (!day) return <div key={`e-${i}`} />;
        const dateStr   = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const dayShifts = shifts.filter(s => s.shift_date === dateStr);
        const isToday   = dateStr === today;
        return (
          <div key={day} className={`${styles.monthCell} ${isToday ? styles.monthCellToday : ''}`}
            onClick={() => canEdit && onAdd(dateStr)}>
            <span className={`${styles.monthDayNum} ${isToday ? styles.monthDayNumToday : ''}`}>{day}</span>
            {dayShifts.map(s => {
              const cfg = SHIFT_CONFIG[s.shift_type];
              return (
                <button key={s.id} className={styles.monthShiftPill}
                  style={{ background: cfg.bg, color: cfg.color }}
                  onClick={e => { e.stopPropagation(); onEdit(s); }}>
                  {s.staff_name?.split(' ')[0]} · {cfg.label}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminShifts = () => {
  const { can }                             = useAdmin();
  const { toasts, showToast, removeToast } = useToast();
  const [viewMode, setViewMode]             = useState<ViewMode>('week');
  const [currentDate, setCurrentDate]       = useState(new Date());
  const [shifts, setShifts]                 = useState<Shift[]>([]);
  const [staff, setStaff]                   = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [drawerShift, setDrawerShift]       = useState<Partial<Shift> | null>(null);
  const [isNew, setIsNew]                   = useState(false);
  const [defaultDate, setDefaultDate]       = useState(toISO(new Date()));
  const canEdit = can('manage_staff');

  useEffect(() => { fetchData(); }, [viewMode, currentDate]);

  const fetchData = async () => {
    setIsLoading(true);
    const weekStart = getWeekStart(currentDate);
    let from: string, to: string;
    if (viewMode === 'day') {
      from = to = toISO(currentDate);
    } else if (viewMode === 'week') {
      from = toISO(weekStart); to = toISO(addDays(weekStart, 6));
    } else {
      const y = currentDate.getFullYear(), m = currentDate.getMonth();
      from = `${y}-${String(m+1).padStart(2,'0')}-01`;
      to   = toISO(new Date(y, m+1, 0));
    }
    try {
      const [shiftsRes, staffRes] = await Promise.all([
        (supabase as any).from('shifts').select('*').gte('shift_date', from).lte('shift_date', to).order('shift_date').order('start_time'),
        (supabase as any).from('staff_members').select('id, full_name').eq('is_active', true).order('full_name'),
      ]);
      const staffMap: Record<string, string> = {};
      (staffRes.data ?? []).forEach((s: any) => { staffMap[s.id] = s.full_name; });
      setShifts((shiftsRes.data ?? []).map((s: any) => ({ ...s, staff_name: staffMap[s.staff_id] ?? 'Unknown' })));
      setStaff(staffRes.data ?? []);
    } catch { showToast('Failed to load shifts.', 'error'); }
    finally { setIsLoading(false); }
  };

  const handleShiftMove = useCallback(async (shiftId: string, newDate: string) => {
    setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, shift_date: newDate } : s));
    try {
      const { error } = await (supabase as any).from('shifts')
        .update({ shift_date: newDate, updated_at: new Date().toISOString() })
        .eq('id', shiftId);
      if (error) throw error;
      showToast('Shift moved.', 'success');
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to move shift.', 'error');
      fetchData();
    }
  }, []);

  const handleAdd    = (date: string) => { setDefaultDate(date); setIsNew(true); setDrawerShift({}); };
  const handleEdit   = (shift: Shift) => { setIsNew(false); setDrawerShift(shift); };
  const handleSave   = () => { setDrawerShift(null); fetchData(); };
  const handleDelete = (id: string) => { setShifts(prev => prev.filter(s => s.id !== id)); setDrawerShift(null); };

  const copyLastWeek = async () => {
    if (viewMode !== 'week') return;
    const ws = getWeekStart(currentDate);
    const lastFrom = toISO(addDays(ws, -7)), lastTo = toISO(addDays(ws, -1));
    const { data } = await (supabase as any).from('shifts').select('*').gte('shift_date', lastFrom).lte('shift_date', lastTo);
    if (!data?.length) { showToast('No shifts last week to copy.', 'error'); return; }
    const inserts = data.map((s: any) => {
      const d = new Date(s.shift_date + 'T00:00:00'); d.setDate(d.getDate() + 7);
      return { staff_id: s.staff_id, shift_date: toISO(d), shift_type: s.shift_type, start_time: s.start_time, end_time: s.end_time, notes: s.notes };
    });
    await (supabase as any).from('shifts').insert(inserts);
    showToast(`Copied ${inserts.length} shifts.`, 'success');
    fetchData();
  };

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (viewMode === 'day')   d.setDate(d.getDate() + dir);
    if (viewMode === 'week')  d.setDate(d.getDate() + dir * 7);
    if (viewMode === 'month') d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const weekStart = getWeekStart(currentDate);
  const getLabel = () => {
    if (viewMode === 'day')  return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (viewMode === 'week') return `${toISO(weekStart)} – ${toISO(addDays(weekStart, 6))}`;
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className={styles.header}>
        <div>
          <h1>Shifts</h1>
          {viewMode === 'week' && <p className={styles.dndHint}>Drag shift blocks to move them between days</p>}
        </div>
        <div className={styles.headerActions}>
          {viewMode === 'week' && canEdit && (
            <button className={styles.copyBtn} onClick={copyLastWeek}>↻ Copy Last Week</button>
          )}
          {canEdit && (
            <button className={styles.addBtn} onClick={() => handleAdd(toISO(new Date()))}>+ Add Shift</button>
          )}
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.viewToggle}>
          {(['day', 'week', 'month'] as ViewMode[]).map(v => (
            <button key={v} className={`${styles.viewBtn} ${viewMode === v ? styles.viewBtnActive : ''}`} onClick={() => setViewMode(v)}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <div className={styles.navGroup}>
          <button className={styles.navBtn} onClick={() => navigate(-1)}><ChevronLeft size={16} /></button>
          <button className={styles.todayBtn} onClick={() => setCurrentDate(new Date())}>Today</button>
          <button className={styles.navBtn} onClick={() => navigate(1)}><ChevronRight size={16} /></button>
        </div>
        <span className={styles.dateLabel}>{getLabel()}</span>
      </div>

      {isLoading ? <div className={styles.loading}>Loading…</div> : (
        <>
          {viewMode === 'day'   && <DayView   date={currentDate} shifts={shifts} canEdit={canEdit} onAdd={handleAdd} onEdit={handleEdit} />}
          {viewMode === 'week'  && <WeekView  weekStart={weekStart} shifts={shifts} staff={staff} canEdit={canEdit} onAdd={handleAdd} onEdit={handleEdit} onShiftMove={handleShiftMove} />}
          {viewMode === 'month' && <MonthView viewDate={currentDate} shifts={shifts} canEdit={canEdit} onAdd={handleAdd} onEdit={handleEdit} />}
        </>
      )}

      {drawerShift !== null && (
        <ShiftDrawer shift={drawerShift} isNew={isNew} defaultDate={defaultDate}
          staff={staff} canEdit={canEdit}
          onClose={() => setDrawerShift(null)}
          onSave={handleSave} onDelete={handleDelete} showToast={showToast} />
      )}
    </div>
  );
};

export default AdminShifts;