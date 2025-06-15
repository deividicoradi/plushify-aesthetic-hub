
import React from 'react';
import { BarChart3, Activity } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ReportsHeaderProps {
  onRefresh: () => void;
}

export const ReportsHeader = ({ onRefresh }: ReportsHeaderProps) => {
  return (
    <header className="flex items-center gap-4 border-b bg-background px-6 py-4">
      <div className="flex items-center justify-between flex-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Relatórios e Análises
            </h1>
            <p className="text-sm text-muted-foreground">Acompanhe o desempenho do seu negócio</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">
            <Activity className="w-3 h-3 mr-1" />
            Dados atualizados
          </Badge>
          <Button onClick={onRefresh} variant="outline" size="sm">
            Atualizar
          </Button>
        </div>
      </div>
    </header>
  );
};
