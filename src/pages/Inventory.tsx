
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { ProductForm } from "@/components/inventory/ProductForm";
import { EditProductForm } from "@/components/inventory/EditProductForm";
import { StockTransaction } from "@/components/inventory/StockTransaction";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { StatCards } from "@/components/inventory/StatCards";
import { ProductsTable } from "@/components/inventory/ProductsTable";
import { BannerAside } from "@/components/inventory/BannerAside";

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
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
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

  const handleTransaction = (product: Product, type: 'entrada' | 'saida') => {
    setSelectedProduct(product);
    setTransactionType(type);
    setIsTransactionOpen(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditProductOpen(true);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-8 animate-fade-in">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
        <main>
          <InventoryHeader onAddProduct={() => setIsNewProductOpen(true)} />
          <StatCards {...stats} />
          <ProductsTable 
            products={products}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onTransaction={handleTransaction}
            onEditProduct={handleEditProduct}
          />
        </main>

        <aside className="hidden lg:block">
          <BannerAside />
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
      
      <Sheet open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar Produto</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {selectedProduct && (
              <EditProductForm
                product={selectedProduct}
                onSuccess={() => {
                  setIsEditProductOpen(false);
                  fetchProducts();
                }}
              />
            )}
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
