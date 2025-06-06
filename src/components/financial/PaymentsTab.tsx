
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PaymentDialog from './PaymentDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PaymentsTab = () => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          payment_methods (name, type),
          clients (name),
          appointments (title)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { label: 'Pendente', variant: 'secondary' as const },
      pago: { label: 'Pago', variant: 'default' as const },
      parcial: { label: 'Parcial', variant: 'outline' as const },
      cancelado: { label: 'Cancelado', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredPayments = payments?.filter(payment =>
    payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar pagamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Pagamento
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">Carregando pagamentos...</div>
        ) : filteredPayments?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Nenhum pagamento encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredPayments?.map((payment) => (
            <Card key={payment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {payment.description || 'Pagamento sem descrição'}
                      </h3>
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {payment.clients && (
                        <p>Cliente: {payment.clients.name}</p>
                      )}
                      {payment.appointments && (
                        <p>Serviço: {payment.appointments.title}</p>
                      )}
                      <p>Método: {payment.payment_methods?.name}</p>
                      <p>Criado em: {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-lg font-bold">
                      {formatCurrency(Number(payment.amount))}
                    </p>
                    {Number(payment.paid_amount) > 0 && (
                      <p className="text-sm text-green-600">
                        Pago: {formatCurrency(Number(payment.paid_amount))}
                      </p>
                    )}
                    {Number(payment.discount) > 0 && (
                      <p className="text-sm text-orange-600">
                        Desconto: {formatCurrency(Number(payment.discount))}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <PaymentDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};

export default PaymentsTab;
