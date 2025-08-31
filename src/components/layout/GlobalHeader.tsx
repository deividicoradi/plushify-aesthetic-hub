import React from 'react';
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { UserDropdownMenu } from './UserDropdownMenu';
import { WhatsAppHeaderButton } from '@/components/whatsapp/WhatsAppHeaderButton';

export const GlobalHeader = () => {
  return (
    <div className="flex items-center gap-2">
      {/* WhatsApp Button */}
      <WhatsAppHeaderButton />
      
      {/* Notifications */}
      <NotificationCenter />
      
      {/* Settings Icon */}
      <Button variant="ghost" size="sm" asChild>
        <Link to="/settings">
          <Settings className="h-4 w-4" />
        </Link>
      </Button>
      
      {/* User Dropdown */}
      <UserDropdownMenu />
    </div>
  );
};