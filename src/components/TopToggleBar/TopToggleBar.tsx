import React, { useEffect, useState } from "react";
import styles from "./TopToggleBar.module.scss";
import { X, AlertCircle } from "lucide-react";

// ------------------ ADDED PROP INTERFACE ------------------
interface TopToggleBarProps {
  onClose?: () => void; // optional callback to notify Header
}

const TopToggleBar: React.FC<TopToggleBarProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    const storedState = localStorage.getItem("topBarClosed");
    if (storedState === "true") setIsVisible(false);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("topBarClosed", "true");
    if (onClose) onClose(); // ------------------ NOTIFY HEADER ------------------
  };

  if (!isVisible) return null;

  return (
    <div className={styles.topToggleBar}>
      <div className={styles.content}>
        <AlertCircle size={20} color="#98ED66" />
        <span>Small field. Big impact.</span>
      </div>

      <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
        <X size={18} />
      </button>
    </div>
  );
};

export default TopToggleBar;
