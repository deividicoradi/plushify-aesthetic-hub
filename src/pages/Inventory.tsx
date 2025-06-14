
import React from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { InventoryContainer } from '@/components/inventory/InventoryContainer';
import { InventoryDialogs } from '@/components/inventory/InventoryDialogs';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { useInventory } from '@/hooks/useInventory';

const Inventory = () => {
  const {
    products,
    stats,
    refetch,
    selectedProduct,
    selectedProducts,
    isNewProductOpen,
    isEditProductOpen,
    isTransactionOpen,
    transactionType,
    searchTerm,
    setIsNewProductOpen,
    setIsEditProductOpen,
    setIsTransactionOpen,
    setSearchTerm,
    setSelectedProducts,
    handleStockTransaction,
    handleEditProduct,
    toggleSelect,
    selectAll,
    openDialog
  } = useInventory();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen w-full">
            {/* Header with sidebar trigger */}
            <header className="sticky top-0 z-40 flex items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
              <SidebarTrigger />
            </header>

            {/* Main content */}
            <main className="flex-1 p-6 space-y-6">
              <InventoryHeader 
                onAddProduct={() => openDialog('productForm')}
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
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
                isHistoryOpen={false}
                setIsHistoryOpen={() => {}}
                isCategoriesOpen={false}
                setIsCategoriesOpen={() => {}}
                isReportsOpen={false}
                setIsReportsOpen={() => {}}
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
