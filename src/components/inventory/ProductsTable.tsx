
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Custo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const stockStatus = getStockStatus(product);
            
            return (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{product.name}</div>
                    {product.brand && (
                      <div className="text-sm text-gray-500">{product.brand}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {product.sku || '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {product.category || '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{product.stock_quantity}</span>
                    {stockStatus.status !== 'ok' && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  {product.min_stock_level && (
                    <div className="text-xs text-gray-500">
                      Mín: {product.min_stock_level}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">
                      {formatCurrency(product.cost_price || 0)}
                    </div>
                    <div className="text-xs text-gray-500">
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
                    <div>
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
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
