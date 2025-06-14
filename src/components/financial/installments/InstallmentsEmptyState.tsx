
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

interface InstallmentsEmptyStateProps {
  onCreateNew: () => void;
}

const InstallmentsEmptyState = ({ onCreateNew }: InstallmentsEmptyStateProps) => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Nenhum parcelamento encontrado</h3>
            <p className="text-muted-foreground">
              Crie seu primeiro parcelamento para organizar pagamentos em parcelas.
            </p>
          </div>
          <Button onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Parcelamento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallmentsEmptyState;
