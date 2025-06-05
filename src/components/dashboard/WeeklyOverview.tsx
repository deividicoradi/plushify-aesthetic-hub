
import React from 'react';
import { Calendar, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const WeeklyOverview = () => {
  const weekData = {
    appointmentsCompleted: 89,
    appointmentsTotal: 120,
    revenueActual: 8450,
    revenueGoal: 10000,
    averageServiceTime: 75,
    clientSatisfaction: 94
  };

  const appointmentProgress = (weekData.appointmentsCompleted / weekData.appointmentsTotal) * 100;
  const revenueProgress = (weekData.revenueActual / weekData.revenueGoal) * 100;

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
              {weekData.appointmentsCompleted}/{weekData.appointmentsTotal}
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
              R$ {weekData.revenueActual.toLocaleString()}/R$ {weekData.revenueGoal.toLocaleString()}
            </span>
          </div>
          <Progress value={revenueProgress} className="h-2" />
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
              {weekData.averageServiceTime}min
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Satisfação</span>
            </div>
            <p className="text-lg font-semibold text-green-600">
              {weekData.clientSatisfaction}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
