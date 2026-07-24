
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface PaymentsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNewPayment: () => void;
  disabled?: boolean;
}

const PaymentsHeader = ({ searchTerm, onSearchChange, onNewPayment, disabled }: PaymentsHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
      <div className="relative w-full sm:flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar pagamentos..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-11 sm:h-10 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all duration-200"
        />
      </div>

      <Button
        onClick={onNewPayment}
        className={`gap-2 w-full sm:w-auto h-11 sm:h-10 shrink-0 ${disabled ? 'opacity-60' : ''}`}
      >
        <Plus className="w-4 h-4" />
        <span>Novo Pagamento</span>
      </Button>
    </div>
  );
};

export default PaymentsHeader;
