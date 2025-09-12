import React from 'react';
import { InstallPrompt } from './InstallPrompt';
import { CacheStatus } from './CacheStatus';
import { OfflineIndicator } from './OfflineIndicator';
import { PWAUpdatePrompt } from './PWAUpdatePrompt';

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <InstallPrompt />
      <CacheStatus />
      <PWAUpdatePrompt />
      <OfflineIndicator />
    </>
  );
};