
import React from 'react';
import { Plus, Calendar, Users, Package, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className={`h-auto p-4 flex flex-col items-center gap-2 text-white border-0 ${action.color}`}
              onClick={action.onClick}
            >
              <action.icon className="w-6 h-6" />
              <div className="text-center">
                <div className="text-sm font-medium">{action.label}</div>
                <div className="text-xs opacity-90">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
