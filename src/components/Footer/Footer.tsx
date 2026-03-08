import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from '../../components/Icons/Icons'; 
// Importing icon components from lucide-react

import styles from './Footer.module.scss'; 
// Importing CSS module styles specific to this footer component

import Logo from "../../assets/logo.svg"; 
// Importing the site logo image

import { Link, useLocation } from "react-router-dom"; 
// React Router link component for client-side navigation

import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { routePairs } from '../../constants/routePairs';


// Footer component
const Footer = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { isSpanish } = useLanguage();

  const lp = (enPath: string) => isSpanish ? (routePairs[enPath] ?? enPath) : enPath;

  // Scroll to top of the page when clicking a link inside the footer
  const handleLinkClick = () => {
    window.scrollTo(0, 0);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <footer className={styles.footer}> 
      {/* Wrapper for all footer content */}

      <div className={styles.footerContent}>
        
        {/* == LEFT SECTION: Logo + tagline + social icons == */}
        <div className={styles.footerSection}>
          <img 
            src={Logo} 
            alt="Small Sided Logo" 
            className={styles.footerLogo}
            width="150"
            height="33"
          />
          <p>{t('footer.tagline')}</p>

          {/* Social media icons linking to external pages */}
          <div className={styles.socialLinks}>
            <a 
              href="https://www.facebook.com/smallsided" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>

            <a 
              href="https://www.instagram.com/smallsided" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>

            <a 
              href="https://www.youtube.com/@smallsided" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Youtube"
            >
              <Youtube size={20} />
            </a>

            <a href="#" aria-label="Twitter">
              <Twitter size={20} />
            </a>
          </div>
        </div>


        {/* == MIDDLE SECTION: Quick Links + Services == */}
        <div className={styles.linksContainer}>

          {/* Quick Links column */}
          <div className={styles.footerSection}>
            <h3 className={styles.footerHeading}>{t('footer.quickLinks')}</h3>
            <ul>
              <li><Link to={lp("/")} onClick={handleLinkClick} className={isActive("/") ? styles.active : ""}>{t('nav.home')}</Link></li>
              <li><Link to={lp("/about")} onClick={handleLinkClick} className={isActive("/about") ? styles.active : ""}>{t('nav.about')}</Link></li>
              <li><Link to={lp("/services")} onClick={handleLinkClick} className={isActive("/services") ? styles.active : ""}>{t('nav.services')}</Link></li>
              <li><Link to={lp("/blog")} onClick={handleLinkClick} className={isActive("/blog") ? styles.active : ""}>{t('nav.blog')}</Link></li>
              <li><Link to={lp("/contact")} onClick={handleLinkClick} className={isActive("/contact") ? styles.active : ""}>{t('nav.contact')}</Link></li>
            </ul>
          </div>

          {/* Services column */}
          <div className={styles.footerSection}>
            <h3 className={styles.footerHeading}>{t('nav.services')}</h3>
            <ul>
              <li><Link to={lp("/services/field-rental")} onClick={handleLinkClick} className={isActive("/services/field-rental") ? styles.active : ""}>{t('services.fieldRentals.title')}</Link></li>
              <li><Link to={lp("/services/leagues")} onClick={handleLinkClick} className={isActive("/services/leagues") ? styles.active : ""}>{t('services.leagues.title')}</Link></li>
              <li><Link to={lp("/services/pickup")} onClick={handleLinkClick} className={isActive("/services/pickup") ? styles.active : ""}>{t('services.pickup.title')}</Link></li>
              <li><Link to={lp("/services/birthday-parties")} onClick={handleLinkClick} className={isActive("/services/birthday-parties") ? styles.active : ""}>{t('services.birthdayParties.title')}</Link></li>
              <li><Link to={lp("/services/camps")} onClick={handleLinkClick} className={isActive("/services/camps") ? styles.active : ""}>{t('services.camps.title')}</Link></li>
              <li><Link to={lp("/services/training")} onClick={handleLinkClick} className={isActive("/services/training") ? styles.active : ""}>{t('services.training.title')}</Link></li>
            </ul>
          </div>

        </div>


        {/* == RIGHT SECTION: Contact details == */}
        <div className={styles.footerSection}>
          <h3 className={styles.footerHeading}>{t('footer.contactUs')}</h3>

          <div className={styles.contactInfo}>

            {/* Address */}
            <div className={styles.contactItem}>
              <MapPin size={18} />
              <a 
                href="https://www.google.com/maps/search/?api=1&query=123+Small+Sided+Way+Tampa+FL+33617" 
                rel="noopener noreferrer"
              >
                <span>123 Small Sided Way, Tampa, FL 33617</span>
              </a>
            </div>

            {/* Phone number (click-to-call) */}
            <div className={styles.contactItem}>
              <Phone size={18} />
              <a href="tel:13528125012">
                <span>(727) 4-SOCCER</span>
              </a>
            </div>

            {/* Email (click-to-email) */}
            <div className={styles.contactItem}>
              <Mail size={18} />
              <a href="mailto:hello@smallsided.com">
                <span>hello@smallsided.com</span>
              </a>
            </div>

          </div>
        </div>

      </div>


      {/* == BOTTOM DISCLAIMER BAR == */}
      <div className={styles.footerBottom}>
        {/* Additional links: Privacy, Terms, Cookies */}
        <div className={styles.footerLinks}>
          <Link to="/PrivacyPolicy" onClick={handleLinkClick} className={isActive("/PrivacyPolicy") ? styles.active : ""}>{t('footer.privacy')}</Link>
          <span>|</span>
          <Link to="/TOS" onClick={handleLinkClick} className={isActive("/TOS") ? styles.active : ""}>{t('footer.tos')}</Link>
          <span>|</span>
          <Link to="/CookiePolicy" onClick={handleLinkClick} className={isActive("/CookiePolicy") ? styles.active : ""}>{t('footer.cookiePolicy')}</Link>
        </div>

        <p>&copy; {new Date().getFullYear()} Small Sided, LLC. {t('footer.rights')}</p>
      </div>

    </footer>
  );
};

export default Footer; 
// Exporting the footer component so it can be used elsewhere