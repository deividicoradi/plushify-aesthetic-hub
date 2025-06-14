
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

interface InstallmentsHeaderProps {
  onCreateNew: () => void;
}

const InstallmentsHeader = ({ onCreateNew }: InstallmentsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Parcelamentos</h2>
        <p className="text-muted-foreground">
          Gerencie parcelas e adiantamentos
        </p>
      </div>
      <Button onClick={onCreateNew}>
        <Plus className="w-4 h-4 mr-2" />
        Novo Parcelamento
      </Button>
    </div>
  );
};

export default InstallmentsHeader;
