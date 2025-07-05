
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface BillingToggleProps {
  isAnnual: boolean;
  onToggle: (checked: boolean) => void;
}

export const BillingToggle: React.FC<BillingToggleProps> = ({
  isAnnual,
  onToggle
}) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-lg max-w-md mx-auto">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Escolha seu ciclo de pagamento
        </h3>
        <p className="text-sm text-muted-foreground">
          Economize mais com o plano anual
        </p>
      </div>
      
      <div className="flex items-center justify-center gap-4 p-4 bg-muted/30 rounded-xl">
        <div className="flex items-center gap-2">
          <span className={`text-lg font-semibold transition-all duration-300 ${!isAnnual ? 'text-foreground scale-110' : 'text-muted-foreground'}`}>
            Mensal
          </span>
        </div>
        
        <div className="relative">
          <Switch
            checked={isAnnual}
            onCheckedChange={onToggle}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-secondary scale-125"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-lg font-semibold transition-all duration-300 ${isAnnual ? 'text-foreground scale-110' : 'text-muted-foreground'}`}>
            Anual
          </span>
          {isAnnual && (
            <div className="animate-fade-in">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-2 py-1 font-semibold shadow-md">
                <Sparkles className="w-3 h-3 mr-1" />
                -30%
              </Badge>
            </div>
          )}
        </div>
      </div>
      
      {isAnnual && (
        <div className="mt-4 text-center animate-fade-in">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
            💰 Economize até R$ 240 por ano!
          </p>
        </div>
      )}
    </div>
  );
};
