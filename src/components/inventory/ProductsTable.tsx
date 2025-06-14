
import React from "react";
import { ArrowDownCircle, ArrowUpCircle, Search, Pencil, Package2 } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  min_stock: number;
  barcode?: string | null;
};

type ProductsTableProps = {
  products: Product[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onTransaction: (product: Product, type: 'entrada' | 'saida') => void;
  onEditProduct: (product: Product) => void;
  selectedProducts: Product[];
  onToggleSelect: (product: Product) => void;
  onSelectAll: () => void;
};

export const ProductsTable = ({
  products,
  searchTerm,
  setSearchTerm,
  onTransaction,
  onEditProduct,
  selectedProducts,
  onToggleSelect,
  onSelectAll
}: ProductsTableProps) => {
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allSelected = filteredProducts.length > 0 && 
    filteredProducts.every(product => 
      selectedProducts.some(p => p.id === product.id)
    );

  if (filteredProducts.length === 0 && searchTerm === '') {
    return (
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="flex flex-col items-center justify-center p-12">
          <Package2 className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhum produto cadastrado
          </h3>
          <p className="text-muted-foreground text-center">
            Comece adicionando seu primeiro produto ao estoque.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Produtos</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]">
                <Checkbox 
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-center">Estoque</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const isSelected = selectedProducts.some(p => p.id === product.id);
              const isLowStock = product.stock <= product.min_stock;
              
              return (
                <TableRow 
                  key={product.id} 
                  className={`hover:bg-muted/50 transition-colors ${isSelected ? 'bg-muted/30' : ''}`}
                >
                  <TableCell>
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect(product)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      {product.barcode && (
                        <div className="text-xs text-muted-foreground">
                          {product.barcode}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-mono ${isLowStock ? 'text-destructive' : ''}`}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {isLowStock ? (
                      <Badge variant="destructive" className="text-xs">
                        Baixo
                      </Badge>
                    ) : (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                        OK
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditProduct(product)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTransaction(product, 'entrada')}
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                      >
                        <ArrowDownCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTransaction(product, 'saida')}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <ArrowUpCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
