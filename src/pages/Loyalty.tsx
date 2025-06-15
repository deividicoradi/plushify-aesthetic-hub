
import React from "react";
import { Award, Star, BadgeCheck, Gift, Trophy, Users, TrendingUp, DollarSign, Calendar, Crown } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLoyalty, LoyaltyClient } from "@/hooks/useLoyalty";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'Diamante': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md';
    case 'Ouro': return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-md';
    case 'Prata': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md';
    default: return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md';
  }
};

const getTierIcon = (tier: string) => {
  switch (tier) {
    case 'Diamante': return <Crown className="w-4 h-4" />;
    case 'Ouro': return <Trophy className="w-4 h-4" />;
    case 'Prata': return <Award className="w-4 h-4" />;
    default: return <BadgeCheck className="w-4 h-4" />;
  }
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export default function Loyalty() {
  const { clients, stats, loading } = useLoyalty();

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  const topClients = clients.slice(0, 5);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <TooltipProvider>
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Programa de Fidelidade</h1>
                    <p className="text-muted-foreground">Gerencie pontos e recompensas dos seus clientes</p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total de Clientes</p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalClients}</p>
                      </div>
                      <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">Agendamentos</p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.totalAppointments}</p>
                      </div>
                      <div className="p-2 bg-green-200 dark:bg-green-800 rounded-lg">
                        <Calendar className="w-5 h-5 text-green-600 dark:text-green-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Receita Total</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(stats.totalRevenue)}
                        </p>
                      </div>
                      <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
                        <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Pontos Distribuídos</p>
                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.pointsDistributed}</p>
                      </div>
                      <div className="p-2 bg-orange-200 dark:bg-orange-800 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Clients and Rules */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Clients */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <CardTitle className="text-lg">Top 5 Clientes Fidelizados</CardTitle>
                      </div>
                      <CardDescription>Ranking dos clientes com mais pontos acumulados</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {topClients.length > 0 ? (
                        <div className="space-y-3">
                          {topClients.map((client, index) => (
                            <div key={client.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                                {index + 1}
                              </div>
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                  {getInitials(client.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium truncate">{client.name}</h3>
                                  <Badge className={`${getTierColor(client.tier)} text-xs shrink-0`}>
                                    {getTierIcon(client.tier)}
                                    <span className="ml-1">{client.tier}</span>
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                  {client.email || client.phone || 'Sem contato'}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-lg font-bold text-primary">{client.totalPoints} pts</div>
                                <div className="text-sm text-muted-foreground">
                                  {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                  }).format(client.totalSpent)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="font-medium">Nenhum cliente com pontos ainda</p>
                          <p className="text-sm">Complete alguns agendamentos para ver o ranking!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* How it works */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Gift className="w-5 h-5 text-primary" />
                      Como Funciona
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-green-100 dark:bg-green-900 rounded">
                          <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">1 Real = 1 Ponto</p>
                          <p className="text-xs text-muted-foreground">A cada R$ 1,00 gasto, o cliente ganha 1 ponto</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Automático</p>
                          <p className="text-xs text-muted-foreground">Pontos creditados quando o agendamento é concluído</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-purple-100 dark:bg-purple-900 rounded">
                          <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Tiers Automáticos</p>
                          <p className="text-xs text-muted-foreground">Bronze, Prata, Ouro e Diamante</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t space-y-2">
                      <h4 className="font-medium text-sm">Níveis de Fidelidade:</h4>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <Badge variant="secondary" className="text-xs">Bronze</Badge>
                          <span className="text-muted-foreground">R$ 0+</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <Badge className="bg-gray-400 text-white text-xs">Prata</Badge>
                          <span className="text-muted-foreground">R$ 500+</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <Badge className="bg-yellow-500 text-white text-xs">Ouro</Badge>
                          <span className="text-muted-foreground">R$ 1.000+</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <Badge className="bg-blue-500 text-white text-xs">Diamante</Badge>
                          <span className="text-muted-foreground">R$ 2.000+</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* All Clients Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Todos os Clientes Fidelizados</CardTitle>
                  <CardDescription>Histórico completo de pontuação e tier dos clientes</CardDescription>
                </CardHeader>
                <CardContent>
                  {clients.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Tier</TableHead>
                            <TableHead className="text-right">Pontos</TableHead>
                            <TableHead className="text-right">Total Gasto</TableHead>
                            <TableHead className="text-center">Atendimentos</TableHead>
                            <TableHead>Última Visita</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clients.map((client) => (
                            <TableRow key={client.id} className="hover:bg-muted/50">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                      {getInitials(client.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{client.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {client.email || client.phone || 'Sem contato'}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={`${getTierColor(client.tier)} text-xs`}>
                                  {getTierIcon(client.tier)}
                                  <span className="ml-1">{client.tier}</span>
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="font-semibold text-primary">{client.totalPoints}</span>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                }).format(client.totalSpent)}
                              </TableCell>
                              <TableCell className="text-center">{client.appointmentsCount}</TableCell>
                              <TableCell>
                                {client.lastVisit 
                                  ? new Date(client.lastVisit).toLocaleDateString('pt-BR')
                                  : 'Nunca'
                                }
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum cliente fidelizado ainda</h3>
                      <p>Complete agendamentos para começar a acumular pontos para seus clientes!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TooltipProvider>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
