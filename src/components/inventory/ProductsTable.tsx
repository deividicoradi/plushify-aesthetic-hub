
import React from "react";
import { ArrowDownCircle, ArrowUpCircle, Search, Pencil, Check } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

  return (
    <Card className="rounded-2xl shadow-xl border-border bg-card mb-10 animate-fade-in delay-100">
      <CardHeader className="p-6 pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-serif text-primary">Produtos em Estoque</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="w-[30px] pr-0">
                <Checkbox 
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Selecionar todos"
                />
              </TableHead>
              <TableHead className="text-foreground">Produto</TableHead>
              <TableHead className="text-foreground">Categoria</TableHead>
              <TableHead className="text-center text-foreground">Quantidade</TableHead>
              <TableHead className="text-center text-foreground">Estoque Mínimo</TableHead>
              <TableHead className="text-center text-foreground">Status</TableHead>
              <TableHead className="text-right text-foreground">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const isSelected = selectedProducts.some(p => p.id === product.id);
              
              return (
                <TableRow 
                  key={product.id} 
                  className={`hover:bg-muted/50 transition border-border ${isSelected ? 'bg-muted/30' : ''}`}
                >
                  <TableCell className="pr-0">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect(product)}
                      aria-label={`Selecionar ${product.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-foreground">{product.name}</span>
                    {product.barcode && (
                      <div className="text-xs text-muted-foreground">
                        Código: {product.barcode}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-foreground">{product.category}</TableCell>
                  <TableCell className="text-center font-mono text-foreground">{product.stock}</TableCell>
                  <TableCell className="text-center text-foreground">{product.min_stock}</TableCell>
                  <TableCell className="text-center">
                    {product.stock > product.min_stock ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                        OK
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse">
                        Crítico
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditProduct(product)}
                        className="hover:bg-secondary border-border"
                      >
                        <Pencil className="w-4 h-4 text-secondary-foreground" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTransaction(product, 'entrada')}
                        className="hover:bg-green-50 dark:hover:bg-green-900/30 border-border"
                      >
                        <ArrowDownCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTransaction(product, 'saida')}
                        className="hover:bg-red-50 dark:hover:bg-red-900/30 border-border"
                      >
                        <ArrowUpCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
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
