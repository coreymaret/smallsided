import { useState, useEffect } from 'react';
import './CookiePopup.scss';

export default function CookiePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    
    if (cookieConsent) {
      const consentData = JSON.parse(cookieConsent);
      const expiryTime = consentData.expiry;
      const currentTime = new Date().getTime();
      
      if (currentTime < expiryTime) {
        // Consent is still valid
        setIsVisible(false);
      } else {
        // Consent expired, remove it and show popup
        localStorage.removeItem('cookieConsent');
        setIsVisible(true);
      }
    } else {
      // No consent found, show popup
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    const expiryTime = new Date().getTime() + (48 * 60 * 60 * 1000); // 48 hours in milliseconds
    const consentData = {
      accepted: true,
      expiry: expiryTime
    };
    localStorage.setItem('cookieConsent', JSON.stringify(consentData));
    
    // Trigger closing animation
    setIsClosing(true);
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsVisible(false);
    }, 500); // Match this to your animation duration
  };

  if (!isVisible) return null;

  return (
    <div className={`popup-cookies ${isClosing ? 'closing' : ''}`}>
      <div className="content">
        <p>This website uses cookies.</p>
        <span className="link active" onClick={handleAccept}>
          Okay
        </span>
      </div>
    </div>
  );
}