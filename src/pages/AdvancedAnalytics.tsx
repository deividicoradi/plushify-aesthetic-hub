
import React, { useState } from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { BarChart3, Clock, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { addDays } from 'date-fns';

import { useServicePerformance } from '@/hooks/analytics/useServicePerformance';
import { useTimeAnalysis } from '@/hooks/analytics/useTimeAnalysis';
import { useClientROI } from '@/hooks/analytics/useClientROI';
import { useRevenueForecasting } from '@/hooks/analytics/useRevenueForecasting';

import { ServicePerformanceChart } from '@/components/analytics/ServicePerformanceChart';
import { TimeAnalysisCharts } from '@/components/analytics/TimeAnalysisCharts';
import { ClientROITable } from '@/components/analytics/ClientROITable';
import { RevenueForecastChart } from '@/components/analytics/RevenueForecastChart';

const AdvancedAnalytics = () => {
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -90),
    to: new Date()
  });

  // Hooks para buscar dados
  const servicePerformance = useServicePerformance(dateRange.from, dateRange.to);
  const { hourlyMovement, seasonalAnalysis } = useTimeAnalysis();
  const clientROI = useClientROI(20);
  const revenueForecasting = useRevenueForecasting();

  const handleRefresh = () => {
    servicePerformance.refetch();
    hourlyMovement.refetch();
    seasonalAnalysis.refetch();
    clientROI.refetch();
    revenueForecasting.refetch();
  };

  const isLoading = servicePerformance.isLoading || hourlyMovement.isLoading || 
                   seasonalAnalysis.isLoading || clientROI.isLoading || revenueForecasting.isLoading;

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-h-screen bg-background">
        {/* Header */}
        <header className="flex items-center gap-4 border-b border-border bg-background px-6 py-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Analytics Avançado
            </h1>
            <p className="text-muted-foreground text-sm">
              Análises detalhadas de performance, clientes e previsões
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DatePickerWithRange
              value={dateRange}
              onChange={setDateRange}
            />
            <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 space-y-6 bg-background">
          <Tabs defaultValue="performance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Tempo
              </TabsTrigger>
              <TabsTrigger value="clients" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Clientes
              </TabsTrigger>
              <TabsTrigger value="forecast" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Previsões
              </TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-6">
              <ServicePerformanceChart 
                data={servicePerformance.data || []} 
                loading={servicePerformance.isLoading}
              />
            </TabsContent>

            <TabsContent value="time" className="space-y-6">
              <TimeAnalysisCharts 
                hourlyData={hourlyMovement.data || []}
                seasonalData={seasonalAnalysis.data || []}
                loading={hourlyMovement.isLoading || seasonalAnalysis.isLoading}
              />
            </TabsContent>

            <TabsContent value="clients" className="space-y-6">
              <ClientROITable 
                data={clientROI.data || []} 
                loading={clientROI.isLoading}
              />
            </TabsContent>

            <TabsContent value="forecast" className="space-y-6">
              <RevenueForecastChart 
                data={revenueForecasting.data || []} 
                loading={revenueForecasting.isLoading}
              />
            </TabsContent>
          </Tabs>

          {/* Resumo estatístico */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Serviços Analisados</p>
                  <p className="text-2xl font-bold">{servicePerformance.data?.length || 0}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Horário de Pico</p>
                  <p className="text-2xl font-bold">
                    {hourlyMovement.data ? 
                      `${hourlyMovement.data.reduce((max, hour) => 
                        hour.appointments_count > max.appointments_count ? hour : max, 
                        hourlyMovement.data[0]
                      )?.hour || 0}:00` : '--:--'
                    }
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Clientes VIP</p>
                  <p className="text-2xl font-bold">
                    {clientROI.data?.filter(c => c.roi_score >= 1000).length || 0}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Tendência</p>
                  <p className={`text-2xl font-bold ${
                    revenueForecasting.data && revenueForecasting.data.length > 0 && 
                    revenueForecasting.data[revenueForecasting.data.length - 1]?.trend === 'up' 
                      ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {revenueForecasting.data && revenueForecasting.data.length > 0 
                      ? revenueForecasting.data[revenueForecasting.data.length - 1]?.trend === 'up' 
                        ? '↗️ Alta' : '↘️ Baixa'
                      : '-- Neutro'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
