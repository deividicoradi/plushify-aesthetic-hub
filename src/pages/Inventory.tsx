
import React from "react";
import { useInventory } from "@/hooks/useInventory";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { InventoryContainer } from "@/components/inventory/InventoryContainer";
import { InventoryDialogs } from "@/components/inventory/InventoryDialogs";
import { BarcodeScanner } from "@/components/inventory/BarcodeScanner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Inventory = () => {
  const {
    products,
    stats,
    selectedProduct,
    isNewProductOpen,
    isEditProductOpen,
    isTransactionOpen,
    isHistoryOpen,
    isCategoriesOpen,
    isReportsOpen,
    isBarcodeScannerOpen,
    transactionType,
    searchTerm,
    setIsNewProductOpen,
    setIsEditProductOpen,
    setIsTransactionOpen,
    setIsHistoryOpen,
    setIsCategoriesOpen,
    setIsReportsOpen,
    setIsBarcodeScannerOpen,
    setSearchTerm,
    fetchProducts,
    handleTransaction,
    handleEditProduct,
  } = useInventory();

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-8 animate-fade-in">
      <InventoryHeader 
        onAddProduct={() => setIsNewProductOpen(true)} 
        onShowTransactionHistory={() => setIsHistoryOpen(true)}
        onManageCategories={() => setIsCategoriesOpen(true)}
        onShowReports={() => setIsReportsOpen(true)}
        onScanBarcode={() => setIsBarcodeScannerOpen(true)}
      />
      
      <InventoryContainer
        products={products}
        stats={stats}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onTransaction={handleTransaction}
        onEditProduct={handleEditProduct}
        isHistoryOpen={isHistoryOpen}
        isCategoriesOpen={isCategoriesOpen}
        isReportsOpen={isReportsOpen}
      />
      
      <InventoryDialogs
        isNewProductOpen={isNewProductOpen}
        setIsNewProductOpen={setIsNewProductOpen}
        isEditProductOpen={isEditProductOpen}
        setIsEditProductOpen={setIsEditProductOpen}
        isTransactionOpen={isTransactionOpen}
        setIsTransactionOpen={setIsTransactionOpen}
        isHistoryOpen={isHistoryOpen}
        setIsHistoryOpen={setIsHistoryOpen}
        isCategoriesOpen={isCategoriesOpen}
        setIsCategoriesOpen={setIsCategoriesOpen}
        isReportsOpen={isReportsOpen}
        setIsReportsOpen={setIsReportsOpen}
        selectedProduct={selectedProduct}
        transactionType={transactionType}
        onSuccess={fetchProducts}
      />

      <Dialog open={isBarcodeScannerOpen} onOpenChange={setIsBarcodeScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escanear Código de Barras</DialogTitle>
          </DialogHeader>
          <BarcodeScanner 
            onClose={() => setIsBarcodeScannerOpen(false)} 
            onSuccess={() => {
              setIsBarcodeScannerOpen(false);
              setIsNewProductOpen(true);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
