import { useState } from "react";
import { BellRing, AlertCircle, Smile } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import styles from "./Subscribe.module.scss";
import subscribeBG from "../../assets/subscribeBG.png";

const Subscribe = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error" | "loading">("idle");
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!captchaToken) {
      setError("Please complete the reCAPTCHA.");
      return;
    }

    setStatus("loading");
    setError("");

    // verify captcha on your backend before adding to Mailchimp
    try {
      const verify = await fetch("/.netlify/functions/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken }),
      });
      const verifyData = await verify.json();

      if (!verifyData.success) {
        setStatus("error");
        setError("Captcha verification failed. Try again.");
        return;
      }

      const url =
        "https://smallsided.us9.list-manage.com/subscribe/post-json?u=2558bfaca57f1f8d04039dde6&id=5d74a6b50e&f_id=006fd5e3f0&c=?";

      const response = await fetch(`${url}&EMAIL=${encodeURIComponent(email)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json;charset=utf-8" },
      });

      const text = await response.text();
      const json = JSON.parse(text.replace(/^.*?({.*}).*$/, "$1"));

      if (json.result === "success") {
        setStatus("success");
        setEmail("");
        setCaptchaToken(null);
      } else {
        setStatus("error");
        setError(json.msg || "Subscription failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError("Something went wrong. Please try again later.");
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
                disabled={status === "success"}
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

            <div style={{ marginTop: "12px" }}>
              <ReCAPTCHA
                sitekey="6LfIaQgsAAAAABKbMn3WCPBtZ1_LfqYNVsje3VQN"
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
          </form>
        </div>
      </div>
    </section>
  );
};

export default Subscribe;
