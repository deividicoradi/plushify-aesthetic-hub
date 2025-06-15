
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface BillingToggleProps {
  isAnnual: boolean;
  onToggle: (checked: boolean) => void;
}

export const BillingToggle: React.FC<BillingToggleProps> = ({
  isAnnual,
  onToggle
}) => {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <span className={`text-lg font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
        Mensal
      </span>
      <Switch
        checked={isAnnual}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-primary"
      />
      <span className={`text-lg font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
        Anual
      </span>
      {isAnnual && (
        <Badge className="bg-green-500 text-white text-sm px-3 py-1">
          Economize 30%
        </Badge>
      )}
    </div>
  );
};
