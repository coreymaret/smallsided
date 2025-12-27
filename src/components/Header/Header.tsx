import { useState, useRef, useEffect } from "react";
// React hooks for state, DOM references, and lifecycle behavior

import { Link } from "react-router-dom";
// Used for internal navigation without reloading the page

import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";
// Social media icon components

import styles from "./Header.module.scss";
// CSS modules for scoped header styling

import Logo from "../../assets/logo.svg";
// Logo image

import TopToggleBar from "../TopToggleBar/TopToggleBar";
// A dismissible top bar displayed above the header


const Header = () => {
  // Tracks the state of the mobile menu: open → closing → closed
  const [menuState, setMenuState] =
    useState<"open" | "closing" | "closed" | undefined>("closed");

  // Boolean for convenience (menu is fully open)
  const isOpen = menuState === "open";

  // Track if the screen is mobile width (<785px)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 785);

  // Tracks whether the top toggle bar should be visible
  const [topBarVisible, setTopBarVisible] = useState(true);

  // Stores last known scroll position (mutable via useRef without rerenders)
  const lastScrollY = useRef<number>(0);

  // Controls whether the entire header is visible (shown/hidden on scroll)
  const [visible, setVisible] = useState(true);


  // -----------------------------
  // Window resize listener
  // -----------------------------
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 785);

    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  // -----------------------------
  // Lock body scroll when mobile menu is open
  // -----------------------------
  useEffect(() => {
    if (isMobile && isOpen) {
      // Prevent the background from scrolling while menu is open
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
    } else {
      // Reset body styles when menu closes
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    }
  }, [isMobile, isOpen]);


  // -----------------------------
  // Load top bar visibility from localStorage
  // -----------------------------
  useEffect(() => {
    const topBarState = localStorage.getItem("topBarClosed");

    if (topBarState) {
      try {
        const data = JSON.parse(topBarState);
        const now = Date.now();
        const fortyEightHours = 48 * 60 * 60 * 1000;

        // If dismissed within last 48 hours → keep hidden
        if (now - data.timestamp < fortyEightHours)
          setTopBarVisible(!data.closed);
        else
          setTopBarVisible(true);

      } catch {
        // If JSON parsing fails, show the bar
        setTopBarVisible(true);
      }
    }
  }, []);


  // -----------------------------
  // Auto-hide header on scroll down, show on scroll up
  // -----------------------------
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      const windowHeight = window.innerHeight;
      const documentHeight = document.body.scrollHeight;

      // Keep header visible when near bottom of page
      const nearBottom =
        documentHeight - (currentScrollY + windowHeight) < 200;

      if (nearBottom) setVisible(true);
      else if (currentScrollY > lastScrollY.current && currentScrollY > 100)
        // Hide header when scrolling down past 100px
        setVisible(false);
      else
        // Show header when scrolling up
        setVisible(true);

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  // -----------------------------
  // Toggle mobile menu open/close
  // -----------------------------
  const toggleMenu = () => {
    if (menuState === "open") setMenuState("closing");
    else setMenuState("open");
  };


  // When clicking a link, close menu on mobile
  const handleLinkClick = () => {
    if (isMobile && isOpen) setMenuState("closing");
  };


  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <header
      className={`${styles.header} ${visible ? styles.show : styles.hide}`}
    >
      {/* Optional top-of-page bar */}
      {topBarVisible && (
        <TopToggleBar onClose={() => setTopBarVisible(false)} />
      )}

      <div
        className={styles.headerContent}
        // Pushes header down when top bar visible so layout doesn't overlap
        style={{ paddingTop: topBarVisible ? "3rem" : "1rem" }}
      >
        {/* Logo (click scrolls to top + closes menu if mobile) */}
        <Link to="/" className={styles.logo} onClick={handleLinkClick}>
          <img src={Logo} alt="Small Sided Logo" />
        </Link>

        {/* Navigation menu with dynamic animation classes */}
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
            // After closing animation finishes → set to fully closed state
            if (menuState === "closing") setMenuState("closed");
          }}
        >
          {/* ----------------------------- */}
          {/* Internal Navigation Links     */}
          {/* ----------------------------- */}
          <div className={styles.linksSection}>
            <ul>
              <li><Link to="/" onClick={handleLinkClick}>Home</Link></li>
              <li><Link to="/about" onClick={handleLinkClick}>About</Link></li>
              <li><Link to="/exercises" onClick={handleLinkClick}>Exercises</Link></li>
              <li><Link to="/work" onClick={handleLinkClick}>Work</Link></li>
              <li><Link to="/blog" onClick={handleLinkClick}>Blog</Link></li>
              <li><Link to="/contact" onClick={handleLinkClick}>Contact</Link></li>

              {/* Call-to-action button in menu */}
              <li className={styles.ctaItem}>
                <Link
                  to="/get-started"
                  onClick={handleLinkClick}
                  className={styles.ctaButton}
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* ----------------------------- */}
          {/* Social Media Icons            */}
          {/* ----------------------------- */}
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

        {/* Hamburger button for mobile view */}
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
// Exporting so this component can be used throughout the app
