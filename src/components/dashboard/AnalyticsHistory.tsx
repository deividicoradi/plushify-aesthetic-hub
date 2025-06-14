
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Brain, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const AnalyticsHistory = () => {
  const { analytics, loading, saving } = useDashboardAnalytics();
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);

  if (loading) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Histórico de Análises
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInsightIcon = (severity: string) => {
    switch (severity) {
      case 'positive': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default: return <TrendingUp className="w-4 h-4 text-blue-500" />;
    }
  };

  const getInsightColor = (severity: string) => {
    switch (severity) {
      case 'positive': return 'bg-green-50 border-green-200 text-green-800';
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const toggleAnalysis = (analysisId: string) => {
    setSelectedAnalysis(selectedAnalysis === analysisId ? null : analysisId);
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Análises Automáticas
            {saving && <Clock className="w-4 h-4 text-blue-500 animate-spin" />}
          </CardTitle>
          <Badge variant="outline">
            {analytics.length} análises salvas
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Suas análises são salvas automaticamente baseadas nos dados do dashboard
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96 px-6 pb-6">
          <div className="space-y-3">
            {analytics.map((analysis) => (
              <div key={analysis.id} className="space-y-0">
                <Card 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200"
                  onClick={() => toggleAnalysis(analysis.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">
                          {format(new Date(analysis.analysis_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {analysis.insights?.length || 0} insights
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Clientes:</span>
                        <p className="font-medium">{analysis.metrics?.total_clients || 0}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Receita:</span>
                        <p className="font-medium">
                          R$ {(analysis.metrics?.monthly_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Agendamentos:</span>
                        <p className="font-medium">{analysis.metrics?.weekly_appointments || 0}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Novos Clientes:</span>
                        <p className="font-medium">{analysis.metrics?.new_clients || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedAnalysis === analysis.id && (
                  <Card className="mt-2 border-l-4 border-l-blue-500 bg-blue-50/30">
                    <CardContent className="p-4 space-y-4">
                      {/* Insights */}
                      <div>
                        <h4 className="font-medium mb-2">Insights Gerados:</h4>
                        <div className="space-y-2">
                          {analysis.insights?.map((insight: any, index: number) => (
                            <div key={index} className={`p-3 rounded-lg border ${getInsightColor(insight.severity)}`}>
                              <div className="flex items-start gap-2">
                                {getInsightIcon(insight.severity)}
                                <div>
                                  <h5 className="font-medium">{insight.title}</h5>
                                  <p className="text-sm">{insight.message}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recomendações */}
                      <div>
                        <h4 className="font-medium mb-2">Recomendações:</h4>
                        <div className="space-y-2">
                          {analysis.recommendations?.map((rec: any, index: number) => (
                            <div key={index} className="p-3 rounded-lg bg-gray-50 border">
                              <div className="flex items-start gap-2">
                                <TrendingUp className="w-4 h-4 text-purple-500 mt-0.5" />
                                <div>
                                  <h5 className="font-medium">{rec.title}</h5>
                                  <p className="text-sm text-gray-600">{rec.action}</p>
                                  <Badge variant="outline" className="mt-1">
                                    Prioridade: {rec.priority}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
            
            {analytics.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma análise salva ainda.</p>
                <p className="text-sm">As análises serão geradas automaticamente baseadas nos seus dados.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
