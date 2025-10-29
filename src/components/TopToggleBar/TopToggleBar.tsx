import React, { useEffect, useState } from "react";
import styles from "./TopToggleBar.module.scss";
import { X, AlertCircle, Glasses, Star } from "lucide-react";

interface TopToggleBarProps {
  onClose?: () => void; // Optional onClose prop
}

const TopToggleBar: React.FC<TopToggleBarProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const messages = [
    { icon: <AlertCircle size={18} color="#98ED66" />, text: "Small field. Big impact." },
    { icon: <Glasses size={18} color="#98ED66" />, text: "Zone 1-aged education." },
    { icon: <Star size={18} color="#98ED66" />, text: "An informational blog." },
  ];

  useEffect(() => {
    const stored = localStorage.getItem("topBarClosed");
    if (stored === "true") setIsVisible(false);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("topBarClosed", "true");
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div className={styles.topToggleBar}>
      <div className={styles.content}>
        <div className={styles.textSlider}>
          {/* Render messages twice for seamless loop */}
          {messages.map((m, i) => (
            <div key={i} className={styles.line}>
              {m.icon}
              <span>{m.text}</span>
            </div>
          ))}
          {messages.map((m, i) => (
            <div key={`dup-${i}`} className={styles.line}>
              {m.icon}
              <span>{m.text}</span>
            </div>
          ))}
        </div>
      </div>
      <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
        <X size={18} />
      </button>
    </div>
  );
};

export default TopToggleBar;
