import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, Users, Trophy, DollarSign, TrendingUp, Clock } from 'lucide-react';
import styles from './AdminDashboard.module.scss';

interface Stats {
  totalBookings: number;
  totalRevenue: number;
  activeLeagues: number;
  upcomingEvents: number;
  fieldRentals: number;
  leagueRegistrations: number;
  pickupGames: number;
  birthdayParties: number;
  trainingSessions: number;
  campRegistrations: number;
}

interface BookingData {
  booking_type: string;
  total_amount: number;
}

interface TrainingData {
  total_amount: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    totalRevenue: 0,
    activeLeagues: 0,
    upcomingEvents: 0,
    fieldRentals: 0,
    leagueRegistrations: 0,
    pickupGames: 0,
    birthdayParties: 0,
    trainingSessions: 0,
    campRegistrations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('🔍 Fetching admin dashboard stats...');
      
      // Fetch total bookings count
      const { count: bookingsCount, error: bookingsError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });
      
      if (bookingsError) {
        console.error('❌ Error fetching bookings count:', bookingsError);
      } else {
        console.log('✅ Bookings count:', bookingsCount);
      }

      // Fetch bookings by type
      const { data: bookings, error: bookingsDataError } = await supabase
        .from('bookings')
        .select('booking_type, total_amount');
      
      if (bookingsDataError) {
        console.error('❌ Error fetching bookings data:', bookingsDataError);
      } else {
        console.log('✅ Bookings data:', bookings);
      }

      // Fetch league registrations count
      const { count: leaguesCount, error: leaguesError } = await supabase
        .from('league_registrations')
        .select('*', { count: 'exact', head: true });
      
      if (leaguesError) {
        console.error('❌ Error fetching league registrations:', leaguesError);
      } else {
        console.log('✅ League registrations count:', leaguesCount);
      }

      // Fetch active leagues count
      const { count: activeLeaguesCount, error: activeLeaguesError } = await supabase
        .from('leagues')
        .select('*', { count: 'exact', head: true });
      
      if (activeLeaguesError) {
        console.error('❌ Error fetching active leagues:', activeLeaguesError);
      } else {
        console.log('✅ Active leagues count:', activeLeaguesCount);
      }

      // Fetch training registrations count and revenue
      const { data: trainingData, count: trainingCount, error: trainingError } = await supabase
        .from('training_registrations')
        .select('total_amount', { count: 'exact' });
      
      if (trainingError) {
        console.error('❌ Error fetching training registrations:', trainingError);
      } else {
        console.log('✅ Training registrations count:', trainingCount);
      }

      // Calculate stats with proper typing
      const typedBookings = (bookings || []) as BookingData[];
      
      const bookingsByType = typedBookings.reduce((acc, booking) => {
        acc[booking.booking_type] = (acc[booking.booking_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('📊 Bookings by type:', bookingsByType);

      // Calculate total revenue from both bookings and training
      const bookingsRevenue = typedBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
      const typedTrainingData = (trainingData || []) as TrainingData[];
      const trainingRevenue = typedTrainingData.reduce((sum, training) => sum + (training.total_amount || 0), 0);
      const totalRevenue = bookingsRevenue + trainingRevenue;

      const statsData = {
        totalBookings: (bookingsCount || 0) + (trainingCount || 0),
        totalRevenue,
        activeLeagues: activeLeaguesCount || 0,
        upcomingEvents: bookingsCount || 0,
        fieldRentals: bookingsByType['field_rental'] || 0,
        leagueRegistrations: leaguesCount || 0,
        pickupGames: bookingsByType['pickup'] || 0,
        birthdayParties: bookingsByType['birthday'] || 0,
        trainingSessions: trainingCount || 0,
        campRegistrations: bookingsByType['camp'] || 0,
      };

      console.log('📈 Final stats:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('💥 Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <p>Overview of all bookings and registrations</p>
      </header>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Calendar size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>Total Bookings</h3>
            <p className={styles.statValue}>{stats.totalBookings}</p>
            <span className={styles.statLabel}>All time</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <DollarSign size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>Total Revenue</h3>
            <p className={styles.statValue}>${stats.totalRevenue.toLocaleString()}</p>
            <span className={styles.statLabel}>All time</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Trophy size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>Active Leagues</h3>
            <p className={styles.statValue}>{stats.activeLeagues}</p>
            <span className={styles.statLabel}>Currently running</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>Upcoming Events</h3>
            <p className={styles.statValue}>{stats.upcomingEvents}</p>
            <span className={styles.statLabel}>Next 30 days</span>
          </div>
        </div>
      </div>

      <div className={styles.bookingBreakdown}>
        <h2>Bookings by Type</h2>
        <div className={styles.breakdownGrid}>
          <div className={styles.breakdownCard}>
            <h3>Field Rentals</h3>
            <p className={styles.breakdownValue}>{stats.fieldRentals}</p>
          </div>
          <div className={styles.breakdownCard}>
            <h3>League Registrations</h3>
            <p className={styles.breakdownValue}>{stats.leagueRegistrations}</p>
          </div>
          <div className={styles.breakdownCard}>
            <h3>Pickup Games</h3>
            <p className={styles.breakdownValue}>{stats.pickupGames}</p>
          </div>
          <div className={styles.breakdownCard}>
            <h3>Birthday Parties</h3>
            <p className={styles.breakdownValue}>{stats.birthdayParties}</p>
          </div>
          <div className={styles.breakdownCard}>
            <h3>Training Sessions</h3>
            <p className={styles.breakdownValue}>{stats.trainingSessions}</p>
          </div>
          <div className={styles.breakdownCard}>
            <h3>Camp Registrations</h3>
            <p className={styles.breakdownValue}>{stats.campRegistrations}</p>
          </div>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <h2>Quick Actions</h2>
        <div className={styles.actionButtons}>
          <button onClick={() => window.location.href = '/admin/field-rentals'} className={styles.actionButton}>
            <Clock size={20} />
            View Field Rentals
          </button>
          <button onClick={() => window.location.href = '/admin/leagues'} className={styles.actionButton}>
            <Trophy size={20} />
            Manage Leagues
          </button>
          <button onClick={() => window.location.href = '/admin/pickup'} className={styles.actionButton}>
            <Users size={20} />
            View Pickup Games
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;