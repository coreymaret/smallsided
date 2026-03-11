// src/components/admin/AdminTimeOff.tsx
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import { Calendar, X, Check, AlertCircle, ChevronLeft, ChevronRight } from '../../components/Icons/Icons';
import ToastContainer from '../Toast/ToastContainer';
import { useToast } from '../../hooks/useToast';
import styles from './AdminTimeOff.module.scss';

// ─── Types ────────────────────────────────────────────────────────────────────

type RequestStatus = 'pending' | 'approved' | 'denied';
type RequestType   = 'vacation' | 'personal';

interface TimeOffRequest {
  id: string;
  staff_id: string;
  start_date: string;
  end_date: string;
  type: RequestType;
  status: RequestStatus;
  request_note: string | null;
  response_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  // joined
  staff_name?: string;
}

interface StaffOption {
  id: string;
  full_name: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<RequestType, string> = {
  vacation: 'Vacation',
  personal: 'Personal',
};

const TYPE_COLORS: Record<RequestType, { bg: string; color: string }> = {
  vacation: { bg: '#eff6ff', color: '#1d4ed8' },
  personal: { bg: '#f5f3ff', color: '#6d28d9' },
};

const STATUS_CONFIG: Record<RequestStatus, { label: string; bg: string; color: string }> = {
  pending:  { label: 'Pending',  bg: '#fef3c7', color: '#92400e' },
  approved: { label: 'Approved', bg: '#dcfce7', color: '#166534' },
  denied:   { label: 'Denied',   bg: '#fee2e2', color: '#991b1b' },
};

const daysBetween = (start: string, end: string): number => {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end   + 'T00:00:00');
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const fmtDateRange = (start: string, end: string) =>
  start === end ? fmtDate(start) : `${fmtDate(start)} – ${fmtDate(end)}`;

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: RequestStatus }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{ background: cfg.bg, color: cfg.color, padding: '0.1875rem 0.625rem', borderRadius: 20, fontSize: '0.8125rem', fontWeight: 600 }}>
      {cfg.label}
    </span>
  );
};

// ─── Request form drawer ──────────────────────────────────────────────────────

interface RequestDrawerProps {
  request: Partial<TimeOffRequest> | null;
  isNew: boolean;
  staffOptions: StaffOption[];
  currentAdminId: string;
  canApprove: boolean;
  onClose: () => void;
  onSave: () => void;
  showToast: (msg: string, type?: any) => void;
}

