import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Download, Calendar, DollarSign, User, MapPin, Clock } from 'lucide-react';
import styles from './AdminTable.module.scss';

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
  const [filteredBookings, setFilteredBookings] = useState<FieldRentalBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, statusFilter, bookings]);

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

  const filterBookings = () => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_phone.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.payment_status === statusFilter);
    }

    setFilteredBookings(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Field', 'Customer', 'Email', 'Phone', 'Players', 'Amount', 'Status'];
    const rows = filteredBookings.map(b => [
      b.booking_date,
      b.start_time,
      b.field_id || 'N/A',
      b.customer_name,
      b.customer_email,
      b.customer_phone,
      b.participants,
      `$${b.total_amount}`,
      b.payment_status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `field-rentals-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      paid: styles.statusPaid,
      pending: styles.statusPending,
      cancelled: styles.statusCancelled,
    };
    return `${styles.statusBadge} ${statusClasses[status as keyof typeof statusClasses] || ''}`;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading field rentals...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Field Rentals</h1>
          <p>{filteredBookings.length} total bookings</p>
        </div>
        <button onClick={exportToCSV} className={styles.exportButton}>
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Field</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Players</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.noData}>
                  No field rentals found
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <div className={styles.cellWithIcon}>
                      <Calendar size={16} />
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className={styles.cellWithIcon}>
                      <Clock size={16} />
                      {booking.start_time}
                    </div>
                  </td>
                  <td>
                    <div className={styles.cellWithIcon}>
                      <MapPin size={16} />
                      {booking.field_id || 'Field 1'}
                    </div>
                  </td>
                  <td>
                    <div className={styles.cellWithIcon}>
                      <User size={16} />
                      {booking.customer_name}
                    </div>
                  </td>
                  <td>
                    <div className={styles.contactCell}>
                      <div>{booking.customer_email}</div>
                      <div className={styles.phoneNumber}>{booking.customer_phone}</div>
                    </div>
                  </td>
                  <td>{booking.participants}</td>
                  <td>
                    <div className={styles.cellWithIcon}>
                      <DollarSign size={16} />
                      {booking.total_amount}
                    </div>
                  </td>
                  <td>
                    <span className={getStatusBadge(booking.payment_status)}>
                      {booking.payment_status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFieldRentals;
