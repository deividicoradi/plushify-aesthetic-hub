
import { useProductsData } from "./inventory/useProductsData";
import { useProductSelection } from "./inventory/useProductSelection";
import { useInventoryDialogs } from "./inventory/useInventoryDialogs";
import { useProductActions } from "./inventory/useProductActions";

export type { Product } from "./inventory/useProductsData";

export const useInventory = () => {
  // Get product data
  const { products, stats, fetchProducts } = useProductsData();

  // Get product selection functionality
  const { 
    selectedProduct, 
    selectedProducts, 
    setSelectedProduct, 
    setSelectedProducts, 
    toggleProductSelection, 
    selectAllProducts 
  } = useProductSelection(products);

  // Get dialog state
  const { 
    isNewProductOpen, 
    isEditProductOpen, 
    isTransactionOpen, 
    isHistoryOpen, 
    isCategoriesOpen, 
    isReportsOpen, 
    isBarcodeScannerOpen, 
    transactionType,
    setIsNewProductOpen, 
    setIsEditProductOpen, 
    setIsTransactionOpen, 
    setIsHistoryOpen, 
    setIsCategoriesOpen, 
    setIsReportsOpen, 
    setIsBarcodeScannerOpen,
    setTransactionType
  } = useInventoryDialogs();

  // Get product actions
  const { 
    searchTerm, 
    setSearchTerm, 
    handleTransaction, 
    handleEditProduct 
  } = useProductActions(
    setSelectedProduct, 
    setIsTransactionOpen, 
    setTransactionType, 
    setIsEditProductOpen
  );

  return {
    // Product data
    products,
    stats,
    // Selection state
    selectedProduct,
    selectedProducts,
    // Dialog state
    isNewProductOpen,
    isEditProductOpen,
    isTransactionOpen,
    isHistoryOpen,
    isCategoriesOpen,
    isReportsOpen,
    isBarcodeScannerOpen,
    transactionType,
    // Search state
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
