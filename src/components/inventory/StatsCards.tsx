
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingDown, DollarSign } from "lucide-react";
import { Product } from "@/hooks/inventory/useProductsData";

interface StatsCardsProps {
  products: Product[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ products }) => {
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.active).length;
  const lowStockProducts = products.filter(p => 
    p.min_stock_level && p.stock_quantity <= p.min_stock_level
  ).length;
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0).length;
  
  const totalInventoryValue = products.reduce((total, product) => {
    return total + ((product.cost_price || 0) * product.stock_quantity);
  }, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Total de Produtos</CardTitle>
          <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            {activeProducts} ativos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Estoque Baixo</CardTitle>
          <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-yellow-600">{lowStockProducts}</div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Produtos com estoque baixo
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Sem Estoque</CardTitle>
          <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-red-600">{outOfStockProducts}</div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Produtos zerados
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Valor do Inventário</CardTitle>
          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold text-green-600">
            {formatCurrency(totalInventoryValue)}
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Valor total em estoque
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
