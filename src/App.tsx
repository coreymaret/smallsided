// src/App.tsx

// React
import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Context
import { MobileMenuProvider } from './contexts/MobileMenuContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { AdminProvider } from './contexts/AdminContext';
import { AccountProvider } from './contexts/AccountContext';

// Layout Components
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Header from './components/Header/Header';
const Footer = lazy(() => import('./components/Footer/Footer'));
const Subscribe = lazy(() => import('./components/Subscribe/Subscribe'));
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
const ChatWidget = lazy(() => import('./components/ChatWidget/ChatWidget'));
import PageLoader from './components/PageLoader/PageLoader';
const CookiePopup = lazy(() => import('./components/CookiePopup/CookiePopup'));
const Register = lazy(() => import('./components/Register/Register'));

// ─── Lazy-Loaded Pages ───
const Home            = lazy(() => import('./pages/Home/Home'));
const About           = lazy(() => import('./pages/About/About'));
const Contact         = lazy(() => import('./pages/Contact/Contact'));
const Services        = lazy(() => import('./pages/Services/Services'));
const FieldRental     = lazy(() => import('./pages/FieldRental/FieldRental'));
const Leagues         = lazy(() => import('./pages/Leagues/Leagues'));
const Pickup          = lazy(() => import('./pages/Pickup/Pickup'));
const BirthdayParties = lazy(() => import('./pages/BirthdayParties/BirthdayParties'));
const Camps           = lazy(() => import('./pages/Camps/Camps'));
const Training        = lazy(() => import('./pages/Training/Training'));
const Blog            = lazy(() => import('./pages/Blog/Blog'));
const BlogPost        = lazy(() => import('./components/Blog/BlogPost'));
const PrivacyPolicy   = lazy(() => import('./pages/PrivacyPolicy/PrivacyPolicy'));
const TOS             = lazy(() => import('./pages/TOS/TOS'));
const CookiePolicy    = lazy(() => import('./pages/CookiePolicy/CookiePolicy'));
const NotFound        = lazy(() => import('./pages/NotFound/NotFound'));

// ─── Lazy-Loaded Account Pages ───
const AccountAuth      = lazy(() => import('./pages/Account/AccountAuth'));
const AccountLayout    = lazy(() => import('./pages/Account/AccountLayout'));
const AccountDashboard = lazy(() => import('./pages/Account/AccountDashboard'));
const AccountBookings  = lazy(() => import('./pages/Account/AccountBookings'));
const AccountProfile   = lazy(() => import('./pages/Account/AccountProfile'));
const AccountFamily    = lazy(() => import('./pages/Account/AccountFamily'));
const AccountPayment   = lazy(() => import('./pages/Account/AccountPayment'));
const AccountWaiver    = lazy(() => import('./pages/Account/AccountWaiver'));

