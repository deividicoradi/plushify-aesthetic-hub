
import React from "react";
import { AlertTriangle, ArrowDownCircle } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  min_stock: number;
};

type StockAlertsProps = {
  products: Product[];
  onTransaction: (product: Product, type: 'entrada' | 'saida') => void;
};

export const StockAlerts = ({ products, onTransaction }: StockAlertsProps) => {
  const lowStockProducts = products.filter(product => product.stock <= product.min_stock);

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8 border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          Alertas de Estoque ({lowStockProducts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lowStockProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {product.name}
                  </h4>
                  <Badge variant="secondary" className="text-xs mb-2">
                    {product.category}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Estoque:</span>
                    <span className="font-mono font-semibold text-red-600 dark:text-red-400">
                      {product.stock}
                    </span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Min: {product.min_stock}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => onTransaction(product, 'entrada')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <ArrowDownCircle className="w-4 h-4 mr-2" />
                Repor Estoque
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
