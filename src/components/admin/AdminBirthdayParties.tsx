import { useEffect, useState, useCallback } from 'react';
import { useDateFilter } from '../../hooks/useDateFilter';
import DateFilterBar from './shared/DateFilterBar';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import { Calendar, Cake, AlertCircle } from '../../components/Icons/Icons';
import AdminDataTable, { type Column } from './shared/AdminDataTable';
import { CellWithIcon, StatusBadge, InlineStatusBadge, type BookingStatus as InlineStatus } from './shared/TableCells';
import BookingDrawer, { type DrawerBooking, type BookingStatus } from './shared/BookingDrawer';
import ToastContainer from '../Toast/ToastContainer';
import { useToast } from '../../hooks/useToast';

interface BirthdayBooking {
  id: string;
  created_at: string;
  booking_date: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  payment_status: string;
  booking_status: string;
  special_requests: string | null;
  stripe_payment_intent_id: string | null;
  metadata?: {
    child_name?: string;
    package?: string;
    child_age?: number;
  };
}

const getDaysUntil = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingDate = new Date(dateStr + 'T00:00:00');
  bookingDate.setHours(0, 0, 0, 0);
  return Math.round((bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const UrgencyBadge = ({ dateStr }: { dateStr: string }) => {
  const days = getDaysUntil(dateStr);
  if (days < 0)  return <span style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>Past</span>;
  if (days === 0) return <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.8125rem' }}>Today!</span>;
  if (days <= 7)  return <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.8125rem' }}>In {days}d</span>;
  if (days <= 14) return <span style={{ color: '#d97706', fontWeight: 600, fontSize: '0.8125rem' }}>In {days}d</span>;
  return <span style={{ color: '#16a34a', fontSize: '0.8125rem' }}>In {days}d</span>;
};

const AdminBirthdayParties = () => {
  const { admin, can } = useAdmin();
  const [bookings, setBookings] = useState<BirthdayBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<DrawerBooking | null>(null);
  const { toasts, showToast, removeToast } = useToast();
  const { preset, range, setPreset } = useDateFilter('upcoming');

  useEffect(() => { fetchBookings(); }, [range.from, range.to]);

  const fetchBookings = async () => {
    setError(null);
    setIsLoading(true);
    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('booking_type', 'birthday');
      if (range.from) query = (query as any).gte('booking_date', range.from);
      if (range.to)   query = (query as any).lte('booking_date', range.to);
      const { data, error: fetchError } = await (query as any).order('booking_date', { ascending: true });
      if (fetchError) throw fetchError;
      setBookings(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load birthday party bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = useCallback((bookingId: string, newStatus: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, booking_status: newStatus } : b));
    setSelectedBooking(prev => prev?.id === bookingId ? { ...prev, booking_status: newStatus } : prev);
  }, []);

  const handleInlineStatusChange = async (bookingId: string, newStatus: InlineStatus) => {
    setBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, booking_status: newStatus } : b)
    );
    const { error } = await (supabase as any)
      .from('bookings')
      .update({ booking_status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', bookingId);
    if (error) {
      fetchBookings();
      showToast('Failed to update status.', 'error');
    } else {
      showToast(`Status updated to ${newStatus.replace('_', ' ')}`, 'success');
    }
  };

  const handleRowClick = (b: BirthdayBooking) => {
    setSelectedBooking({
      id: b.id,
      booking_type: 'birthday',
      customer_name: b.customer_name,
      customer_email: b.customer_email,
      customer_phone: b.customer_phone,
      booking_date: b.booking_date,
      start_time: null,
      end_time: null,
      field_id: null,
      participants: null,
      total_amount: b.total_amount,
      payment_status: b.payment_status as DrawerBooking['payment_status'],
      booking_status: (b.booking_status as BookingStatus) ?? 'pending',
      special_requests: b.special_requests,
      metadata: b.metadata ?? null,
      created_at: b.created_at,
      stripe_payment_intent_id: b.stripe_payment_intent_id,
    });
  };

  const columns: Column<BirthdayBooking>[] = [
    {
      header: 'Date',
      accessor: 'booking_date',
      cell: (value) => (
        <CellWithIcon icon={Calendar}>
          {new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </CellWithIcon>
      ),
      exportFormatter: (value) => new Date(value + 'T00:00:00').toLocaleDateString(),
    },
    {
      header: 'Upcoming',
      accessor: 'booking_date',
      cell: (value) => <UrgencyBadge dateStr={value} />,
      sortable: false,
    },
    {
      header: 'Birthday Child',
      accessor: (row) => row.metadata?.child_name || '—',
      cell: (value) => <CellWithIcon icon={Cake}>{value}</CellWithIcon>,
    },
    {
      header: 'Age',
      accessor: (row) => row.metadata?.child_age ?? '—',
      exportFormatter: (value) => String(value),
    },
    {
      header: 'Package',
      accessor: (row) => row.metadata?.package || '—',
    },
    {
      header: 'Contact',
      accessor: 'customer_name',
      cell: (value, row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{value}</div>
          <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>{row.customer_phone}</div>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: 'customer_email',
    },
    {
      header: 'Amount',
      accessor: 'total_amount',
      cell: (value) => `$${Number(value).toFixed(2)}`,
      exportFormatter: (value) => `$${Number(value).toFixed(2)}`,
    },
    {
      header: 'Payment',
      accessor: 'payment_status',
      cell: (value) => <StatusBadge status={value} />,
    },
    {
      header: 'Status',
      accessor: 'booking_status',
      cell: (value, row) => (
        <InlineStatusBadge
          status={value ?? 'pending'}
          onStatusChange={can('change_booking_status') ? (newStatus) => {
            handleInlineStatusChange(row.id, newStatus);
          } : undefined}
        />
      ),
      sortable: false,
    },
  ];

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '1rem 1.25rem', color: '#991b1b' }}>
          <AlertCircle size={20} />
          <div>
            <strong>Failed to load birthday party bookings</strong>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>{error}</p>
          </div>
          <button onClick={fetchBookings} style={{ marginLeft: 'auto', padding: '0.375rem 0.875rem', background: '#991b1b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <DateFilterBar preset={preset} onChange={setPreset} resultCount={bookings.length} />
      <AdminDataTable
        data={bookings}
        columns={columns}
        title="Birthday Parties"
        subtitle={`${bookings.length} bookings`}
        searchable
        searchPlaceholder="Search by child name or contact..."
        searchFields={['customer_name', 'customer_email']}
        exportable
        exportFilename="birthday-parties"
        loading={isLoading}
        emptyMessage="No birthday party bookings found"
        filters={[
          {
            label: 'All Payment Statuses',
            field: 'payment_status',
            options: [
              { label: 'Paid', value: 'paid' },
              { label: 'Pending', value: 'pending' },
              { label: 'Refunded', value: 'refunded' },
              { label: 'Failed', value: 'failed' },
            ],
          },
          {
            label: 'All Booking Statuses',
            field: 'booking_status',
            options: [
              { label: 'Pending',   value: 'pending'   },
              { label: 'Confirmed', value: 'confirmed' },
              { label: 'Completed', value: 'completed' },
              { label: 'No Show',   value: 'no_show'   },
              { label: 'Cancelled', value: 'cancelled' },
            ],
          },
        ]}
        onRowClick={handleRowClick}
      />
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
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

export default AdminBirthdayParties;
