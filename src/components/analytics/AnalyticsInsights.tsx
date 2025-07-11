import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsInsightsProps {
  newThisMonth: number;
}

const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({ newThisMonth }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights Principais</CardTitle>
        <CardDescription>
          Análises automáticas baseadas nos seus dados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">
              📈 Crescimento Positivo
            </h4>
            <p className="text-sm text-muted-foreground">
              Seu negócio cresceu {newThisMonth} novos clientes este mês, 
              mostrando uma tendência positiva de expansão.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
              🕐 Horário de Pico
            </h4>
            <p className="text-sm text-muted-foreground">
              O período entre 15h-16h é o mais movimentado, 
              considere otimizar a agenda para esse horário.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">
              💎 Clientes VIP
            </h4>
            <p className="text-sm text-muted-foreground">
              Identifique e cultive relacionamentos com seus top clientes 
              para maximizar o lifetime value.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsInsights;