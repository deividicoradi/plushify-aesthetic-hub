
import React from "react";
import { Award, Star, BadgeCheck, Gift, Trophy, Users, TrendingUp, DollarSign, Calendar } from "lucide-react";
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
    case 'Diamante': return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white dark:from-blue-500 dark:to-blue-700';
    case 'Ouro': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-800 dark:from-yellow-300 dark:to-yellow-500';
    case 'Prata': return 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-800 dark:from-gray-400 dark:to-gray-600';
    default: return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white dark:from-orange-500 dark:to-orange-700';
  }
};

const getTierIcon = (tier: string) => {
  switch (tier) {
    case 'Diamante': return <Trophy className="w-4 h-4" />;
    case 'Ouro': return <Award className="w-4 h-4" />;
    case 'Prata': return <Star className="w-4 h-4" />;
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
        <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
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
  const cardGlass = "backdrop-blur-lg bg-card/95 border border-border shadow-xl";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <TooltipProvider>
            <div className="min-h-screen bg-gradient-soft py-12 px-3 animate-fade-in">
              <div className="max-w-7xl mx-auto flex flex-col gap-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3 animate-fade-in">
                  <Award className="w-9 h-9 text-primary animate-float" />
                  <h1 className="text-3xl md:text-4xl font-extrabold font-serif gradient-text tracking-tight">Programa de Fidelidade</h1>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className={cardGlass}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalClients}</div>
                      <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
                    </CardContent>
                  </Card>

                  <Card className={cardGlass}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalAppointments}</div>
                      <p className="text-xs text-muted-foreground">Atendimentos concluídos</p>
                    </CardContent>
                  </Card>

                  <Card className={cardGlass}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(stats.totalRevenue)}
                      </div>
                      <p className="text-xs text-muted-foreground">Total faturado</p>
                    </CardContent>
                  </Card>

                  <Card className={cardGlass}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pontos Distribuídos</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.pointsDistributed}</div>
                      <p className="text-xs text-muted-foreground">Total de pontos</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Clients Ranking */}
                <Card className={cardGlass}>
                  <CardHeader>
                    <CardTitle className="text-lg font-serif text-primary flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-gold" /> Top 5 Clientes Fidelizados
                    </CardTitle>
                    <CardDescription>Ranking dos clientes com mais pontos acumulados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {topClients.length > 0 ? (
                      <div className="space-y-4">
                        {topClients.map((client, index) => (
                          <div key={client.id} className="flex items-center gap-4 p-4 rounded-lg bg-accent/50 dark:bg-accent/30">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                              {index + 1}
                            </div>
                            <Avatar className="bg-primary/10 text-primary">
                              <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{client.name}</h3>
                                <Badge className={`${getTierColor(client.tier)} text-xs`}>
                                  {getTierIcon(client.tier)}
                                  <span className="ml-1">{client.tier}</span>
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {client.email || client.phone || 'Sem contato'}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">{client.totalPoints} pts</div>
                              <div className="text-sm text-muted-foreground">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                }).format(client.totalSpent)} gastos
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum cliente com pontos ainda.</p>
                        <p className="text-sm">Complete alguns agendamentos para ver o ranking!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* All Clients Table */}
                <Card className={cardGlass}>
                  <CardHeader>
                    <CardTitle className="text-lg font-serif text-primary">Todos os Clientes Fidelizados</CardTitle>
                    <CardDescription>Histórico completo de pontuação e tier dos clientes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {clients.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Tier</TableHead>
                            <TableHead>Pontos</TableHead>
                            <TableHead>Total Gasto</TableHead>
                            <TableHead>Atendimentos</TableHead>
                            <TableHead>Última Visita</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clients.map((client) => (
                            <TableRow key={client.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="bg-primary/10 text-primary w-8 h-8">
                                    <AvatarFallback className="text-xs">{getInitials(client.name)}</AvatarFallback>
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
                              <TableCell>
                                <span className="font-semibold text-primary">{client.totalPoints}</span>
                              </TableCell>
                              <TableCell>
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                }).format(client.totalSpent)}
                              </TableCell>
                              <TableCell>{client.appointmentsCount}</TableCell>
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
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum cliente fidelizado ainda</h3>
                        <p>Complete agendamentos para começar a acumular pontos para seus clientes!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* How it works */}
                <Card className={cardGlass}>
                  <CardHeader>
                    <CardTitle className="text-lg font-serif">Como Funciona o Sistema de Fidelidade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span><strong>1 Real = 1 Ponto:</strong> A cada R$ 1,00 gasto, o cliente ganha 1 ponto</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <span><strong>Automático:</strong> Pontos são creditados quando o agendamento é marcado como "concluído"</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-purple-600" />
                          <span><strong>Tiers Automáticos:</strong> Bronze (R$ 0+), Prata (R$ 500+), Ouro (R$ 1.000+), Diamante (R$ 2.000+)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-5 h-5 text-orange-600" />
                          <span><strong>Ranking:</strong> Clientes são rankeados por total de pontos acumulados</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center mt-4 text-muted-foreground text-sm opacity-80">
                  Powered by Plushify Club <Award className="inline w-4 h-4 ml-1 text-primary" />
                </div>
              </div>
            </div>
          </TooltipProvider>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
