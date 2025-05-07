
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
    <Card className="rounded-2xl shadow-xl border-0 bg-white/80 dark:bg-card mb-10 animate-fade-in delay-100">
      <CardHeader className="p-6 pb-3 border-b border-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-serif text-pink-700">Produtos em Estoque</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
              <TableHead className="w-[30px] pr-0">
                <Checkbox 
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Selecionar todos"
                />
              </TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-center">Quantidade</TableHead>
              <TableHead className="text-center">Estoque Mínimo</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const isSelected = selectedProducts.some(p => p.id === product.id);
              
              return (
                <TableRow 
                  key={product.id} 
                  className={`hover:bg-pink-50/40 transition ${isSelected ? 'bg-pink-50/60' : ''}`}
                >
                  <TableCell className="pr-0">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect(product)}
                      aria-label={`Selecionar ${product.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="font-bold">{product.name}</span>
                    {product.barcode && (
                      <div className="text-xs text-gray-500">
                        Código: {product.barcode}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-center font-mono">{product.stock}</TableCell>
                  <TableCell className="text-center">{product.min_stock}</TableCell>
                  <TableCell className="text-center">
                    {product.stock > product.min_stock ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
                        OK
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600 animate-pulse">
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
                        className="hover:bg-purple-50"
                      >
                        <Pencil className="w-4 h-4 text-purple-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTransaction(product, 'entrada')}
                        className="hover:bg-green-50"
                      >
                        <ArrowDownCircle className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTransaction(product, 'saida')}
                        className="hover:bg-red-50"
                      >
                        <ArrowUpCircle className="w-4 h-4 text-red-600" />
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
