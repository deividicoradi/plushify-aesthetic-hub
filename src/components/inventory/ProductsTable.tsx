
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
      <Card className="border border-border bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center p-12">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-full mb-6">
            <Package2 className="w-16 h-16 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-serif font-bold text-foreground mb-3">
            Nenhum produto cadastrado
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            Comece adicionando seu primeiro produto ao estoque para ter controle total do seu inventário.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-serif font-bold flex items-center gap-2">
            <Package2 className="w-6 h-6 text-blue-600" />
            Produtos ({filteredProducts.length})
          </CardTitle>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar produtos ou categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableHead className="w-[50px] pl-6">
                  <Checkbox 
                    checked={allSelected}
                    onCheckedChange={onSelectAll}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Produto</TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Categoria</TableHead>
                <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300">Estoque</TableHead>
                <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300 pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product, index) => {
                const isSelected = selectedProducts.some(p => p.id === product.id);
                const isLowStock = product.stock <= product.min_stock;
                
                return (
                  <TableRow 
                    key={product.id} 
                    className={`
                      hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors duration-200
                      ${isSelected ? 'bg-blue-50 dark:bg-blue-950/30' : ''}
                      ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/50'}
                      border-b border-gray-100 dark:border-gray-800
                    `}
                  >
                    <TableCell className="pl-6">
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect(product)}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {product.name}
                        </div>
                        {product.barcode && (
                          <div className="text-xs text-muted-foreground font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block">
                            {product.barcode}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800"
                      >
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`font-mono text-lg font-bold ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {product.stock}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Min: {product.min_stock}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {isLowStock ? (
                        <Badge variant="destructive" className="text-xs font-medium animate-pulse">
                          🚨 Baixo
                        </Badge>
                      ) : (
                        <Badge className="text-xs font-medium bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300">
                          ✅ OK
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditProduct(product)}
                          className="h-9 w-9 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTransaction(product, 'entrada')}
                          className="h-9 w-9 p-0 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                        >
                          <ArrowDownCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTransaction(product, 'saida')}
                          className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
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
        </div>
      </CardContent>
    </Card>
  );
};
