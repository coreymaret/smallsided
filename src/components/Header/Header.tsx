import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import styles from "./Header.module.scss";
import Logo from "../../assets/logo.svg";
import TopToggleBar from "../TopToggleBar/TopToggleBar";

const Header = () => {
  const [menuState, setMenuState] = useState<"open" | "closing" | "closed" | undefined>("closed");
  const isOpen = menuState === "open";

  const [isMobile, setIsMobile] = useState(window.innerWidth < 785);
  const [topBarVisible, setTopBarVisible] = useState(true);

  const lastScrollY = useRef<number>(0);
  const [visible, setVisible] = useState(true);

  // Window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 785);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    }
  }, [isMobile, isOpen]);

  // Top bar visibility
  useEffect(() => {
    const topBarState = localStorage.getItem("topBarClosed");
    if (topBarState) {
      try {
        const data = JSON.parse(topBarState);
        const now = Date.now();
        const fortyEightHours = 48 * 60 * 60 * 1000;
        if (now - data.timestamp < fortyEightHours) setTopBarVisible(!data.closed);
        else setTopBarVisible(true);
      } catch {
        setTopBarVisible(true);
      }
    }
  }, []);

  // Scroll hide/show
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.body.scrollHeight;
      const nearBottom = documentHeight - (currentScrollY + windowHeight) < 200;

      if (nearBottom) setVisible(true);
      else if (currentScrollY > lastScrollY.current && currentScrollY > 100)
        setVisible(false);
      else setVisible(true);

      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle menu
  const toggleMenu = () => {
    if (menuState === "open") setMenuState("closing");
    else setMenuState("open");
  };

  const handleLinkClick = () => {
    if (isMobile && isOpen) setMenuState("closing");
  };

  return (
    <header className={`${styles.header} ${visible ? styles.show : styles.hide}`}>
      {topBarVisible && <TopToggleBar onClose={() => setTopBarVisible(false)} />}

      <div
        className={styles.headerContent}
        style={{ paddingTop: topBarVisible ? "3rem" : "1rem" }}
      >
        <Link to="/" className={styles.logo} onClick={handleLinkClick}>
          <img src={Logo} alt="Small Sided Logo" />
        </Link>

        <nav
          className={`${styles["main-nav"]} ${
            menuState === "open"
              ? styles.open
              : menuState === "closing"
              ? styles.closing
              : menuState === "closed"
              ? styles.closed
              : ""
          }`}
          onTransitionEnd={() => {
            if (menuState === "closing") setMenuState("closed");
          }}
        >
          {/* Links Section */}
          <div className={styles.linksSection}>
            <ul>
              <li>
                <Link to="/" onClick={handleLinkClick}>Home</Link>
              </li>
              <li>
                <Link to="/about" onClick={handleLinkClick}>About</Link>
              </li>
              <li>
                <Link to="/services" onClick={handleLinkClick}>Services</Link>
              </li>
              <li>
                <Link to="/work" onClick={handleLinkClick}>Work</Link>
              </li>
              <li>
                <Link to="/contact" onClick={handleLinkClick}>Contact</Link>
              </li>
              <li className={styles.ctaItem}>
                <Link to="/get-started" onClick={handleLinkClick} className={styles.ctaButton}>
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div className={styles.socialSection}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <Facebook size={28} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <Instagram size={28} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <Youtube size={28} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <Twitter size={28} />
            </a>
          </div>
        </nav>

        {isMobile && (
          <div
            className={`${styles.hamburger} ${isOpen ? styles.active : ""}`}
            onClick={toggleMenu}
            aria-label={isOpen ? "Close menu" : "Open menu"}
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