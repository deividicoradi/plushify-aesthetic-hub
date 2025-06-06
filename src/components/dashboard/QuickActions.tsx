
import React from 'react';
import { Plus, Calendar, Users, Package, Brain, Target, Zap, ArrowRight } from 'lucide-react';
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
  textColor?: string;
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
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-white'
    },
    {
      icon: Users,
      label: 'Adicionar Cliente',
      description: 'Cadastrar novo cliente',
      onClick: () => navigate('/clientes'),
      color: 'from-green-500 to-green-600',
      textColor: 'text-white'
    },
    {
      icon: Package,
      label: 'Controlar Estoque',
      description: 'Gerenciar produtos',
      onClick: () => navigate('/estoque'),
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-white'
    },
    {
      icon: Calendar,
      label: 'Ver Agenda',
      description: 'Visualizar agendamentos',
      onClick: () => navigate('/agendamentos'),
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-white'
    }
  ];

  const premiumActions: QuickAction[] = [
    {
      icon: Brain,
      label: 'IA Personalizada',
      description: 'Análises inteligentes',
      onClick: () => navigate('/ai-dashboard'),
      color: 'from-gradient-purple to-gradient-pink',
      textColor: 'text-white',
      isPremium: true
    },
    {
      icon: Target,
      label: 'CRM Avançado',
      description: 'Gestão de vendas',
      onClick: () => navigate('/crm'),
      color: 'from-gradient-blue to-gradient-cyan',
      textColor: 'text-white',
      isPremium: true
    }
  ];

  const allActions = hasFeature('premium') 
    ? [...basicActions.slice(0, 2), ...premiumActions]
    : basicActions;

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-card dark:to-card/50">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border-b border-border/50">
        <CardTitle className="flex items-center justify-between text-card-foreground">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            Ações Rápidas
          </div>
          {hasFeature('premium') && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
              Premium
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className={`h-auto p-4 flex flex-col items-center gap-3 border-0 relative bg-gradient-to-br ${action.color} hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg group`}
              onClick={action.onClick}
            >
              {action.isPremium && (
                <Badge className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full shadow-sm">
                  AI
                </Badge>
              )}
              <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                <action.icon className={`w-5 h-5 ${action.textColor || 'text-white'}`} />
              </div>
              <div className="text-center">
                <div className={`text-sm font-semibold ${action.textColor || 'text-white'}`}>
                  {action.label}
                </div>
                <div className={`text-xs opacity-90 ${action.textColor || 'text-white'}`}>
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>

        {!hasFeature('premium') && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100">Recursos Premium</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    IA personalizada, CRM avançado e automações
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md"
                onClick={() => navigate('/planos')}
              >
                Upgrade
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
