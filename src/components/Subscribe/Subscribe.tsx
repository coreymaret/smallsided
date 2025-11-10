import { useState, useEffect, useRef } from "react";
import { BellRing, AlertCircle, Smile } from "lucide-react";
import styles from "./Subscribe.module.scss";
import subscribeBG from "../../assets/subscribeBG.png";

declare global {
  interface Window {
    grecaptcha: any;
    mailchimpCallback: (data: any) => void;
  }
}

const Subscribe = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recaptchaRef = useRef<number | null>(null);
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  // Wait for reCAPTCHA to load and render it
  useEffect(() => {
    console.log("🔵 [Component] Mounted, checking for reCAPTCHA...");
    
    const checkRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.render) {
        console.log("✅ [reCAPTCHA] Available, rendering...");
        
        try {
          if (recaptchaRef.current === null) {
            recaptchaRef.current = window.grecaptcha.render("recaptcha-container", {
              sitekey: "6LdkcAgsAAAAAHJJfTjEL3RaCIqhB4aO5keXHsVe", // ⚠️ Replace with your actual site key
              size: "invisible",
              callback: handleRecaptchaSuccess,
            });
            console.log("✅ [reCAPTCHA] Rendered with ID:", recaptchaRef.current);
            setRecaptchaReady(true);
          }
        } catch (err) {
          console.error("❌ [reCAPTCHA] Render error:", err);
        }
      } else {
        console.log("⏳ [reCAPTCHA] Not ready yet, retrying...");
        setTimeout(checkRecaptcha, 100);
      }
    };

    checkRecaptcha();
  }, []);

  const handleRecaptchaSuccess = (token: string) => {
    console.log("✅ [reCAPTCHA] Token received:", token.substring(0, 50) + "...");
    submitToMailchimp(token);
  };

  const submitToMailchimp = (recaptchaToken: string) => {
    console.log("🔵 [Mailchimp] Starting submission for:", email);
    
    const url = `https://smallsided.us9.list-manage.com/subscribe/post-json?u=2558bfaca57f1f8d04039dde6&id=5d74a6b50e&EMAIL=${encodeURIComponent(
      email
    )}&g-recaptcha-response=${recaptchaToken}&c=mailchimpCallback`;

    console.log("🔵 [Mailchimp] Request URL:", url);

    window.mailchimpCallback = (data: any) => {
      console.log("📥 [Mailchimp] Response received:", JSON.stringify(data, null, 2));
      
      setIsSubmitting(false);
      
      if (data.result === "success") {
        console.log("✅ [Mailchimp] Subscription successful!");
        setStatus("success");
        setEmail("");
        setError("");
      } else {
        console.log("❌ [Mailchimp] Subscription failed:", data.msg);
        setStatus("error");
        const errorMsg = data.msg || "Something went wrong. Please try again.";
        setError(errorMsg.replace(/\d+ - /, "").replace(/<[^>]*>/g, ""));
      }

      if (recaptchaRef.current !== null) {
        console.log("🔄 [reCAPTCHA] Resetting...");
        window.grecaptcha.reset(recaptchaRef.current);
      }
    };

    const script = document.createElement("script");
    script.src = url;
    
    script.onerror = () => {
      console.error("❌ [Mailchimp] Script load failed");
      setIsSubmitting(false);
      setStatus("error");
      setError("Network error. Please try again.");
      
      if (recaptchaRef.current !== null) {
        window.grecaptcha.reset(recaptchaRef.current);
      }
    };
    
    document.body.appendChild(script);
    
    script.onload = () => {
      console.log("🟢 [Mailchimp] Script loaded");
      setTimeout(() => {
        if (script.parentNode) {
          document.body.removeChild(script);
        }
      }, 100);
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔵 [Form] Submit triggered for email:", email);
    console.log("🔵 [Form] reCAPTCHA ready:", recaptchaReady);
    console.log("🔵 [Form] recaptchaRef.current:", recaptchaRef.current);
    
    setError("");
    setStatus("idle");

    if (!email.trim()) {
      console.log("⚠️ [Validation] Empty email");
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log("⚠️ [Validation] Invalid email format");
      setError("Please enter a valid email address.");
      return;
    }

    console.log("✅ [Validation] Email valid");

    if (!recaptchaReady || recaptchaRef.current === null) {
      console.error("❌ [reCAPTCHA] Not ready");
      setError("Please wait a moment and try again.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("🔵 [reCAPTCHA] Executing challenge...");
      window.grecaptcha.execute(recaptchaRef.current);
    } catch (err) {
      console.error("❌ [reCAPTCHA] Execute failed:", err);
      setError("reCAPTCHA error. Please refresh the page.");
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
                disabled={status === "success" || isSubmitting || !recaptchaReady}
              >
                {isSubmitting
                  ? "Subscribing..."
                  : status === "success"
                  ? "Subscribed!"
                  : "Subscribe"}
              </button>
            </div>

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

export default Subscribe;