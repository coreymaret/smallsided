import { useState, useEffect } from "react";
// React state + lifecycle hooks

import { BellRing, AlertCircle, Smile } from "lucide-react";
// Icons used in the component UI

import styles from "./Subscribe.module.scss";
// CSS module for styling

import subscribeBG from "../../assets/subscribeBG.png";
// Background image for the subscription card


// Extend the window interface so TypeScript knows Mailchimp will call this global function
declare global {
  interface Window {
    mailchimpCallback: (data: any) => void;
  }
}


const Subscribe = () => {
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
        const errorMsg = data.msg || "Something went wrong. Please try again.";
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
      setError("Network error. Please try again.");
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
      setError("Please enter your email address.");
      return;
    }

    // Basic email pattern check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log("⚠️ [Validation] Invalid email format");
      setError("Please enter a valid email address.");
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
      <div
        className={styles["subscribe-card"]}
        style={{ backgroundImage: `url(${subscribeBG})` }}
      >
        <div className={styles["subscribe-container"]}>
          
          {/* Heading + description */}
          <div className={styles["subscribe-content"]}>
            <div className={styles["subscribe-title-wrapper"]}>
              <BellRing className={styles["subscribe-icon"]} />
              <h2 className={styles["subscribe-title"]}>Stay in the Loop</h2>
            </div>

            <p className={styles["subscribe-description"]}>
              Get the latest updates, exclusive content, and insights delivered
              straight to your inbox.
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
                placeholder="Enter your email"
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
                  ? "Subscribing..." // during request
                  : status === "success"
                  ? "Subscribed!"   // after success
                  : "Subscribe" /* default */}
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
                Thanks for subscribing! Check your inbox.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default Subscribe;
