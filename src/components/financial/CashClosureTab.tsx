
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calculator, TrendingUp, TrendingDown, DoorOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CashClosureDialog from './CashClosureDialog';
import CashOpeningDialog from './CashOpeningDialog';

const CashClosureTab = () => {
  const { user } = useAuth();
  const [isClosureDialogOpen, setIsClosureDialogOpen] = useState(false);
  const [isOpeningDialogOpen, setIsOpeningDialogOpen] = useState(false);

  const { data: cashClosures, isLoading: loadingClosures, refetch: refetchClosures } = useQuery({
    queryKey: ['cash-closures', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_closures')
        .select('*')
        .eq('user_id', user?.id)
        .order('closure_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: cashOpenings, isLoading: loadingOpenings, refetch: refetchOpenings } = useQuery({
    queryKey: ['cash-openings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_openings')
        .select('*')
        .eq('user_id', user?.id)
        .order('opening_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      aberto: { label: 'Aberto', variant: 'secondary' as const },
      fechado: { label: 'Fechado', variant: 'default' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.aberto;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const MetricCard = ({ title, value, icon: Icon, trend }: any) => (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        trend === 'up' ? 'bg-green-100 dark:bg-green-800/20' : 
        trend === 'down' ? 'bg-red-100 dark:bg-red-800/20' : 
        'bg-blue-100 dark:bg-blue-800/20'
      }`}>
        <Icon className={`w-5 h-5 ${
          trend === 'up' ? 'text-green-600 dark:text-green-400' : 
          trend === 'down' ? 'text-red-600 dark:text-red-400' : 
          'text-blue-600 dark:text-blue-400'
        }`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-lg font-bold">{formatCurrency(value)}</p>
      </div>
    </div>
  );

  const handleRefetch = () => {
    refetchClosures();
    refetchOpenings();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Controle de Caixa</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Controle de abertura e fechamento de caixa
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsOpeningDialogOpen(true)}>
            <DoorOpen className="w-4 h-4 mr-2" />
            Abrir Caixa
          </Button>
          <Button onClick={() => setIsClosureDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Fechar Caixa
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {loadingClosures || loadingOpenings ? (
          <div className="text-center py-8">Carregando dados...</div>
        ) : (
          <>
            {/* Aberturas de Caixa */}
            {cashOpenings && cashOpenings.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Aberturas de Caixa</h3>
                {cashOpenings.map((opening) => (
                  <Card key={opening.id} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <DoorOpen className="w-5 h-5" />
                            Abertura - {format(new Date(opening.opening_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </CardTitle>
                          <div className="mt-2">
                            {getStatusBadge(opening.status)}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Aberto em: {format(new Date(opening.opened_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <MetricCard
                          title="Saldo Inicial"
                          value={Number(opening.opening_balance)}
                          icon={Calculator}
                        />
                        
                        <MetricCard
                          title="Dinheiro"
                          value={Number(opening.cash_amount)}
                          icon={Calculator}
                        />
                        
                        <MetricCard
                          title="Cartão"
                          value={Number(opening.card_amount)}
                          icon={Calculator}
                        />
                        
                        <MetricCard
                          title="PIX"
                          value={Number(opening.pix_amount)}
                          icon={Calculator}
                        />
                        
                        <MetricCard
                          title="Outros"
                          value={Number(opening.other_amount)}
                          icon={Calculator}
                        />
                      </div>

                      {opening.notes && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-800/20 rounded-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Observações:</strong> {opening.notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Fechamentos de Caixa */}
            {cashClosures && cashClosures.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Fechamentos de Caixa</h3>
                {cashClosures.map((closure) => (
                  <Card key={closure.id} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Calculator className="w-5 h-5" />
                            Fechamento - {format(new Date(closure.closure_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </CardTitle>
                          <div className="mt-2">
                            {getStatusBadge(closure.status)}
                          </div>
                        </div>
                        <div className="text-right">
                          {closure.closed_at && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Fechado em: {format(new Date(closure.closed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard
                          title="Saldo Inicial"
                          value={Number(closure.opening_balance)}
                          icon={Calculator}
                        />
                        
                        <MetricCard
                          title="Total Receitas"
                          value={Number(closure.total_income)}
                          icon={TrendingUp}
                          trend="up"
                        />
                        
                        <MetricCard
                          title="Total Despesas"
                          value={Number(closure.total_expenses)}
                          icon={TrendingDown}
                          trend="down"
                        />
                        
                        <MetricCard
                          title="Saldo Final"
                          value={Number(closure.closing_balance)}
                          icon={Calculator}
                          trend={Number(closure.closing_balance) > Number(closure.opening_balance) ? 'up' : 'down'}
                        />
                      </div>

                      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Dinheiro</p>
                          <p className="font-semibold">{formatCurrency(Number(closure.cash_amount))}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Cartão</p>
                          <p className="font-semibold">{formatCurrency(Number(closure.card_amount))}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">PIX</p>
                          <p className="font-semibold">{formatCurrency(Number(closure.pix_amount))}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Outros</p>
                          <p className="font-semibold">{formatCurrency(Number(closure.other_amount))}</p>
                        </div>
                      </div>

                      {Number(closure.difference) !== 0 && (
                        <div className={`mt-4 p-3 rounded-lg ${
                          Number(closure.difference) > 0 
                            ? 'bg-green-50 dark:bg-green-800/20 text-green-800 dark:text-green-200' 
                            : 'bg-red-50 dark:bg-red-800/20 text-red-800 dark:text-red-200'
                        }`}>
                          <p className="font-medium">
                            Diferença: {formatCurrency(Number(closure.difference))}
                          </p>
                        </div>
                      )}

                      {closure.notes && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-800/20 rounded-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Observações:</strong> {closure.notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {(!cashOpenings || cashOpenings.length === 0) && (!cashClosures || cashClosures.length === 0) && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">Nenhum registro de caixa encontrado</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      <CashClosureDialog 
        open={isClosureDialogOpen} 
        onOpenChange={setIsClosureDialogOpen}
        onSuccess={handleRefetch}
      />

      <CashOpeningDialog 
        open={isOpeningDialogOpen} 
        onOpenChange={setIsOpeningDialogOpen}
        onSuccess={handleRefetch}
      />
    </div>
  );
};

export default CashClosureTab;
