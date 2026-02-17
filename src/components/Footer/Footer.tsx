import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from '../../components/Icons/Icons'; 
// Importing icon components from lucide-react

import styles from './Footer.module.scss'; 
// Importing CSS module styles specific to this footer component

import Logo from "../../assets/logo.svg"; 
// Importing the site logo image

import { Link, useLocation } from "react-router-dom"; 
// React Router link component for client-side navigation


// Footer component
const Footer = () => {
  const location = useLocation();

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
          <p>Small field. Big impact.</p>

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
            <h3 className={styles.footerHeading}>Quick Links</h3>
            <ul>
              {/* Internal links to pages; scrolls to top on click */}
              <li><Link to="/" onClick={handleLinkClick} className={isActive("/") ? styles.active : ""}>Home</Link></li>
              <li><Link to="/about" onClick={handleLinkClick} className={isActive("/about") ? styles.active : ""}>About</Link></li>
              <li><Link to="/services" onClick={handleLinkClick} className={isActive("/services") ? styles.active : ""}>Services</Link></li>
              <li><Link to="/blog" onClick={handleLinkClick} className={isActive("/blog") ? styles.active : ""}>Blog</Link></li>
              <li><Link to="/contact" onClick={handleLinkClick} className={isActive("/contact") ? styles.active : ""}>Contact</Link></li>
            </ul>
          </div>

          {/* Services column */}
          <div className={styles.footerSection}>
            <h3 className={styles.footerHeading}>Services</h3>
            <ul>
              <li><Link to="/services/field-rental" onClick={handleLinkClick} className={isActive("/services/field-rental") ? styles.active : ""}>Field Rental</Link></li>
              <li><Link to="/services/leagues" onClick={handleLinkClick} className={isActive("/services/leagues") ? styles.active : ""}>Leagues</Link></li>
              <li><Link to="/services/pickup" onClick={handleLinkClick} className={isActive("/services/pickup") ? styles.active : ""}>Pickup</Link></li>
              <li><Link to="/services/birthday-parties" onClick={handleLinkClick} className={isActive("/services/birthday-parties") ? styles.active : ""}>Birthday Parties</Link></li>
              <li><Link to="/services/camps" onClick={handleLinkClick} className={isActive("/services/camps") ? styles.active : ""}>Camps</Link></li>
              <li><Link to="/services/training" onClick={handleLinkClick} className={isActive("/services/training") ? styles.active : ""}>Training</Link></li>
            </ul>
          </div>

        </div>


        {/* == RIGHT SECTION: Contact details == */}
        <div className={styles.footerSection}>
          <h3 className={styles.footerHeading}>Contact Us</h3>

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
          <Link to="/PrivacyPolicy" onClick={handleLinkClick} className={isActive("/PrivacyPolicy") ? styles.active : ""}>Privacy Policy</Link>
          <span>|</span>
          <Link to="/TOS" onClick={handleLinkClick} className={isActive("/TOS") ? styles.active : ""}>Terms of Service</Link>
          <span>|</span>
          <Link to="/CookiePolicy" onClick={handleLinkClick} className={isActive("/CookiePolicy") ? styles.active : ""}>Cookie Policy</Link>
        </div>

        <p>&copy; {new Date().getFullYear()} Small Sided, LLC. All rights reserved.</p>
      </div>

    </footer>
  );
};

export default Footer; 
// Exporting the footer component so it can be used elsewhere