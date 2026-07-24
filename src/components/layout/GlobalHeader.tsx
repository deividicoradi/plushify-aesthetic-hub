import React, { useState } from 'react';
import { UserCog } from 'lucide-react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { UserDropdownMenu } from './UserDropdownMenu';
import { Button } from '@/components/ui/button';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useStaffMode } from '@/contexts/StaffModeContext';
import { StaffModeDialog } from '@/components/team/StaffModeDialog';

export const GlobalHeader = () => {
  const { hasFeature } = usePlanLimits();
  const { isStaffMode } = useStaffMode();
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* Modo Funcionário (Premium) */}
      {hasFeature('hasStaffPinMode') && !isStaffMode && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Entrar em modo funcionário"
          onClick={() => setStaffDialogOpen(true)}
        >
          <UserCog className="h-4 w-4" />
        </Button>
      )}
      <StaffModeDialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen} />

      {/* Notifications */}
      <NotificationCenter />

      {/* User Dropdown */}
      <UserDropdownMenu />
    </div>
  );
};