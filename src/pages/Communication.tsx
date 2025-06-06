
import React, { useState } from 'react';
import { 
  MessageSquare, 
  Mail, 
  Send,
  Phone,
  Users,
  Calendar,
  Bell,
  TrendingUp,
  Filter,
  Plus,
  Search,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const Communication = () => {
  const [message, setMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    message: '',
    channel: 'email',
    audience: 'all'
  });

  const channels = [
    {
      id: 'email',
      title: "Email Marketing",
      icon: Mail,
      description: "Alcance seus clientes com campanhas personalizadas",
      count: "2.4k enviados",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      sent: 2400,
      opened: 1890,
      clicked: 567
    },
    {
      id: 'sms',
      title: "SMS/WhatsApp",
      icon: Phone,
      description: "Comunicação direta e instantânea",
      count: "1.8k enviados",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      sent: 1800,
      opened: 1650,
      clicked: 423
    },
    {
      id: 'chat',
      title: "Chat em Tempo Real",
      icon: MessageSquare,
      description: "Atendimento personalizado imediato",
      count: "890 conversas",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      sent: 890,
      opened: 820,
      clicked: 234
    },
    {
      id: 'push',
      title: "Notificações Push",
      icon: Bell,
      description: "Mantenha seus clientes atualizados",
      count: "3.2k enviadas",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      sent: 3200,
      opened: 2890,
      clicked: 789
    }
  ];

  const campaigns = [
    {
      id: 1,
      title: "Promoção de Verão 2024",
      channel: "WhatsApp",
      status: "Ativa",
      sent: 245,
      opened: 189,
      clicked: 67,
      date: "2024-01-15",
      audience: "Todos os clientes"
    },
    {
      id: 2,
      title: "Lembrete de Agendamento",
      channel: "SMS",
      status: "Agendada",
      sent: 0,
      opened: 0,
      clicked: 0,
      date: "2024-01-20",
      audience: "Clientes com agendamento"
    },
    {
      id: 3,
      title: "Novos Serviços Disponíveis",
      channel: "Email",
      status: "Rascunho",
      sent: 0,
      opened: 0,
      clicked: 0,
      date: "2024-01-25",
      audience: "Clientes VIP"
    }
  ];

  const templates = [
    {
      id: 1,
      title: "Confirmação de Agendamento",
      description: "Confirma automaticamente novos agendamentos",
      type: "Automático"
    },
    {
      id: 2,
      title: "Lembrete 24h",
      description: "Lembra clientes sobre agendamentos",
      type: "Automático"
    },
    {
      id: 3,
      title: "Promoção Mensal",
      description: "Template para campanhas promocionais",
      type: "Manual"
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      toast.success("Mensagem enviada com sucesso!");
      setMessage('');
    } else {
      toast.error("Por favor, digite uma mensagem.");
    }
  };

  const handleCreateCampaign = () => {
    if (newCampaign.title && newCampaign.message) {
      toast.success("Campanha criada com sucesso!");
      setNewCampaign({ title: '', message: '', channel: 'email', audience: 'all' });
    } else {
      toast.error("Preencha todos os campos obrigatórios.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativa': return 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400';
      case 'Pausada': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400';
      case 'Agendada': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-950/20 dark:text-gray-400';
    }
  };

  const filteredChannels = channels.filter(channel => 
    selectedChannel === 'all' || channel.id === selectedChannel
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold font-serif">Comunicação</h1>
              <p className="text-muted-foreground">Gerencie todas as suas comunicações com clientes</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Campanha
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Nova Campanha</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Título</label>
                    <Input
                      placeholder="Nome da campanha"
                      value={newCampaign.title}
                      onChange={(e) => setNewCampaign({...newCampaign, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Canal</label>
                    <Select value={newCampaign.channel} onValueChange={(value) => setNewCampaign({...newCampaign, channel: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS/WhatsApp</SelectItem>
                        <SelectItem value="push">Push</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Público</label>
                    <Select value={newCampaign.audience} onValueChange={(value) => setNewCampaign({...newCampaign, audience: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os clientes</SelectItem>
                        <SelectItem value="active">Clientes ativos</SelectItem>
                        <SelectItem value="inactive">Clientes inativos</SelectItem>
                        <SelectItem value="vip">Clientes VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Mensagem</label>
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      value={newCampaign.message}
                      onChange={(e) => setNewCampaign({...newCampaign, message: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleCreateCampaign} className="w-full">
                    Criar Campanha
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar campanhas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os canais</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS/WhatsApp</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="push">Push</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Canais de Comunicação */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredChannels.map((channel) => (
                <Card key={channel.id} className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${channel.bgColor}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <div className="flex items-center gap-2">
                        <channel.icon className={`w-5 h-5 ${channel.color}`} />
                        {channel.title}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Configurar</DropdownMenuItem>
                          <DropdownMenuItem>Histórico</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-3">{channel.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Enviadas:</span>
                        <span className="font-medium">{channel.sent}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Abertas:</span>
                        <span className="font-medium text-green-600">{channel.opened}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Cliques:</span>
                        <span className="font-medium text-blue-600">{channel.clicked}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Taxa de abertura</span>
                        <span className="text-xs font-medium">
                          {Math.round((channel.opened / channel.sent) * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mensagem Rápida */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  Mensagem Rápida
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os clientes</SelectItem>
                        <SelectItem value="active">Clientes ativos</SelectItem>
                        <SelectItem value="vip">Clientes VIP</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="whatsapp">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Campanhas Ativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{campaign.title}</h3>
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">via {campaign.channel}</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span>Público: {campaign.audience}</span>
                          <span>Enviadas: {campaign.sent}</span>
                          <span>Abertas: {campaign.opened}</span>
                          <span>Cliques: {campaign.clicked}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Duplicar</DropdownMenuItem>
                          <DropdownMenuItem>Pausar</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Templates de Mensagens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{template.title}</CardTitle>
                        <Badge variant="outline" className="w-fit">
                          {template.type}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            Editar
                          </Button>
                          <Button size="sm" className="flex-1">
                            Usar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Enviado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8.29k</div>
                  <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Taxa de Abertura</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78.2%</div>
                  <p className="text-xs text-muted-foreground">+5.4% vs mês anterior</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Taxa de Cliques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24.8%</div>
                  <p className="text-xs text-muted-foreground">+2.1% vs mês anterior</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Conversões</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">+23% vs mês anterior</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Communication;
