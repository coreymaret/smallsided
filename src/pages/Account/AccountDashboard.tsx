// src/pages/Account/AccountDashboard.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from '../../contexts/AccountContext';
import { supabase } from '../../lib/supabase';
import { Calendar, Users, CreditCard, ChevronRight } from '../../components/Icons/Icons';
import styles from './AccountDashboard.module.scss';

interface RecentBooking {
  id: string;
  booking_type: string;
  booking_date: string;
  total_amount: number;
  booking_status: string;
}

const SERVICE_LABELS: Record<string, string> = {
  field_rental: 'Field Rental', pickup: 'Pickup Game',
  birthday: 'Birthday Party', camp: 'Camp',
  training: 'Training', league: 'League',
};

const AccountDashboard = () => {
  const { user, profile } = useAccount();
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchRecent();
  }, [user]);

  const fetchRecent = async () => {
    try {
      const { data } = await (supabase as any)
        .from('bookings')
        .select('id, booking_type, booking_date, total_amount, booking_status')
        .eq('customer_email', user!.email)
        .order('booking_date', { ascending: false })
        .limit(3);
      setRecentBookings(data ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  const firstName = profile?.first_name || user?.email?.split('@')[0] || 'there';

  return (
    <div className={styles.page}>
      <div className={styles.greeting}>
        <h1>Hey, {firstName} 👋</h1>
        <p>Manage your bookings, family members, and account settings.</p>
      </div>

      {/* Quick links */}
      <div className={styles.quickLinks}>
        <Link to="/account/bookings" className={styles.quickCard}>
          <div className={styles.quickIcon}><Calendar size={22} /></div>
          <div><div className={styles.quickTitle}>My Bookings</div><div className={styles.quickSub}>View all your bookings</div></div>
          <ChevronRight size={18} className={styles.quickArrow} />
        </Link>
        <Link to="/account/family" className={styles.quickCard}>
          <div className={styles.quickIcon}><Users size={22} /></div>
          <div><div className={styles.quickTitle}>Family & Team</div><div className={styles.quickSub}>Manage kids & teammates</div></div>
          <ChevronRight size={18} className={styles.quickArrow} />
        </Link>
        <Link to="/account/payment" className={styles.quickCard}>
          <div className={styles.quickIcon}><CreditCard size={22} /></div>
          <div><div className={styles.quickTitle}>Payment Methods</div><div className={styles.quickSub}>View saved cards</div></div>
          <ChevronRight size={18} className={styles.quickArrow} />
        </Link>
      </div>

      {/* Recent bookings */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Recent Bookings</h2>
          <Link to="/account/bookings" className={styles.seeAll}>See all</Link>
        </div>
        {isLoading ? (
          <div className={styles.loading}>Loading…</div>
        ) : recentBookings.length === 0 ? (
          <div className={styles.empty}>
            <p>No bookings yet.</p>
            <Link to="/register" className={styles.bookBtn}>Book a field</Link>
          </div>
        ) : (
          <div className={styles.bookingList}>
            {recentBookings.map(b => (
              <div key={b.id} className={styles.bookingRow}>
                <div className={styles.bookingType}>{SERVICE_LABELS[b.booking_type] ?? b.booking_type}</div>
                <div className={styles.bookingDate}>{new Date(b.booking_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div className={styles.bookingAmount}>${Number(b.total_amount).toFixed(2)}</div>
                <span className={`${styles.statusBadge} ${styles[`status_${b.booking_status}`]}`}>{b.booking_status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountDashboard;
