import { useState, useEffect } from 'react';        // React hooks for state and lifecycle
import { Cookie } from '../../components/Icons/Icons';              // Cookie icon component
import './CookiePopup.scss';                        // Styles for this popup

// Main component that displays a cookie consent popup
export default function CookiePopup() {

  // Controls whether the popup is shown on the screen
  const [isVisible, setIsVisible] = useState(false);

  // Controls whether the popup is currently playing its closing animation
  const [isClosing, setIsClosing] = useState(false);

  // Runs once on mount: checks localStorage to see if the user already accepted cookies
  useEffect(() => {

    // Retrieve any previously saved consent data
    const cookieConsent = localStorage.getItem('cookieConsent');
    
    // If consent data exists, check if it's still valid
    if (cookieConsent) {
      const consentData = JSON.parse(cookieConsent);
      const expiryTime = consentData.expiry;             // Timestamp when consent expires
      const currentTime = new Date().getTime();          // Current time in ms
      
      // If the saved consent has not expired, hide the popup
      if (currentTime < expiryTime) {
        setIsVisible(false);
      } else {
        // Consent expired → remove it and show the popup again
        localStorage.removeItem('cookieConsent');
        setIsVisible(true);
      }
    } else {
      // No consent found → show the popup
      setIsVisible(true);
    }
  }, []);                                                 // Empty dependency array = run once on mount

  // Called when the user clicks "Okay"
  const handleAccept = () => {

    // Consent expires in 48 hours (48 * 60 * 60 * 1000 ms)
    const expiryTime = new Date().getTime() + (48 * 60 * 60 * 1000);

    // Data stored in localStorage
    const consentData = {
      accepted: true,
      expiry: expiryTime
    };

    // Save consent information
    localStorage.setItem('cookieConsent', JSON.stringify(consentData));
    
    // Trigger closing animation
    setIsClosing(true);

    // After animation finishes, hide popup completely
    setTimeout(() => {
      setIsVisible(false);
    }, 500);                                             // Matches CSS animation duration
  };

  // If the popup should not be visible, render nothing
  if (!isVisible) return null;

  // Render the popup UI
  return (
    <div className={`popup-cookies ${isClosing ? 'closing' : ''}`}>
      <div className="content">
        <p>
          {/* Cookie icon with inline styling */}
          <Cookie 
            size={16} 
            style={{ marginRight: '8px', verticalAlign: 'middle', color: '#98ED66' }} 
          />
          This website uses cookies.
        </p>

        {/* Button-like span that accepts cookies */}
        <span className="link active" onClick={handleAccept}>
          Okay
        </span>
      </div>
    </div>
  );
}
