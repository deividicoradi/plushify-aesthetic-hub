
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";

export type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  min_stock: number;
};

export const useInventory = () => {
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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
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

  return {
    // State
    products,
    stats,
    selectedProduct,
    isNewProductOpen,
    isEditProductOpen,
    isTransactionOpen,
    isHistoryOpen,
    isCategoriesOpen,
    isReportsOpen,
    transactionType,
    searchTerm,
    // Setters
    setIsNewProductOpen,
    setIsEditProductOpen,
    setIsTransactionOpen,
    setIsHistoryOpen,
    setIsCategoriesOpen,
    setIsReportsOpen,
    setSearchTerm,
    // Actions
    fetchProducts,
    handleTransaction,
    handleEditProduct,
  };
};
