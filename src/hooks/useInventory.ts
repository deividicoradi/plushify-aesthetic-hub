
import { useProductsData } from "./inventory/useProductsData";
import { useProductSelection } from "./inventory/useProductSelection";
import { useInventoryDialogs } from "./inventory/useInventoryDialogs";
import { useProductActions } from "./inventory/useProductActions";

export type { Product } from "./inventory/useProductsData";

export const useInventory = () => {
  // Get product data
  const { products, stats, refetch } = useProductsData();

  // Get product selection functionality
  const { 
    selectedProducts, 
    toggleSelect, 
    selectAll, 
    clearSelection,
    setSelectedProducts
  } = useProductSelection(products);

  // Get dialog state
  const { 
    isNewProductOpen, 
    isEditProductOpen, 
    isTransactionOpen, 
    setIsNewProductOpen, 
    setIsEditProductOpen, 
    setIsTransactionOpen,
    transactionType,
    setTransactionType,
    openDialog,
    closeDialog
  } = useInventoryDialogs();

  // Get product actions
  const { 
    searchTerm, 
    setSearchTerm, 
    handleStockTransaction, 
    handleEditProduct,
    selectedProduct,
    setSelectedProduct
  } = useProductActions(refetch);

  // Enhanced handlers that also manage dialog state
  const enhancedStockTransaction = (product: any, type: 'entrada' | 'saida') => {
    setSelectedProduct(product);
    setTransactionType(type);
    setIsTransactionOpen(true);
  };

  const enhancedEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsEditProductOpen(true);
  };

  return {
    // Product data
    products,
    stats,
    refetch,
    // Selection state
    selectedProduct,
    selectedProducts,
    // Dialog state
    isNewProductOpen,
    isEditProductOpen,
    isTransactionOpen,
    transactionType,
    // Search state
    searchTerm,
    // Setters
    setIsNewProductOpen,
    setIsEditProductOpen,
    setIsTransactionOpen,
    setSearchTerm,
    setSelectedProducts,
    setTransactionType,
    setSelectedProduct,
    // Actions
    handleStockTransaction: enhancedStockTransaction,
    handleEditProduct: enhancedEditProduct,
    toggleSelect,
    selectAll,
    clearSelection,
    openDialog,
    closeDialog,
  };
};
