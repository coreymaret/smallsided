import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import CookiePopup from './components/CookiePopup/CookiePopup'
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Services from './pages/Services/Services';
import Work from './pages/Work/Work';
import Contact from './pages/Contact/Contact';
import PlayerEducation from './pages/PlayerEducation/PlayerEducation';
import ParentEducation from './pages/ParentEducation/ParentEducation';
import CoachEducation from './pages/CoachEducation/CoachEducation';
import Consulting from './pages/Consulting/Consulting';
import Resources from './pages/Resources/Resources';
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy';
import TOS from './pages/TOS/TOS';
import CookiePolicy from './pages/CookiePolicy/CookiePolicy';
import Subscribe from './components/Subscribe/Subscribe';


const App = () => {
  const location = useLocation();

  return (
    <>
      <Header />
      <main className="main-content">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
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
        </Routes>
      </main>
      <Subscribe />
      <Footer />
      <CookiePopup />
    </>
  );
};

export default App;