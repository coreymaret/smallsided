import { useState, useEffect } from "react";
import { BellRing, AlertCircle, Smile } from "lucide-react";
import styles from "./Subscribe.module.scss";
import subscribeBG from "../../assets/subscribeBG.png";

declare global {
  interface Window {
    mailchimpCallback: (data: any) => void;
  }
}

const Subscribe = () => {
  console.log("🚀 SUBSCRIBE COMPONENT LOADED - VERSION 2.0");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form after success
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        setStatus("idle");
      }, 5000); // Reset after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [status]);

  const submitToMailchimp = () => {
    console.log("🔵 [Mailchimp] Starting submission for:", email);
    
    const url = `https://smallsided.us9.list-manage.com/subscribe/post-json?u=2558bfaca57f1f8d04039dde6&id=5d74a6b50e&EMAIL=${encodeURIComponent(
      email
    )}&c=mailchimpCallback`;

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
    };

    const script = document.createElement("script");
    script.src = url;
    
    script.onerror = () => {
      console.error("❌ [Mailchimp] Script load failed");
      setIsSubmitting(false);
      setStatus("error");
      setError("Network error. Please try again.");
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
    setIsSubmitting(true);
    submitToMailchimp();
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
                disabled={status === "success" || isSubmitting}
              >
                {isSubmitting
                  ? "Subscribing..."
                  : status === "success"
                  ? "Subscribed!"
                  : "Subscribe"}
              </button>
            </div>

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