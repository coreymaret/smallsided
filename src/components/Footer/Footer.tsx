import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import styles from './Footer.module.scss';
import Logo from "../../assets/logo.svg";
import { Link } from "react-router-dom";

const Footer = () => {
  const handleLinkClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <img src={Logo} alt="Small Sided Logo" className={styles.footerLogo} />
          <p>Small field. Big impact.</p>
          <div className={styles.socialLinks}>
            <a href="https://www.facebook.com/smallsided" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="https://www.instagram.com/smallsided" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="https://www.youtube.com/@smallsided" target="_blank" rel="noopener noreferrer" aria-label="Youtube">
              <Youtube size={20} />
            </a>
            <a href="#" aria-label="Twitter">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        <div className={styles.linksContainer}>
          <div className={styles.footerSection}>
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/" onClick={handleLinkClick}>Home</Link></li>
              <li><Link to="/about" onClick={handleLinkClick}>About</Link></li>
              <li><Link to="/services" onClick={handleLinkClick}>Services</Link></li>
              <li><Link to="/work" onClick={handleLinkClick}>Work</Link></li>
              <li><Link to="/contact" onClick={handleLinkClick}>Contact</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4>Services</h4>
            <ul>
              <li><Link to="/PlayerEducation" onClick={handleLinkClick}>Player Education</Link></li>
              <li><Link to="/ParentEducation" onClick={handleLinkClick}>Parent Education</Link></li>
              <li><Link to="/CoachEducation" onClick={handleLinkClick}>Coach Education</Link></li>
              <li><Link to="/Consulting" onClick={handleLinkClick}>Consulting</Link></li>
              <li><Link to="/Resources" onClick={handleLinkClick}>Resources</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h4>Contact Us</h4>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <MapPin size={18} />
              <a href="https://www.google.com/maps/search/?api=1&query=123+Small+Sided+Way+Tampa+FL+33617" rel="noopener noreferrer">
                <span>123 Small Sided Way, Tampa, FL 33617</span>
              </a>
            </div>
            <div className={styles.contactItem}>
              <Phone size={18} />
              <a href="tel:13528125012">
                <span>(727) 4-SOCCER</span>
              </a>
            </div>
            <div className={styles.contactItem}>
              <Mail size={18} />
              <a href="mailto:admin@smallsided.com">
                <span>admin@smallsided.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; 2025 Small Sided. All rights reserved.</p>
        <div className={styles.footerLinks}>
          <Link to="/PrivacyPolicy" onClick={handleLinkClick}>Privacy Policy</Link>
          <span>|</span>
          <Link to="/TOS" onClick={handleLinkClick}>Terms of Service</Link>
          <span>|</span>
          <Link to="/CookiePolicy" onClick={handleLinkClick}>Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;