
import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
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
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen w-full">
            {/* Header with sidebar trigger */}
            <header className="flex items-center gap-4 border-b bg-background px-4 py-3">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <Package className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Estoque</h1>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 p-6 space-y-6">
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
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Inventory;
