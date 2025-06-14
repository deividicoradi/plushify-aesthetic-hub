
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
    <div className="flex flex-col sm:flex-row gap-4 justify-between">
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar pagamentos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>
      <Button onClick={onNewPayment}>
        <Plus className="w-4 h-4 mr-2" />
        Novo Pagamento
      </Button>
    </div>
  );
};

export default PaymentsHeader;