// ─── Lazy-Loaded Admin Pages ───
const AdminLogin               = lazy(() => import('./components/admin/AdminLogin'));
const AdminLayout              = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard           = lazy(() => import('./components/admin/AdminDashboard'));
const AdminFieldRentals        = lazy(() => import('./components/admin/AdminFieldRentals'));
const AdminLeagues             = lazy(() => import('./components/admin/AdminLeagues'));
const AdminLeagueRegistrations = lazy(() => import('./components/admin/AdminLeagueRegistrations'));
const AdminPickup              = lazy(() => import('./components/admin/AdminPickup'));
const AdminBirthdayParties     = lazy(() => import('./components/admin/AdminBirthdayParties'));
const AdminTraining            = lazy(() => import('./components/admin/AdminTraining'));
const AdminCamps               = lazy(() => import('./components/admin/AdminCamps'));
const AdminSchedule            = lazy(() => import('./components/admin/AdminSchedule'));
const AdminStaff               = lazy(() => import('./components/admin/AdminStaff'));
const AdminTimeOff             = lazy(() => import('./components/admin/AdminTimeOff'));
const AdminShifts              = lazy(() => import('./components/admin/AdminShifts'));
const AdminBlackouts           = lazy(() => import('./components/admin/AdminBlackouts'));
const AdminRevenue             = lazy(() => import('./components/admin/AdminRevenue'));
const AdminOccupancy           = lazy(() => import('./components/admin/AdminOccupancy'));
const AdminCustomers           = lazy(() => import('./components/admin/AdminCustomers'));
const AdminChat                = lazy(() => import('./components/admin/AdminChat'));
const AdminWaivers             = lazy(() => import('./components/admin/AdminWaivers'));

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <MobileMenuProvider>
      <LanguageProvider>
        <NavigationProvider>
          <HelmetProvider>
            {/* AccountProvider wraps Header so isCustomer is available in nav */}
            <AccountProvider>
              <ErrorBoundary>
              <ScrollToTop />
              {!isAdminRoute && <Header />}

              <main className="main-content" style={{ minHeight: '100vh' }}>
                <Suspense fallback={<PageLoader />}>
                  <Routes>

                    {/* Core Pages */}
                    <Route path="/" element={<Home />} />
                    <Route path="/es/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/es/nosotros" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/es/contacto" element={<Contact />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/es/servicios" element={<Services />} />

                    {/* Service Landing Pages */}
                    <Route path="/services/field-rental" element={<FieldRental />} />
                    <Route path="/es/servicios/canchas" element={<FieldRental />} />
                    <Route path="/services/leagues" element={<Leagues />} />
                    <Route path="/es/ligas" element={<Leagues />} />
                    <Route path="/services/pickup" element={<Pickup />} />
                    <Route path="/es/partido-libre" element={<Pickup />} />
                    <Route path="/services/birthday-parties" element={<BirthdayParties />} />
                    <Route path="/es/fiestas" element={<BirthdayParties />} />
                    <Route path="/services/camps" element={<Camps />} />
                    <Route path="/es/campamentos" element={<Camps />} />
                    <Route path="/services/training" element={<Training />} />
                    <Route path="/es/entrenamiento" element={<Training />} />

                    {/* Registration Routes */}
                    <Route path="/services/field-rental/book"         element={<Register config={{ type: 'fieldRental', title: '', subtitle: '', component: () => null }} />} />
                    <Route path="/services/pickup/book"               element={<Register config={{ type: 'pickup',      title: '', subtitle: '', component: () => null }} />} />
                    <Route path="/services/leagues/register"          element={<Register config={{ type: 'league',     title: '', subtitle: '', component: () => null }} />} />
                    <Route path="/services/training/register"         element={<Register config={{ type: 'training',   title: '', subtitle: '', component: () => null }} />} />
                    <Route path="/services/camps/register"            element={<Register config={{ type: 'camps',      title: '', subtitle: '', component: () => null }} />} />
                    <Route path="/services/birthday-parties/register" element={<Register config={{ type: 'birthday',  title: '', subtitle: '', component: () => null }} />} />

                    {/* Blog */}
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/es/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/es/blog/:slug" element={<BlogPost />} />

                    {/* Legal */}
                    <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                    <Route path="/TOS" element={<TOS />} />
                    <Route path="/CookiePolicy" element={<CookiePolicy />} />

                    {/* Account */}
                    <Route path="/account/login" element={<AccountAuth />} />
                    <Route path="/account" element={<AccountLayout />}>
                      <Route index   element={<AccountDashboard />} />
                      <Route path="bookings" element={<AccountBookings />} />
                      <Route path="profile"  element={<AccountProfile />} />
                      <Route path="family"   element={<AccountFamily />} />
                      <Route path="payment"  element={<AccountPayment />} />
                      <Route path="waiver"   element={<AccountWaiver />} />
                    </Route>

                    {/* Admin */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route
                      path="/admin"
                      element={
                        <AdminProvider>
                          <ErrorBoundary admin>
                            <AdminLayout />
                          </ErrorBoundary>
                        </AdminProvider>
                      }
                    >
                      <Route index element={<AdminDashboard />} />
                      <Route path="field-rentals"        element={<AdminFieldRentals />} />
                      <Route path="leagues"              element={<AdminLeagues />} />
                      <Route path="league-registrations" element={<AdminLeagueRegistrations />} />
                      <Route path="pickup"               element={<AdminPickup />} />
                      <Route path="birthday-parties"     element={<AdminBirthdayParties />} />
                      <Route path="training"             element={<AdminTraining />} />
                      <Route path="camps"                element={<AdminCamps />} />
                      <Route path="schedule"             element={<AdminSchedule />} />
                      <Route path="staff"                element={<AdminStaff />} />
                      <Route path="time-off"             element={<AdminTimeOff />} />
                      <Route path="shifts"               element={<AdminShifts />} />
                      <Route path="blackouts"            element={<AdminBlackouts />} />
                      <Route path="revenue"              element={<AdminRevenue />} />
                      <Route path="occupancy"            element={<AdminOccupancy />} />
                      <Route path="customers"            element={<AdminCustomers />} />
                      <Route path="chat"                 element={<AdminChat />} />
                      <Route path="waivers"              element={<AdminWaivers />} />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />

                  </Routes>
                </Suspense>
              </main>

              {!isAdminRoute && <Subscribe />}
              {!isAdminRoute && <Footer />}
              {!isAdminRoute && <CookiePopup />}
              {!isAdminRoute && <ChatWidget />}
              </ErrorBoundary>
            </AccountProvider>
          </HelmetProvider>
        </NavigationProvider>
      </LanguageProvider>
    </MobileMenuProvider>
  );
};

export default App;
