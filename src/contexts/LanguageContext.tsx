// LanguageContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import i18n from "../i18n";

interface LanguageContextType {
  isSpanish: boolean;
  toggleLanguage: () => void;
  setLanguage: (spanish: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  isSpanish: false,
  toggleLanguage: () => {},
  setLanguage: () => {},
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [isSpanish, setIsSpanish] = useState<boolean>(() => {
    return window.location.pathname.startsWith('/es');
  });

  // Sync i18n with the initial language on mount
  useEffect(() => {
    i18n.changeLanguage(isSpanish ? "es" : "en");
  }, []);

  const setLanguage = (spanish: boolean) => {
    setIsSpanish(spanish);
    localStorage.setItem("lang", spanish ? "es" : "en");
    i18n.changeLanguage(spanish ? "es" : "en");
  };

  const toggleLanguage = () => {
    setLanguage(!isSpanish);
  };

  return (
    <LanguageContext.Provider value={{ isSpanish, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);