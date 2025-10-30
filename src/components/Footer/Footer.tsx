import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import styles from './Footer.module.scss';
import Logo from "../../assets/logo.svg";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Company Info */}
        <div className={styles.footerSection}>
          <img src={Logo} alt="Small Sided Logo" className={styles.footerLogo} />
          <p>Small field. Big impact.</p>
          <div className={styles.socialLinks}>
            <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
            <a href="#" aria-label="Youtube"><Youtube size={20} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
          </div>
        </div>

        {/* Quick Links & Services Container */}
        <div className={styles.linksContainer}>
          <div className={styles.footerSection}>
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/services">Services</a></li>
              <li><a href="/work">Our Work</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4>Services</h4>
            <ul>
              <li><a href="#">Training Programs</a></li>
              <li><a href="#">Coaching Services</a></li>
              <li><a href="#">Field Management</a></li>
              <li><a href="#">Consulting</a></li>
              <li><a href="#">Resources</a></li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className={styles.footerSection}>
          <h4>Contact Us</h4>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <MapPin size={18} />
              <span>123 Small Sided Way, Tampa, FL 33617</span>
            </div>
            <div className={styles.contactItem}>
              <Phone size={18} />
              <span>(727) 4-SOCCER</span>
            </div>
            <div className={styles.contactItem}>
              <Mail size={18} />
              <span>admin@smallsided.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.footerBottom}>
        <p>&copy; 2025 Small Sided. All rights reserved.</p>
        <div className={styles.footerLinks}>
          <a href="#">Privacy Policy</a>
          <span>|</span>
          <a href="#">Terms of Service</a>
          <span>|</span>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;