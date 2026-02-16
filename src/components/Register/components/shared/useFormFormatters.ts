// Shared form formatting logic (phone, card number, expiry)
// This eliminates 200+ duplicate lines across 6 services

import { useState } from 'react';

export const useFormFormatters = () => {
  const formatPhoneNumber = (value: string, oldValue: string): string => {
    // Handle backspace/deletion
    if (value.length < oldValue.length) {
      let digitsOnly = value.replace(/\D/g, '');
      
      if (digitsOnly.length === 0) return '';
      if (digitsOnly.length <= 3) return digitsOnly;
      if (digitsOnly.length <= 6) {
        return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
      }
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
    }
    
    // Handle input
    let digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length > 10) {
      digitsOnly = digitsOnly.slice(0, 10);
    }
    
    if (digitsOnly.length === 0) return '';
    if (digitsOnly.length <= 3) return digitsOnly;
    if (digitsOnly.length <= 6) {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
    }
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  };

  const formatCardNumber = (value: string): string => {
    let digitsOnly = value.replace(/\D/g, '');
    
    if (digitsOnly.length > 16) {
      digitsOnly = digitsOnly.slice(0, 16);
    }
    
    if (digitsOnly.length <= 4) return digitsOnly;
    
    let formatted = `${digitsOnly.slice(0, 4)}-`;
    if (digitsOnly.length <= 8) {
      formatted += digitsOnly.slice(4);
    } else if (digitsOnly.length <= 12) {
      formatted += `${digitsOnly.slice(4, 8)}-${digitsOnly.slice(8)}`;
    } else {
      formatted += `${digitsOnly.slice(4, 8)}-${digitsOnly.slice(8, 12)}-${digitsOnly.slice(12)}`;
    }
    
    return formatted;
  };

  const formatCardExpiry = (value: string): string => {
    // Handle manual "/" input
    if (value.includes('/')) {
      const parts = value.split('/');
      let month = parts[0].replace(/\D/g, '');
      let year = parts[1] ? parts[1].replace(/\D/g, '') : '';
      
      if (month.length === 1 && parseInt(month) > 1) {
        month = '0' + month;
      }
      
      month = month.slice(0, 2);
      year = year.slice(0, 2);
      
      return year ? `${month}/${year}` : `${month}/`;
    }
    
    // Auto-format
    let digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length > 4) {
      digitsOnly = digitsOnly.slice(0, 4);
    }
    
    if (digitsOnly.length <= 2) return digitsOnly;
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
  };

  return {
    formatPhoneNumber,
    formatCardNumber,
    formatCardExpiry,
  };
};