const RequestDrawer = ({
  request, isNew, staffOptions, currentAdminId,
  canApprove, onClose, onSave, showToast,
}: RequestDrawerProps) => {
  const [staffId, setStaffId]       = useState(request?.staff_id ?? currentAdminId);
  const [startDate, setStartDate]   = useState(request?.start_date ?? '');
  const [endDate, setEndDate]       = useState(request?.end_date ?? '');
  const [type, setType]             = useState<RequestType>(request?.type ?? 'vacation');
  const [requestNote, setNote]      = useState(request?.request_note ?? '');
  const [responseNote, setRespNote] = useState(request?.response_note ?? '');
  const [isSaving, setIsSaving]     = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handler); };
  }, [onClose]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!staffId)    errs.staffId   = 'Staff member required';
    if (!startDate)  errs.startDate = 'Start date required';
    if (!endDate)    errs.endDate   = 'End date required';
    if (startDate && endDate && endDate < startDate) errs.endDate = 'End must be after start';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      if (isNew) {
        const { error } = await (supabase as any).from('time_off_requests').insert({
          staff_id: staffId, start_date: startDate, end_date: endDate,
          type, status: 'pending', request_note: requestNote || null,
        });
        if (error) throw error;
        showToast('Time-off request submitted.', 'success');
      } else {
        const { error } = await (supabase as any).from('time_off_requests')
          .update({ start_date: startDate, end_date: endDate, type, request_note: requestNote || null, updated_at: new Date().toISOString() })
          .eq('id', request?.id);
        if (error) throw error;
        showToast('Request updated.', 'success');
      }
      onSave();
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to save.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDecision = async (decision: 'approved' | 'denied') => {
    setIsSaving(true);
    try {
      const { error } = await (supabase as any).from('time_off_requests').update({
        status: decision,
        response_note: responseNote || null,
        reviewed_by: currentAdminId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', request?.id);
      if (error) throw error;
      showToast(decision === 'approved' ? 'Request approved.' : 'Request denied.', decision === 'approved' ? 'success' : 'error');
      onSave();
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to update.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const days = startDate && endDate ? daysBetween(startDate, endDate) : 0;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div className={styles.drawer} role="dialog" aria-modal="true">

        {/* Header */}
        <div className={styles.drawerHeader}>
          <div>
            <h2>{isNew ? 'New Time-Off Request' : 'Time-Off Request'}</h2>
            {!isNew && request?.status && <StatusBadge status={request.status as RequestStatus} />}
          </div>
          <button className={styles.drawerClose} onClick={onClose}><X size={20} /></button>
        </div>

        <div className={styles.drawerBody}>

          {/* Staff selector */}
          <section className={styles.drawerSection}>
            <h3>Staff Member</h3>
            <div className={styles.formField}>
              <label>Who is this request for?{isNew && <span className={styles.req}> *</span>}</label>
              <select
                className={`${styles.input} ${errors.staffId ? styles.inputErr : ''}`}
                value={staffId}
                onChange={e => setStaffId(e.target.value)}
                disabled={!isNew}
              >
                <option value="">Select staff member…</option>
                {staffOptions.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
              {errors.staffId && <span className={styles.errMsg}>{errors.staffId}</span>}
            </div>
          </section>

          {/* Dates & type */}
          <section className={styles.drawerSection}>
            <h3>Request Details</h3>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Start Date <span className={styles.req}>*</span></label>
                <input
                  type="date" className={`${styles.input} ${errors.startDate ? styles.inputErr : ''}`}
                  value={startDate} onChange={e => setStartDate(e.target.value)}
                  disabled={!isNew && request?.status !== 'pending'}
                />
                {errors.startDate && <span className={styles.errMsg}>{errors.startDate}</span>}
              </div>
              <div className={styles.formField}>
                <label>End Date <span className={styles.req}>*</span></label>
                <input
                  type="date" className={`${styles.input} ${errors.endDate ? styles.inputErr : ''}`}
                  value={endDate} onChange={e => setEndDate(e.target.value)}
                  min={startDate}
                  disabled={!isNew && request?.status !== 'pending'}
                />
                {errors.endDate && <span className={styles.errMsg}>{errors.endDate}</span>}
              </div>
            </div>

            {days > 0 && (
              <div className={styles.dayCount}>
                <Calendar size={14} />
                {days} {days === 1 ? 'day' : 'days'}
              </div>
            )}

            <div className={styles.formField}>
              <label>Type</label>
              <div className={styles.typeGroup}>
                {(['vacation', 'personal'] as RequestType[]).map(t => (
                  <button
                    key={t}
                    className={`${styles.typeBtn} ${type === t ? styles.typeBtnActive : ''}`}
                    onClick={() => setType(t)}
                    disabled={!isNew && request?.status !== 'pending'}
                    style={type === t ? { background: TYPE_COLORS[t].bg, color: TYPE_COLORS[t].color, borderColor: TYPE_COLORS[t].color } : {}}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formField}>
              <label>Note <span className={styles.optional}>(optional)</span></label>
              <textarea
                className={styles.textarea}
                value={requestNote}
                onChange={e => setNote(e.target.value)}
                placeholder="Any context for this request…"
                rows={3}
                disabled={!isNew && request?.status !== 'pending'}
              />
            </div>
          </section>

          {/* Approval section — managers only, pending requests */}
          {!isNew && canApprove && request?.status === 'pending' && (
            <section className={styles.drawerSection}>
              <h3>Manager Response</h3>
              <div className={styles.formField}>
                <label>Response note <span className={styles.optional}>(optional)</span></label>
                <textarea
                  className={styles.textarea}
                  value={responseNote}
                  onChange={e => setRespNote(e.target.value)}
                  placeholder="Add a note for the staff member…"
                  rows={2}
                />
              </div>
              <div className={styles.decisionBtns}>
                <button
                  className={styles.denyBtn}
                  onClick={() => handleDecision('denied')}
                  disabled={isSaving}
                >
                  <X size={16} /> Deny
                </button>
                <button
                  className={styles.approveBtn}
                  onClick={() => handleDecision('approved')}
                  disabled={isSaving}
                >
                  <Check size={16} /> Approve
                </button>
              </div>
            </section>
          )}

          {/* Response note (read-only if already reviewed) */}
          {!isNew && request?.status !== 'pending' && request?.response_note && (
            <section className={styles.drawerSection}>
              <h3>Manager Response</h3>
              <p className={styles.responseNote}>{request.response_note}</p>
              {request.reviewed_at && (
                <p className={styles.reviewedAt}>
                  {STATUS_CONFIG[request.status as RequestStatus].label} on{' '}
                  {new Date(request.reviewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </section>
          )}

        </div>

        {/* Footer — only show Save for new or pending requests */}
        {(isNew || request?.status === 'pending') && !canApprove && (
          <div className={styles.drawerFooter}>
            <button className={styles.cancelBtn} onClick={onClose} disabled={isSaving}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        )}
        {isNew && canApprove && (
          <div className={styles.drawerFooter}>
            <button className={styles.cancelBtn} onClick={onClose} disabled={isSaving}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        )}

      </div>
    </>
  );
};

// ─── Calendar view ────────────────────────────────────────────────────────────

const CalendarView = ({ requests }: { requests: TimeOffRequest[] }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells       = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  const approved = requests.filter(r => r.status === 'approved');

  const getRequestsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return approved.filter(r => r.start_date <= dateStr && r.end_date >= dateStr);
  };

  const today = new Date();

  return (
    <div className={styles.calWrap}>
      <div className={styles.calHeader}>
        <button className={styles.calNavBtn} onClick={() => setViewDate(new Date(year, month - 1, 1))}><ChevronLeft size={16} /></button>
        <span className={styles.calTitle}>
          {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button className={styles.calNavBtn} onClick={() => setViewDate(new Date(year, month + 1, 1))}><ChevronRight size={16} /></button>
      </div>

      <div className={styles.calGrid}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className={styles.calDayLabel}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const reqs  = getRequestsForDay(day);
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
          return (
            <div key={day} className={`${styles.calCell} ${isToday ? styles.calToday : ''}`}>
              <span className={styles.calDayNum}>{day}</span>
              {reqs.map(r => (
                <div
                  key={r.id}
                  className={styles.calEvent}
                  style={{ background: TYPE_COLORS[r.type].bg, color: TYPE_COLORS[r.type].color }}
                  title={`${r.staff_name} — ${TYPE_LABELS[r.type]}`}
                >
                  {r.staff_name?.split(' ')[0]}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const AdminTimeOff = () => {
  const { admin, can }                      = useAdmin();
  const { toasts, showToast, removeToast }  = useToast();
  const [requests, setRequests]             = useState<TimeOffRequest[]>([]);
  const [staffOptions, setStaffOptions]     = useState<StaffOption[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Partial<TimeOffRequest> | null>(null);
  const [isNew, setIsNew]                   = useState(false);
  const [activeTab, setActiveTab]           = useState<'queue' | 'calendar'>('queue');
  const [filterStatus, setFilterStatus]     = useState<RequestStatus | 'all'>('pending');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [reqRes, staffRes] = await Promise.all([
        (supabase as any).from('time_off_requests').select('*').order('created_at', { ascending: false }),
        (supabase as any).from('staff_members').select('id, full_name').eq('is_active', true).order('full_name'),
      ]);
      if (reqRes.error)   throw reqRes.error;
      if (staffRes.error) throw staffRes.error;

      const staffMap: Record<string, string> = {};
      (staffRes.data ?? []).forEach((s: StaffOption) => { staffMap[s.id] = s.full_name; });

      const enriched = (reqRes.data ?? []).map((r: TimeOffRequest) => ({
        ...r,
        staff_name: staffMap[r.staff_id] ?? 'Unknown',
      }));

      setRequests(enriched);
      setStaffOptions(staffRes.data ?? []);
    } catch (err: any) {
      showToast('Failed to load requests.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = useCallback(() => {
    setSelectedRequest(null);
    setIsNew(false);
    fetchAll();
  }, []);

  const filtered = requests.filter(r => filterStatus === 'all' || r.status === filterStatus);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Time Off</h1>
          <p>{pendingCount > 0 ? `${pendingCount} pending request${pendingCount > 1 ? 's' : ''}` : 'No pending requests'}</p>
        </div>
        <button className={styles.newBtn} onClick={() => { setIsNew(true); setSelectedRequest({}); }}>
          + New Request
        </button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'queue' ? styles.tabActive : ''}`} onClick={() => setActiveTab('queue')}>
          Requests
          {pendingCount > 0 && <span className={styles.badge}>{pendingCount}</span>}
        </button>
        <button className={`${styles.tab} ${activeTab === 'calendar' ? styles.tabActive : ''}`} onClick={() => setActiveTab('calendar')}>
          Calendar
        </button>
      </div>

      {/* Queue view */}
      {activeTab === 'queue' && (
        <>
          {/* Status filter */}
          <div className={styles.filterRow}>
            {(['pending', 'approved', 'denied', 'all'] as const).map(s => (
              <button
                key={s}
                className={`${styles.filterBtn} ${filterStatus === s ? styles.filterBtnActive : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
                {s === 'pending' && pendingCount > 0 && ` (${pendingCount})`}
              </button>
            ))}
          </div>

          {isLoading && <div className={styles.loading}>Loading requests…</div>}

          {!isLoading && filtered.length === 0 && (
            <div className={styles.empty}>
              <Calendar size={36} className={styles.emptyIcon} />
              <p>No {filterStatus === 'all' ? '' : filterStatus} requests.</p>
            </div>
          )}

          <div className={styles.requestList}>
            {filtered.map(req => {
              const days = daysBetween(req.start_date, req.end_date);
              return (
                <button key={req.id} className={styles.requestCard} onClick={() => { setIsNew(false); setSelectedRequest(req); }}>
                  <div className={styles.requestLeft}>
                    <div className={styles.requestName}>{req.staff_name}</div>
                    <div className={styles.requestDates}>
                      <Calendar size={13} />
                      {fmtDateRange(req.start_date, req.end_date)}
                      <span className={styles.requestDays}>{days}d</span>
                    </div>
                    {req.request_note && (
                      <div className={styles.requestNote}>"{req.request_note}"</div>
                    )}
                  </div>
                  <div className={styles.requestRight}>
                    <span
                      className={styles.typeTag}
                      style={{ background: TYPE_COLORS[req.type].bg, color: TYPE_COLORS[req.type].color }}
                    >
                      {TYPE_LABELS[req.type]}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Calendar view */}
      {activeTab === 'calendar' && <CalendarView requests={requests} />}

      {/* Drawer */}
      {selectedRequest !== null && (
        <RequestDrawer
          request={selectedRequest}
          isNew={isNew}
          staffOptions={staffOptions}
          currentAdminId={admin?.id ?? ''}
          canApprove={can('approve_timeoff')}
          onClose={() => { setSelectedRequest(null); setIsNew(false); }}
          onSave={handleSave}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default AdminTimeOff;
