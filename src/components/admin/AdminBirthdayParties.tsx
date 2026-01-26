import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, Cake } from 'lucide-react';
import styles from './AdminTable.module.scss';

const AdminBirthdayParties = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    const { data } = await supabase.from('bookings').select('*').eq('booking_type', 'birthday').order('created_at', { ascending: false });
    setBookings(data || []);
    setIsLoading(false);
  };

  if (isLoading) return <div className={styles.container}><div className={styles.loading}>Loading...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Birthday Parties</h1>
        <p>{bookings.length} bookings</p>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead><tr><th>Date</th><th>Child</th><th>Package</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id}>
                <td><div className={styles.cellWithIcon}><Calendar size={16} />{new Date(b.booking_date).toLocaleDateString()}</div></td>
                <td><div className={styles.cellWithIcon}><Cake size={16} />{b.metadata?.child_name || 'N/A'}</div></td>
                <td>{b.metadata?.package || 'N/A'}</td>
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

export default AdminBirthdayParties;