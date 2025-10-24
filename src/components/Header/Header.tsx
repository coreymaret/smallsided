// Header.tsx

// Import React hooks and tools for component logic
import { useState, useRef, useEffect } from "react";
// Import the `Link` component from React Router for client-side navigation
import { Link } from "react-router-dom";
// Import CSS module styles scoped to this component
import styles from "./Header.module.scss";
// Import a logo image file (bundled by your build tool, e.g. Vite or Webpack)
import Logo from "../../assets/logo.svg";

// Define a React functional component named `Header`
const Header = () => {
  /**
   * STATE VARIABLES
   * ----------------
   */

  // `isOpen` keeps track of whether the mobile navigation menu is open or closed
  const [isOpen, setIsOpen] = useState(false);

  // `isMobile` determines if the current screen size is smaller than 785px
  // (you can adjust this breakpoint based on your design)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 785);

  // `navRef` gives us a reference to the <nav> DOM element
  // useRef is initialized with `null` because the element doesn't exist until render
  const navRef = useRef<HTMLElement | null>(null);

  // `navHeight` stores the height of the navigation menu so we can animate it
  const [navHeight, setNavHeight] = useState(0);

  /**
   * EFFECT 1: Handle window resize
   * ------------------------------
   * This useEffect adds an event listener that updates `isMobile`
   * whenever the window resizes. It ensures the component reacts
   * dynamically when the user changes screen width.
   */
  useEffect(() => {
    // Function to check the current screen width and update `isMobile`
    const handleResize = () => setIsMobile(window.innerWidth < 785);

    // Attach the event listener to the window
    window.addEventListener("resize", handleResize);

    // Cleanup function: remove the event listener when the component unmounts
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty dependency array → runs only once (on mount/unmount)

  /**
   * EFFECT 2: Update navigation height
   * ----------------------------------
   * When the menu is open on mobile, we measure the nav’s height so that
   * we can set a max-height dynamically (used for smooth CSS transitions).
   */
  useEffect(() => {
    // Only measure height when on mobile view
    if (navRef.current && isMobile) {
      // scrollHeight = the full height of the element’s content (even if hidden)
      setNavHeight(navRef.current.scrollHeight);
    }
  }, [isOpen, isMobile]); 
  // Runs whenever `isOpen` or `isMobile` changes

  /**
   * Function to handle link clicks
   * ------------------------------
   * On mobile, when a navigation link is clicked,
   * we want to automatically close the hamburger menu.
   */
  const handleLinkClick = () => {
    if (isMobile) setIsOpen(false);
  };

  /**
   * JSX RETURN
   * -----------
   * This is what gets rendered to the DOM.
   * It includes the logo, navigation links, and hamburger button (on mobile).
   */
  return (
    <header className={styles.header}>
      {/* Logo: Clicking it navigates home and closes the menu (on mobile) */}
      <Link to="/" className={styles.logo} onClick={handleLinkClick}>
        <img src={Logo} alt="Small Sided Logo" />
      </Link>

      {/* Main navigation area */}
      <nav
        ref={navRef} // Connects the DOM element to `navRef`
        // Combine base nav styles with 'open' class if menu is toggled
        className={`${styles["main-nav"]} ${isOpen ? styles.open : ""}`}
        // Apply inline style only when mobile: set maxHeight for animation
        style={isMobile ? { maxHeight: isOpen ? `${navHeight}px` : 0 } : {}}
      >
        <ul>
          {/* Each Link navigates to a different route and closes the menu if mobile */}
          <li><Link to="/" onClick={handleLinkClick}>Home</Link></li>
          <li><Link to="/about" onClick={handleLinkClick}>About</Link></li>
          <li><Link to="/services" onClick={handleLinkClick}>Services</Link></li>
          <li><Link to="/work" onClick={handleLinkClick}>Work</Link></li>
          <li><Link to="/contact" onClick={handleLinkClick}>Contact</Link></li>
        </ul>
      </nav>

      {/* Hamburger icon appears only on mobile view */}
      {isMobile && (
        <div
          // Apply base hamburger class plus 'active' when the menu is open
          className={`${styles.hamburger} ${isOpen ? styles.active : ""}`}
          // Clicking toggles menu open/close state
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* The three spans form the lines of the hamburger icon */}
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
    </header>
  );
};

// Export the Header component so it can be imported elsewhere
export default Header;
