
import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  min_stock: number;
};

type StockAlertsProps = {
  products: Product[];
  onTransaction?: (product: Product, type: 'entrada') => void;
};

export const StockAlerts = ({ products, onTransaction }: StockAlertsProps) => {
  const navigate = useNavigate();
  const lowStockProducts = products.filter(product => product.stock <= product.min_stock);
  
  if (lowStockProducts.length === 0) {
    return (
      <Card className="border-border shadow-lg mb-6 bg-card">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-xl font-serif text-primary">Alertas de Estoque</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Tudo OK!</AlertTitle>
            <AlertDescription>
              Nenhum produto com estoque baixo no momento.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-lg mb-6 bg-card">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-xl font-serif text-primary">Alertas de Estoque</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Alert className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção!</AlertTitle>
          <AlertDescription>
            {lowStockProducts.length} {lowStockProducts.length === 1 ? 'produto com' : 'produtos com'} estoque crítico.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          {lowStockProducts.slice(0, 5).map(product => (
            <div key={product.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/50">
              <div>
                <p className="font-medium text-foreground">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  Estoque: <span className="font-mono">{product.stock}</span> / Mínimo: <span className="font-mono">{product.min_stock}</span>
                </p>
              </div>
              {onTransaction && (
                <Button 
                  size="sm" 
                  onClick={() => onTransaction(product, 'entrada')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Repor Estoque
                </Button>
              )}
            </div>
          ))}
          
          {lowStockProducts.length > 5 && (
            <div className="text-center pt-2">
              <Button 
                variant="link" 
                className="text-primary hover:text-primary/80"
                onClick={() => navigate("/inventory")}
              >
                Ver todos os {lowStockProducts.length} produtos com estoque crítico
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
