import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Play,
  Square,
  Users,
  Clock,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface LoadTestConfig {
  concurrentUsers: number;
  duration: number;
  messageInterval: number;
  targetPhone: string;
}

interface LoadTestResults {
  id?: string;
  test_name: string;
  concurrent_users: number;
  duration_seconds: number;
  status: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  avg_response_time: number;
  max_response_time: number;
  cpu_peak: number;
  memory_peak: number;
  start_time: string;
  end_time?: string;
  results?: any;
}

export default function WhatsAppLoadTester() {
  const { toast } = useToast();
  
  const [config, setConfig] = useState<LoadTestConfig>({
    concurrentUsers: 10,
    duration: 60,
    messageInterval: 5,
    targetPhone: '5511999999999'
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<LoadTestResults | null>(null);
  const [progress, setProgress] = useState(0);
  const [testHistory, setTestHistory] = useState<LoadTestResults[]>([]);
  
  // Simular teste de carga
  const runLoadTest = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setProgress(0);
    
    const testName = `Load Test - ${config.concurrentUsers} users - ${new Date().toLocaleString()}`;
    const startTime = new Date().toISOString();
    
    const testResult: LoadTestResults = {
      test_name: testName,
      concurrent_users: config.concurrentUsers,
      duration_seconds: config.duration,
      status: 'running',
      total_requests: 0,
      successful_requests: 0,
      failed_requests: 0,
      avg_response_time: 0,
      max_response_time: 0,
      cpu_peak: 0,
      memory_peak: 0,
      start_time: startTime
    };
    
    setCurrentTest(testResult);
    
    try {
      // Salvar teste no banco
      const { data: savedTest, error } = await supabase
        .from('whatsapp_load_tests')
        .insert(testResult)
        .select()
        .single();
      
      if (error) throw error;
      
      // Simular execução do teste
      const totalSteps = config.duration;
      let successfulRequests = 0;
      let failedRequests = 0;
      const responseTimes: number[] = [];
      let maxCpu = 0;
      let maxMemory = 0;
      
      for (let step = 0; step < totalSteps; step++) {
        // Simular múltiplos usuários simultâneos
        const requests = Math.min(config.concurrentUsers, 50); // Limitar para não sobrecarregar
        
        for (let user = 0; user < requests; user++) {
          try {
            const startTime = Date.now();
            
            // Simular envio de mensagem via API
            const { data, error } = await supabase.functions.invoke('whatsapp-api', {
              body: {
                action: 'simulate-message',
                phone: config.targetPhone,
                message: `Teste de carga - Usuário ${user} - Step ${step}`,
                user_simulation: true
              }
            });
            
            const responseTime = Date.now() - startTime;
            responseTimes.push(responseTime);
            
            if (error) {
              failedRequests++;
            } else {
              successfulRequests++;
            }
          } catch (error) {
            failedRequests++;
          }
        }
        
        // Simular métricas de sistema
        const currentCpu = Math.random() * 80 + (step / totalSteps) * 20;
        const currentMemory = Math.random() * 60 + (step / totalSteps) * 30;
        
        maxCpu = Math.max(maxCpu, currentCpu);
        maxMemory = Math.max(maxMemory, currentMemory);
        
        // Registrar métricas
        await supabase.rpc('record_performance_metric', {
          p_user_id: (await supabase.auth.getUser()).data.user?.id,
          p_session_id: 'load_test',
          p_metric_type: 'cpu_usage',
          p_metric_value: currentCpu,
          p_metric_unit: 'percent'
        });
        
        await supabase.rpc('record_performance_metric', {
          p_user_id: (await supabase.auth.getUser()).data.user?.id,
          p_session_id: 'load_test',
          p_metric_type: 'memory_usage',
          p_metric_value: currentMemory,
          p_metric_unit: 'percent'
        });
        
        // Atualizar progresso
        setProgress(((step + 1) / totalSteps) * 100);
        
        // Aguardar intervalo
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Calcular estatísticas finais
      const totalRequests = successfulRequests + failedRequests;
      const avgResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0;
      const maxResponseTime = responseTimes.length > 0 
        ? Math.max(...responseTimes) 
        : 0;
      
      const finalResult: LoadTestResults = {
        ...testResult,
        id: savedTest.id,
        status: 'completed',
        total_requests: totalRequests,
        successful_requests: successfulRequests,
        failed_requests: failedRequests,
        avg_response_time: avgResponseTime,
        max_response_time: maxResponseTime,
        cpu_peak: maxCpu,
        memory_peak: maxMemory,
        end_time: new Date().toISOString(),
        results: {
          success_rate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
          requests_per_second: totalRequests / config.duration,
          response_time_p95: responseTimes.length > 0 
            ? responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)] 
            : 0
        }
      };
      
      // Atualizar teste no banco
      await supabase
        .from('whatsapp_load_tests')
        .update({
          status: 'completed',
          total_requests: totalRequests,
          successful_requests: successfulRequests,
          failed_requests: failedRequests,
          avg_response_time: avgResponseTime,
          max_response_time: maxResponseTime,
          cpu_peak: maxCpu,
          memory_peak: maxMemory,
          end_time: finalResult.end_time,
          results: finalResult.results
        })
        .eq('id', savedTest.id);
      
      setCurrentTest(finalResult);
      loadTestHistory();
      
      toast({
        title: "Teste Concluído",
        description: `Teste com ${config.concurrentUsers} usuários executado com sucesso.`,
      });
      
    } catch (error) {
      console.error('Load test error:', error);
      
      const failedResult: LoadTestResults = {
        ...testResult,
        status: 'failed',
        end_time: new Date().toISOString()
      };
      
      setCurrentTest(failedResult);
      
      toast({
        title: "Erro no Teste",
        description: "Falha na execução do teste de carga.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
      setProgress(100);
    }
  };
  
  // Parar teste
  const stopTest = () => {
    setIsRunning(false);
    
    if (currentTest) {
      const stoppedResult: LoadTestResults = {
        ...currentTest,
        status: 'stopped',
        end_time: new Date().toISOString()
      };
      setCurrentTest(stoppedResult);
    }
    
    toast({
      title: "Teste Interrompido",
      description: "Teste de carga foi interrompido pelo usuário.",
    });
  };
  
  // Carregar histórico de testes
  const loadTestHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_load_tests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setTestHistory(data || []);
    } catch (error) {
      console.error('Error loading test history:', error);
    }
  };
  
  useEffect(() => {
    loadTestHistory();
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Configuração do Teste */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Teste de Carga</CardTitle>
          <CardDescription>
            Configure os parâmetros para simular múltiplos usuários simultâneos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="users">Usuários Simultâneos</Label>
              <Input
                id="users"
                type="number"
                value={config.concurrentUsers}
                onChange={(e) => setConfig(prev => ({ ...prev, concurrentUsers: parseInt(e.target.value) || 10 }))}
                min="1"
                max="100"
                disabled={isRunning}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (segundos)</Label>
              <Input
                id="duration"
                type="number"
                value={config.duration}
                onChange={(e) => setConfig(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                min="10"
                max="600"
                disabled={isRunning}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interval">Intervalo entre Mensagens (s)</Label>
              <Input
                id="interval"
                type="number"
                value={config.messageInterval}
                onChange={(e) => setConfig(prev => ({ ...prev, messageInterval: parseInt(e.target.value) || 5 }))}
                min="1"
                max="60"
                disabled={isRunning}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone de Teste</Label>
              <Input
                id="phone"
                value={config.targetPhone}
                onChange={(e) => setConfig(prev => ({ ...prev, targetPhone: e.target.value }))}
                placeholder="5511999999999"
                disabled={isRunning}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Button onClick={runLoadTest} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Iniciar Teste
              </Button>
            ) : (
              <Button onClick={stopTest} variant="destructive" className="flex items-center gap-2">
                <Square className="w-4 h-4" />
                Parar Teste
              </Button>
            )}
          </div>
          
          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progresso do Teste</span>
                <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Resultados do Teste Atual */}
      {currentTest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentTest.status === 'running' && <Activity className="w-5 h-5 text-blue-500" />}
              {currentTest.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {currentTest.status === 'failed' && <AlertTriangle className="w-5 h-5 text-red-500" />}
              Teste Atual
            </CardTitle>
            <CardDescription>{currentTest.test_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{currentTest.successful_requests}</div>
                <div className="text-sm text-muted-foreground">Sucessos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{currentTest.failed_requests}</div>
                <div className="text-sm text-muted-foreground">Falhas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{currentTest.avg_response_time.toFixed(0)}ms</div>
                <div className="text-sm text-muted-foreground">Latência Média</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{currentTest.cpu_peak.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">CPU Pico</div>
              </div>
            </div>
            
            {currentTest.results && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Taxa de Sucesso: </span>
                    <span>{currentTest.results.success_rate?.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="font-medium">Req/seg: </span>
                    <span>{currentTest.results.requests_per_second?.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="font-medium">P95 Latência: </span>
                    <span>{currentTest.results.response_time_p95?.toFixed(0)}ms</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Histórico de Testes */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Testes</CardTitle>
          <CardDescription>Últimos testes de carga executados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testHistory.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{test.test_name}</span>
                    <Badge variant={
                      test.status === 'completed' ? 'default' : 
                      test.status === 'failed' ? 'destructive' : 'secondary'
                    }>
                      {test.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {test.concurrent_users} usuários • {test.duration_seconds}s • 
                    {test.total_requests} requests • {test.avg_response_time.toFixed(0)}ms avg
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-green-600">{test.successful_requests} sucessos</div>
                  <div className="text-red-600">{test.failed_requests} falhas</div>
                </div>
              </div>
            ))}
            
            {testHistory.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <p>Nenhum teste executado ainda</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}