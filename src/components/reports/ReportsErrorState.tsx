
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DashboardSidebar from '@/components/layout/DashboardSidebar';

interface ReportsErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ReportsErrorState = ({ error, onRetry }: ReportsErrorStateProps) => {
  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar />
      <div className="flex-1">
        <div className="flex flex-col min-h-screen w-full bg-background">
          <header className="flex items-center gap-4 border-b bg-background px-4 py-3">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <div className="w-8 h-8 bg-destructive rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive-foreground" />
                </div>
                Relatórios e Análises
              </h1>
            </div>
          </header>
          <main className="flex-1 p-6">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-destructive rounded-lg flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-destructive-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Ops! Algo deu errado</h2>
              <p className="text-muted-foreground mb-6">Erro ao carregar dados: {error}</p>
              <Button onClick={onRetry}>
                Tentar novamente
              </Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
