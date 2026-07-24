import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PeakHour {
  hour: number;
  appointments_count: number;
}

interface TopClient {
  client_name: string;
  total_spent: number;
}

interface AnalyticsInsightsProps {
  newThisMonth: number;
  periodLabel?: string;
  peakHour?: PeakHour | null;
  topClient?: TopClient | null;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatHourRange = (hour: number) =>
  `${String(hour).padStart(2, '0')}h-${String((hour + 1) % 24).padStart(2, '0')}h`;

const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({ newThisMonth, periodLabel, peakHour, topClient }) => {
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Insights Principais</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Análises automáticas baseadas nos seus dados
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <div className="p-3 sm:p-4 border rounded-lg">
            <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">
              📈 Crescimento Positivo
            </h4>
            <p className="text-sm text-muted-foreground">
              Seu negócio cresceu {newThisMonth} novos clientes
              {periodLabel ? ` no período "${periodLabel}"` : ' este mês'},
              mostrando uma tendência positiva de expansão.
            </p>
          </div>
          
          <div className="p-3 sm:p-4 border rounded-lg">
            <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
              🕐 Horário de Pico
            </h4>
            <p className="text-sm text-muted-foreground">
              {peakHour ? (
                <>
                  O período entre {formatHourRange(peakHour.hour)} é o mais movimentado
                  ({peakHour.appointments_count} agendamento{peakHour.appointments_count !== 1 ? 's' : ''}),
                  considere otimizar a agenda para esse horário.
                </>
              ) : (
                'Ainda não há agendamentos suficientes para identificar o horário de pico.'
              )}
            </p>
          </div>

          <div className="p-3 sm:p-4 border rounded-lg">
            <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">
              💎 Clientes VIP
            </h4>
            <p className="text-sm text-muted-foreground">
              {topClient ? (
                <>
                  <strong>{topClient.client_name}</strong> é seu cliente com maior retorno
                  ({formatCurrency(topClient.total_spent)} em gastos), cultive esse relacionamento
                  para maximizar o lifetime value.
                </>
              ) : (
                'Ainda não há dados suficientes para identificar seus clientes VIP.'
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsInsights;