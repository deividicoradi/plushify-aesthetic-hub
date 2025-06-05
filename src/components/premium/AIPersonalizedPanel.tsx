
import React from 'react';
import { Brain, Sparkles, TrendingUp, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const AIPersonalizedPanel = () => {
  const aiFeatures = [
    {
      icon: Brain,
      title: 'Análise Comportamental',
      description: 'IA analisa padrões dos seus clientes',
      insight: '85% dos clientes preferem agendamentos vespertinos',
      color: 'bg-purple-500'
    },
    {
      icon: Sparkles,
      title: 'Sugestões Personalizadas',
      description: 'Recomendações específicas para seu negócio',
      insight: 'Ofereça pacotes combo para aumentar receita em 32%',
      color: 'bg-blue-500'
    },
    {
      icon: TrendingUp,
      title: 'Previsões de Demanda',
      description: 'Antecipe períodos de alta e baixa',
      insight: 'Dezembro: +40% de demanda prevista',
      color: 'bg-green-500'
    },
    {
      icon: MessageCircle,
      title: 'Comunicação Inteligente',
      description: 'Mensagens personalizadas por IA',
      insight: 'Templates otimizados para seu público',
      color: 'bg-orange-500'
    }
  ];

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            IA Personalizada
          </CardTitle>
          <Badge className="bg-purple-100 text-purple-700">Premium</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {aiFeatures.map((feature, index) => (
          <div key={index} className="p-4 rounded-lg border border-gray-100 hover:border-purple-200 transition-colors">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                <feature.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{feature.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                <div className="bg-purple-50 p-2 rounded text-sm text-purple-700">
                  💡 {feature.insight}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <Button className="w-full bg-purple-600 hover:bg-purple-700">
          Configurar IA Personalizada
        </Button>
      </CardContent>
    </Card>
  );
};
