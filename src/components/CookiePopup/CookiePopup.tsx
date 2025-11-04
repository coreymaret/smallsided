import { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';
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
        setIsVisible(false);
      } else {
        localStorage.removeItem('cookieConsent');
        setIsVisible(true);
      }
    } else {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    const expiryTime = new Date().getTime() + (48 * 60 * 60 * 1000);
    const consentData = {
      accepted: true,
      expiry: expiryTime
    };
    localStorage.setItem('cookieConsent', JSON.stringify(consentData));
    
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 500);
  };

  if (!isVisible) return null;

  return (
    <div className={`popup-cookies ${isClosing ? 'closing' : ''}`}>
      <div className="content">
        <p>
          <Cookie size={16} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#98ED66' }} />
          This website uses cookies.
        </p>
        <span className="link active" onClick={handleAccept}>
          Okay
        </span>
      </div>
    </div>
  );
}
