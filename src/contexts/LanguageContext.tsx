// LanguageContext.tsx

import { createContext, useContext, useState, ReactNode } from "react";

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

  const toggleLanguage = () => {
    setIsSpanish((prev) => {
      const next = !prev;
      localStorage.setItem("lang", next ? "es" : "en");
      // i18n.changeLanguage() will go here once react-i18next is installed
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