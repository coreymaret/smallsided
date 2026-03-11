import { useEffect, useState, useCallback } from 'react';
import { useDateFilter } from '../../hooks/useDateFilter';
import DateFilterBar from './shared/DateFilterBar';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import { Calendar, Clock, MapPin, User, DollarSign, AlertCircle } from '../../components/Icons/Icons';
import AdminDataTable, { type Column } from './shared/AdminDataTable';
import { CellWithIcon, ContactCell, StatusBadge, InlineStatusBadge, type BookingStatus as InlineStatus } from './shared/TableCells';
import BookingDrawer, { type DrawerBooking, type BookingStatus } from './shared/BookingDrawer';
import ToastContainer from '../Toast/ToastContainer';
import { useToast } from '../../hooks/useToast';
import { useFieldConflicts } from '../../hooks/useFieldConflicts';

interface FieldRentalBooking {
  id: string;
  created_at: string;
  booking_date: string;
  start_time: string | null;
  end_time: string | null;
  field_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  participants: number | null;
  total_amount: number;
  payment_status: string;
  booking_status: string;
  special_requests: string | null;
  metadata: Record<string, any> | null;
  stripe_payment_intent_id: string | null;
}

const fmtTime = (t: string | null): string => {
  if (!t) return 'TBD';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const AdminFieldRentals = () => {
  const { admin, can } = useAdmin();
  const [bookings, setBookings] = useState<FieldRentalBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<DrawerBooking | null>(null);
  const { toasts, showToast, removeToast } = useToast();
  const { preset, range, setPreset } = useDateFilter('upcoming');
  const conflictMap = useFieldConflicts(bookings);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('booking_type', 'field_rental');
      if (range.from) query = (query as any).gte('booking_date', range.from);
      if (range.to)   query = (query as any).lte('booking_date', range.to);
      const { data, error } = await (query as any).order('booking_date', { ascending: false });
      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching field rentals:', err);
      showToast('Failed to load field rentals.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = useCallback((bookingId: string, newStatus: BookingStatus) => {
    setBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, booking_status: newStatus } : b)
    );
    setSelectedBooking(prev =>
      prev?.id === bookingId ? { ...prev, booking_status: newStatus } : prev
    );
  }, []);

  const handleInlineStatusChange = async (bookingId: string, newStatus: InlineStatus) => {
    // Optimistic update
    setBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, booking_status: newStatus } : b)
    );
    const { error } = await (supabase as any)
      .from('bookings')
      .update({ booking_status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', bookingId);
    if (error) {
      // Revert on failure
      fetchBookings();
      showToast('Failed to update status.', 'error');
    } else {
      showToast(`Status updated to ${newStatus.replace('_', ' ')}`, 'success');
    }
  };

  const handleRowClick = (b: FieldRentalBooking) => {
    setSelectedBooking({
      id: b.id,
      booking_type: 'field_rental',
      customer_name: b.customer_name,
      customer_email: b.customer_email,
      customer_phone: b.customer_phone,
      booking_date: b.booking_date,
      start_time: b.start_time,
      end_time: b.end_time,
      field_id: b.field_id,
      participants: b.participants,
      total_amount: b.total_amount,
      payment_status: b.payment_status as DrawerBooking['payment_status'],
      booking_status: (b.booking_status as BookingStatus) ?? 'pending',
      special_requests: b.special_requests,
      metadata: b.metadata,
      created_at: b.created_at,
      stripe_payment_intent_id: b.stripe_payment_intent_id,
    });
  };

  const columns: Column<FieldRentalBooking>[] = [
    {
      header: 'Date',
      accessor: 'booking_date',
      cell: (value) => (
        <CellWithIcon icon={Calendar}>
          {new Date(value + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })}
        </CellWithIcon>
      ),
      exportFormatter: (value) => new Date(value + 'T00:00:00').toLocaleDateString(),
    },
    {
      header: 'Time',
      accessor: 'start_time',
      cell: (value, row) => (
        <CellWithIcon icon={Clock}>
          {value
            ? `${fmtTime(value)}${row.end_time ? ` - ${fmtTime(row.end_time)}` : ''}`
            : 'TBD'
          }
        </CellWithIcon>
      ),
    },
    {
      header: 'Field',
      accessor: 'field_id',
      cell: (value, row) => {
        const hasConflict = conflictMap.has(row.id);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CellWithIcon icon={MapPin}>
              {value || 'Field 1'}
            </CellWithIcon>
            {hasConflict && (
              <span title="Field conflict detected" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                background: '#fffbeb', border: '1px solid #fcd34d',
                borderRadius: '6px', padding: '0.125rem 0.5rem',
                fontSize: '0.75rem', fontWeight: 600, color: '#92400e',
                whiteSpace: 'nowrap',
              }}>
                <AlertCircle size={12} />
                Conflict
              </span>
            )}
          </div>
        );
      },
      exportFormatter: (value) => value || 'Field 1',
    },
    {
      header: 'Customer',
      accessor: 'customer_name',
      cell: (value) => (
        <CellWithIcon icon={User}>
          {value}
        </CellWithIcon>
      ),
    },
    {
      header: 'Contact',
      accessor: (row) => `${row.customer_email} ${row.customer_phone}`,
      cell: (_, row) => (
        <ContactCell email={row.customer_email} phone={row.customer_phone} />
      ),
      sortable: false,
      exportFormatter: (_, row) => `${row.customer_email}, ${row.customer_phone}`,
    },
    {
      header: 'Players',
      accessor: 'participants',
      cell: (value) => value != null
        ? <CellWithIcon icon={User}>{value}</CellWithIcon>
        : <span style={{ color: '#9ca3af' }}>—</span>,
    },
    {
      header: 'Amount',
      accessor: 'total_amount',
      cell: (value) => (
        <CellWithIcon icon={DollarSign}>
          {Number(value).toFixed(2)}
        </CellWithIcon>
      ),
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
        title="Field Rentals"
        subtitle={`${bookings.length} total bookings`}
        searchable
        searchPlaceholder="Search by name, email, or phone..."
        searchFields={['customer_name', 'customer_email', 'customer_phone']}
        exportable
        exportFilename="field-rentals"
        filters={[
          {
            label: 'All Payment Statuses',
            field: 'payment_status',
            options: [
              { label: 'Paid',     value: 'paid'     },
              { label: 'Pending',  value: 'pending'  },
              { label: 'Refunded', value: 'refunded' },
              { label: 'Failed',   value: 'failed'   },
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
        loading={isLoading}
        emptyMessage="No field rentals found"
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
        conflictInfo={selectedBooking ? conflictMap.get(selectedBooking.id) : null}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

export default AdminFieldRentals;
