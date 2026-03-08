import { useState, useEffect } from "react";
// React state + lifecycle hooks

import { useTranslation } from 'react-i18next';

import { BellRing, AlertCircle, Smile } from '../../components/Icons/Icons';
// Icons used in the component UI

import styles from "./Subscribe.module.scss";
// CSS module for styling

import subscribeBG from "../../assets/subscribeBG.webp";
// Background image for the subscription card


// Extend the window interface so TypeScript knows Mailchimp will call this global function
declare global {
  interface Window {
    mailchimpCallback: (data: any) => void;
  }
}


const Subscribe = () => {
  const { t } = useTranslation();

  // The email value typed by the user
  const [email, setEmail] = useState("");

  // Subscription state: idle → success or error
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  // Holds validation or API error messages
  const [error, setError] = useState("");

  // Tracks whether the request to Mailchimp is currently running
  const [isSubmitting, setIsSubmitting] = useState(false);


  // ---------------------------------------------------------
  // Reset the success message after 5 seconds
  // ---------------------------------------------------------
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        setStatus("idle");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);


  // ---------------------------------------------------------
  // Submit the email to Mailchimp via JSONP (script injection)
  // ---------------------------------------------------------
  const submitToMailchimp = () => {
    console.log("🔵 [Mailchimp] Starting submission for:", email);

    // Build the Mailchimp JSONP endpoint URL
    const url = `https://smallsided.us9.list-manage.com/subscribe/post-json?u=2558bfaca57f1f8d04039dde6&id=5d74a6b50e&EMAIL=${encodeURIComponent(
      email
    )}&c=mailchimpCallback`;

    console.log("🔵 [Mailchimp] Request URL:", url);

    // Mailchimp will call this global callback with its response
    window.mailchimpCallback = (data: any) => {
      console.log("📥 [Mailchimp] Response received:", JSON.stringify(data, null, 2));

      // Form request is done
      setIsSubmitting(false);

      if (data.result === "success") {
        console.log("✅ [Mailchimp] Subscription successful!");
        setStatus("success");
        setEmail("");   // Clear form
        setError("");   // Clear errors
      } else {
        console.log("❌ [Mailchimp] Subscription failed:", data.msg);
        setStatus("error");

        // Clean up Mailchimp's error message (removes digits + HTML)
        const errorMsg = data.msg || t('subscribe.errors.generic');
        setError(errorMsg.replace(/\d+ - /, "").replace(/<[^>]*>/g, ""));
      }
    };

    // Create a script tag to dynamically load Mailchimp JSONP response
    const script = document.createElement("script");
    script.src = url;

    // If the script fails to load, treat it as a network error
    script.onerror = () => {
      console.error("❌ [Mailchimp] Script load failed");
      setIsSubmitting(false);
      setStatus("error");
      setError(t('subscribe.errors.network'));
    };

    // Add to page so it executes
    document.body.appendChild(script);

    // Remove script after it loads to avoid clutter
    script.onload = () => {
      console.log("🟢 [Mailchimp] Script loaded");

      setTimeout(() => {
        if (script.parentNode) {
          document.body.removeChild(script);
        }
      }, 100);
    };
  };


  // ---------------------------------------------------------
  // Validate user input then call Mailchimp submission
  // ---------------------------------------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔵 [Form] Submit triggered for email:", email);

    setError(""); 
    setStatus("idle");

    // Empty email validation
    if (!email.trim()) {
      console.log("⚠️ [Validation] Empty email");
      setError(t('subscribe.errors.emptyEmail'));
      return;
    }

    // Basic email pattern check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log("⚠️ [Validation] Invalid email format");
      setError(t('subscribe.errors.invalidEmail'));
      return;
    }

    console.log("✅ [Validation] Email valid");

    // Begin request
    setIsSubmitting(true);
    submitToMailchimp();
  };


  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  return (
    <section className={styles["subscribe-cta"]}>
      <div className={styles["subscribe-card"]}>
        {/* Background image as actual <img> tag for better performance */}
        <img 
          src={subscribeBG}
          alt=""
          className={styles["subscribe-bg-image"]}
          loading="lazy"
          decoding="async"
          width="896"
          height="400"
        />
        
        <div className={styles["subscribe-container"]}>
          
          {/* Heading + description */}
          <div className={styles["subscribe-content"]}>
            <div className={styles["subscribe-title-wrapper"]}>
              <BellRing className={styles["subscribe-icon"]} />
              <h2 className={styles["subscribe-title"]}>{t('subscribe.heading')}</h2>
            </div>

            <p className={styles["subscribe-description"]}>
              {t('subscribe.description')}
            </p>
          </div>

          {/* Subscription form */}
          <form
            className={styles["subscribe-form"]}
            onSubmit={handleSubmit}
            noValidate
          >
            <div className={styles["input-wrapper"]}>
              <input
                type="email"
                className={styles["subscribe-input"]}
                placeholder={t('subscribe.placeholder')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(""); // clear error as user types
                }}
                disabled={status === "success" || isSubmitting}
              />

              <button
                type="submit"
                className={styles["subscribe-button"]}
                disabled={status === "success" || isSubmitting}
              >
                {isSubmitting
                  ? t('subscribe.subscribing')
                  : status === "success"
                  ? t('subscribe.subscribed')
                  : t('subscribe.subscribe')}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <p className={`${styles["subscribe-message"]} ${styles.error}`}>
                <AlertCircle
                  size={16}
                  style={{ marginRight: "6px", verticalAlign: "middle" }}
                />
                {error}
              </p>
            )}

            {/* Success message */}
            {status === "success" && (
              <p className={`${styles["subscribe-message"]} ${styles.success}`}>
                <Smile
                  size={16}
                  style={{ marginRight: "6px", verticalAlign: "middle" }}
                />
                {t('subscribe.successMessage')}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default Subscribe;