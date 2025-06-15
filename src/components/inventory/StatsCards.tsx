
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
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
  
  const totalStockValue = products.reduce((total, product) => {
    return total + (product.price * product.stock_quantity);
  }, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            {activeProducts} ativos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{lowStockProducts}</div>
          <p className="text-xs text-muted-foreground">
            Produtos com estoque baixo
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
          <TrendingUp className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{outOfStockProducts}</div>
          <p className="text-xs text-muted-foreground">
            Produtos zerados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalStockValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Valor total em estoque
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
