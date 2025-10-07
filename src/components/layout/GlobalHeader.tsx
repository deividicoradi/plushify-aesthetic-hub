import React from 'react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { UserDropdownMenu } from './UserDropdownMenu';
import { WhatsAppHeaderButton } from '@/components/whatsapp/WhatsAppHeaderButton';

export const GlobalHeader = () => {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* WhatsApp Button */}
      <WhatsAppHeaderButton />
      
      {/* Notifications */}
      <NotificationCenter />
      
      {/* User Dropdown */}
      <UserDropdownMenu />
    </div>
  );
};