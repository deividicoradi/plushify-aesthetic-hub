
import React from 'react';
import { TrendingUp, BarChart3, PieChart, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-6 h-6 text-plush-600" />
        <h1 className="text-2xl font-bold">Relatórios e Análises</h1>
      </div>

      {/* Métricas de crescimento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-600">+18.2%</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-green-700">Taxa de Crescimento</h3>
              <p className="text-2xl font-semibold text-green-800">18.2%</p>
              <p className="text-sm text-green-600">Comparado ao mês anterior</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-blue-100">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-600">+25.5%</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-blue-700">Receita Mensal</h3>
              <p className="text-2xl font-semibold text-blue-800">R$ 15.290</p>
              <p className="text-sm text-blue-600">Este mês</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-purple-100">
                <PieChart className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-purple-600">+12.8%</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-purple-700">Novos Clientes</h3>
              <p className="text-2xl font-semibold text-purple-800">127</p>
              <p className="text-sm text-purple-600">Últimos 30 dias</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-orange-100">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-orange-600">+8.4%</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-orange-700">Agendamentos</h3>
              <p className="text-2xl font-semibold text-orange-800">156</p>
              <p className="text-sm text-orange-600">Esta semana</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e análises detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-plush-600" />
              Crescimento Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Janeiro</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-plush-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-sm font-medium">65%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Fevereiro</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-plush-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <span className="text-sm font-medium">78%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Março</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-plush-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <span className="text-sm font-medium">92%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Abril</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-plush-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <span className="text-sm font-medium">100%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-plush-600" />
              Distribuição de Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-plush-500"></div>
                  <span className="text-sm">Serviços</span>
                </div>
                <span className="text-sm font-medium">R$ 9.174 (60%)</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-plush-300"></div>
                  <span className="text-sm">Produtos</span>
                </div>
                <span className="text-sm font-medium">R$ 4.587 (30%)</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-plush-100"></div>
                  <span className="text-sm">Outros</span>
                </div>
                <span className="text-sm font-medium">R$ 1.529 (10%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights e recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">📈 Crescimento Positivo</h4>
              <p className="text-sm text-green-700">
                Seu negócio está crescendo 18.2% comparado ao mês anterior. Continue investindo em marketing e atendimento ao cliente.
              </p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">💡 Oportunidade</h4>
              <p className="text-sm text-blue-700">
                Os serviços representam 60% da sua receita. Consider expandir a linha de produtos para diversificar.
              </p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">🎯 Meta Sugerida</h4>
              <p className="text-sm text-purple-700">
                Com base no crescimento atual, você pode atingir R$ 20.000 de receita no próximo mês.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
