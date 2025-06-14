
import React from 'react';
import { Calendar, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useWeeklyOverviewData } from '@/hooks/useWeeklyOverviewData';

export const WeeklyOverview = () => {
  const {
    appointmentsCompleted,
    appointmentsTotal,
    revenueActual,
    revenueGoal,
    averageServiceTime,
    clientSatisfaction,
    loading
  } = useWeeklyOverviewData();

  const appointmentProgress = appointmentsTotal > 0 ? (appointmentsCompleted / appointmentsTotal) * 100 : 0;
  const revenueProgress = (revenueActual / revenueGoal) * 100;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-plush-600" />
            Resumo da Semana
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-plush-600" />
          Resumo da Semana
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Agendamentos</span>
            </div>
            <span className="text-sm font-medium">
              {appointmentsCompleted}/{appointmentsTotal}
            </span>
          </div>
          <Progress value={appointmentProgress} className="h-2" />
          <p className="text-xs text-gray-500">
            {appointmentProgress.toFixed(0)}% dos agendamentos concluídos
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Meta de Faturamento</span>
            </div>
            <span className="text-sm font-medium">
              R$ {revenueActual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/R$ {revenueGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <Progress value={Math.min(revenueProgress, 100)} className="h-2" />
          <p className="text-xs text-gray-500">
            {revenueProgress.toFixed(0)}% da meta atingida
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Tempo Médio</span>
            </div>
            <p className="text-lg font-semibold text-plush-600">
              {averageServiceTime > 0 ? `${averageServiceTime}min` : 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Satisfação</span>
            </div>
            <p className="text-lg font-semibold text-green-600">
              {clientSatisfaction}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
