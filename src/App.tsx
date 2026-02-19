// src/App.tsx

// React
import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Context
import { MobileMenuProvider } from './contexts/MobileMenuContext';

// Layout Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Subscribe from './components/Subscribe/Subscribe';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import PageLoader from './components/PageLoader/PageLoader';
import CookiePopup from './components/CookiePopup/CookiePopup';
import Register from './components/Register/Register';

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

// ─── Lazy-Loaded Admin Pages ───
const AdminLogin          = lazy(() => import('./components/admin/AdminLogin'));
const AdminLayout         = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard      = lazy(() => import('./components/admin/AdminDashboard'));
const AdminFieldRentals   = lazy(() => import('./components/admin/AdminFieldRentals'));
const AdminLeagues        = lazy(() => import('./components/admin/AdminLeagues'));
const AdminPickup         = lazy(() => import('./components/admin/AdminPickup'));
const AdminBirthdayParties = lazy(() => import('./components/admin/AdminBirthdayParties'));
const AdminTraining       = lazy(() => import('./components/admin/AdminTraining'));
const AdminCamps          = lazy(() => import('./components/admin/AdminCamps'));

/**
 * Root application component.
 * Handles routing, layout structure, and lazy-loaded page rendering.
 * Admin routes hide the Subscribe and Footer sections.
 */
const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <MobileMenuProvider>
      <HelmetProvider>
        <ScrollToTop />
        <Header />

        <main className="main-content" style={{ minHeight: '100vh' }}>
          <Suspense fallback={<PageLoader />}>
            <Routes location={location} key={location.pathname}>

              {/* Core Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/services" element={<Services />} />

              {/* Service Landing Pages */}
              <Route path="/services/field-rental" element={<FieldRental />} />
              <Route path="/services/leagues" element={<Leagues />} />
              <Route path="/services/pickup" element={<Pickup />} />
              <Route path="/services/birthday-parties" element={<BirthdayParties />} />
              <Route path="/services/camps" element={<Camps />} />
              <Route path="/services/training" element={<Training />} />

              {/* Registration Routes */}
              <Route path="/services/field-rental/book" element={<Register config={{ type: 'fieldRental', title: '', subtitle: '', component: () => null }} />} />
              <Route path="/services/pickup/book" element={<Register config={{ type: 'pickup', title: '', subtitle: '', component: () => null }} />} />
              <Route path="/services/leagues/register" element={<Register config={{ type: 'league', title: '', subtitle: '', component: () => null }} />} />
              <Route path="/services/training/register" element={<Register config={{ type: 'training', title: '', subtitle: '', component: () => null }} />} />
              <Route path="/services/camps/register" element={<Register config={{ type: 'camps', title: '', subtitle: '', component: () => null }} />} />
              <Route path="/services/birthday-parties/register" element={<Register config={{ type: 'birthday', title: '', subtitle: '', component: () => null }} />} />

              {/* Blog */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />

              {/* Legal */}
              <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
              <Route path="/TOS" element={<TOS />} />
              <Route path="/CookiePolicy" element={<CookiePolicy />} />

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="field-rentals" element={<AdminFieldRentals />} />
                <Route path="leagues" element={<AdminLeagues />} />
                <Route path="pickup" element={<AdminPickup />} />
                <Route path="birthday-parties" element={<AdminBirthdayParties />} />
                <Route path="training" element={<AdminTraining />} />
                <Route path="camps" element={<AdminCamps />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </Suspense>
        </main>

        {/* Global sections — hidden on admin routes */}
        {!isAdminRoute && <Subscribe />}
        {!isAdminRoute && <Footer />}
        <CookiePopup />

      </HelmetProvider>
    </MobileMenuProvider>
  );
};

export default App;