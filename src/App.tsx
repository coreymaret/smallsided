import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { lazy, Suspense } from 'react';
// Lazy load all page components for better performance
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import CookiePopup from './components/CookiePopup/CookiePopup';
import Subscribe from './components/Subscribe/Subscribe';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import PageLoader from './components/PageLoader/PageLoader';
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
const ExerciseDetail = lazy(() => import('./components/Exercises/ExerciseDetail'));
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
    <HelmetProvider>
      <ScrollToTop />
      <Header />
      <main className="main-content" style={{ minHeight: '100vh' }}>
        {/* ⬆️ ADDED: minHeight reserves space to prevent Subscribe from shifting */}
        {/* Suspense boundary catches lazy-loaded components while they load */}
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/exercises/:slug" element={<ExerciseDetail />} />
            <Route path="/work" element={<Work />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/field-rental" element={<FieldRental />} />
            <Route path="/services/leagues" element={<Leagues />} />
            <Route path="/services/pickup" element={<Pickup />} />
            <Route path="/services/birthday-parties" element={<BirthdayParties />} />
            <Route path="/services/camps" element={<Camps />} />
            <Route path="/services/training" element={<Training />} />
            <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/TOS" element={<TOS />} />
            <Route path="/CookiePolicy" element={<CookiePolicy />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
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
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <Subscribe />}
      {!isAdminRoute && <Footer />}
      <CookiePopup />
    </HelmetProvider>
  );
};

export default App;