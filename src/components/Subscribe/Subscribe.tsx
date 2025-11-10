import { useState, useRef, useEffect } from "react";
import { BellRing, AlertCircle, Smile } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import styles from "./Subscribe.module.scss";
import subscribeBG from "../../assets/subscribeBG.png";

// Mailchimp JSONP endpoint
const MAILCHIMP_JSONP =
  "https://smallsided.us9.list-manage.com/subscribe/post-json?u=2558bfaca57f1f8d04039dde6&id=5d74a6b50e&f_id=006fd5e3f0";

// Your v2 Checkbox site key
const RECAPTCHA_SITE_KEY = "6LfIaQgsAAAAABKbMn3WCPBtZ1_LfqYNVsje3VQN";

const Subscribe = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  useEffect(() => {
    return () => {
      try {
        recaptchaRef.current?.reset();
      } catch {}
    };
  }, []);

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleCaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    setError("");
  };

  const submitToMailchimpJsonp = (emailValue: string) =>
    new Promise<{ result: string; msg?: string }>((resolve, reject) => {
      const callbackName = `mc_callback_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      (window as any)[callbackName] = (data: any) => {
        try {
          delete (window as any)[callbackName];
        } catch (e) {
          (window as any)[callbackName] = undefined;
        }
        const el = document.getElementById(callbackName);
        if (el) el.remove();
        if (!data) reject(new Error("No response from Mailchimp"));
        else resolve(data);
      };

      const params: Record<string, string> = {
        EMAIL: emailValue,
        c: callbackName,
      };
      const query = Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&");

      const script = document.createElement("script");
      script.src = `${MAILCHIMP_JSONP}&${query}`;
      script.id = callbackName;
      script.async = true;
      script.onerror = () => {
        try {
          delete (window as any)[callbackName];
        } catch (e) {
          (window as any)[callbackName] = undefined;
        }
        script.remove();
        reject(new Error("Script load error"));
      };

      document.body.appendChild(script);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      setStatus("error");
      return;
    }

    if (!validateEmail(email.trim())) {
      setError("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      // Step 1: Verify reCAPTCHA server-side via Netlify function
      const verifyResp = await fetch("/.netlify/functions/verify-recaptcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: recaptchaToken }),
      });

      const verifyData = await verifyResp.json();

      if (!verifyData.success) {
        setStatus("error");
        setError("reCAPTCHA verification failed. Please try again.");
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
        return;
      }

      // Step 2: Submit to Mailchimp JSONP
      const mcResp = await submitToMailchimpJsonp(email.trim());
      if (mcResp && mcResp.result === "success") {
        setStatus("success");
        setError("");
        setEmail("");
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
      } else {
        setStatus("error");
        const raw = (mcResp && mcResp.msg) || "Subscription failed. Please try again.";
        const stripped = raw.replace(/<\/?[^>]+(>|$)/g, "");
        setError(stripped);
      }
    } catch (err) {
      console.error("Error:", err);
      setStatus("error");
      setError("Something went wrong. Please try again.");
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
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
              Get the latest updates, exclusive content, and insights delivered straight to your inbox.
            </p>
          </div>

          <form className={styles["subscribe-form"]} onSubmit={handleSubmit} noValidate>
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
                disabled={status === "success" || status === "loading"}
              />
              <button
                type="submit"
                className={styles["subscribe-button"]}
                disabled={status === "success" || status === "loading"}
              >
                {status === "loading"
                  ? "Subscribing..."
                  : status === "success"
                  ? "Subscribed!"
                  : "Subscribe"}
              </button>
            </div>

            {/* reCAPTCHA */}
            <div style={{ marginTop: 12 }}>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleCaptchaChange}
              />
            </div>

            {error && (
              <p className={`${styles["subscribe-message"]} ${styles.error}`}>
                <AlertCircle size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                {error}
              </p>
            )}

            {status === "success" && (
              <p className={`${styles["subscribe-message"]} ${styles.success}`}>
                <Smile size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                Thanks for subscribing! Check your inbox.
              </p>
            )}

            {status === "error" && error === "" && (
              <p className={`${styles["subscribe-message"]} ${styles.error}`}>
                <AlertCircle size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                Something went wrong. Please try again.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default Subscribe;
