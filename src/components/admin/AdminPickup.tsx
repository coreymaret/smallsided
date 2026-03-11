import { useEffect, useState, useCallback } from 'react';
import { useDateFilter } from '../../hooks/useDateFilter';
import DateFilterBar from './shared/DateFilterBar';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import { Calendar, Clock, MapPin, Users } from '../../components/Icons/Icons';
import AdminDataTable, { type Column } from './shared/AdminDataTable';
import { CellWithIcon, StatusBadge, InlineStatusBadge, type BookingStatus as InlineStatus } from './shared/TableCells';
import BookingDrawer, { type DrawerBooking, type BookingStatus } from './shared/BookingDrawer';
import ToastContainer from '../Toast/ToastContainer';
import { useToast } from '../../hooks/useToast';

interface PickupBooking {
  id: string;
  created_at: string;
  booking_date: string;
  start_time: string | null;
  end_time: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  participants: number | null;
  total_amount: number;
  payment_status: string;
  booking_status: string;
  special_requests: string | null;
  stripe_payment_intent_id: string | null;
  metadata?: {
    location?: string;
    format?: string;
  };
}

const fmtTime = (t: string | null): string => {
  if (!t) return 'TBD';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const AdminPickup = () => {
  const { admin, can } = useAdmin();
  const [bookings, setBookings] = useState<PickupBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<DrawerBooking | null>(null);
  const { toasts, showToast, removeToast } = useToast();
  const { preset, range, setPreset } = useDateFilter('upcoming');

  useEffect(() => { fetchBookings(); }, [range.from, range.to]);

  const fetchBookings = async () => {
    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('booking_type', 'pickup');
      if (range.from) query = (query as any).gte('booking_date', range.from);
      if (range.to)   query = (query as any).lte('booking_date', range.to);
      const { data, error } = await (query as any).order('booking_date', { ascending: false });
      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      showToast('Failed to load pickup games.', 'error');
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

  const handleRowClick = (b: PickupBooking) => {
    setSelectedBooking({
      id: b.id,
      booking_type: 'pickup',
      customer_name: b.customer_name,
      customer_email: b.customer_email,
      customer_phone: b.customer_phone,
      booking_date: b.booking_date,
      start_time: b.start_time,
      end_time: b.end_time,
      field_id: null,
      participants: b.participants,
      total_amount: b.total_amount,
      payment_status: b.payment_status as DrawerBooking['payment_status'],
      booking_status: (b.booking_status as BookingStatus) ?? 'pending',
      special_requests: b.special_requests,
      metadata: b.metadata ?? null,
      created_at: b.created_at,
      stripe_payment_intent_id: b.stripe_payment_intent_id,
    });
  };

  const columns: Column<PickupBooking>[] = [
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
      header: 'Time',
      accessor: 'start_time',
      cell: (value) => (
        <CellWithIcon icon={Clock}>
          {fmtTime(value)}
        </CellWithIcon>
      ),
    },
    {
      header: 'Location',
      accessor: (row) => row.metadata?.location || 'Main Field',
      cell: (value) => <CellWithIcon icon={MapPin}>{value}</CellWithIcon>,
    },
    {
      header: 'Format',
      accessor: (row) => row.metadata?.format || '7v7',
    },
    {
      header: 'Customer',
      accessor: 'customer_name',
    },
    {
      header: 'Email',
      accessor: 'customer_email',
    },
    {
      header: 'Spots',
      accessor: 'participants',
      cell: (value) => (
        <CellWithIcon icon={Users}>
          {value ?? '—'}
        </CellWithIcon>
      ),
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

  return (
    <>
      <DateFilterBar preset={preset} onChange={setPreset} resultCount={bookings.length} />
      <AdminDataTable
        data={bookings}
        columns={columns}
        title="Pickup Games"
        subtitle={`${bookings.length} reservations`}
        searchable
        searchPlaceholder="Search pickup games..."
        searchFields={['customer_name', 'customer_email']}
        exportable
        exportFilename="pickup-games"
        loading={isLoading}
        emptyMessage="No pickup game reservations found"
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

export default AdminPickup;
