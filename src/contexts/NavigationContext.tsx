// src/contexts/NavigationContext.tsx

import { createContext, useContext, useRef, ReactNode } from 'react';

interface NavigationContextValue {
  isLanguageToggle: () => boolean;
  setLanguageToggle: () => void;
}

const NavigationContext = createContext<NavigationContextValue>({
  isLanguageToggle: () => false,
  setLanguageToggle: () => {},
});

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  // A ref (not state) so it never triggers a re-render
  const toggleFlag = useRef(false);

  const setLanguageToggle = () => {
    toggleFlag.current = true;
    // Auto-clear after the navigation + render cycle completes
    setTimeout(() => { toggleFlag.current = false; }, 100);
  };

  const isLanguageToggle = () => toggleFlag.current;

  return (
    <NavigationContext.Provider value={{ isLanguageToggle, setLanguageToggle }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => useContext(NavigationContext);