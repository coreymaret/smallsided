// src/components/admin/AdminSchedule.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import { ChevronLeft, ChevronRight, Calendar, Download } from '../../components/Icons/Icons';
import BookingDrawer, { type DrawerBooking, type BookingStatus } from './shared/BookingDrawer';
import QuickCreateModal from './shared/QuickCreateModal';
import ToastContainer from '../Toast/ToastContainer';
import { useToast } from '../../hooks/useToast';
import styles from './AdminSchedule.module.scss';

// ─── Config ───────────────────────────────────────────────────────────────────

const FIELDS = [
  { id: 'field-1', name: 'Camp Nou'     },
  { id: 'field-2', name: 'Old Trafford' },
  { id: 'field-3', name: 'San Siro'     },
];

const START_HOUR  = 10;
const END_HOUR    = 24;
const SLOT_MINS   = 30;
const TOTAL_SLOTS = ((END_HOUR - START_HOUR) * 60) / SLOT_MINS; // 28 slots
const SLOT_PX     = 48; // px per slot
const HEADER_PX   = 56; // field header height
const GUTTER_PX   = 80; // time gutter width

const TIME_SLOTS = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
  const totalMins = START_HOUR * 60 + i * SLOT_MINS;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const isHour = m === 0;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const label = isHour ? `${hour}:00 ${ampm}` : '';
  return { h, m, totalMins, label, isHour };
});

const SERVICE_COLORS: Record<string, string> = {
  field_rental: '#3b82f6',
  training:     '#8b5cf6',
  camp:         '#f59e0b',
  birthday:     '#ec4899',
  league:       '#10b981',
  pickup:       '#ef4444',
};

