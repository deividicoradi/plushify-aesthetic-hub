
import React from 'react';
import { TrendingUp, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyChart } from '@/components/reports/MonthlyChart';
import { CategoryChart } from '@/components/reports/CategoryChart';
import { MonthlyData, CategoryData } from '@/hooks/useReportsData';

interface ChartsSectionProps {
  monthlyData: MonthlyData[];
  revenueByCategory: CategoryData[];
  loading: boolean;
}

export const ChartsSection = ({ monthlyData, revenueByCategory, loading }: ChartsSectionProps) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-xl">Evolução Mensal</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <MonthlyChart data={monthlyData} loading={loading} />
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <PieChart className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-xl">Receita por Categoria</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CategoryChart data={revenueByCategory} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
};
