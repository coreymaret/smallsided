import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {  
  Calendar,
  Trophy, 
  Users,
  Cake,
  ChartNoAxesCombined,
  Smile,
  LogOut,
  Menu,
  X,
  Home,
  User,
  Settings
} from 'lucide-react';
import { getCurrentAdmin, signOut } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';
import Logo from '../../assets/logo.svg';
import Footer from '../Footer/Footer';
import { useMobileMenu } from '../../contexts/MobileMenuContext';
import styles from './AdminLayout.module.scss';

type AdminUser = Database['public']['Tables']['admin_users']['Row'];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isHeaderMenuOpen } = useMobileMenu();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropup, setActiveDropup] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  // Close dropup when route changes
  useEffect(() => {
    setActiveDropup(null);
  }, [location.pathname]);

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

  const toggleDropup = (menu: string) => {
    setActiveDropup(activeDropup === menu ? null : menu);
  };

  const isBookingsActive = () => {
    return location.pathname.includes('/admin/field-rentals') ||
           location.pathname.includes('/admin/pickup') ||
           location.pathname.includes('/admin/birthday-parties');
  };

  const isProgramsActive = () => {
    return location.pathname.includes('/admin/leagues') ||
           location.pathname.includes('/admin/camps') ||
           location.pathname.includes('/admin/training');
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
    { path: '/admin', label: 'Dashboard', icon: Home, end: true },
    { path: '/admin/field-rentals', label: 'Field Rentals', icon: Calendar },
    { path: '/admin/leagues', label: 'Leagues', icon: Trophy },
    { path: '/admin/pickup', label: 'Pickup Games', icon: Users },
    { path: '/admin/birthday-parties', label: 'Birthday Parties', icon: Cake },
    { path: '/admin/training', label: 'Training', icon: ChartNoAxesCombined },
    { path: '/admin/camps', label: 'Camps', icon: Smile },
  ];

  const bookingsItems = [
    { path: '/admin/field-rentals', label: 'Field Rentals', icon: Calendar },
    { path: '/admin/pickup', label: 'Pickup', icon: Users },
    { path: '/admin/birthday-parties', label: 'Birthday Parties', icon: Cake },
  ];

  const programsItems = [
    { path: '/admin/leagues', label: 'Leagues', icon: Trophy },
    { path: '/admin/camps', label: 'Camps', icon: Smile },
    { path: '/admin/training', label: 'Training', icon: ChartNoAxesCombined },
  ];

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <img src={Logo} alt="Small Sided Logo" className={styles.logo} width="160" height="36" />
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
        <div>
          <Outlet />
        </div>
        <Footer />
      </main>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <nav className={`${styles.mobileBottomNav} ${isHeaderMenuOpen ? styles.hidden : ''}`}>
        {/* Dashboard */}
        <div className={styles.navButtonWrapper}>
          <button
            className={`${styles.navButton} ${location.pathname === '/admin' ? styles.active : ''}`}
            onClick={() => navigate('/admin')}
          >
            <Home size={24} />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Bookings */}
        <div className={styles.navButtonWrapper}>
          {activeDropup === 'bookings' && (
            <div className={styles.dropup}>
              {bookingsItems.map((item) => (
                <button
                  key={item.path}
                  className={styles.dropupItem}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
          <button
            className={`${styles.navButton} ${isBookingsActive() ? styles.active : ''}`}
            onClick={() => toggleDropup('bookings')}
          >
            <Calendar size={24} />
            <span>Bookings</span>
          </button>
        </div>

        {/* Programs */}
        <div className={styles.navButtonWrapper}>
          {activeDropup === 'programs' && (
            <div className={styles.dropup}>
              {programsItems.map((item) => (
                <button
                  key={item.path}
                  className={styles.dropupItem}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
          <button
            className={`${styles.navButton} ${isProgramsActive() ? styles.active : ''}`}
            onClick={() => toggleDropup('programs')}
          >
            <Trophy size={24} />
            <span>Programs</span>
          </button>
        </div>

        {/* Profile */}
        <div className={styles.navButtonWrapper}>
          {activeDropup === 'profile' && (
            <div className={styles.dropup}>
              <button className={styles.dropupItem} onClick={() => navigate('/admin/settings')}>
                <Settings size={20} />
                <span>Settings</span>
              </button>
              <button className={styles.dropupItem} onClick={handleSignOut}>
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
          <button
            className={styles.navButton}
            onClick={() => toggleDropup('profile')}
          >
            <User size={24} />
            <span>Profile</span>
          </button>
        </div>
      </nav>

      {/* Dropup Overlay */}
      {activeDropup && (
        <div 
          className={styles.dropupOverlay}
          onClick={() => setActiveDropup(null)}
        />
      )}
    </div>
  );
};

export default AdminLayout;