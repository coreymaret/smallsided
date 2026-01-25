import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Trophy, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { getCurrentAdmin, signOut } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';
import styles from './AdminLayout.module.scss';

type AdminUser = Database['public']['Tables']['admin_users']['Row'];

export const AdminLayout = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentAdmin = await getCurrentAdmin();
      
      if (!currentAdmin) {
        navigate('/admin/login');
        return;
      }

      setAdmin(currentAdmin);
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { path: '/admin/bookings', label: 'Bookings', icon: Calendar },
    { path: '/admin/leagues', label: 'Leagues', icon: Trophy },
    { path: '/admin/teams', label: 'Teams', icon: Users },
    { path: '/admin/matches', label: 'Matches', icon: Calendar },
  ];

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.logo}>Small Sided Admin</h1>
          <button 
            className={styles.mobileMenuClose}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => 
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {admin?.full_name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{admin?.full_name}</p>
              <p className={styles.userRole}>{admin?.role.replace('_', ' ')}</p>
            </div>
          </div>
          
          <button 
            className={styles.signOutButton}
            onClick={handleSignOut}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button 
        className={styles.mobileMenuButton}
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};