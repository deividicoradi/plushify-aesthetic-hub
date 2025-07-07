import React from 'react';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useClientStats } from '@/hooks/useClientStats';
import { useAppointments } from '@/hooks/useAppointments';
import { useProductsData } from '@/hooks/inventory/useProductsData';
import { useServices } from '@/hooks/useServices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Infinity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const PlanLimitsDisplay = () => {
  const { currentPlan, getLimit, hasReachedLimit, isTestUser } = usePlanLimits();
  const { totalClients } = useClientStats();
  const { appointments } = useAppointments();
  const { products } = useProductsData();
  const { services } = useServices();

  const limits = [
    { 
      type: 'clients' as const, 
      current: totalClients, 
      label: 'Clientes',
      icon: '👥'
    },
    { 
      type: 'appointments' as const, 
      current: appointments.length, 
      label: 'Agendamentos',
      icon: '📅'
    },
    { 
      type: 'products' as const, 
      current: products.length, 
      label: 'Produtos',
      icon: '📦'
    },
    { 
      type: 'services' as const, 
      current: services.length, 
      label: 'Serviços',
      icon: '⚙️'
    },
  ];

  if (isTestUser) {
    return (
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-800 dark:text-blue-200 text-lg flex items-center gap-2">
            🧪 Modo de Teste - Acesso Completo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Você tem acesso ilimitado a todas as funcionalidades para testes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Limites do Plano
          <Badge variant={currentPlan === 'premium' ? 'default' : 'secondary'}>
            {currentPlan === 'trial' ? 'Gratuito' : 
             currentPlan === 'professional' ? 'Professional' : 'Premium'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {limits.map(({ type, current, label, icon }) => {
          const limit = getLimit(type);
          const isAtLimit = hasReachedLimit(type, current);
          const isUnlimited = limit === -1;
          const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);

          return (
            <div key={type} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span>{icon}</span>
                  {label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {current}
                    {isUnlimited ? (
                      <span className="text-green-600 ml-1">
                        <Infinity className="w-4 h-4 inline" />
                      </span>
                    ) : (
                      `/${limit}`
                    )}
                  </span>
                  {isAtLimit ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : current >= limit * 0.8 && !isUnlimited ? (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
              {!isUnlimited && (
                <Progress 
                  value={percentage} 
                  className={`h-2 ${
                    isAtLimit ? 'bg-red-100' : 
                    percentage >= 80 ? 'bg-orange-100' : 
                    'bg-green-100'
                  }`}
                />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};