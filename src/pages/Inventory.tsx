
import React, { useState, useEffect } from 'react';
import { Package, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { InventoryContainer } from '@/components/inventory/InventoryContainer';
import { InventoryDialogs } from '@/components/inventory/InventoryDialogs';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { useInventoryDialogs } from '@/hooks/inventory/useInventoryDialogs';
import { useProductsData } from '@/hooks/inventory/useProductsData';
import { useProductActions } from '@/hooks/inventory/useProductActions';
import { useProductSelection } from '@/hooks/inventory/useProductSelection';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  const { products, stats, refetch } = useProductsData();
  const { 
    dialogs, 
    openDialog, 
    closeDialog,
    isNewProductOpen,
    setIsNewProductOpen,
    isEditProductOpen,
    setIsEditProductOpen,
    isTransactionOpen,
    setIsTransactionOpen,
    isHistoryOpen: dialogHistoryOpen,
    setIsHistoryOpen: setDialogHistoryOpen,
    isCategoriesOpen: dialogCategoriesOpen,
    setIsCategoriesOpen: setDialogCategoriesOpen,
    isReportsOpen: dialogReportsOpen,
    setIsReportsOpen: setDialogReportsOpen,
    transactionType
  } = useInventoryDialogs();
  
  const { selectedProduct, handleStockTransaction, handleEditProduct } = useProductActions(refetch);
  const { selectedProducts, toggleSelect, selectAll, clearSelection } = useProductSelection(products);

  const handleViewChange = (view: string) => {
    setIsHistoryOpen(view === 'history');
    setIsCategoriesOpen(view === 'categories');
    setIsReportsOpen(view === 'reports');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Estoque</h1>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
            onClick={() => openDialog('productForm')}
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Produto
          </Button>
        </div>

        <p className="text-muted-foreground">
          Gerencie seu inventário, adicione novos produtos, atualize o estoque e edite detalhes dos produtos existentes.
        </p>

        <InventoryHeader 
          onAddProduct={() => openDialog('productForm')}
          onShowTransactionHistory={() => handleViewChange('history')}
          onManageCategories={() => handleViewChange('categories')}
          onShowReports={() => handleViewChange('reports')}
          onScanBarcode={() => openDialog('barcodeScanner')}
          selectedProducts={selectedProducts}
          setSelectedProducts={() => {}}
          allProducts={products}
          fetchProducts={refetch}
        />

        <InventoryContainer
          products={products}
          stats={stats}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onTransaction={handleStockTransaction}
          onEditProduct={handleEditProduct}
          isHistoryOpen={isHistoryOpen}
          isCategoriesOpen={isCategoriesOpen}
          isReportsOpen={isReportsOpen}
          selectedProducts={selectedProducts}
          onToggleSelect={toggleSelect}
          onSelectAll={selectAll}
        />

        <InventoryDialogs
          isNewProductOpen={isNewProductOpen}
          setIsNewProductOpen={setIsNewProductOpen}
          isEditProductOpen={isEditProductOpen}
          setIsEditProductOpen={setIsEditProductOpen}
          isTransactionOpen={isTransactionOpen}
          setIsTransactionOpen={setIsTransactionOpen}
          isHistoryOpen={dialogHistoryOpen}
          setIsHistoryOpen={setDialogHistoryOpen}
          isCategoriesOpen={dialogCategoriesOpen}
          setIsCategoriesOpen={setDialogCategoriesOpen}
          isReportsOpen={dialogReportsOpen}
          setIsReportsOpen={setDialogReportsOpen}
          selectedProduct={selectedProduct}
          transactionType={transactionType}
          onSuccess={refetch}
        />
      </div>
    </div>
  );
};

export default Inventory;
