
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface PaymentsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNewPayment: () => void;
}

const PaymentsHeader = ({ searchTerm, onSearchChange, onNewPayment }: PaymentsHeaderProps) => {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar pagamentos..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-11 sm:h-10 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all duration-200"
        />
      </div>
      
      <div className="flex gap-2 w-full justify-end">
        <Button onClick={onNewPayment} className="gap-2 touch-target">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Pagamento</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>
    </div>
  );
};

export default PaymentsHeader;
