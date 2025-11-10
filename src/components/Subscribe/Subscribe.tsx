import { useState, useEffect, useRef } from "react";
import { BellRing, AlertCircle, Smile } from "lucide-react";
import styles from "./Subscribe.module.scss";
import subscribeBG from "../../assets/subscribeBG.png";

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

const Subscribe = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recaptchaRef = useRef<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Load reCAPTCHA script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    window.onRecaptchaLoad = () => {
      if (window.grecaptcha && formRef.current) {
        recaptchaRef.current = window.grecaptcha.render("recaptcha-container", {
          sitekey: "6LdkcAgsAAAAAHJJfTjEL3RaCIqhB4aO5keXHsVe", // ⚠️ Replace with your actual site key
          size: "invisible",
          callback: handleRecaptchaSuccess,
        });
      }
    };

    script.onload = () => {
      if (window.grecaptcha) {
        window.onRecaptchaLoad();
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleRecaptchaSuccess = (token: string) => {
    submitToMailchimp(token);
  };

  const submitToMailchimp = async (recaptchaToken: string) => {
    try {
      // Create form data for Mailchimp
      const formData = new FormData();
      formData.append("EMAIL", email);
      formData.append("g-recaptcha-response", recaptchaToken);

      // Submit to Mailchimp using JSONP to avoid CORS issues
      const url = `https://smallsided.us9.list-manage.com/subscribe/post-json?u=2558bfaca57f1f8d04039dde6&id=5d74a6b50e&EMAIL=${encodeURIComponent(
        email
      )}&g-recaptcha-response=${recaptchaToken}&c=mailchimpCallback`;

      // Create callback function
      window.mailchimpCallback = (data: any) => {
        setIsSubmitting(false);
        
        if (data.result === "success") {
          setStatus("success");
          setEmail("");
          setError("");
        } else {
          setStatus("error");
          // Extract error message from Mailchimp response
          const errorMsg = data.msg || "Something went wrong. Please try again.";
          setError(errorMsg.replace(/\d+ - /, "")); // Remove error code prefix
        }

        // Reset reCAPTCHA
        if (recaptchaRef.current !== null) {
          window.grecaptcha.reset(recaptchaRef.current);
        }
      };

      // Create script tag for JSONP
      const script = document.createElement("script");
      script.src = url;
      document.body.appendChild(script);
      
      // Clean up script after load
      script.onload = () => {
        document.body.removeChild(script);
      };
    } catch (err) {
      setIsSubmitting(false);
      setStatus("error");
      setError("Something went wrong. Please try again.");
      
      // Reset reCAPTCHA
      if (recaptchaRef.current !== null) {
        window.grecaptcha.reset(recaptchaRef.current);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("idle");

    // Validation
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Execute invisible reCAPTCHA
    setIsSubmitting(true);
    if (recaptchaRef.current !== null && window.grecaptcha) {
      window.grecaptcha.execute(recaptchaRef.current);
    } else {
      setError("reCAPTCHA not loaded. Please refresh the page.");
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles["subscribe-cta"]}>
      <div
        className={styles["subscribe-card"]}
        style={{ backgroundImage: `url(${subscribeBG})` }}
      >
        <div className={styles["subscribe-container"]}>
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

          <form
            ref={formRef}
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
                  setError("");
                }}
                disabled={status === "success" || isSubmitting}
              />
              <button
                type="submit"
                className={styles["subscribe-button"]}
                disabled={status === "success" || isSubmitting}
              >
                {isSubmitting
                  ? "Subscribing..."
                  : status === "success"
                  ? "Subscribed!"
                  : "Subscribe"}
              </button>
            </div>

            {/* Hidden reCAPTCHA container */}
            <div id="recaptcha-container"></div>

            {error && (
              <p className={`${styles["subscribe-message"]} ${styles.error}`}>
                <AlertCircle
                  size={16}
                  style={{ marginRight: "6px", verticalAlign: "middle" }}
                />
                {error}
              </p>
            )}

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

// Extend window type for JSONP callback
declare global {
  interface Window {
    mailchimpCallback: (data: any) => void;
  }
}

export default Subscribe;