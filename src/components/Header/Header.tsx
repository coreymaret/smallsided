import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Facebook, Instagram, Youtube, Twitter, Calendar, Trophy, Users, Cake, ChevronDown,ChartNoAxesCombined, Smile } from '../../components/Icons/Icons';
import styles from "./Header.module.scss";
import Logo from "../../assets/logo.svg";
import { useMobileMenu } from "../../contexts/MobileMenuContext";

const Header = () => {
  const location = useLocation();
  const { setIsHeaderMenuOpen } = useMobileMenu();
  const [menuState, setMenuState] = useState<"open" | "closing" | "closed" | undefined>("closed");
  const isOpen = menuState === "open";
  const [isMobile, setIsMobile] = useState(window.innerWidth < 785);
  const lastScrollY = useRef<number>(0);
  const [visible, setVisible] = useState(true);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [menuAnimationComplete, setMenuAnimationComplete] = useState(false);
  const [servicesAnimationComplete, setServicesAnimationComplete] = useState(false);
  const megaMenuTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 785);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update context when menu state changes
  useEffect(() => {
    setIsHeaderMenuOpen(isOpen);
  }, [isOpen, setIsHeaderMenuOpen]);

  useEffect(() => {
    if (isMobile && isOpen) {
      // Calculate scrollbar width before hiding it
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // Also add padding to header to prevent shift
      const headerElement = document.querySelector('header');
      if (headerElement) {
        (headerElement as HTMLElement).style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      
      // Reset header padding
      const headerElement = document.querySelector('header');
      if (headerElement) {
        (headerElement as HTMLElement).style.paddingRight = "";
      }
      
      // Close services submenu when mobile menu closes
      if (isMobile) {
        setMobileServicesOpen(false);
      }
    }
  }, [isMobile, isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      // Don't hide header when mobile menu is open
      if (isOpen) {
        setVisible(true);
        return;
      }

      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.body.scrollHeight;
      const nearBottom = documentHeight - (currentScrollY + windowHeight) < 200;

      if (nearBottom) setVisible(true);
      else if (currentScrollY > lastScrollY.current && currentScrollY > 100)
        setVisible(false);
      else
        setVisible(true);

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  const toggleMenu = () => {
    if (menuState === "open") {
      setMenuState("closing");
      setMenuAnimationComplete(false);
    } else {
      setMenuState("open");
      // Enable hover effects after the longest animation completes (0.7s + 0.5s animation + 0.1s buffer)
      setTimeout(() => {
        setMenuAnimationComplete(true);
      }, 1300);
    }
  };

  const handleLinkClick = () => {
    if (isMobile && isOpen) setMenuState("closing");
    setMegaMenuOpen(false);
    setMobileServicesOpen(false);
  };

  const toggleMobileServices = (e: React.MouseEvent) => {
    e.preventDefault();
    if (mobileServicesOpen) {
      setMobileServicesOpen(false);
      setServicesAnimationComplete(false);
    } else {
      setMobileServicesOpen(true);
      // Enable hover effects after the longest animation completes (0.25s + 0.4s animation + 0.1s buffer)
      setTimeout(() => {
        setServicesAnimationComplete(true);
      }, 750);
    }
  };

  const handleServicesMouseEnter = () => {
    if (!isMobile) {
      if (megaMenuTimeoutRef.current) {
        clearTimeout(megaMenuTimeoutRef.current);
      }
      setMegaMenuOpen(true);
    }
  };

  const handleServicesMouseLeave = () => {
    // Don't close immediately - let handleMegaMenuMouseLeave handle it
  };

  const handleMegaMenuMouseEnter = () => {
    if (!isMobile) {
      setMegaMenuOpen(true);
    }
  };

  const handleMegaMenuMouseLeave = () => {
    if (!isMobile) {
      setMegaMenuOpen(false);
    }
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const serviceItems = [
    {
      title: "Field Rentals",
      path: "/services/field-rental",
      icon: Calendar,
      description: "Book premium small-sided fields"
    },
    {
      title: "Leagues",
      path: "/services/leagues",
      icon: Trophy,
      description: "Join competitive small-sided leagues"
    },
    {
      title: "Pickup",
      path: "/services/pickup",
      icon: Users,
      description: "Drop-in games and open play"
    },
    {
      title: "Birthday Parties",
      path: "/services/birthday-parties",
      icon: Cake,
      description: "Unforgettable soccer celebrations"
    },
    {
      title: "Camps",
      path: "/services/camps",
      icon: Smile,
      description: "Skill development programs"
    },
    {
      title: "Training",
      path: "/services/training",
      icon: ChartNoAxesCombined,
      description: "Skill development programs"
    }
  ];

  return (
    <>
      <header 
        className={`${styles.header} ${visible ? styles.show : styles.hide}`}
      >
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo} onClick={handleLinkClick}>
            <img src={Logo} alt="Small Sided Logo" width="180" height="40" />
          </Link>

          {/* Desktop Nav - inside header */}
          {!isMobile && (
            <nav className={styles["main-nav"]}>
              <div className={styles.linksSection}>
                <ul>
                  <li>
                    <Link to="/" onClick={handleLinkClick} className={isActive("/") ? styles.active : ""}>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" onClick={handleLinkClick} className={isActive("/about") ? styles.active : ""}>
                      About
                    </Link>
                  </li>
                  <li
                    className={styles.servicesItem}
                    onMouseEnter={handleServicesMouseEnter}
                    onMouseLeave={handleServicesMouseLeave}
                  >
                    <span className={`${styles.servicesLabel} ${isActive("/services") ? styles.active : ""}`}>
                      Services
                    </span>
                    
                    {/* Desktop Mega Menu */}
                    <div
                      className={`${styles.megaMenu} ${megaMenuOpen ? styles.megaMenuOpen : ""}`}
                      onMouseEnter={handleMegaMenuMouseEnter}
                      onMouseLeave={handleMegaMenuMouseLeave}
                    >
                      <div className={styles.megaMenuContent}>
                        {serviceItems.map((item, index) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`${styles.megaMenuItem} ${isActive(item.path) ? styles.active : ''}`}
                            onClick={handleLinkClick}
                            style={{ transitionDelay: `${index * 0.05}s` }}
                          >
                            <div className={styles.megaMenuIcon}>
                              <item.icon size={24} />
                            </div>
                            <div className={styles.megaMenuText}>
                              <h3>{item.title}</h3>
                              <p>{item.description}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </li>
                  <li>
                    <Link to="/blog" onClick={handleLinkClick} className={isActive("/blog") ? styles.active : ""}>
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" onClick={handleLinkClick} className={isActive("/contact") ? styles.active : ""}>
                      Contact
                    </Link>
                  </li>

                  <li className={styles.ctaItem}>
                    <Link to="/get-started" onClick={handleLinkClick} className={styles.ctaButton}>
                      Get Started
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          )}

          {isMobile && (
            <button
              className={`${styles.hamburger} ${isOpen ? styles.active : ""}`}
              onClick={toggleMenu}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile Nav - outside header */}
      {isMobile && (
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
          data-hover-enabled={menuAnimationComplete ? "true" : "false"}
          onTransitionEnd={() => {
            if (menuState === "closing") setMenuState("closed");
          }}
        >
          <div className={styles.linksSection}>
            <ul>
              <li>
                <Link to="/" onClick={handleLinkClick} className={isActive("/") ? styles.active : ""}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={handleLinkClick} className={isActive("/about") ? styles.active : ""}>
                  About
                </Link>
              </li>
              <li className={styles.servicesItem}>
                <button
                  className={styles.servicesToggle}
                  onClick={toggleMobileServices}
                >
                  <span>Services</span>
                  <ChevronDown 
                    size={20} 
                    className={`${styles.chevron} ${mobileServicesOpen ? styles.chevronOpen : ''}`}
                  />
                </button>
                
                {/* Mobile Mega Menu Cards */}
                <div 
                  className={`${styles.mobileServiceCards} ${mobileServicesOpen ? styles.mobileServiceCardsOpen : ''}`}
                  data-hover-enabled={servicesAnimationComplete ? "true" : "false"}
                >
                  {serviceItems.map((item, index) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`${styles.mobileServiceCard} ${isActive(item.path) ? styles.active : ''}`}
                      onClick={handleLinkClick}
                      style={{ transitionDelay: mobileServicesOpen ? `${index * 0.05}s` : '0s' }}
                    >
                      <div className={styles.mobileServiceIcon}>
                        <item.icon size={24} />
                      </div>
                      <div className={styles.mobileServiceText}>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </li>
              <li>
                <Link to="/blog" onClick={handleLinkClick} className={isActive("/blog") ? styles.active : ""}>
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={handleLinkClick} className={isActive("/contact") ? styles.active : ""}>
                  Contact
                </Link>
              </li>

              <li className={styles.ctaItem}>
                <Link to="/get-started" onClick={handleLinkClick} className={styles.ctaButton}>
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.socialSection}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Visit our Facebook page">
              <Facebook size={28} aria-hidden="true" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Visit our Instagram page">
              <Instagram size={28} aria-hidden="true" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="Visit our YouTube channel">
              <Youtube size={28} aria-hidden="true" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Visit our Twitter page">
              <Twitter size={28} aria-hidden="true" />
            </a>
          </div>
        </nav>
      )}
    </>
  );
};

export default Header;