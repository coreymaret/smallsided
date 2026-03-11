// src/components/admin/shared/BookingDrawer.tsx
import { useState, useEffect, useRef } from 'react';
import {
  X, User, Mail, Phone, Calendar, Clock, DollarSign,
  MapPin, Users, FileText, Check, ChevronDown, AlertCircle
} from '../../../components/Icons/Icons';
import { supabase } from '../../../lib/supabase';
import { StatusBadge } from './TableCells';
import type { ToastType } from '../../../hooks/useToast';
import type { ConflictInfo } from '../../../hooks/useFieldConflicts';
import styles from './BookingDrawer.module.scss';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'no_show' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type ServiceType = 'field_rental' | 'pickup' | 'birthday' | 'camp' | 'training' | 'league';

export interface DrawerBooking {
  id: string;
  booking_type: ServiceType;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  start_time: string | null;
  end_time: string | null;
  field_id: string | null;
  participants: number | null;
  total_amount: number;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  special_requests: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  stripe_payment_intent_id?: string | null;
}

interface BookingNote {
  id: string;
  note: string;
  created_at: string;
  admin_name?: string;
}

export interface ConflictInfo {
  conflictsWith: {
    id: string;
    customer_name: string;
    start_time: string | null;
    end_time: string | null;
  }[];
}

interface BookingDrawerProps {
  booking: DrawerBooking | null;
  onClose: () => void;
  onStatusChange?: (bookingId: string, newStatus: BookingStatus) => void;
  showToast: (message: string, type?: ToastType) => void;
  canChangeStatus: boolean;
  canAddNotes: boolean;
  adminName: string;
  adminId: string;
  conflictInfo?: ConflictInfo | null;
}

const STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'no_show', 'cancelled'],
  completed: [],
  no_show: ['confirmed'],
  cancelled: ['confirmed'],
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  no_show: 'No Show',
  cancelled: 'Cancelled',
};

const SERVICE_LABELS: Record<ServiceType, string> = {
  field_rental: 'Field Rental',
  pickup: 'Pickup Game',
  birthday: 'Birthday Party',
  camp: 'Camp',
  training: 'Training',
  league: 'League',
};

const formatTime = (time: string | null): string => {
  if (!time) return '—';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
};

const formatAmount = (amount: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

const DetailRow = ({ label, value, mono = false }: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) => (
  <div className={styles.detailRow}>
    <span className={styles.detailLabel}>{label}</span>
    <span className={`${styles.detailValue} ${mono ? styles.mono : ''}`}>{value}</span>
  </div>
);

const CopyButton = ({ text, onCopy }: { text: string; onCopy: () => void }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <button className={styles.copyBtn} onClick={handleCopy} title="Copy to clipboard">
      {copied ? <Check size={14} /> : <FileText size={14} />}
    </button>
  );
};

