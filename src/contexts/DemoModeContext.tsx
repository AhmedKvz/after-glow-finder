import React, { createContext, useContext, useState, useEffect } from 'react';

interface DemoModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  showDemoSuccess: (message: string) => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
};

interface DemoModeProviderProps {
  children: React.ReactNode;
}

export const DemoModeProvider: React.FC<DemoModeProviderProps> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Load demo mode from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('vodi-demo-mode');
    if (stored) {
      setIsDemoMode(JSON.parse(stored));
    }
  }, []);

  const toggleDemoMode = () => {
    const newValue = !isDemoMode;
    setIsDemoMode(newValue);
    localStorage.setItem('vodi-demo-mode', JSON.stringify(newValue));
  };

  const showDemoSuccess = (message: string) => {
    if (isDemoMode) {
      // In a real app, this would show a success toast/modal
      console.log('Demo Success:', message);
    }
  };

  return (
    <DemoModeContext.Provider value={{ isDemoMode, toggleDemoMode, showDemoSuccess }}>
      {children}
    </DemoModeContext.Provider>
  );
};