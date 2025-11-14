import { useEffect, useState } from "react";
// React hooks: useState for popup state, useEffect for lifecycle behavior

import styles from "./Popup.module.scss";
// CSS module for styling this popup component

import Logo from "../../assets/logo.svg";
// Image displayed inside the popup


// Extend the global window type so TypeScript knows these analytics functions may exist
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;   // Google Analytics
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void; // Plausible
    posthog?: { capture: (event: string, props?: Record<string, any>) => void };    // PostHog
  }
}

const Popup = () => {
  // Controls whether the popup is visible
  const [isOpen, setIsOpen] = useState(false);


  // ------------------------------------------------------------
  // Show popup with delay, but only if it hasn't been dismissed
  // within the last 48 hours
  // ------------------------------------------------------------
  useEffect(() => {
    const lastClosed = localStorage.getItem("popupClosedAt");

    if (lastClosed) {
      const diff = Date.now() - parseInt(lastClosed, 10);
      const hours48 = 48 * 60 * 60 * 1000;

      // User closed popup less than 48 hours ago → don't show again
      if (diff < hours48) return;
    }

    // Wait 3 seconds before showing popup
    const timer = setTimeout(() => {
      setIsOpen(true);

      // Track popup impression across analytics providers
      window.gtag?.("event", "popup_impression", { popup_name: "welcome_popup" });
      window.plausible?.("Popup Impression", { props: { name: "welcome_popup" } });
      window.posthog?.capture("popup_impression", { popup_name: "welcome_popup" });
    }, 3000);

    // Cleanup timeout on unmount
    return () => clearTimeout(timer);
  }, []);


  // ------------------------------------------------------------
  // Handle user clicking “Yes” or “No”
  // ------------------------------------------------------------
  const handleResponse = (response: "yes" | "no") => {
    // Store timestamp so popup won’t show again for 48 hours
    localStorage.setItem("popupClosedAt", Date.now().toString());

    // Close popup immediately
    setIsOpen(false);

    // Log the user's response
    window.gtag?.("event", "popup_response", {
      popup_name: "welcome_popup",
      response,
    });

    window.plausible?.("Popup Response", {
      props: { name: "welcome_popup", response },
    });

    window.posthog?.capture("popup_response", {
      popup_name: "welcome_popup",
      response,
    });
  };


  // If popup is not open, render nothing
  if (!isOpen) return null;


  // ------------------------------------------------------------
  // Popup markup
  // ------------------------------------------------------------
  return (
    // Clicking outside popup counts as "no"
    <div className={styles.overlay} onClick={() => handleResponse("no")}>

      {/* Stop clicks inside popup from closing it */}
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>

        {/* Close button at top-right */}
        <button className={styles.closeIcon} onClick={() => handleResponse("no")}>
          ×
        </button>

        {/* Logo image inside popup */}
        <img src={Logo} alt="Popup" className={styles.image} />

        <h2 className={styles.title}>Welcome to Small Sided!</h2>

        <p className={styles.text}>
          This popup appears after 3 seconds, remembers your choice for 48 hours,
          and logs impressions and button clicks for analytics.
        </p>

        <div className={styles.buttons}>
          {/* User wants to learn more */}
          <button className={styles.btnYes} onClick={() => handleResponse("yes")}>
            Learn More
          </button>

          {/* User declines */}
          <button className={styles.btnNo} onClick={() => handleResponse("no")}>
            No Thanks
          </button>
        </div>

      </div>
    </div>
  );
};

export default Popup;
