import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Calendar, MapPin, Users } from 'lucide-react';
import styles from './AdminTraining.module.scss';

const AdminPickup = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchBookings(); }, []);
  useEffect(() => { filterData(); }, [searchTerm, bookings]);

  const fetchBookings = async () => {
    try {
      const { data } = await supabase.from('bookings').select('*').eq('booking_type', 'pickup').order('created_at', { ascending: false });
      setBookings(data || []);
    } finally { setIsLoading(false); }
  };

  const filterData = () => {
    setFiltered(searchTerm ? bookings.filter(b => b.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) : bookings);
  };

  if (isLoading) return <div className={styles.container}><div className={styles.loading}>Loading...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}><div><h1>Pickup Games</h1><p>{filtered.length} reservations</p></div></div>
      <div className={styles.filters}><div className={styles.searchBox}><Search size={18} /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead><tr><th>Date</th><th>Time</th><th>Location</th><th>Format</th><th>Customer</th><th>Spots</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.id}>
                <td><div className={styles.cellWithIcon}><Calendar size={16} />{new Date(b.booking_date).toLocaleDateString()}</div></td>
                <td>{b.start_time}</td>
                <td><div className={styles.cellWithIcon}><MapPin size={16} />{b.metadata?.location || 'Main Field'}</div></td>
                <td>{b.metadata?.format || '7v7'}</td>
                <td>{b.customer_name}</td>
                <td><div className={styles.cellWithIcon}><Users size={16} />{b.participants}</div></td>
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

export default AdminPickup;
