
import React from 'react';
import { Target, Users, DollarSign, TrendingUp, Phone, Mail, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const AdvancedCRM = () => {
  const salesFunnel = [
    { stage: 'Prospects', count: 45, percentage: 100, color: 'bg-blue-500' },
    { stage: 'Qualificados', count: 32, percentage: 71, color: 'bg-purple-500' },
    { stage: 'Propostas', count: 18, percentage: 40, color: 'bg-orange-500' },
    { stage: 'Fechados', count: 12, percentage: 27, color: 'bg-green-500' }
  ];

  const leadSources = [
    { source: 'Instagram', leads: 28, conversion: 35, revenue: 'R$ 4.200' },
    { source: 'Google Ads', leads: 15, conversion: 60, revenue: 'R$ 6.800' },
    { source: 'Indicações', leads: 12, conversion: 75, revenue: 'R$ 8.100' },
    { source: 'Facebook', leads: 22, conversion: 25, revenue: 'R$ 2.900' }
  ];

  const recentActivities = [
    { type: 'call', client: 'Maria Silva', action: 'Ligação realizada', time: '10 min', status: 'success' },
    { type: 'email', client: 'João Santos', action: 'Email enviado', time: '1h', status: 'pending' },
    { type: 'message', client: 'Ana Costa', action: 'WhatsApp respondido', time: '2h', status: 'success' },
    { type: 'call', client: 'Pedro Lima', action: 'Ligação perdida', time: '3h', status: 'failed' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'message': return MessageSquare;
      default: return MessageSquare;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Funil de Vendas
            </CardTitle>
            <Badge className="bg-green-100 text-green-700">Premium CRM</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesFunnel.map((stage, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  <div>
                    <h4 className="font-medium">{stage.stage}</h4>
                    <p className="text-sm text-gray-600">{stage.count} leads</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24">
                    <Progress value={stage.percentage} className="h-2" />
                  </div>
                  <span className="text-sm font-medium w-12">{stage.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Taxa de Conversão: 27%</span>
            </div>
            <p className="text-sm text-green-700">Acima da média do setor (22%)</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Origens de Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leadSources.map((source, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{source.source}</h4>
                  <Badge variant="outline">{source.leads} leads</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Conversão</p>
                    <p className="font-medium text-purple-600">{source.conversion}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Receita</p>
                    <p className="font-medium text-green-600">{source.revenue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <IconComponent className={`w-4 h-4 ${getStatusColor(activity.status)}`} />
                  <div className="flex-1">
                    <p className="font-medium">{activity.client}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              );
            })}
          </div>
          
          <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
            Ver Todas as Atividades
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
