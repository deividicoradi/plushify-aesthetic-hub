
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

interface InstallmentsHeaderProps {
  onCreateNew: () => void;
}

const InstallmentsHeader = ({ onCreateNew }: InstallmentsHeaderProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Parcelamentos</h2>
        <p className="text-muted-foreground">
          Gerencie parcelas e adiantamentos
        </p>
      </div>
      
      <div className="flex gap-2 w-full justify-end">
        <Button onClick={onCreateNew} className="gap-2 touch-target">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Parcelamento</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>
    </div>
  );
};

export default InstallmentsHeader;
