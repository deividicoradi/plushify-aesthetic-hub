
import React from "react";
import { Package, AlertTriangle, Grid3X3, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type StatCardsProps = {
  total: number;
  lowStock: number;
  categories: number;
};

export const StatCards = ({ total, lowStock, categories }: StatCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-200/50 hover:border-blue-300/70 transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Total de Produtos
              </p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {total}
              </p>
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>Produtos ativos</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border-orange-200/50 hover:border-orange-300/70 transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Estoque Baixo
              </p>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                {lowStock}
              </p>
              <div className="flex items-center text-xs text-orange-600 dark:text-orange-400">
                <AlertTriangle className="w-3 h-3 mr-1" />
                <span>Precisam reposição</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-green-200/50 hover:border-green-300/70 transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                Categorias
              </p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {categories}
              </p>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                <Grid3X3 className="w-3 h-3 mr-1" />
                <span>Tipos diferentes</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Grid3X3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-purple-200/50 hover:border-purple-300/70 transition-all duration-300 group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Valor Total
              </p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                -
              </p>
              <div className="flex items-center text-xs text-purple-600 dark:text-purple-400">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>Em estoque</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
