import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  AlertCircle,
  BarChart2,
  Calendar,
  Clock,
  Trophy,
  Users,
  Cake,
  ChartNoAxesCombined,
  DollarSign,
  FileText,
  Smile,
  LogOut,
  Menu,
  MessageSquare,
  X,
  Home,
  User,
  Settings,
  Search,
  CalendarDays
} from '../../components/Icons/Icons';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import { useMobileMenu } from '../../contexts/MobileMenuContext';
import Logo from '../../assets/logo.svg';
import styles from './AdminLayout.module.scss';
import { lazy, Suspense } from 'react';
const AdminGlobalSearch = lazy(() => import('./AdminGlobalSearch'));

const ROLE_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  super_admin: { label: 'Super Admin', bg: '#15141a', color: '#98ED66' },
  manager:     { label: 'Manager',     bg: '#1e3a5f', color: '#93c5fd' },
  staff:       { label: 'Staff',       bg: '#1a2e1a', color: '#86efac' },
  readonly:    { label: 'Read Only',   bg: '#3b1f1f', color: '#fca5a5' },
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isHeaderMenuOpen } = useMobileMenu();
  const { admin, isLoading, can } = useAdmin();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropup, setActiveDropup] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setActiveDropup(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!isLoading && !admin) {
      navigate('/admin/login');
    }
  }, [admin, isLoading, navigate]);

  // Cmd+K / Ctrl+K opens global search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(o => !o);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const toggleDropup = (menu: string) => {
    setActiveDropup(activeDropup === menu ? null : menu);
  };

  const isBookingsActive = () =>
    location.pathname.includes('/admin/field-rentals') ||
    location.pathname.includes('/admin/pickup') ||
    location.pathname.includes('/admin/birthday-parties');

  const isProgramsActive = () =>
    location.pathname.includes('/admin/leagues') ||
    location.pathname.includes('/admin/camps') ||
    location.pathname.includes('/admin/training');

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (!admin) return null;

  const roleStyle = ROLE_STYLES[admin.role] ?? ROLE_STYLES.staff;

  const navItems = [
    { path: '/admin',                  label: 'Dashboard',        icon: Home,                end: true  },
    { path: '/admin/schedule',           label: 'Schedule',         icon: CalendarDays,          end: false },
    { path: '/admin/staff',              label: 'Staff',            icon: Users,               end: false },
    { path: '/admin/time-off',           label: 'Time Off',         icon: Calendar,            end: false },
    { path: '/admin/shifts',             label: 'Shifts',           icon: Clock,               end: false },
    { path: '/admin/blackouts',          label: 'Blackout Dates',   icon: AlertCircle,         end: false },
    { path: '/admin/revenue',            label: 'Revenue',          icon: DollarSign,          end: false },
    { path: '/admin/occupancy',          label: 'Occupancy',        icon: BarChart2,           end: false },
    { path: '/admin/customers',          label: 'Customers',        icon: Users,               end: false },
    { path: '/admin/chat',               label: 'Chat Inbox',       icon: MessageSquare,       end: false },
    { path: '/admin/waivers',            label: 'Waivers',          icon: FileText,            end: false },
    { path: '/admin/field-rentals',    label: 'Field Rentals',    icon: Calendar,            end: false },
    { path: '/admin/leagues',          label: 'Leagues',          icon: Trophy,              end: false },
    { path: '/admin/pickup',           label: 'Pickup Games',     icon: Users,               end: false },
    { path: '/admin/birthday-parties', label: 'Birthday Parties', icon: Cake,                end: false },
    { path: '/admin/training',         label: 'Training',         icon: ChartNoAxesCombined, end: false },
    { path: '/admin/camps',            label: 'Camps',            icon: Smile,               end: false },
  ];

  const bookingsItems = [
    { path: '/admin/field-rentals',    label: 'Field Rentals',    icon: Calendar },
    { path: '/admin/pickup',           label: 'Pickup',           icon: Users    },
    { path: '/admin/birthday-parties', label: 'Birthday Parties', icon: Cake     },
  ];

  const programsItems = [
    { path: '/admin/leagues',  label: 'Leagues',  icon: Trophy               },
    { path: '/admin/camps',    label: 'Camps',    icon: Smile                },
    { path: '/admin/training', label: 'Training', icon: ChartNoAxesCombined  },
  ];

  return (
    <div className={styles.adminLayout}>
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
          {can('manage_settings') && (
            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          )}
        </nav>

        {/* Search shortcut button */}
        <button
          className={styles.searchTrigger}
          onClick={() => setSearchOpen(true)}
          aria-label="Global search"
        >
          <Search size={16} />
          <span>Search</span>
          <kbd className={styles.searchKbd}>⌘K</kbd>
        </button>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {admin.full_name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{admin.full_name}</p>
              <span
                className={styles.roleBadge}
                style={{ backgroundColor: roleStyle.bg, color: roleStyle.color }}
              >
                {roleStyle.label}
              </span>
            </div>
          </div>
          <button className={styles.signOutButton} onClick={handleSignOut}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <button
        className={styles.mobileMenuButton}
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      <main className={styles.mainContent}>
        <Outlet />
      </main>

      {isMobileMenuOpen && (
        <div className={styles.overlay} onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <nav className={`${styles.mobileBottomNav} ${isHeaderMenuOpen ? styles.hidden : ''}`}>
        <div className={styles.navButtonWrapper}>
          <button
            className={`${styles.navButton} ${location.pathname === '/admin' ? styles.active : ''}`}
            onClick={() => navigate('/admin')}
          >
            <Home size={24} />
            <span>Dashboard</span>
          </button>
        </div>

        <div className={styles.navButtonWrapper}>
          {activeDropup === 'bookings' && (
            <div className={styles.dropup}>
              {bookingsItems.map((item) => (
                <button
                  key={item.path}
                  className={styles.dropupItem}
                  onClick={() => { navigate(item.path); setActiveDropup(null); }}
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

        <div className={styles.navButtonWrapper}>
          {activeDropup === 'programs' && (
            <div className={styles.dropup}>
              {programsItems.map((item) => (
                <button
                  key={item.path}
                  className={styles.dropupItem}
                  onClick={() => { navigate(item.path); setActiveDropup(null); }}
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

        <div className={styles.navButtonWrapper}>
          {activeDropup === 'profile' && (
            <div className={styles.dropup}>
              {can('manage_settings') && (
                <button
                  className={styles.dropupItem}
                  onClick={() => { navigate('/admin/settings'); setActiveDropup(null); }}
                >
                  <Settings size={20} />
                  <span>Settings</span>
                </button>
              )}
              <button className={styles.dropupItem} onClick={handleSignOut}>
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
          <button className={styles.navButton} onClick={() => toggleDropup('profile')}>
            <User size={24} />
            <span>Profile</span>
          </button>
        </div>
      </nav>

      {activeDropup && (
        <div className={styles.dropupOverlay} onClick={() => setActiveDropup(null)} />
      )}

      {/* Global Search Palette */}
      {searchOpen && (
        <Suspense fallback={null}>
          <AdminGlobalSearch onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
    </div>
  );
};

export default AdminLayout;
