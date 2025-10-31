import { useState } from "react";
import { BellRing } from "lucide-react";
import styles from "./Subscribe.module.scss";
import subscribeBG from "../../assets/subscribeBG.png";

const Subscribe = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Mock success
    setStatus("success");
    setEmail("");
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

          <form className={styles["subscribe-form"]} onSubmit={handleSubmit}>
            <div className={styles["input-wrapper"]}>
              <input
                type="email"
                className={styles["subscribe-input"]}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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

            {status === "success" && (
              <p className={`${styles["subscribe-message"]} ${styles.success}`}>
                Thanks for subscribing! Check your inbox.
              </p>
            )}

            {status === "error" && (
              <p className={`${styles["subscribe-message"]} ${styles.error}`}>
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
