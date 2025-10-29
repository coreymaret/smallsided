import React, { useEffect, useState } from "react";
import styles from "./TopToggleBar.module.scss";
import { X, AlertCircle, Info, Star } from "lucide-react";

// Define the props interface for the component
interface TopToggleBarProps {
  onClose?: () => void; // Add the optional onClose prop
}

const TopToggleBar: React.FC<TopToggleBarProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const messages = [
    { icon: <AlertCircle size={18} color="#98ED66" />, text: "Small field. Big impact." },
    { icon: <Info size={18} color="#98ED66" />, text: "Zone 1-aged education." },
    { icon: <Star size={18} color="#98ED66" />, text: "An informational blog." },
  ];

  useEffect(() => {
    const stored = localStorage.getItem("topBarClosed");
    if (stored === "true") setIsVisible(false);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("topBarClosed", "true");
    if (onClose) onClose(); // Call onClose when close button is clicked
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
          {/* Only duplicate the first line for smooth loop */}
          <div key="dup-0" className={styles.line}>
            {messages[0].icon}
            <span>{messages[0].text}</span>
          </div>
        </div>
      </div>

      {/* The button is inside the toggle bar now */}
      <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
        <X size={18} />
      </button>
    </div>
  );
};

export default TopToggleBar;
