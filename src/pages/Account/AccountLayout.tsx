// src/pages/Account/AccountLayout.tsx
import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAccount } from '../../contexts/AccountContext';
import { User, Calendar, Users, CreditCard, LogOut, Home, FileText } from '../../components/Icons/Icons';
import styles from './AccountLayout.module.scss';

const AccountLayout = () => {
  const { user, profile, isLoading, signOut } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate('/account/login');
  }, [user, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading) return <div className={styles.loading}><div className={styles.spinner} /></div>;
  if (!user) return null;

  const displayName = profile?.full_name?.trim() || user?.email || '';

  const initials = profile?.full_name
  ? profile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  : (user?.email?.[0] ?? '?').toUpperCase();

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{displayName}</div>
            <div className={styles.userEmail}>{user.email}</div>
          </div>
        </div>

        <nav className={styles.nav}>
          <NavLink to="/account" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <Home size={18} /><span>Dashboard</span>
          </NavLink>
          <NavLink to="/account/bookings" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <Calendar size={18} /><span>My Bookings</span>
          </NavLink>
          <NavLink to="/account/profile" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <User size={18} /><span>Profile</span>
          </NavLink>
          <NavLink to="/account/family" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <Users size={18} /><span>Family & Team</span>
          </NavLink>
          <NavLink to="/account/payment" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <CreditCard size={18} /><span>Payment Methods</span>
          </NavLink>
          <NavLink to="/account/waiver" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <FileText size={18} /><span>Waiver</span>
          </NavLink>
        </nav>

        <button className={styles.signOutBtn} onClick={handleSignOut}>
          <LogOut size={16} /><span>Sign Out</span>
        </button>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default AccountLayout;
