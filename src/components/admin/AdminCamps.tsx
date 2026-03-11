import { useEffect, useState, useCallback } from 'react';
import { useDateFilter } from '../../hooks/useDateFilter';
import DateFilterBar from './shared/DateFilterBar';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import { Calendar, Zap, User, AlertCircle } from '../../components/Icons/Icons';
import AdminDataTable, { type Column } from './shared/AdminDataTable';
import { CellWithIcon, StatusBadge, InlineStatusBadge, type BookingStatus as InlineStatus } from './shared/TableCells';
import BookingDrawer, { type DrawerBooking, type BookingStatus } from './shared/BookingDrawer';
import ToastContainer from '../Toast/ToastContainer';
import { useToast } from '../../hooks/useToast';

interface CampBooking {
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
    camp_type?: string;
    child_age?: number;
    medical_notes?: string;
    allergies?: string;
    emergency_contact?: string;
  };
}

const AdminCamps = () => {
  const { admin, can } = useAdmin();
  const [bookings, setBookings] = useState<CampBooking[]>([]);
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
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_type', 'camp')
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setBookings(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load camp registrations.');
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

  const handleRowClick = (b: CampBooking) => {
    setSelectedBooking({
      id: b.id,
      booking_type: 'camp',
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

  const columns: Column<CampBooking>[] = [
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
      header: 'Child',
      accessor: (row) => row.metadata?.child_name || '—',
      cell: (value) => <CellWithIcon icon={User}>{value}</CellWithIcon>,
    },
    {
      header: 'Age',
      accessor: (row) => row.metadata?.child_age ?? '—',
      exportFormatter: (value) => String(value),
    },
    {
      header: 'Camp Type',
      accessor: (row) => row.metadata?.camp_type || '—',
      cell: (value) => <CellWithIcon icon={Zap}>{value}</CellWithIcon>,
    },
    {
      header: 'Medical',
      accessor: (row) => row.metadata?.medical_notes || row.metadata?.allergies ? '⚠ Yes' : '—',
      sortable: false,
    },
    {
      header: 'Parent / Guardian',
      accessor: 'customer_name',
    },
    {
      header: 'Email',
      accessor: 'customer_email',
    },
    {
      header: 'Phone',
      accessor: 'customer_phone',
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
            <strong>Failed to load camp registrations</strong>
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
        title="Camp Registrations"
        subtitle={`${bookings.length} registrations`}
        searchable
        searchPlaceholder="Search by child or parent name..."
        searchFields={['customer_name', 'customer_email']}
        exportable
        exportFilename="camp-registrations"
        loading={isLoading}
        emptyMessage="No camp registrations found"
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

export default AdminCamps;
