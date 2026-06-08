
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

interface InstallmentsHeaderProps {
  onCreateNew: () => void;
}

const InstallmentsHeader = ({ onCreateNew }: InstallmentsHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-xl sm:text-2xl font-bold">Parcelamentos</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Gerencie parcelas e adiantamentos
        </p>
      </div>

      <Button
        onClick={onCreateNew}
        className="gap-2 w-full sm:w-auto h-11 sm:h-10 shrink-0"
      >
        <Plus className="w-4 h-4" />
        <span>Novo Parcelamento</span>
      </Button>
    </div>
  );
};

export default InstallmentsHeader;
