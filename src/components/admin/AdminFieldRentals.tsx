import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, Clock, MapPin, User, DollarSign } from 'lucide-react';
import AdminDataTable, { type Column } from './shared/AdminDataTable';
import { CellWithIcon, ContactCell, StatusBadge } from './shared/TableCells';

interface FieldRentalBooking {
  id: string;
  created_at: string;
  booking_date: string;
  start_time: string;
  end_time?: string;
  field_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  participants: number;
  total_amount: number;
  payment_status: string;
  metadata?: any;
}

const AdminFieldRentals = () => {
  const [bookings, setBookings] = useState<FieldRentalBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_type', 'field_rental')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching field rentals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Define columns
  const columns: Column<FieldRentalBooking>[] = [
    {
      header: 'Date',
      accessor: 'booking_date',
      cell: (value) => (
        <CellWithIcon icon={Calendar}>
          {new Date(value).toLocaleDateString()}
        </CellWithIcon>
      ),
      exportFormatter: (value) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'Time',
      accessor: 'start_time',
      cell: (value) => (
        <CellWithIcon icon={Clock}>
          {value}
        </CellWithIcon>
      ),
    },
    {
      header: 'Field',
      accessor: 'field_id',
      cell: (value) => (
        <CellWithIcon icon={MapPin}>
          {value || 'Field 1'}
        </CellWithIcon>
      ),
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
    },
    {
      header: 'Amount',
      accessor: 'total_amount',
      cell: (value) => (
        <CellWithIcon icon={DollarSign}>
          {value}
        </CellWithIcon>
      ),
      exportFormatter: (value) => `$${value}`,
    },
    {
      header: 'Status',
      accessor: 'payment_status',
      cell: (value) => <StatusBadge status={value} />,
    },
  ];

  return (
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
          label: 'All Statuses',
          field: 'payment_status',
          options: [
            { label: 'Paid', value: 'paid' },
            { label: 'Pending', value: 'pending' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
        },
      ]}
      loading={isLoading}
      emptyMessage="No field rentals found"
    />
  );
};

export default AdminFieldRentals;
