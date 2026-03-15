// src/pages/Account/AccountBookings.tsx
import { useEffect, useState } from 'react';
import { useAccount } from '../../contexts/AccountContext';
import { supabase } from '../../lib/supabase';
import { Calendar, Clock, MapPin, DollarSign } from '../../components/Icons/Icons';
import styles from './AccountBookings.module.scss';

interface Booking {
  id: string;
  booking_type: string;
  booking_date: string;
  start_time: string | null;
  end_time: string | null;
  field_id: string | null;
  total_amount: number;
  booking_status: string;
  payment_status: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

const SERVICE_LABELS: Record<string, string> = {
  field_rental: 'Field Rental', pickup: 'Pickup Game',
  birthday: 'Birthday Party', camp: 'Camp',
  training: 'Training', league: 'League',
};

const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const fmtTime = (t: string | null) => {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const AccountBookings = () => {
  const { user } = useAccount();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => { if (user) fetchBookings(); }, [user, filter]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      let query = (supabase as any).from('bookings').select('*').eq('customer_email', user!.email);
      const today = new Date().toISOString().split('T')[0];
      if (filter === 'upcoming') query = query.gte('booking_date', today);
      if (filter === 'past')     query = query.lt('booking_date', today);
      const { data } = await query.order('booking_date', { ascending: filter !== 'past' });
      setBookings(data ?? []);
    } finally { setIsLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>My Bookings</h1>
        <div className={styles.filterGroup}>
          {(['upcoming', 'past', 'all'] as const).map(f => (
            <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading…</div>
      ) : bookings.length === 0 ? (
        <div className={styles.empty}>No {filter === 'all' ? '' : filter} bookings found.</div>
      ) : (
        <div className={styles.list}>
          {bookings.map(b => (
            <div key={b.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div>
                  <div className={styles.serviceType}>{SERVICE_LABELS[b.booking_type] ?? b.booking_type}</div>
                  {b.metadata?.team_name && <div className={styles.metaLine}>{b.metadata.team_name}</div>}
                  {b.metadata?.child_name && <div className={styles.metaLine}>For: {b.metadata.child_name}</div>}
                </div>
                <span className={`${styles.statusBadge} ${styles[`status_${b.booking_status}`]}`}>{b.booking_status}</span>
              </div>
              <div className={styles.cardMeta}>
                <span><Calendar size={14} />{fmtDate(b.booking_date)}</span>
                {b.start_time && <span><Clock size={14} />{fmtTime(b.start_time)}{b.end_time ? ` – ${fmtTime(b.end_time)}` : ''}</span>}
                {b.field_id && <span><MapPin size={14} />{b.field_id}</span>}
                <span><DollarSign size={14} />${Number(b.total_amount).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountBookings;
