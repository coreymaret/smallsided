import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { lazy, Suspense } from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import CookiePopup from './components/CookiePopup/CookiePopup';
import Subscribe from './components/Subscribe/Subscribe';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import PageLoader from './components/PageLoader/PageLoader';

// Lazy load all page components for better performance
// Each page will be loaded only when needed, reducing initial bundle size
const Home = lazy(() => import('./pages/Home/Home'));
const About = lazy(() => import('./pages/About/About'));
const Exercises = lazy(() => import('./pages/Exercises/Exercises'));
const Work = lazy(() => import('./pages/Work/Work'));
const Contact = lazy(() => import('./pages/Contact/Contact'));
const PlayerEducation = lazy(() => import('./pages/PlayerEducation/PlayerEducation'));
const ParentEducation = lazy(() => import('./pages/ParentEducation/ParentEducation'));
const CoachEducation = lazy(() => import('./pages/CoachEducation/CoachEducation'));
const Consulting = lazy(() => import('./pages/Consulting/Consulting'));
const Resources = lazy(() => import('./pages/Resources/Resources'));
const ExerciseDetail = lazy(() => import('./components/Exercises/ExerciseDetail'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy/PrivacyPolicy'));
const TOS = lazy(() => import('./pages/TOS/TOS'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy/CookiePolicy'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
const Blog = lazy(() => import('./pages/Blog/Blog'));
const BlogPost = lazy(() => import('./components/Blog/BlogPost'));

const App = () => {
  const location = useLocation();

  return (
    <HelmetProvider>
      <ScrollToTop />
      <Header />
      <main className="main-content">
        {/* Suspense boundary catches lazy-loaded components while they load */}
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/exercises/:slug" element={<ExerciseDetail />} />
            <Route path="/work" element={<Work />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/PlayerEducation" element={<PlayerEducation />} />
            <Route path="/ParentEducation" element={<ParentEducation />} />
            <Route path="/CoachEducation" element={<CoachEducation />} />
            <Route path="/Consulting" element={<Consulting />} />
            <Route path="/Resources" element={<Resources />} />
            <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
            <Route path="/TOS" element={<TOS />} />
            <Route path="/CookiePolicy" element={<CookiePolicy />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Routes>
        </Suspense>
      </main>
      <Subscribe />
      <Footer />
      <CookiePopup />
    </HelmetProvider>
  );
};

export default App;