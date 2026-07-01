import React from 'react';
import { InstallPrompt } from './InstallPrompt';
import { OfflineIndicator } from './OfflineIndicator';
import { PWAUpdatePrompt } from './PWAUpdatePrompt';

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <InstallPrompt />
      <PWAUpdatePrompt />
      <OfflineIndicator />
    </>
  );
};