import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, MapPin, Users } from '../../components/Icons/Icons';
import AdminDataTable, { type Column } from './shared/AdminDataTable';
import { CellWithIcon, StatusBadge } from './shared/TableCells';

interface PickupBooking {
  id: string;
  created_at: string;
  booking_date: string;
  start_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  participants: number;
  total_amount: number;
  payment_status: string;
  metadata?: {
    location?: string;
    format?: string;
  };
}

const AdminPickup = () => {
  const [bookings, setBookings] = useState<PickupBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_type', 'pickup')
        .order('created_at', { ascending: false });
      setBookings(data || []);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<PickupBooking>[] = [
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
    },
    {
      header: 'Location',
      accessor: (row) => row.metadata?.location || 'Main Field',
      cell: (value) => (
        <CellWithIcon icon={MapPin}>
          {value}
        </CellWithIcon>
      ),
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
      header: 'Spots',
      accessor: 'participants',
      cell: (value) => (
        <CellWithIcon icon={Users}>
          {value}
        </CellWithIcon>
      ),
    },
    {
      header: 'Amount',
      accessor: 'total_amount',
      cell: (value) => `$${value}`,
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
      title="Pickup Games"
      subtitle={`${bookings.length} reservations`}
      searchable
      searchPlaceholder="Search pickup games..."
      searchFields={['customer_name', 'customer_email']}
      exportable
      exportFilename="pickup-games"
      loading={isLoading}
      emptyMessage="No pickup game reservations found"
    />
  );
};

export default AdminPickup;
