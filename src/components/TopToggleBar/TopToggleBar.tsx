import React, { useEffect, useState } from "react";
import styles from "./TopToggleBar.module.scss";

// Icons displayed in the scrolling text marquee
import { X, AlertCircle, Glasses, Star } from "lucide-react";

interface TopToggleBarProps {
  onClose?: () => void; // Optional callback to notify parent when the bar closes
}

const TopToggleBar: React.FC<TopToggleBarProps> = ({ onClose }) => {
  // Whether the bar is currently shown in the UI
  const [isVisible, setIsVisible] = useState(true);

  // Messages that scroll in a loop
  const messages = [
    { icon: <AlertCircle size={18} color="#98ED66" />, text: "Small field. Big impact." },
    { icon: <Glasses size={18} color="#98ED66" />, text: "Zone 1-aged education." },
    { icon: <Star size={18} color="#98ED66" />, text: "An informational blog." },
  ];

  // --------------------------------------------------------------------
  // On mount: restore closed state from localStorage with a 48-hour TTL
  // --------------------------------------------------------------------
  useEffect(() => {
    const stored = localStorage.getItem("topBarClosed");
    
    if (stored) {
      try {
        const { closed, timestamp } = JSON.parse(stored);
        const now = Date.now();
        const fortyEightHours = 48 * 60 * 60 * 1000;

        // If the user closed it less than 48 hours ago, keep it closed
        if (now - timestamp < fortyEightHours) {
          setIsVisible(!closed);
        } else {
          // If 48 hours have passed, clear stored state and show again
          localStorage.removeItem("topBarClosed");
          setIsVisible(true);
        }

      } catch (error) {
        // If something corrupted the JSON, reset preference
        localStorage.removeItem("topBarClosed");
        setIsVisible(true);
      }
    }
  }, []);

  // --------------------------------------------------------------------
  // Close the bar & store a timestamp so it remains hidden for 48 hours
  // --------------------------------------------------------------------
  const handleClose = () => {
    setIsVisible(false);

    const data = {
      closed: true,
      timestamp: Date.now(),
    };
    localStorage.setItem("topBarClosed", JSON.stringify(data));

    // Notify parent (used by Header to adjust layout paddings)
    if (onClose) onClose();
  };

  // If not visible, render nothing
  if (!isVisible) return null;

  return (
    <div className={styles.topToggleBar}>
      <div className={styles.content}>
        
        {/* 
          The text slider duplicates the message list twice.
          This is a classic infinite marquee technique:
          - First list scrolls out
          - Duplicate follows seamlessly
          - CSS handles the looped animation
        */}
        <div className={styles.textSlider}>
          {messages.map((m, i) => (
            <div key={i} className={styles.line}>
              {m.icon}
              <span>{m.text}</span>
            </div>
          ))}

          {/* Duplicate block for continuous scrolling */}
          {messages.map((m, i) => (
            <div key={`dup-${i}`} className={styles.line}>
              {m.icon}
              <span>{m.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Close button, accessible via aria-label */}
      <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
        <X size={18} />
      </button>
    </div>
  );
};

export default TopToggleBar;
