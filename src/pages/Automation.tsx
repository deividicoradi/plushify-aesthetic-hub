
import React, { useState } from 'react';
import { Zap, MessageSquare, Calendar, Users, Plus, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

const Automation = () => {
  const { hasFeature } = useSubscription();
  const navigate = useNavigate();
  const [automations, setAutomations] = useState([
    { id: 1, name: 'Lembrete 24h antes', type: 'reminder', active: true },
    { id: 2, name: 'Follow-up pós atendimento', type: 'followup', active: true },
    { id: 3, name: 'Aniversário do cliente', type: 'birthday', active: false },
    { id: 4, name: 'Recuperação de cliente inativo', type: 'reactivation', active: true }
  ]);

  if (!hasFeature('premium')) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto text-center">
          <Zap className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Automações Inteligentes</h1>
          <p className="text-gray-600 mb-8">
            Funcionalidade exclusiva do plano Premium. Automatize suas comunicações e workflows para economizar tempo e aumentar a satisfação dos clientes.
          </p>
          <Button onClick={() => navigate('/planos')} className="bg-orange-600 hover:bg-orange-700">
            Fazer Upgrade para Premium
          </Button>
        </div>
      </div>
    );
  }

  const toggleAutomation = (id: number) => {
    setAutomations(prev => 
      prev.map(auto => 
        auto.id === id ? { ...auto, active: !auto.active } : auto
      )
    );
  };

  const automationTemplates = [
    {
      title: 'Lembrete Automático',
      description: 'Envie lembretes por WhatsApp/SMS automaticamente',
      trigger: 'X horas antes do agendamento',
      action: 'Enviar mensagem personalizada',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Follow-up Inteligente',
      description: 'Peça feedback após cada atendimento',
      trigger: 'Y horas após o atendimento',
      action: 'Solicitar avaliação e agendamento',
      icon: MessageSquare,
      color: 'bg-green-500'
    },
    {
      title: 'Recuperação de Clientes',
      description: 'Reconquiste clientes inativos',
      trigger: 'Z dias sem agendamento',
      action: 'Oferta especial personalizada',
      icon: Users,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl font-bold">Automações Inteligentes</h1>
          </div>
          <Badge className="bg-orange-100 text-orange-700">Premium</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Automações Ativas
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Automação
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automations.map((automation) => (
                  <div key={automation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{automation.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{automation.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={automation.active}
                        onCheckedChange={() => toggleAutomation(automation.id)}
                      />
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Automação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span>Mensagens Enviadas (Mês)</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">1,247</div>
                    <div className="text-sm text-green-600">+18% vs mês anterior</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span>Taxa de Resposta</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">87%</div>
                    <div className="text-sm text-blue-600">Acima da média</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                  <span>Tempo Economizado</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">12h</div>
                    <div className="text-sm text-purple-600">Por semana</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {automationTemplates.map((template, index) => (
            <Card key={index} className="border-orange-100 hover:border-orange-200 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${template.color} text-white`}>
                    <template.icon className="w-5 h-5" />
                  </div>
                  {template.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{template.description}</p>
                <div className="space-y-2 text-sm">
                  <div><strong>Gatilho:</strong> {template.trigger}</div>
                  <div><strong>Ação:</strong> {template.action}</div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Configurar Automação
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Automation;
