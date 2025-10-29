import React, { useEffect, useState } from "react";
import styles from "./TopToggleBar.module.scss";
import { X, AlertCircle, Glasses, Star } from "lucide-react";

interface TopToggleBarProps {
  onClose?: () => void;
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
    
    if (stored) {
      try {
        const { closed, timestamp } = JSON.parse(stored);
        const now = Date.now();
        const fortyEightHours = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
        
        // Check if 48 hours have passed
        if (now - timestamp < fortyEightHours) {
          setIsVisible(!closed); // Keep it closed if within 48 hours
        } else {
          // 48 hours have passed, clear the preference and show the bar
          localStorage.removeItem("topBarClosed");
          setIsVisible(true);
        }
      } catch (error) {
        // If parsing fails, clear the storage and show the bar
        localStorage.removeItem("topBarClosed");
        setIsVisible(true);
      }
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    const data = {
      closed: true,
      timestamp: Date.now()
    };
    localStorage.setItem("topBarClosed", JSON.stringify(data));
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div className={styles.topToggleBar}>
      <div className={styles.content}>
        <div className={styles.textSlider}>
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