import { useState } from "react";
import { BellRing, AlertCircle, Smile } from "lucide-react"; // ✅ Added AlertCircle here
import styles from "./Subscribe.module.scss";
import subscribeBG from "../../assets/subscribeBG.png";

const Subscribe = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState(""); // ✅ Already present

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Custom validation logic (unchanged)
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Mock success
    setStatus("success");
    setEmail("");
    setError("");
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

          {/* ✅ noValidate disables Chrome’s tooltip */}
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
                disabled={status === "success"}
              >
                {status === "success" ? "Subscribed!" : "Subscribe"}
              </button>
            </div>

            {/* ✅ Added AlertCircle icon to the left of the error text */}
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

            {status === "error" && (
              <p className={`${styles["subscribe-message"]} ${styles.error}`}>
                <AlertCircle
                  size={16}
                  style={{ marginRight: "6px", verticalAlign: "middle" }}
                />
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
