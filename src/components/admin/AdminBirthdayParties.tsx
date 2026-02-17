import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, Cake } from '../../components/Icons/Icons'
import AdminDataTable, { type Column } from './shared/AdminDataTable';
import { CellWithIcon, StatusBadge } from './shared/TableCells';

interface BirthdayBooking {
  id: string;
  created_at: string;
  booking_date: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  payment_status: string;
  metadata?: {
    child_name?: string;
    package?: string;
    child_age?: number;
  };
}

const AdminBirthdayParties = () => {
  const [bookings, setBookings] = useState<BirthdayBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_type', 'birthday')
      .order('created_at', { ascending: false });
    setBookings(data || []);
    setIsLoading(false);
  };

  const columns: Column<BirthdayBooking>[] = [
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
      header: 'Child',
      accessor: (row) => row.metadata?.child_name || 'N/A',
      cell: (value) => (
        <CellWithIcon icon={Cake}>
          {value}
        </CellWithIcon>
      ),
    },
    {
      header: 'Package',
      accessor: (row) => row.metadata?.package || 'N/A',
    },
    {
      header: 'Customer',
      accessor: 'customer_name',
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
      title="Birthday Parties"
      subtitle={`${bookings.length} bookings`}
      searchable
      searchPlaceholder="Search birthday parties..."
      searchFields={['customer_name', 'customer_email']}
      exportable
      exportFilename="birthday-parties"
      loading={isLoading}
      emptyMessage="No birthday party bookings found"
    />
  );
};

export default AdminBirthdayParties;
