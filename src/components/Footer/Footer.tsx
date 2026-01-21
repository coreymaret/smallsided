import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'; 
// Importing icon components from lucide-react

import styles from './Footer.module.scss'; 
// Importing CSS module styles specific to this footer component

import Logo from "../../assets/logo.svg"; 
// Importing the site logo image

import { Link } from "react-router-dom"; 
// React Router link component for client-side navigation


// Footer component
const Footer = () => {

  // Scroll to top of the page when clicking a link inside the footer
  const handleLinkClick = () => {
    window.scrollTo(0, 0);
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
              <li><Link to="/" onClick={handleLinkClick}>Home</Link></li>
              <li><Link to="/about" onClick={handleLinkClick}>About</Link></li>
              <li><Link to="/services" onClick={handleLinkClick}>Services</Link></li>
              <li><Link to="/blog" onClick={handleLinkClick}>Blog</Link></li>
              <li><Link to="/contact" onClick={handleLinkClick}>Contact</Link></li>
            </ul>
          </div>

          {/* Services column */}
          <div className={styles.footerSection}>
            <h3 className={styles.footerHeading}>Services</h3>
            <ul>
              <li><Link to="/services/field-rental" onClick={handleLinkClick}>Field Rental</Link></li>
              <li><Link to="/services/leagues" onClick={handleLinkClick}>Leagues</Link></li>
              <li><Link to="/services/pickup" onClick={handleLinkClick}>Pickup</Link></li>
              <li><Link to="/services/birthday-parties" onClick={handleLinkClick}>Birthday Parties</Link></li>
              <li><Link to="/services/camps" onClick={handleLinkClick}>Camps</Link></li>
              <li><Link to="/services/training" onClick={handleLinkClick}>Training</Link></li>
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
          <Link to="/PrivacyPolicy" onClick={handleLinkClick}>Privacy Policy</Link>
          <span>|</span>
          <Link to="/TOS" onClick={handleLinkClick}>Terms of Service</Link>
          <span>|</span>
          <Link to="/CookiePolicy" onClick={handleLinkClick}>Cookie Policy</Link>
        </div>

        <p>&copy; {new Date().getFullYear()} Small Sided, LLC. All rights reserved.</p>
      </div>

    </footer>
  );
};

export default Footer; 
// Exporting the footer component so it can be used elsewhere