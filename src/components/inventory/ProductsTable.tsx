
import React, { useState } from "react";
import { Product } from "@/hooks/inventory/useProductsData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, AlertTriangle } from "lucide-react";

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  onEdit,
  onDelete,
  isLoading,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) {
      return { status: 'out', label: 'Sem estoque', color: 'destructive' };
    }
    if (product.min_stock_level && product.stock_quantity <= product.min_stock_level) {
      return { status: 'low', label: 'Estoque baixo', color: 'secondary' };
    }
    return { status: 'ok', label: 'Em estoque', color: 'default' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Carregando produtos...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-gray-400 text-lg">Nenhum produto cadastrado</div>
        <p className="text-gray-500 text-sm">Clique em "Novo Produto" para começar</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[150px]">Produto</TableHead>
            <TableHead className="hidden sm:table-cell">SKU</TableHead>
            <TableHead className="hidden md:table-cell">Categoria</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead className="hidden lg:table-cell">Custo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right min-w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const stockStatus = getStockStatus(product);
            
            return (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-sm sm:text-base">{product.name}</div>
                    {product.brand && (
                      <div className="text-xs sm:text-sm text-muted-foreground">{product.brand}</div>
                    )}
                    {/* Mobile: mostrar SKU e categoria inline */}
                    <div className="sm:hidden text-xs text-muted-foreground space-y-0.5">
                      {product.sku && <div>SKU: {product.sku}</div>}
                      {product.category && <div>Cat: {product.category}</div>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {product.sku || '-'}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm">
                    {product.category || '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="font-medium text-sm">{product.stock_quantity}</span>
                    {stockStatus.status !== 'ok' && (
                      <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                    )}
                  </div>
                  {product.min_stock_level && (
                    <div className="text-xs text-muted-foreground">
                      Mín: {product.min_stock_level}
                    </div>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="space-y-1">
                    <div className="font-medium text-sm">
                      {formatCurrency(product.cost_price || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total: {formatCurrency((product.cost_price || 0) * product.stock_quantity)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge
                      variant={stockStatus.color as any}
                      className="text-xs"
                    >
                      {stockStatus.label}
                    </Badge>
                    <div className="lg:block hidden">
                      <Badge
                        variant={product.active ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {product.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1 sm:space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(product)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(product.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