const BookingDrawer = ({
  booking,
  onClose,
  onStatusChange,
  showToast,
  canChangeStatus,
  canAddNotes,
  adminName,
  adminId,
  conflictInfo,
}: BookingDrawerProps) => {
  const [activeTab, setActiveTab] = useState<'details' | 'notes'>('details');
  const [notes, setNotes] = useState<BookingNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState<BookingStatus>('pending');
  const drawerRef = useRef<HTMLDivElement>(null);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (booking) {
      setLocalStatus(booking.booking_status);
      setActiveTab('details');
      setStatusDropdownOpen(false);
    }
  }, [booking?.id]);

  useEffect(() => {
    if (booking) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [booking]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    if (activeTab === 'notes' && booking) {
      fetchNotes(booking.id);
    }
  }, [activeTab, booking?.id]);

  const fetchNotes = async (bookingId: string) => {
    const { data } = await (supabase as any)
      .from('booking_notes')
      .select('id, note, created_at, admin_user_id')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });
    if (data) {
      setNotes(data.map((n: any) => ({
        id: n.id as string,
        note: n.note as string,
        created_at: n.created_at as string,
        admin_name: 'Staff',
      })));
    }
  };

  const handleStatusChange = async (newStatus: BookingStatus) => {
    if (!booking || !canChangeStatus) return;

    // Block confirming a booking that has conflicts
    if (newStatus === 'confirmed' && conflictInfo && conflictInfo.conflictsWith.length > 0) {
      showToast('Resolve the field conflict before confirming this booking.', 'warning');
      return;
    }

    setStatusDropdownOpen(false);
    setIsChangingStatus(true);
    const prevStatus = localStatus;
    setLocalStatus(newStatus);
    const { error } = await (supabase as any)
      .from('bookings')
      .update({ booking_status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', booking.id);
    setIsChangingStatus(false);
    if (error) {
      setLocalStatus(prevStatus);
      showToast('Failed to update status. Please try again.', 'error');
      return;
    }
    showToast(`Status updated to ${STATUS_LABELS[newStatus]}`, 'success');
    onStatusChange?.(booking.id, newStatus);
  };

  const handleSaveNote = async () => {
    if (!booking || !adminId || !newNote.trim()) return;
    setIsSavingNote(true);
    const { data, error } = await (supabase as any)
      .from('booking_notes')
      .insert({ booking_id: booking.id, admin_user_id: adminId, note: newNote.trim() })
      .select('id, note, created_at')
      .single();
    setIsSavingNote(false);
    if (error) {
      showToast('Failed to save note.', 'error');
      return;
    }
    setNotes(prev => [{ ...data, admin_name: adminName }, ...prev]);
    setNewNote('');
    showToast('Note saved.', 'success');
  };

  const availableTransitions = STATUS_TRANSITIONS[localStatus] ?? [];

  if (!booking) return null;

  const hasTime = booking.start_time && booking.start_time.match(/^\d{2}:\d{2}/);
  const timeDisplay = hasTime
    ? `${formatTime(booking.start_time)}${booking.end_time ? ` - ${formatTime(booking.end_time)}` : ''}`
    : 'Time not yet assigned';

  const emailHref = `mailto:${booking.customer_email}?subject=Re: Your Small Sided ${SERVICE_LABELS[booking.booking_type]} on ${booking.booking_date}`;
  const telHref = `tel:${booking.customer_phone}`;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div
        ref={drawerRef}
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={`Booking details for ${booking.customer_name}`}
      >
        <div className={styles.header}>
          <div className={styles.headerMeta}>
            <span className={styles.serviceTag}>{SERVICE_LABELS[booking.booking_type]}</span>
            <h2 className={styles.customerName}>{booking.customer_name}</h2>
            <p className={styles.bookingDate}>{formatDate(booking.booking_date)}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close drawer">
            <X size={22} />
          </button>
        </div>

        {/* ── Conflict alert ──────────────────────────────── */}
        {conflictInfo && (
          <div className={styles.conflictBanner}>
            <AlertCircle size={16} className={styles.conflictIcon} />
            <div>
              <strong>Field Conflict</strong>
              <span>
                {' '}Overlaps with <strong>{conflictInfo.conflictingCustomerName}</strong>
                {conflictInfo.conflictingStartTime && (
                  <> at {conflictInfo.conflictingStartTime}{conflictInfo.conflictingEndTime ? ` – ${conflictInfo.conflictingEndTime}` : ''}</>
                )}
              </span>
            </div>
          </div>
        )}

        <div className={styles.statusBar}>
          <div className={styles.statusLeft}>
            <StatusBadge status={localStatus} />
            {isChangingStatus && <span className={styles.statusSaving}>Saving...</span>}
          </div>
          {canChangeStatus && availableTransitions.length > 0 && (
            <div className={styles.statusDropdownWrap} ref={dropdownRef}>
              <button
                className={styles.statusChangeBtn}
                onClick={() => setStatusDropdownOpen(o => !o)}
                disabled={isChangingStatus}
              >
                Change status
                <ChevronDown size={14} />
              </button>
              {statusDropdownOpen && (
                <div className={styles.statusDropdown}>
                  {availableTransitions.map(status => (
                    <button
                      key={status}
                      className={styles.statusOption}
                      onClick={() => handleStatusChange(status)}
                    >
                      <StatusBadge status={status} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {conflictInfo && conflictInfo.conflictsWith.length > 0 && (
          <div className={styles.conflictBanner}>
            <AlertCircle size={18} className={styles.conflictIcon} />
            <div className={styles.conflictText}>
              <strong>Field Conflict</strong>
              {conflictInfo.conflictsWith.map(c => {
                const fmt = (t: string | null) => {
                  if (!t) return '';
                  const [h, m] = t.split(':').map(Number);
                  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
                };
                return (
                  <span key={c.id}>
                    Overlaps with <strong>{c.customer_name}</strong>
                    {c.start_time ? ` (${fmt(c.start_time)}${c.end_time ? ` – ${fmt(c.end_time)}` : ''})` : ''}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'details' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'notes' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            Notes
            {notes.length > 0 && <span className={styles.noteCount}>{notes.length}</span>}
          </button>
        </div>

        <div className={styles.body}>
          {activeTab === 'details' && (
            <div className={styles.detailsPane}>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Contact</h3>
                <div className={styles.contactCard}>
                  <div className={styles.contactRow}>
                    <User size={16} className={styles.contactIcon} />
                    <span>{booking.customer_name}</span>
                    <CopyButton text={booking.customer_name} onCopy={() => showToast('Name copied', 'info')} />
                  </div>
                  <div className={styles.contactRow}>
                    <Mail size={16} className={styles.contactIcon} />
                    <a href={emailHref} className={styles.contactLink}>{booking.customer_email}</a>
                    <CopyButton text={booking.customer_email} onCopy={() => showToast('Email copied', 'info')} />
                  </div>
                  <div className={styles.contactRow}>
                    <Phone size={16} className={styles.contactIcon} />
                    <a href={telHref} className={styles.contactLink}>{booking.customer_phone}</a>
                    <CopyButton text={booking.customer_phone} onCopy={() => showToast('Phone copied', 'info')} />
                  </div>
                </div>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Booking Info</h3>
                <div className={styles.detailList}>
                  <DetailRow
                    label="Date"
                    value={<span className={styles.iconValue}><Calendar size={14} />{formatDate(booking.booking_date)}</span>}
                  />
                  <DetailRow
                    label="Time"
                    value={<span className={styles.iconValue}><Clock size={14} />{timeDisplay}</span>}
                  />
                  {booking.field_id && (
                    <DetailRow
                      label="Field"
                      value={<span className={styles.iconValue}><MapPin size={14} />{booking.field_id}</span>}
                    />
                  )}
                  {booking.participants != null && (
                    <DetailRow
                      label="Players"
                      value={<span className={styles.iconValue}><Users size={14} />{booking.participants}</span>}
                    />
                  )}
                  <DetailRow label="Booked on" value={new Date(booking.created_at).toLocaleDateString()} />
                </div>
              </section>

              {booking.metadata && Object.keys(booking.metadata).length > 0 && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Additional Info</h3>
                  <div className={styles.detailList}>
                    {booking.metadata.child_name && (
                      <DetailRow label="Child's name" value={booking.metadata.child_name} />
                    )}
                    {booking.metadata.child_age && (
                      <DetailRow label="Child's age" value={`${booking.metadata.child_age} years old`} />
                    )}
                    {booking.metadata.camp_type && (
                      <DetailRow label="Camp type" value={booking.metadata.camp_type} />
                    )}
                    {booking.metadata.package && (
                      <DetailRow label="Package" value={booking.metadata.package} />
                    )}
                    {booking.metadata.format && (
                      <DetailRow label="Format" value={booking.metadata.format} />
                    )}
                    {booking.metadata.medical_notes && (
                      <DetailRow
                        label="Medical notes"
                        value={<span className={styles.alertValue}><AlertCircle size={14} />{booking.metadata.medical_notes}</span>}
                      />
                    )}
                    {booking.metadata.allergies && (
                      <DetailRow
                        label="Allergies"
                        value={<span className={styles.alertValue}><AlertCircle size={14} />{booking.metadata.allergies}</span>}
                      />
                    )}
                    {booking.metadata.emergency_contact && (
                      <DetailRow label="Emergency contact" value={booking.metadata.emergency_contact} />
                    )}
                  </div>
                </section>
              )}

              {booking.special_requests && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Special Requests</h3>
                  <p className={styles.requestText}>{booking.special_requests}</p>
                </section>
              )}

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Payment</h3>
                <div className={styles.detailList}>
                  <DetailRow
                    label="Amount"
                    value={<span className={styles.iconValue}><DollarSign size={14} />{formatAmount(booking.total_amount)}</span>}
                  />
                  <DetailRow label="Payment status" value={<StatusBadge status={booking.payment_status} />} />
                  {booking.stripe_payment_intent_id && (
                    <DetailRow
                      label="Payment ID"
                      value={<span className={styles.monoSmall}>{booking.stripe_payment_intent_id}</span>}
                      mono
                    />
                  )}
                </div>
              </section>

            </div>
          )}

          {activeTab === 'notes' && (
            <div className={styles.notesPane}>
              {canAddNotes && (
                <div className={styles.newNoteBox}>
                  <textarea
                    ref={noteInputRef}
                    className={styles.noteInput}
                    placeholder="Add an internal note... (only visible to staff)"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <button
                    className={styles.saveNoteBtn}
                    onClick={handleSaveNote}
                    disabled={isSavingNote || !newNote.trim()}
                  >
                    {isSavingNote ? 'Saving...' : 'Save Note'}
                  </button>
                </div>
              )}
              {notes.length === 0 ? (
                <p className={styles.emptyNotes}>No notes yet.</p>
              ) : (
                <div className={styles.noteList}>
                  {notes.map(note => (
                    <div key={note.id} className={styles.noteItem}>
                      <div className={styles.noteMeta}>
                        <span className={styles.noteAuthor}>{note.admin_name ?? 'Staff'}</span>
                        <span className={styles.noteDate}>
                          {new Date(note.created_at).toLocaleString('en-US', {
                            month: 'short', day: 'numeric',
                            hour: 'numeric', minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className={styles.noteText}>{note.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookingDrawer;
