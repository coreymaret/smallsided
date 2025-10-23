import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.scss";
import Logo from "../../assets/logo.svg";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // Type the ref as HTML element
  const navRef = useRef<HTMLElement | null>(null);
  const [navHeight, setNavHeight] = useState(0);

  // Update mobile state on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update nav height dynamically
  useEffect(() => {
    if (navRef.current && isMobile) {
      setNavHeight(navRef.current.scrollHeight);
    }
  }, [isOpen, isMobile]);

  const handleLinkClick = () => {
    if (isMobile) setIsOpen(false);
  };

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo} onClick={handleLinkClick}>
        <img src={Logo} alt="Small Sided Logo" />
      </Link>

      <nav
        ref={navRef}
        className={`${styles['main-nav']} ${isOpen ? styles.open : ""}`}
        style={isMobile ? { maxHeight: isOpen ? `${navHeight}px` : 0 } : {}}
      >
        <ul>
          <li><Link to="/" onClick={handleLinkClick}>Home</Link></li>
          <li><Link to="/about" onClick={handleLinkClick}>About</Link></li>
          <li><Link to="/services" onClick={handleLinkClick}>Services</Link></li>
          <li><Link to="/work" onClick={handleLinkClick}>Work</Link></li>
          <li><Link to="/contact" onClick={handleLinkClick}>Contact</Link></li>
        </ul>
      </nav>

      {isMobile && (
        <div
          className={`${styles.hamburger} ${isOpen ? styles.active : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
    </header>
  );
};

export default Header;
