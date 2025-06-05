
import React from 'react';
import { Plus, Calendar, Users, Package, MessageSquare, Brain, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';

interface QuickAction {
  icon: React.ComponentType<any>;
  label: string;
  description: string;
  onClick: () => void;
  color: string;
  isPremium?: boolean;
}

export const QuickActions = () => {
  const navigate = useNavigate();
  const { hasFeature } = useSubscription();

  const basicActions: QuickAction[] = [
    {
      icon: Plus,
      label: 'Novo Agendamento',
      description: 'Agendar serviço',
      onClick: () => navigate('/agendamentos'),
      color: 'bg-plush-500 hover:bg-plush-600'
    },
    {
      icon: Users,
      label: 'Adicionar Cliente',
      description: 'Cadastrar novo cliente',
      onClick: () => navigate('/clientes'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      icon: Package,
      label: 'Controlar Estoque',
      description: 'Gerenciar produtos',
      onClick: () => navigate('/estoque'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: MessageSquare,
      label: 'Enviar Mensagem',
      description: 'Comunicar com clientes',
      onClick: () => navigate('/comunicacao'),
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  const premiumActions: QuickAction[] = [
    {
      icon: Brain,
      label: 'IA Personalizada',
      description: 'Análises inteligentes',
      onClick: () => navigate('/ai-dashboard'),
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      isPremium: true
    },
    {
      icon: Target,
      label: 'CRM Avançado',
      description: 'Gestão de vendas',
      onClick: () => navigate('/crm'),
      color: 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600',
      isPremium: true
    },
    {
      icon: Zap,
      label: 'Automações',
      description: 'Workflows inteligentes',
      onClick: () => navigate('/automacoes'),
      color: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600',
      isPremium: true
    }
  ];

  const allActions = hasFeature('premium') 
    ? [...basicActions.slice(0, 2), ...premiumActions.slice(0, 2)]
    : basicActions;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Ações Rápidas
          {hasFeature('premium') && (
            <Badge className="bg-purple-100 text-purple-700">Premium</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {allActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className={`h-auto p-4 flex flex-col items-center gap-2 text-white border-0 relative ${action.color}`}
              onClick={action.onClick}
            >
              {action.isPremium && (
                <Badge className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs px-1">
                  AI
                </Badge>
              )}
              <action.icon className="w-6 h-6" />
              <div className="text-center">
                <div className="text-sm font-medium">{action.label}</div>
                <div className="text-xs opacity-90">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>

        {!hasFeature('premium') && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Recursos Premium</span>
            </div>
            <p className="text-xs text-purple-700 mb-2">
              Desbloqueie IA personalizada, CRM avançado e automações inteligentes
            </p>
            <Button 
              size="sm" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-xs"
              onClick={() => navigate('/planos')}
            >
              Upgrade para Premium
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
