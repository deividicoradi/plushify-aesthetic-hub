
import React from "react";
import { Package, AlertTriangle, Grid3X3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type StatCardsProps = {
  total: number;
  lowStock: number;
  categories: number;
};

export const StatCards = ({ total, lowStock, categories }: StatCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-950/50 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 dark:text-blue-300 text-sm font-medium mb-1">
                Total de Produtos
              </p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {total}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Produtos cadastrados
              </p>
            </div>
            <div className="bg-blue-500 p-4 rounded-full shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-950/50 border-orange-200 dark:border-orange-800 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-700 dark:text-orange-300 text-sm font-medium mb-1">
                Estoque Baixo
              </p>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                {lowStock}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Precisam reposição
              </p>
            </div>
            <div className="bg-orange-500 p-4 rounded-full shadow-lg">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-950/50 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 dark:text-green-300 text-sm font-medium mb-1">
                Categorias
              </p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {categories}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Tipos diferentes
              </p>
            </div>
            <div className="bg-green-500 p-4 rounded-full shadow-lg">
              <Grid3X3 className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
