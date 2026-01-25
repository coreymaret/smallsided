import styles from './AdminDashboard.module.scss';

const AdminDashboard = () => {
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <p>Welcome to the Small Sided Soccer admin panel</p>
      </header>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>Total Bookings</h3>
          <p className={styles.statValue}>0</p>
          <span className={styles.statLabel}>All time</span>
        </div>

        <div className={styles.statCard}>
          <h3>League Registrations</h3>
          <p className={styles.statValue}>1</p>
          <span className={styles.statLabel}>Spring 2026</span>
        </div>

        <div className={styles.statCard}>
          <h3>Active Leagues</h3>
          <p className={styles.statValue}>17</p>
          <span className={styles.statLabel}>Total leagues</span>
        </div>

        <div className={styles.statCard}>
          <h3>Revenue</h3>
          <p className={styles.statValue}>$150</p>
          <span className={styles.statLabel}>This month</span>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <h2>Recent Activity</h2>
        <p className={styles.emptyState}>No recent activity to display</p>
      </div>
    </div>
  );
};

export default AdminDashboard;