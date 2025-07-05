import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  MousePointer, 
  Clock, 
  TrendingUp, 
  Eye,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  avgSessionDuration: string;
  bounceRate: string;
  topPages: Array<{ page: string; views: number }>;
  deviceTypes: Array<{ type: string; percentage: number }>;
  referralSources: Array<{ source: string; visits: number }>;
}

export const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    pageViews: 0,
    uniqueVisitors: 0,
    avgSessionDuration: '0:00',
    bounceRate: '0%',
    topPages: [],
    deviceTypes: [],
    referralSources: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Simulação de dados (em produção seria integração real com GA4)
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    
    // Simular carregamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Dados mockados (em produção viria da GA4 API)
    setAnalyticsData({
      pageViews: 12458,
      uniqueVisitors: 3247,
      avgSessionDuration: '2:34',
      bounceRate: '42.3%',
      topPages: [
        { page: '/dashboard', views: 3450 },
        { page: '/appointments', views: 2100 },
        { page: '/clients', views: 1890 },
        { page: '/financial', views: 1654 },
        { page: '/', views: 1234 }
      ],
      deviceTypes: [
        { type: 'Desktop', percentage: 58 },
        { type: 'Mobile', percentage: 35 },
        { type: 'Tablet', percentage: 7 }
      ],
      referralSources: [
        { source: 'Direto', visits: 1854 },
        { source: 'Google', visits: 1203 },
        { source: 'Redes Sociais', visits: 567 },
        { source: 'Email', visits: 234 }
      ]
    });
    
    setIsLoading(false);
    setLastUpdated(new Date());
  };

  const refreshData = () => {
    loadAnalyticsData();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <Badge variant="outline">Google Analytics 4</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Insights sobre o uso da aplicação • Atualizado: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" />
            Google Analytics 4
          </Badge>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.pageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12.5% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitantes Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.uniqueVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +8.2% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.avgSessionDuration}</div>
            <p className="text-xs text-muted-foreground">
              Duração da sessão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Rejeição</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.bounceRate}</div>
            <p className="text-xs text-muted-foreground">
              Sessões com uma página
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes */}
      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pages">Páginas Populares</TabsTrigger>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
          <TabsTrigger value="traffic">Fontes de Tráfego</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Páginas Mais Visitadas</CardTitle>
              <CardDescription>
                Top 5 páginas por número de visualizações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topPages.map((page, index) => (
                  <div key={page.page} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium">{page.page}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{page.views.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">visualizações</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Dispositivo</CardTitle>
              <CardDescription>
                Como os usuários acessam a aplicação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.deviceTypes.map((device) => (
                  <div key={device.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {device.type === 'Desktop' && <Monitor className="h-4 w-4" />}
                      {device.type === 'Mobile' && <Smartphone className="h-4 w-4" />}
                      {device.type === 'Tablet' && <Monitor className="h-4 w-4" />}
                      <span className="font-medium">{device.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${device.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{device.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fontes de Tráfego</CardTitle>
              <CardDescription>
                De onde vêm os visitantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.referralSources.map((source, index) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4" />
                      <span className="font-medium">{source.source}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{source.visits.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">visitas</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Nota sobre Privacidade */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">
              Privacidade
            </Badge>
            <div>
              <p className="text-sm">
                <strong>Conformidade com LGPD:</strong> Todos os dados são coletados de forma anônima e 
                agregada. Nenhuma informação pessoal identificável é capturada. Os usuários podem 
                optar por não participar do tracking a qualquer momento nas configurações de cookies.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};