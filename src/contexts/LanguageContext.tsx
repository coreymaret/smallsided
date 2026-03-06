// LanguageContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import i18n from "../i18n";

interface LanguageContextType {
  isSpanish: boolean;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  isSpanish: false,
  toggleLanguage: () => {},
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [isSpanish, setIsSpanish] = useState<boolean>(() => {
    return localStorage.getItem("lang") === "es";
  });

  // Sync i18n with the initial language on mount
  useEffect(() => {
    i18n.changeLanguage(isSpanish ? "es" : "en");
  }, []);

  const toggleLanguage = () => {
    setIsSpanish((prev) => {
      const next = !prev;
      localStorage.setItem("lang", next ? "es" : "en");
      i18n.changeLanguage(next ? "es" : "en");
      return next;
    });
  };

  return (
    <LanguageContext.Provider value={{ isSpanish, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);