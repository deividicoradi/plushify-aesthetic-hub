
import React, { useState } from 'react';
import { Megaphone, Target, Send, BarChart3, Users, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

const Marketing = () => {
  const { hasFeature } = useSubscription();
  const navigate = useNavigate();
  const [campaignData, setCampaignData] = useState({
    title: '',
    message: '',
    target: 'all'
  });

  if (!hasFeature('pro')) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto text-center">
          <Megaphone className="w-16 h-16 text-pink-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Marketing Automatizado</h1>
          <p className="text-gray-600 mb-8">
            Funcionalidade disponível a partir do plano Pro. Crie campanhas inteligentes e personalizadas para seus clientes.
          </p>
          <Button onClick={() => navigate('/planos')} className="bg-pink-600 hover:bg-pink-700">
            Fazer Upgrade para Pro
          </Button>
        </div>
      </div>
    );
  }

  const campaigns = [
    {
      name: 'Promoção de Verão',
      status: 'Ativa',
      sent: 245,
      opened: 189,
      clicked: 67,
      type: 'WhatsApp'
    },
    {
      name: 'Lembrete de Retorno',
      status: 'Pausada',
      sent: 156,
      opened: 134,
      clicked: 45,
      type: 'SMS'
    },
    {
      name: 'Novos Serviços',
      status: 'Rascunho',
      sent: 0,
      opened: 0,
      clicked: 0,
      type: 'Email'
    }
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-pink-600" />
            <h1 className="text-2xl font-bold">Marketing Automatizado</h1>
          </div>
          <Badge className={hasFeature('premium') ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}>
            {hasFeature('premium') ? 'Premium' : 'Pro'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-pink-600" />
                  Criar Nova Campanha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Título da Campanha</label>
                    <Input 
                      placeholder="Ex: Promoção Especial de Inverno"
                      value={campaignData.title}
                      onChange={(e) => setCampaignData({...campaignData, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Público Alvo</label>
                    <select 
                      className="w-full h-10 border border-input rounded-md px-3 text-sm"
                      value={campaignData.target}
                      onChange={(e) => setCampaignData({...campaignData, target: e.target.value})}
                    >
                      <option value="all">Todos os clientes</option>
                      <option value="active">Clientes ativos</option>
                      <option value="inactive">Clientes inativos</option>
                      <option value="vip">Clientes VIP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Mensagem</label>
                    <Textarea 
                      placeholder="Digite sua mensagem personalizada..."
                      value={campaignData.message}
                      onChange={(e) => setCampaignData({...campaignData, message: e.target.value})}
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-pink-600 hover:bg-pink-700">
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Agora
                    </Button>
                    <Button variant="outline">
                      Agendar Envio
                    </Button>
                    <Button variant="outline">
                      Salvar Rascunho
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Resumo do Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">1,247</div>
                    <div className="text-sm text-gray-600">Mensagens Enviadas</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">78%</div>
                    <div className="text-sm text-gray-600">Taxa de Abertura</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">34%</div>
                    <div className="text-sm text-gray-600">Taxa de Conversão</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Campanhas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Campanha</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Enviadas</th>
                    <th className="text-left p-2">Abertas</th>
                    <th className="text-left p-2">Cliques</th>
                    <th className="text-left p-2">Tipo</th>
                    <th className="text-left p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{campaign.name}</td>
                      <td className="p-2">
                        <Badge variant={campaign.status === 'Ativa' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </td>
                      <td className="p-2">{campaign.sent}</td>
                      <td className="p-2">{campaign.opened}</td>
                      <td className="p-2">{campaign.clicked}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {campaign.type}
                        </div>
                      </td>
                      <td className="p-2">
                        <Button variant="ghost" size="sm">
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Marketing;
