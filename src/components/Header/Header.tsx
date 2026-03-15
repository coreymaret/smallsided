import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Facebook, Instagram, Youtube, Twitter, Calendar, Trophy, Users, Cake, ChevronDown, ChartNoAxesCombined, Smile } from '../../components/Icons/Icons';
import styles from "./Header.module.scss";
import Logo from "../../assets/logo.svg";
import { useMobileMenu } from "../../contexts/MobileMenuContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { routePairs } from "../../constants/routePairs";
import { useAccount } from "../../contexts/AccountContext";
import AccountNavButton from "../AccountNavButton/AccountNavButton";

const DesktopLanguageToggle = lazy(() =>
  import("../../components/LanguageToggle/LanguageToggle").then(m => ({ default: m.DesktopLanguageToggle }))
);
const MobileLanguageToggle = lazy(() =>
  import("../../components/LanguageToggle/LanguageToggle").then(m => ({ default: m.MobileLanguageToggle }))
);

const Header = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { isSpanish } = useLanguage();
  const { setIsHeaderMenuOpen } = useMobileMenu();
  const { user, isCustomer } = useAccount();
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

  const lp = (enPath: string) => isSpanish ? (routePairs[enPath] ?? enPath) : enPath;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 785);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsHeaderMenuOpen(isOpen);
  }, [isOpen, setIsHeaderMenuOpen]);

  useEffect(() => {
    if (isMobile && isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      const headerElement = document.querySelector('header');
      if (headerElement) (headerElement as HTMLElement).style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      const headerElement = document.querySelector('header');
      if (headerElement) (headerElement as HTMLElement).style.paddingRight = "";
      if (isMobile) setMobileServicesOpen(false);
    }
  }, [isMobile, isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) { setVisible(true); return; }
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.body.scrollHeight;
      const nearBottom = documentHeight - (currentScrollY + windowHeight) < 200;
      if (nearBottom) setVisible(true);
      else if (currentScrollY > lastScrollY.current && currentScrollY > 100) setVisible(false);
      else setVisible(true);
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
      setTimeout(() => setMenuAnimationComplete(true), 1300);
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
      setTimeout(() => setServicesAnimationComplete(true), 750);
    }
  };

  const handleServicesMouseEnter = () => {
    if (!isMobile) {
      if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
      setMegaMenuOpen(true);
    }
  };

  const handleServicesMouseLeave = () => {};
  const handleMegaMenuMouseEnter = () => { if (!isMobile) setMegaMenuOpen(true); };
  const handleMegaMenuMouseLeave = () => { if (!isMobile) setMegaMenuOpen(false); };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const serviceItems = [
    { title: t('services.fieldRentals.title'),    path: "/services/field-rental",     icon: Calendar,            description: t('services.fieldRentals.description') },
    { title: t('services.leagues.title'),         path: "/services/leagues",           icon: Trophy,              description: t('services.leagues.description') },
    { title: t('services.pickup.title'),          path: "/services/pickup",            icon: Users,               description: t('services.pickup.description') },
    { title: t('services.birthdayParties.title'), path: "/services/birthday-parties", icon: Cake,                description: t('services.birthdayParties.description') },
    { title: t('services.camps.title'),           path: "/services/camps",             icon: Smile,               description: t('services.camps.description') },
    { title: t('services.training.title'),        path: "/services/training",          icon: ChartNoAxesCombined, description: t('services.training.description') },
  ];

  return (
    <>
      <header className={`${styles.header} ${visible ? styles.show : styles.hide}`}>
        <div className={styles.headerContent}>
          <Link to={isSpanish ? "/es/" : "/"} className={styles.logo} onClick={handleLinkClick}>
            <img src={Logo} alt="Small Sided Logo" width="180" height="40" />
          </Link>

          {/* Desktop Nav */}
          {!isMobile && (
            <nav className={styles["main-nav"]}>
              <div className={styles.linksSection}>
                <ul>
                  <li>
                    <Link to={lp("/")} onClick={handleLinkClick} className={isActive("/") ? styles.active : ""}>
                      {t('nav.home')}
                    </Link>
                  </li>
                  <li>
                    <Link to={lp("/about")} onClick={handleLinkClick} className={isActive("/about") ? styles.active : ""}>
                      {t('nav.about')}
                    </Link>
                  </li>
                  <li className={styles.servicesItem} onMouseEnter={handleServicesMouseEnter} onMouseLeave={handleServicesMouseLeave}>
                    <span className={`${styles.servicesLabel} ${isActive("/services") ? styles.active : ""}`}>
                      {t('nav.services')}
                    </span>
                    <div
                      className={`${styles.megaMenu} ${megaMenuOpen ? styles.megaMenuOpen : ""}`}
                      onMouseEnter={handleMegaMenuMouseEnter}
                      onMouseLeave={handleMegaMenuMouseLeave}
                    >
                      <div className={styles.megaMenuContent}>
                        {serviceItems.map((item, index) => (
                          <Link
                            key={item.path}
                            to={lp(item.path)}
                            className={`${styles.megaMenuItem} ${isActive(item.path) ? styles.active : ''}`}
                            onClick={handleLinkClick}
                            style={{ transitionDelay: `${index * 0.05}s` }}
                          >
                            <div className={styles.megaMenuIcon}><item.icon size={24} /></div>
                            <div className={styles.megaMenuText}><h3>{item.title}</h3><p>{item.description}</p></div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </li>
                  <li>
                    <Link to={lp("/blog")} onClick={handleLinkClick} className={isActive("/blog") ? styles.active : ""}>
                      {t('nav.blog')}
                    </Link>
                  </li>
                  <li>
                    <Link to={lp("/contact")} onClick={handleLinkClick} className={isActive("/contact") ? styles.active : ""}>
                      {t('nav.contact')}
                    </Link>
                  </li>

                  {/* Desktop CTA — Get Started or account avatar */}
                  <li className={styles.ctaItem}>
                    {isCustomer ? (
                      <AccountNavButton />
                    ) : (
                      <Link to="/account/login" onClick={handleLinkClick} className={styles.ctaButton}>
                        {t('nav.getStarted')}
                      </Link>
                    )}
                  </li>

                  <li className={styles.languageToggleItem}>
                    <Suspense fallback={null}><DesktopLanguageToggle /></Suspense>
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

      {/* Mobile Nav */}
      {isMobile && (
        <nav
          className={`${styles["main-nav"]} ${
            menuState === "open" ? styles.open :
            menuState === "closing" ? styles.closing :
            menuState === "closed" ? styles.closed : ""
          }`}
          data-hover-enabled={menuAnimationComplete ? "true" : "false"}
          onTransitionEnd={() => { if (menuState === "closing") setMenuState("closed"); }}
        >
          <div className={styles.linksSection}>
            <ul>
              <li>
                <Link to={lp("/")} onClick={handleLinkClick} className={isActive("/") ? styles.active : ""}>
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to={lp("/about")} onClick={handleLinkClick} className={isActive("/about") ? styles.active : ""}>
                  {t('nav.about')}
                </Link>
              </li>
              <li className={styles.servicesItem}>
                <button className={styles.servicesToggle} onClick={toggleMobileServices}>
                  <span>{t('nav.services')}</span>
                  <ChevronDown size={20} className={`${styles.chevron} ${mobileServicesOpen ? styles.chevronOpen : ''}`} />
                </button>
                <div
                  className={`${styles.mobileServiceCards} ${mobileServicesOpen ? styles.mobileServiceCardsOpen : ''}`}
                  data-hover-enabled={servicesAnimationComplete ? "true" : "false"}
                >
                  {serviceItems.map((item, index) => (
                    <Link
                      key={item.path}
                      to={lp(item.path)}
                      className={`${styles.mobileServiceCard} ${isActive(item.path) ? styles.active : ''}`}
                      onClick={handleLinkClick}
                      style={{ transitionDelay: mobileServicesOpen ? `${index * 0.05}s` : '0s' }}
                    >
                      <div className={styles.mobileServiceIcon}><item.icon size={24} /></div>
                      <div className={styles.mobileServiceText}><h3>{item.title}</h3><p>{item.description}</p></div>
                    </Link>
                  ))}
                </div>
              </li>
              <li>
                <Link to={lp("/blog")} onClick={handleLinkClick} className={isActive("/blog") ? styles.active : ""}>
                  {t('nav.blog')}
                </Link>
              </li>
              <li>
                <Link to={lp("/contact")} onClick={handleLinkClick} className={isActive("/contact") ? styles.active : ""}>
                  {t('nav.contact')}
                </Link>
              </li>

              {/* Mobile CTA — Get Started or account avatar */}
              <li className={styles.ctaItem}>
                {isCustomer ? (
                  <div className={styles.mobileAccountBtn}>
                    <AccountNavButton />
                  </div>
                ) : (
                  <Link to="/account/login" onClick={handleLinkClick} className={styles.ctaButton}>
                    {t('nav.getStarted')}
                  </Link>
                )}
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

          <Suspense fallback={null}>
            <MobileLanguageToggle menuIsOpen={isOpen} />
          </Suspense>
        </nav>
      )}
    </>
  );
};

export default Header;
