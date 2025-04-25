import React, { useEffect, useState } from "react";
import { NailPolish, Archive, Boxes, Plus, ArrowDownCircle, ArrowUpCircle, Search } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProductForm } from "@/components/inventory/ProductForm";
import { StockTransaction } from "@/components/inventory/StockTransaction";
import { useAuth } from "@/contexts/AuthContext";

type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  min_stock: number;
};

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    categories: 0
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'entrada' | 'saida'>('entrada');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;

      setProducts(data || []);
      
      const uniqueCategories = new Set(data?.map(p => p.category));
      setStats({
        total: data?.length || 0,
        lowStock: data?.filter(p => p.stock <= p.min_stock).length || 0,
        categories: uniqueCategories.size
      });
    } catch (error: any) {
      toast.error("Erro ao carregar produtos: " + error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTransaction = (product: Product, type: 'entrada' | 'saida') => {
    setSelectedProduct(product);
    setTransactionType(type);
    setIsTransactionOpen(true);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-8 animate-fade-in">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
        <main>
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-3">
              <NailPolish className="w-9 h-9 text-pink-600 animate-float" />
              <h1 className="text-3xl md:text-4xl font-extrabold font-serif gradient-text tracking-tight">
                Estoque
              </h1>
            </div>
            <Button onClick={() => setIsNewProductOpen(true)} className="gap-2 bg-pink-600 hover:bg-pink-700">
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            <Card className="bg-gradient-to-br from-pink-50 to-purple-50 text-pink-700">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full p-3 bg-white/70 shadow-sm">
                  <NailPolish className="w-7 h-7 text-pink-600" />
                </div>
                <div>
                  <div className="text-lg font-bold">{stats.total}</div>
                  <div className="text-sm font-semibold opacity-70">Produtos Ativos</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-pink-50 text-red-700">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full p-3 bg-white/70 shadow-sm">
                  <Archive className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <div className="text-lg font-bold">{stats.lowStock}</div>
                  <div className="text-sm font-semibold opacity-70">Baixo Estoque</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full p-3 bg-white/70 shadow-sm">
                  <Boxes className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <div className="text-lg font-bold">{stats.categories}</div>
                  <div className="text-sm font-semibold opacity-70">Categorias</div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead className="text-center">Estoque Mínimo</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-pink-50/40 transition">
                      <TableCell>
                        <span className="font-bold">{product.name}</span>
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
                            onClick={() => handleTransaction(product, 'entrada')}
                            className="hover:bg-green-50"
                          >
                            <ArrowDownCircle className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTransaction(product, 'saida')}
                            className="hover:bg-red-50"
                          >
                            <ArrowUpCircle className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>

        <aside className="hidden lg:block">
          <div className="rounded-2xl bg-gradient-to-br from-pink-50 via-purple-50 to-white/90 p-6 shadow-lg glass-morphism animate-fade-in delay-200">
            <img
              src="https://images.unsplash.com/photo-1604654894611-6973b376cbde?auto=format&fit=crop&w=600&q=80"
              alt="Nail art design"
              className="w-full h-[360px] object-cover object-center rounded-xl shadow-lg mb-6"
              loading="lazy"
              draggable={false}
            />
            <h2 className="text-2xl font-serif font-bold mb-3 text-pink-600">
              Mantenha seu estoque organizado
            </h2>
            <p className="text-gray-600">
              Gerencie seus produtos com facilidade, monitore o estoque e mantenha seu salão 
              sempre abastecido com os melhores produtos para suas clientes.
            </p>
          </div>
        </aside>
      </div>

      <Sheet open={isNewProductOpen} onOpenChange={setIsNewProductOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Novo Produto</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ProductForm onSuccess={() => {
              setIsNewProductOpen(false);
              fetchProducts();
            }} />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isTransactionOpen} onOpenChange={setIsTransactionOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {transactionType === 'entrada' ? 'Entrada' : 'Saída'} de Estoque - {selectedProduct?.name}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {selectedProduct && (
              <StockTransaction
                productId={selectedProduct.id}
                type={transactionType}
                onSuccess={() => {
                  setIsTransactionOpen(false);
                  fetchProducts();
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Inventory;
