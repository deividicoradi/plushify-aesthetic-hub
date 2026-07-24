import React from 'react';
import { UserCog, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStaffMode } from '@/contexts/StaffModeContext';

export const StaffModeBanner: React.FC = () => {
  const { isStaffMode, activeMember, exitStaffMode } = useStaffMode();

  if (!isStaffMode || !activeMember) return null;

  return (
    <div className="flex items-center justify-between gap-3 bg-amber-100 dark:bg-amber-900/40 border-b border-amber-300 dark:border-amber-800 px-3 sm:px-4 py-2 text-sm">
      <div className="flex items-center gap-2 min-w-0 text-amber-900 dark:text-amber-200">
        <UserCog className="w-4 h-4 shrink-0" />
        <span className="truncate">
          Modo Funcionário: <strong>{activeMember.name}</strong> ({activeMember.role})
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={exitStaffMode}
        className="text-amber-900 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800/50 shrink-0 gap-1.5 h-7"
      >
        <LogOut className="w-3.5 h-3.5" />
        Sair
      </Button>
    </div>
  );
};
