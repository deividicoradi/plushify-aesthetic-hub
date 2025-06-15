
import React from "react";
import { AlertTriangle, ArrowDownCircle, Package } from "lucide-react";
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
    return (
      <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
            <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-200">
              Estoque em Ordem!
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              Todos os produtos estão com estoque adequado
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-orange-700 dark:text-orange-300">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <span className="text-lg font-bold">Alertas de Estoque</span>
            <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
              {lowStockProducts.length} produtos
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lowStockProducts.map((product) => (
            <Card 
              key={product.id} 
              className="bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-700 hover:shadow-md transition-all duration-300 group"
            >
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-orange-600 transition-colors">
                      {product.name}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>
                  
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Estoque atual:</span>
                      <span className="font-bold text-red-600 dark:text-red-400 text-lg">
                        {product.stock}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-600 dark:text-gray-400">Mínimo:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {product.min_stock}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => onTransaction(product, 'entrada')}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <ArrowDownCircle className="w-4 h-4 mr-2" />
                    Repor Estoque
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
