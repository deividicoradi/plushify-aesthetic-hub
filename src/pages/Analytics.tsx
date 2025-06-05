
import React from 'react';
import { TrendingUp, Users, Calendar, DollarSign, Target, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const { hasFeature } = useSubscription();
  const navigate = useNavigate();

  if (!hasFeature('premium')) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto text-center">
          <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Análises Avançadas com IA</h1>
          <p className="text-gray-600 mb-8">
            Funcionalidade exclusiva do plano Premium. Obtenha insights poderosos sobre seu negócio com inteligência artificial.
          </p>
          <Button onClick={() => navigate('/planos')} className="bg-purple-600 hover:bg-purple-700">
            Fazer Upgrade para Premium
          </Button>
        </div>
      </div>
    );
  }

  const analyticsData = [
    {
      title: 'Análise de Performance',
      description: 'IA analisa seus dados e identifica padrões de sucesso',
      insight: 'Clientes que recebem lembretes têm 40% mais chance de retornar',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Segmentação Inteligente',
      description: 'Agrupe clientes por comportamento e preferências',
      insight: '65% dos seus clientes preferem agendamentos pela manhã',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Previsão de Demanda',
      description: 'Antecipe picos de movimento e organize sua agenda',
      insight: 'Dezembro terá 35% mais agendamentos que novembro',
      icon: Calendar,
      color: 'bg-purple-500'
    },
    {
      title: 'Otimização de Preços',
      description: 'IA sugere ajustes de preço baseados no mercado',
      insight: 'Aumente 15% o preço do serviço X para maximizar receita',
      icon: DollarSign,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold">Análises Avançadas com IA</h1>
          </div>
          <Badge className="bg-purple-100 text-purple-700">Premium</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {analyticsData.map((item, index) => (
            <Card key={index} className="border-purple-100 hover:border-purple-200 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.color} text-white`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700">
                    💡 <strong>Insight:</strong> {item.insight}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Relatório de Performance Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span>Taxa de Conversão</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">78%</div>
                  <div className="text-sm text-green-600">+12% vs semana anterior</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span>Satisfação do Cliente</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">4.8/5</div>
                  <div className="text-sm text-blue-600">+0.3 vs mês anterior</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <span>Receita por Cliente</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">R$ 185</div>
                  <div className="text-sm text-purple-600">+22% vs último trimestre</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
