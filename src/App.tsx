import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { lazy, Suspense } from 'react';
import { MobileMenuProvider } from './contexts/MobileMenuContext';
// Lazy load all page components for better performance
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import CookiePopup from './components/CookiePopup/CookiePopup';
import Subscribe from './components/Subscribe/Subscribe';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import PageLoader from './components/PageLoader/PageLoader';
import Register from './components/Register/Register';

// Each page will be loaded only when needed, reducing initial bundle size
const Home = lazy(() => import('./pages/Home/Home'));
const About = lazy(() => import('./pages/About/About'));
const Exercises = lazy(() => import('./pages/Exercises/Exercises'));
const Work = lazy(() => import('./pages/Work/Work'));
const Contact = lazy(() => import('./pages/Contact/Contact'));
const Services = lazy(() => import('./pages/Services/Services'));
const FieldRental = lazy(() => import('./pages/FieldRental/FieldRental'));
const Leagues = lazy(() => import('./pages/Leagues/Leagues'));
const Pickup = lazy(() => import('./pages/Pickup/Pickup'));
const BirthdayParties = lazy(() => import('./pages/BirthdayParties/BirthdayParties'));
const Camps = lazy(() => import('./pages/Camps/Camps'));
const Training = lazy(() => import('./pages/Training/Training'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy/PrivacyPolicy'));
const GetStarted = lazy(() => import('./pages/GetStarted/GetStarted'));
const TOS = lazy(() => import('./pages/TOS/TOS'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy/CookiePolicy'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
const Blog = lazy(() => import('./pages/Blog/Blog'));
const BlogPost = lazy(() => import('./components/Blog/BlogPost'));
const AdminLogin = lazy(() => import('./components/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const AdminFieldRentals = lazy(() => import('./components/admin/AdminFieldRentals'));
const AdminLeagues = lazy(() => import('./components/admin/AdminLeagues'));
const AdminPickup = lazy(() => import('./components/admin/AdminPickup'));
const AdminBirthdayParties = lazy(() => import('./components/admin/AdminBirthdayParties'));
const AdminTraining = lazy(() => import('./components/admin/AdminTraining'));
const AdminCamps = lazy(() => import('./components/admin/AdminCamps'));

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <MobileMenuProvider>
      <HelmetProvider>
        <ScrollToTop />
        <Header />
        <main className="main-content" style={{ minHeight: '100vh' }}>
          {/* Suspense boundary catches lazy-loaded components while they load */}
          <Suspense fallback={<PageLoader />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/exercises" element={<Exercises />} />
              <Route path="/work" element={<Work />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/services" element={<Services />} />
              
              {/* Service Landing Pages */}
              <Route path="/services/field-rental" element={<FieldRental />} />
              <Route path="/services/leagues" element={<Leagues />} />
              <Route path="/services/pickup" element={<Pickup />} />
              <Route path="/services/birthday-parties" element={<BirthdayParties />} />
              <Route path="/services/camps" element={<Camps />} />
              <Route path="/services/training" element={<Training />} />
              
              {/* Registration Routes - All use unified Register wrapper */}
              <Route 
                path="/services/field-rental/book" 
                element={<Register config={{ type: 'fieldRental', title: '', subtitle: '', component: () => null }} />} 
              />
              <Route 
                path="/services/pickup/book" 
                element={<Register config={{ type: 'pickup', title: '', subtitle: '', component: () => null }} />} 
              />
              <Route 
                path="/services/leagues/register" 
                element={<Register config={{ type: 'league', title: '', subtitle: '', component: () => null }} />} 
              />
              <Route 
                path="/services/training/register" 
                element={<Register config={{ type: 'training', title: '', subtitle: '', component: () => null }} />} 
              />
              <Route 
                path="/services/camps/register" 
                element={<Register config={{ type: 'camps', title: '', subtitle: '', component: () => null }} />} 
              />
              <Route 
                path="/services/birthday-parties/register" 
                element={<Register config={{ type: 'birthday', title: '', subtitle: '', component: () => null }} />} 
              />
              
              {/* Legal Pages */}
              <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
              <Route path="/get-started" element={<GetStarted />} />
              <Route path="/TOS" element={<TOS />} />
              <Route path="/CookiePolicy" element={<CookiePolicy />} />
              
              {/* Blog */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              
              {/* Admin Routes */}
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
              
              {/* 404 - Keep last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        {!isAdminRoute && <Subscribe />}
        {!isAdminRoute && <Footer />}
        <CookiePopup />
      </HelmetProvider>
    </MobileMenuProvider>
  );
};

export default App;
