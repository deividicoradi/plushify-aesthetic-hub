
import React, { useEffect, useState } from "react";
import { PackageOpen, Archive, Boxes, Plus, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const { user } = useAuth();

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;

      setProducts(data || []);
      
      // Calculate stats
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

  const handleTransaction = (product: Product, type: 'entrada' | 'saida') => {
    setSelectedProduct(product);
    setTransactionType(type);
    setIsTransactionOpen(true);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-8 animate-fade-in">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
        <main>
          {/* Header */}
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-3">
              <Boxes className="w-9 h-9 text-plush-600 animate-float" />
              <h1 className="text-3xl md:text-4xl font-extrabold font-serif gradient-text tracking-tight">
                Estoque
              </h1>
            </div>
            <Button onClick={() => setIsNewProductOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            <Card className="bg-plush-50 text-plush-700 animate-scale-in">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full p-3 bg-white/70 shadow-sm">
                  <PackageOpen className="w-7 h-7 text-plush-600" />
                </div>
                <div>
                  <div className="text-lg font-bold">{stats.total}</div>
                  <div className="text-sm font-semibold opacity-70">Produtos Ativos</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent2-50 text-accent2-700 animate-scale-in">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full p-3 bg-white/70 shadow-sm">
                  <Archive className="w-7 h-7 text-accent2-600" />
                </div>
                <div>
                  <div className="text-lg font-bold">{stats.lowStock}</div>
                  <div className="text-sm font-semibold opacity-70">Baixo Estoque</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/10 text-primary animate-scale-in">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full p-3 bg-white/70 shadow-sm">
                  <Boxes className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <div className="text-lg font-bold">{stats.categories}</div>
                  <div className="text-sm font-semibold opacity-70">Categorias</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Table */}
          <Card className="rounded-2xl shadow-xl border-0 bg-white/80 dark:bg-card mb-10 animate-fade-in delay-100">
            <CardHeader className="p-6 pb-3 border-b border-muted/30">
              <CardTitle className="text-xl font-serif text-plush-700">Produtos em Estoque</CardTitle>
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
                  {products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-plush-50/40 transition">
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
                          >
                            <ArrowDownCircle className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTransaction(product, 'saida')}
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

        {/* Banner/Visual Lateral */}
        <aside className="hidden lg:block">
          <div className="rounded-2xl bg-gradient-to-br from-plush-50 via-accent2-50 to-white/90 p-2 shadow-lg glass-morphism animate-fade-in delay-200">
            <img
              src="https://images.unsplash.com/photo-1611042553484-d61f84d22784?auto=format&fit=crop&w=600&q=80"
              alt="Unhas decoradas"
              className="w-full h-[360px] object-cover object-center rounded-xl shadow"
              loading="lazy"
              draggable={false}
            />
            <div className="p-5 pt-3 text-center">
              <h2 className="text-xl font-serif font-bold mb-2 text-plush-600">
                Controle total do seu estoque!
              </h2>
              <p className="text-base text-muted-foreground">
                Monitore seus produtos, registre entradas e saídas, e mantenha seu estoque sempre organizado.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* New Product Sheet */}
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

      {/* Transaction Sheet */}
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
