import React, { createContext, useContext, useState } from 'react';

interface MobileMenuContextType {
  isHeaderMenuOpen: boolean;
  setIsHeaderMenuOpen: (isOpen: boolean) => void;
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined);

export const MobileMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

  return (
    <MobileMenuContext.Provider value={{ isHeaderMenuOpen, setIsHeaderMenuOpen }}>
      {children}
    </MobileMenuContext.Provider>
  );
};

export const useMobileMenu = () => {
  const context = useContext(MobileMenuContext);
  if (context === undefined) {
    throw new Error('useMobileMenu must be used within a MobileMenuProvider');
  }
  return context;
};