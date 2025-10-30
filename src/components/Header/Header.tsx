import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.scss";
import Logo from "../../assets/logo.svg";
import TopToggleBar from "../TopToggleBar/TopToggleBar";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 785);

  const [topBarVisible, setTopBarVisible] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 785);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [isMobile, isOpen]);

  useEffect(() => {
    // Check localStorage for top bar visibility on reload
    const topBarState = localStorage.getItem("topBarClosed");
    if (topBarState) {
      try {
        const data = JSON.parse(topBarState);
        const now = Date.now();
        const fortyEightHours = 48 * 60 * 60 * 1000;
        
        if (now - data.timestamp < fortyEightHours) {
          setTopBarVisible(!data.closed);
        } else {
          setTopBarVisible(true);
        }
      } catch (error) {
        setTopBarVisible(true);
      }
    }
  }, []);

  const handleLinkClick = () => {
    if (isMobile) setIsOpen(false);
  };

  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.body.scrollHeight;
      const nearBottom = documentHeight - (currentScrollY + windowHeight) < 200;

      if (nearBottom) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`${styles.header} ${visible ? styles.show : styles.hide}`}
    >
      {topBarVisible && <TopToggleBar onClose={() => setTopBarVisible(false)} />}

      <div
        className={styles.headerContent}
        style={{
          paddingTop: topBarVisible ? "3rem" : "1rem",
        }}
      >
        <Link to="/" className={styles.logo} onClick={handleLinkClick}>
          <img src={Logo} alt="Small Sided Logo" />
        </Link>

        <nav
          className={`${styles["main-nav"]} ${isOpen ? styles.open : ""}`}
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
      </div>
    </header>
  );
};

export default Header;