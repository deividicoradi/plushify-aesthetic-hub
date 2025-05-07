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
  barcode?: string | null;
};

export const useInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    categories: 0
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
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

  const toggleProductSelection = (product: Product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.find(p => p.id === product.id);
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      // If all are selected, unselect all
      setSelectedProducts([]);
    } else {
      // Otherwise select all
      setSelectedProducts([...products]);
    }
  };

  return {
    // State
    products,
    stats,
    selectedProduct,
    selectedProducts,
    isNewProductOpen,
    isEditProductOpen,
    isTransactionOpen,
    isHistoryOpen,
    isCategoriesOpen,
    isReportsOpen,
    isBarcodeScannerOpen,
    transactionType,
    searchTerm,
    // Setters
    setIsNewProductOpen,
    setIsEditProductOpen,
    setIsTransactionOpen,
    setIsHistoryOpen,
    setIsCategoriesOpen,
    setIsReportsOpen,
    setIsBarcodeScannerOpen,
    setSearchTerm,
    setSelectedProducts,
    // Actions
    fetchProducts,
    handleTransaction,
    handleEditProduct,
    toggleProductSelection,
    selectAllProducts,
  };
};
