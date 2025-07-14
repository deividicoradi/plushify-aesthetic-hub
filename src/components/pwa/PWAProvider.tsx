import React from 'react';
import { InstallPrompt } from './InstallPrompt';
import { CacheStatus } from './CacheStatus';
import { OfflineIndicator } from './OfflineIndicator';

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <InstallPrompt />
      <CacheStatus />
      <OfflineIndicator />
    </>
  );
};