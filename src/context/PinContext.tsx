'use client';
import React, { createContext, useState, useEffect } from 'react';

interface PinContextType {
  pinValidated: boolean;
  validatePin: () => void;
  clearPinValidation: () => void;
  adminMode: () => void;
  clearadminMode: () => void;
  adminModeOn: boolean;
}

export const PinContext = createContext<PinContextType>({
  pinValidated: false,
  validatePin: () => {},
  clearPinValidation: () => {},
  adminMode: () => {},
  clearadminMode: () => {},
  adminModeOn: false,
});

export const PinProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pinValidated, setPinValidated] = useState(false);
  const [adminModeOn, setAdminModeOn] = useState(false);

  useEffect(() => {
    // Check sessionStorage for pin validation
    const validated = sessionStorage.getItem('pinValidated');
    setPinValidated(validated === 'true');
    const adminMode = sessionStorage.getItem('adminMode');
    setAdminModeOn(adminMode === 'true');
  }, []);

  const validatePin = () => {

    setPinValidated(true);
    sessionStorage.setItem('pinValidated', 'true');
  };

  const adminMode = () => {
    setAdminModeOn(true); 
    sessionStorage.setItem('adminMode', 'true');
    
  };

  const clearadminMode = () => {
    setAdminModeOn(false);
    sessionStorage.removeItem('adminMode');
  };

  const clearPinValidation = () => {
    setPinValidated(false);
    sessionStorage.removeItem('pinValidated');
  };

  return (
    <PinContext.Provider value={{ pinValidated, adminModeOn, validatePin, clearPinValidation, adminMode, clearadminMode }}>
      {children}
    </PinContext.Provider>
  );
};
