
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, DoorOpen } from 'lucide-react';

interface CashClosureHeaderProps {
  onOpenCashOpening: () => void;
  onOpenCashClosure: () => void;
}

const CashClosureHeader = ({ onOpenCashOpening, onOpenCashClosure }: CashClosureHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Controle de Caixa</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Controle de abertura e fechamento de caixa
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={onOpenCashOpening}
          className="bg-green-500 text-white hover:bg-green-600"
        >
          <DoorOpen className="w-4 h-4 mr-2" />
          Abrir Caixa
        </Button>
        <Button onClick={onOpenCashClosure}>
          <Plus className="w-4 h-4 mr-2" />
          Fechar Caixa
        </Button>
      </div>
    </div>
  );
};

export default CashClosureHeader;
