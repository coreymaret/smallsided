import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, Zap, User } from '../../components/Icons/Icons';
import AdminDataTable, { type Column } from './shared/AdminDataTable';
import { CellWithIcon, StatusBadge } from './shared/TableCells';

interface CampBooking {
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
    camp_type?: string;
    child_age?: number;
  };
}

const AdminCamps = () => {
  const [bookings, setBookings] = useState<CampBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_type', 'camp')
      .order('created_at', { ascending: false });
    setBookings(data || []);
    setIsLoading(false);
  };

  const columns: Column<CampBooking>[] = [
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
        <CellWithIcon icon={User}>
          {value}
        </CellWithIcon>
      ),
    },
    {
      header: 'Camp Type',
      accessor: (row) => row.metadata?.camp_type || 'N/A',
      cell: (value) => (
        <CellWithIcon icon={Zap}>
          {value}
        </CellWithIcon>
      ),
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
      title="Camp Registrations"
      subtitle={`${bookings.length} registrations`}
      searchable
      searchPlaceholder="Search camps..."
      searchFields={['customer_name', 'customer_email']}
      exportable
      exportFilename="camp-registrations"
      loading={isLoading}
      emptyMessage="No camp registrations found"
    />
  );
};

export default AdminCamps;
