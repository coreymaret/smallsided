import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.scss";
import Logo from "../../assets/logo.svg";
import TopToggleBar from "../TopToggleBar/TopToggleBar";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 785);
  const navRef = useRef<HTMLElement | null>(null);
  const [navHeight, setNavHeight] = useState(0);

  // ------------------ NEW STATE: track top bar visibility ------------------
  const [topBarVisible, setTopBarVisible] = useState(true); // Added state for top bar visibility

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 785);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (navRef.current && isMobile) {
      setNavHeight(navRef.current.scrollHeight);
    }
  }, [isOpen, isMobile]);

  const handleLinkClick = () => {
    if (isMobile) setIsOpen(false);
  };

  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.body.scrollHeight;
      const nearBottom = documentHeight - (currentScrollY + windowHeight) < 200;

      if (nearBottom) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`${styles.header} ${visible ? styles.show : styles.hide}`}>
      {/* Pass onClose prop to TopToggleBar */}
      <TopToggleBar onClose={() => setTopBarVisible(false)} /> 

      <div
        className={styles.headerContent}
        style={{ paddingTop: topBarVisible ? "3rem" : "1rem" }} // Adjust padding based on top bar visibility
      >
        <Link to="/" className={styles.logo} onClick={handleLinkClick}>
          <img src={Logo} alt="Small Sided Logo" />
        </Link>

        {/* ------------------ MOVED NAV INSIDE .headerContent ------------------ */}
        <nav
          ref={navRef}
          className={`${styles["main-nav"]} ${isOpen ? styles.open : ""}`}
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
      </div>
    </header>
  );
};

export default Header;
