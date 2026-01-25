import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search } from 'lucide-react';
import styles from './AdminTable.module.scss';

const AdminCamps = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    const { data } = await supabase.from('bookings').select('*').eq('booking_type', 'camp').order('created_at', { ascending: false });
    setBookings(data || []);
    setIsLoading(false);
  };

  if (isLoading) return <div className={styles.container}><div className={styles.loading}>Loading...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Camp Registrations</h1>
        <p>{bookings.length} bookings</p>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead><tr><th>Date</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id}>
                <td>{new Date(b.booking_date).toLocaleDateString()}</td>
                <td>{b.customer_name}</td>
                <td>${b.total_amount}</td>
                <td><span className={`${styles.statusBadge} ${styles.statusPaid}`}>{b.payment_status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCamps;