const SERVICE_LABELS: Record<string, string> = {
  field_rental: 'Field Rental',
  training:     'Training',
  camp:         'Camp',
  birthday:     'Birthday Party',
  league:       'League',
  pickup:       'Pickup',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toISO = (d: Date) => {
  const y  = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${dy}`;
};

const toMins = (t: string | null): number | null => {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
};

const fmtTime = (t: string | null): string => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
};

const fmtDateHeader = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

const normalizeField = (id: string | null): string => {
  if (!id) return 'field-1'; // unassigned → Camp Nou
  return id.toLowerCase().replace(/[\s_]/g, '-');
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScheduleBooking {
  id: string;
  booking_type: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  start_time: string | null;
  end_time: string | null;
  field_id: string | null;
  participants: number | null;
  total_amount: number;
  payment_status: string;
  booking_status: string;
  special_requests: string | null;
  metadata: Record<string, any> | null;
  stripe_payment_intent_id: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AdminSchedule = () => {
  const { admin, can }                    = useAdmin();
  const { toasts, showToast, removeToast } = useToast();
  const [currentDate, setCurrentDate]     = useState(new Date());
  const [bookings, setBookings]           = useState<ScheduleBooking[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<DrawerBooking | null>(null);
  const [quickCreate, setQuickCreate]     = useState<{ fieldId: string; time: string } | null>(null);

  useEffect(() => { fetchBookings(currentDate); }, [currentDate]);

  const fetchBookings = async (date: Date) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_date', toISO(date))
        .neq('booking_status', 'cancelled');
      if (error) throw error;
      setBookings(data || []);
    } catch {
      showToast('Failed to load schedule.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = useCallback((id: string, s: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, booking_status: s } : b));
    setSelectedBooking(prev => prev?.id === id ? { ...prev, booking_status: s } : prev);
  }, []);

  const openDrawer = (b: ScheduleBooking) => {
    setSelectedBooking({
      id: b.id,
      booking_type:   b.booking_type as any,
      customer_name:  b.customer_name,
      customer_email: b.customer_email,
      customer_phone: b.customer_phone,
      booking_date:   b.booking_date,
      start_time:     b.start_time,
      end_time:       b.end_time,
      field_id:       b.field_id,
      participants:   b.participants,
      total_amount:   b.total_amount,
      payment_status: b.payment_status as any,
      booking_status: (b.booking_status as BookingStatus) ?? 'pending',
      special_requests: b.special_requests,
      metadata:         b.metadata,
      created_at:       new Date().toISOString(),
      stripe_payment_intent_id: b.stripe_payment_intent_id,
    });
  };

  // ── Calculate booking positions for a given field ──────────────────────────
  const getFieldBookings = (fieldId: string) => {
    const norm = normalizeField(fieldId);
    const fieldBookings = bookings.filter(b => normalizeField(b.field_id) === norm);
    const totalMins = (END_HOUR - START_HOUR) * 60;
    const totalPx   = TOTAL_SLOTS * SLOT_PX;

    // Detect conflicts
    const conflicting = new Set<string>();
    for (let i = 0; i < fieldBookings.length; i++) {
      for (let j = i + 1; j < fieldBookings.length; j++) {
        const a = fieldBookings[i], bk = fieldBookings[j];
        const as = toMins(a.start_time), ae = toMins(a.end_time) ?? ((as ?? 0) + 60);
        const bs = toMins(bk.start_time), be = toMins(bk.end_time) ?? ((bs ?? 0) + 60);
        if (as !== null && bs !== null && as < be && bs < ae) {
          conflicting.add(a.id);
          conflicting.add(bk.id);
        }
      }
    }

    return fieldBookings.map((b, idx) => {
      const startM = toMins(b.start_time) ?? (START_HOUR * 60);
      const endM   = toMins(b.end_time)   ?? (startM + 60);
      const topPx  = Math.max(0, ((startM - START_HOUR * 60) / totalMins) * totalPx);
      const htPx   = Math.max(32, ((endM - startM) / totalMins) * totalPx);
      const isConflict = conflicting.has(b.id);
      // Side-by-side for conflicts
      const siblings = fieldBookings.filter(x => conflicting.has(x.id));
      const sibling  = siblings.indexOf(b);
      return { b, topPx, htPx, isConflict, colIdx: sibling % 2, colCount: isConflict ? 2 : 1 };
    });
  };

  const isToday   = toISO(currentDate) === toISO(new Date());
  const gridHeight = TOTAL_SLOTS * SLOT_PX;

  const prevDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d); };
  const nextDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d); };

  return (
    <div className={styles.page}>

      {/* ── Page header ──────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <h1>Facility Schedule</h1>
          <p className={styles.dateLabel}>{fmtDateHeader(currentDate)}</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.navGroup}>
            <button className={styles.navBtn} onClick={prevDay} aria-label="Previous day"><ChevronLeft size={18} /></button>
            <button className={`${styles.todayBtn} ${isToday ? styles.todayActive : ''}`} onClick={() => setCurrentDate(new Date())}>Today</button>
            <button className={styles.navBtn} onClick={nextDay} aria-label="Next day"><ChevronRight size={18} /></button>
          </div>
          <div className={styles.datePicker}>
            <Calendar size={16} />
            <input
              type="date"
              value={toISO(currentDate)}
              onChange={e => { if (e.target.value) setCurrentDate(new Date(e.target.value + 'T12:00:00')); }}
              className={styles.dateInput}
            />
          </div>
          <button className={styles.printBtn} onClick={() => window.print()}>
            <Download size={16} /><span>Print Day</span>
          </button>
        </div>
      </div>

      {/* ── Legend ───────────────────────────────────────────── */}
      <div className={styles.legend}>
        {Object.entries(SERVICE_LABELS).map(([key, label]) => (
          <div key={key} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: SERVICE_COLORS[key] }} />
            <span>{label}</span>
          </div>
        ))}
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#fef3c7', border: '2px solid #f59e0b' }} />
          <span>Conflict</span>
        </div>
      </div>

      {/* ── Schedule grid ────────────────────────────────────── */}
      <div className={styles.gridWrap}>
        {isLoading && <div className={styles.loading}>Loading schedule…</div>}

        {/* Field headers row */}
        <div className={styles.headersRow} style={{ paddingLeft: GUTTER_PX }}>
          {FIELDS.map(field => (
            <div key={field.id} className={styles.fieldHeader}>
              <span className={styles.fieldName}>{field.name}</span>
              <button
                className={styles.addBtn}
                onClick={() => setQuickCreate({ fieldId: field.id, time: `${START_HOUR}:00` })}
                title={`Add booking to ${field.name}`}
              >
                +
              </button>
            </div>
          ))}
        </div>

        {/* Scrollable body: time gutter + field columns */}
        <div className={styles.bodyRow}>

          {/* Time gutter */}
          <div className={styles.timeGutter} style={{ width: GUTTER_PX, minWidth: GUTTER_PX }}>
            {TIME_SLOTS.map((slot, i) => (
              <div
                key={i}
                className={styles.timeLabel}
                style={{ height: SLOT_PX }}
              >
                {slot.isHour && <span>{slot.label}</span>}
              </div>
            ))}
          </div>

          {/* Field columns */}
          {FIELDS.map(field => (
            <div key={field.id} className={styles.fieldCol}>

              {/* Clickable time slots */}
              {TIME_SLOTS.map((slot, i) => (
                <div
                  key={i}
                  className={`${styles.timeSlot} ${slot.isHour ? styles.timeSlotHour : ''}`}
                  style={{ height: SLOT_PX }}
                  onClick={() => setQuickCreate({
                    fieldId: field.id,
                    time: `${String(slot.h).padStart(2, '0')}:${String(slot.m).padStart(2, '0')}`,
                  })}
                />
              ))}

              {/* Booking blocks — absolutely positioned over the slots */}
              <div className={styles.bookingsLayer} style={{ height: gridHeight }}>
                {getFieldBookings(field.id).map(({ b, topPx, htPx, isConflict, colIdx, colCount }) => (
                  <button
                    key={b.id}
                    className={`${styles.bookingBlock} ${isConflict ? styles.conflictBlock : ''}`}
                    style={{
                      top:    topPx,
                      height: htPx,
                      left:   colCount > 1 ? `${colIdx * 50}%` : '2px',
                      right:  colCount > 1 ? `${(1 - colIdx - 1) * 50 + (colIdx === 0 ? 1 : 0)}%` : '2px',
                      background: isConflict ? '#fef3c7' : SERVICE_COLORS[b.booking_type] ?? '#667eea',
                      borderColor: isConflict ? '#f59e0b' : 'transparent',
                      color: isConflict ? '#92400e' : '#fff',
                    }}
                    onClick={e => { e.stopPropagation(); openDrawer(b); }}
                  >
                    <span className={styles.blockName}>{b.customer_name}</span>
                    <span className={styles.blockTime}>{fmtTime(b.start_time)}{b.end_time ? ` – ${fmtTime(b.end_time)}` : ''}</span>
                    <span className={styles.blockService}>{SERVICE_LABELS[b.booking_type] ?? b.booking_type}</span>
                  </button>
                ))}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* ── Drawers ───────────────────────────────────────────── */}
      <BookingDrawer
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onStatusChange={handleStatusChange}
        showToast={showToast}
        canChangeStatus={can('change_booking_status')}
        canAddNotes={can('add_booking_notes')}
        adminName={admin?.full_name ?? ''}
        adminId={admin?.id ?? ''}
      />

      {quickCreate && (
        <QuickCreateModal
          defaultFieldId={quickCreate.fieldId}
          defaultTime={quickCreate.time}
          defaultDate={toISO(currentDate)}
          onClose={() => setQuickCreate(null)}
          onSuccess={() => { setQuickCreate(null); fetchBookings(currentDate); showToast('Booking created.', 'success'); }}
          showToast={showToast}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default AdminSchedule;
