import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigation } from '../../contexts/NavigationContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const { isLanguageToggle } = useNavigation();

  useEffect(() => {
    if (isLanguageToggle()) return;
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;