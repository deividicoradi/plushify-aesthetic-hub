import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Activity,
  Users,
  MessageSquare,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  BarChart3,
  Cpu,
  HardDrive,
  Network
} from 'lucide-react';

interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  retrying: number;
}

interface PerformanceMetrics {
  cpu_usage: number;
  memory_usage: number;
  response_time: number;
  throughput: number;
  error_rate: number;
}

interface LoadTestResult {
  id: string;
  test_name: string;
  concurrent_users: number;
  duration_seconds: number;
  status: string;
  successful_requests: number;
  failed_requests: number;
  avg_response_time: number;
  cpu_peak: number;
  memory_peak: number;
  start_time: string;
  end_time: string;
}

export default function WhatsAppScalabilityDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [queueStats, setQueueStats] = useState<QueueStats>({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    retrying: 0
  });
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpu_usage: 0,
    memory_usage: 0,
    response_time: 0,
    throughput: 0,
    error_rate: 0
  });
  
  const [loadTests, setLoadTests] = useState<LoadTestResult[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carregar estatísticas da fila
  const loadQueueStats = async () => {
    if (!user) return;
    
    try {
      const { data: queueData, error } = await supabase
        .from('whatsapp_message_queue')
        .select('status')
        .eq('user_id', user.id);

      if (error) throw error;

      const stats = queueData.reduce((acc, item) => {
        acc[item.status as keyof QueueStats] = (acc[item.status as keyof QueueStats] || 0) + 1;
        return acc;
      }, {} as Partial<QueueStats>);

      setQueueStats({
        pending: stats.pending || 0,
        processing: stats.processing || 0,
        completed: stats.completed || 0,
        failed: stats.failed || 0,
        retrying: 0
      });
    } catch (error) {
      console.error('Error loading queue stats:', error);
    }
  };

  // Carregar métricas de performance
  const loadPerformanceMetrics = async () => {
    if (!user) return;
    
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data: metricsData, error } = await supabase
        .from('whatsapp_performance_metrics')
        .select('metric_type, metric_value')
        .eq('user_id', user.id)
        .gte('timestamp', oneHourAgo)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const latest = metricsData.reduce((acc, metric) => {
        acc[metric.metric_type] = metric.metric_value;
        return acc;
      }, {} as Record<string, number>);

      setMetrics({
        cpu_usage: latest.cpu_usage || 0,
        memory_usage: latest.memory_usage || 0,
        response_time: latest.response_time || 0,
        throughput: latest.throughput || 0,
        error_rate: latest.error_rate || 0
      });
    } catch (error) {
      console.error('Error loading performance metrics:', error);
    }
  };

  // Carregar resultados de testes de carga
  const loadLoadTests = async () => {
    try {
      const { data: testData, error } = await supabase
        .from('whatsapp_load_tests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLoadTests(testData || []);
    } catch (error) {
      console.error('Error loading load tests:', error);
    }
  };

  // Executar teste de carga
  const runLoadTest = async (concurrentUsers: number, duration: number) => {
    if (!user) return;
    
    setIsRunningTest(true);
    
    try {
      const testName = `Load Test - ${concurrentUsers} users - ${duration}s`;
      
      const { data, error } = await supabase.functions.invoke('whatsapp-api', {
        body: {
          action: 'run-load-test',
          test_name: testName,
          concurrent_users: concurrentUsers,
          duration_seconds: duration
        }
      });

      if (error) throw error;

      toast({
        title: "Teste Iniciado",
        description: `Teste de carga com ${concurrentUsers} usuários simultâneos iniciado.`,
      });

      // Aguardar alguns segundos e recarregar dados
      setTimeout(() => {
        loadLoadTests();
        loadQueueStats();
        loadPerformanceMetrics();
      }, 3000);

    } catch (error) {
      console.error('Error running load test:', error);
      toast({
        title: "Erro no Teste",
        description: "Falha ao executar teste de carga.",
        variant: "destructive",
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  // Limpar fila de mensagens
  const clearQueue = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('whatsapp_message_queue')
        .delete()
        .eq('user_id', user.id)
        .in('status', ['completed', 'failed']);

      if (error) throw error;

      toast({
        title: "Fila Limpa",
        description: "Mensagens processadas removidas da fila.",
      });

      loadQueueStats();
    } catch (error) {
      console.error('Error clearing queue:', error);
      toast({
        title: "Erro na Limpeza",
        description: "Falha ao limpar fila de mensagens.",
        variant: "destructive",
      });
    }
  };

  // Setup realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const queueChannel = supabase
      .channel('queue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_message_queue',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadQueueStats();
        }
      )
      .subscribe();

    const metricsChannel = supabase
      .channel('metrics_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_performance_metrics',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadPerformanceMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(queueChannel);
      supabase.removeChannel(metricsChannel);
    };
  }, [user]);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadQueueStats(),
        loadPerformanceMetrics(),
        loadLoadTests()
      ]);
      setLoading(false);
    };
    
    if (user) {
      loadData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Escalabilidade WhatsApp</h2>
          <p className="text-muted-foreground">
            Monitoramento de performance e testes de carga
          </p>
        </div>
        <Button onClick={clearQueue} variant="outline">
          Limpar Fila
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cpu_usage.toFixed(1)}%</div>
            <Progress value={metrics.cpu_usage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memória</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memory_usage.toFixed(1)}%</div>
            <Progress value={metrics.memory_usage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latência</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.response_time.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">Tempo de resposta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.throughput.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">msgs/min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.error_rate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Fila de Mensagens</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="load-tests">Testes de Carga</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{queueStats.pending}</div>
                <Badge variant="secondary">Aguardando</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processando</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{queueStats.processing}</div>
                <Badge variant="default">Em andamento</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{queueStats.completed}</div>
                <Badge variant="outline" className="text-green-600">Sucesso</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Falharam</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{queueStats.failed}</div>
                <Badge variant="destructive">Erro</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Performance</CardTitle>
              <CardDescription>
                Monitoramento em tempo real dos recursos do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm text-muted-foreground">{metrics.cpu_usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.cpu_usage} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memória</span>
                    <span className="text-sm text-muted-foreground">{metrics.memory_usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.memory_usage} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics.response_time.toFixed(0)}ms</div>
                  <div className="text-sm text-muted-foreground">Latência Média</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics.throughput.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Msgs/Min</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics.error_rate.toFixed(2)}%</div>
                  <div className="text-sm text-muted-foreground">Taxa de Erro</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="load-tests" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Testes de Carga</h3>
              <p className="text-sm text-muted-foreground">
                Simular múltiplos usuários para avaliar escalabilidade
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => runLoadTest(10, 60)}
                disabled={isRunningTest}
                variant="outline"
              >
                <Users className="w-4 h-4 mr-2" />
                10 Usuários
              </Button>
              <Button
                onClick={() => runLoadTest(50, 120)}
                disabled={isRunningTest}
                variant="outline"
              >
                <Users className="w-4 h-4 mr-2" />
                50 Usuários
              </Button>
              <Button
                onClick={() => runLoadTest(100, 180)}
                disabled={isRunningTest}
              >
                <Zap className="w-4 h-4 mr-2" />
                100 Usuários
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {loadTests.map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{test.test_name}</CardTitle>
                    <Badge variant={test.status === 'completed' ? 'default' : test.status === 'failed' ? 'destructive' : 'secondary'}>
                      {test.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {test.concurrent_users} usuários simultâneos • {test.duration_seconds}s de duração
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-green-600">{test.successful_requests}</div>
                      <div className="text-muted-foreground">Sucessos</div>
                    </div>
                    <div>
                      <div className="font-medium text-red-600">{test.failed_requests}</div>
                      <div className="text-muted-foreground">Falhas</div>
                    </div>
                    <div>
                      <div className="font-medium">{test.avg_response_time.toFixed(0)}ms</div>
                      <div className="text-muted-foreground">Latência Média</div>
                    </div>
                    <div>
                      <div className="font-medium">{test.cpu_peak.toFixed(1)}%</div>
                      <div className="text-muted-foreground">CPU Pico</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {loadTests.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <BarChart3 className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhum teste executado ainda</p>
                <p className="text-sm text-muted-foreground">Execute um teste de carga para ver os resultados</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}