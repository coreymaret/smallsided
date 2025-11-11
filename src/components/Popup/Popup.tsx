import { useEffect, useState } from "react";
import styles from "./Popup.module.scss";
import Logo from "../../assets/logo.svg";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
    posthog?: { capture: (event: string, props?: Record<string, any>) => void };
  }
}

const Popup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const lastClosed = localStorage.getItem("popupClosedAt");
    if (lastClosed) {
      const diff = Date.now() - parseInt(lastClosed, 10);
      const hours48 = 48 * 60 * 60 * 1000;
      if (diff < hours48) return; // don’t show if within 48h
    }

    // 👇 Delay showing popup for 3 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
      window.gtag?.("event", "popup_impression", { popup_name: "welcome_popup" });
      window.plausible?.("Popup Impression", { props: { name: "welcome_popup" } });
      window.posthog?.capture("popup_impression", { popup_name: "welcome_popup" });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleResponse = (response: "yes" | "no") => {
    localStorage.setItem("popupClosedAt", Date.now().toString());
    setIsOpen(false);

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

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => handleResponse("no")}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeIcon} onClick={() => handleResponse("no")}>
          ×
        </button>

        <img src={Logo} alt="Popup" className={styles.image} />

        <h2 className={styles.title}>Welcome to Small Sided!</h2>
        <p className={styles.text}>
          This popup appears after 3 seconds, remembers your choice for 48 hours,
          and logs impressions and button clicks for analytics.
        </p>

        <div className={styles.buttons}>
          <button className={styles.btnYes} onClick={() => handleResponse("yes")}>
            Learn More
          </button>
          <button className={styles.btnNo} onClick={() => handleResponse("no")}>
            No Thanks
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
