
import React from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { FeatureGuard } from '@/components/FeatureGuard';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventoryContainer } from '@/components/inventory/InventoryContainer';
import { InventoryDialogs } from '@/components/inventory/InventoryDialogs';
import { useInventory } from '@/hooks/useInventory';

const Inventory = () => {
  const {
    products,
    searchTerm,
    setSearchTerm,
    stats,
    isLoading,
    selectedProducts,
    selectedProduct,
    toggleSelect,
    selectAll,
    setSelectedProducts,
    handleStockTransaction,
    handleEditProduct,
    handleDeleteProduct,
    isNewProductOpen,
    setIsNewProductOpen,
    isEditProductOpen,
    setIsEditProductOpen,
    isTransactionOpen,
    setIsTransactionOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    transactionType,
    refetch,
    removeProductFromList,
    handleCreateSuccess,
    handleUpdateSuccess,
    handleDeleteSuccess,
    handleTransactionSuccess
  } = useInventory();

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex flex-col min-h-screen w-full">
              <header className="flex items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 sticky top-0 z-50">
                <SidebarTrigger />
              </header>
              <main className="flex-1 bg-background overflow-hidden p-6">
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando produtos...</p>
                  </div>
                </div>
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen w-full">
            {/* Header */}
            <header className="flex items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 sticky top-0 z-50">
              <SidebarTrigger />
            </header>

            {/* Main content */}
            <main className="flex-1 bg-background overflow-hidden">
              <FeatureGuard 
                planFeature="hasInventoryAdvanced"
                requiredPlan="professional"
                showUpgradePrompt={true}
              >
                <div className="p-6 space-y-6">
                  <InventoryHeader
                    onAddProduct={() => setIsNewProductOpen(true)}
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
                    onDeleteProduct={handleDeleteProduct}
                    selectedProducts={selectedProducts}
                    onToggleSelect={toggleSelect}
                    onSelectAll={selectAll}
                  />
                </div>

                <InventoryDialogs
                  isNewProductOpen={isNewProductOpen}
                  setIsNewProductOpen={setIsNewProductOpen}
                  isEditProductOpen={isEditProductOpen}
                  setIsEditProductOpen={setIsEditProductOpen}
                  isTransactionOpen={isTransactionOpen}
                  setIsTransactionOpen={setIsTransactionOpen}
                  isDeleteDialogOpen={isDeleteDialogOpen}
                  setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                  isHistoryOpen={false}
                  setIsHistoryOpen={() => {}}
                  isCategoriesOpen={false}
                  setIsCategoriesOpen={() => {}}
                  isReportsOpen={false}
                  setIsReportsOpen={() => {}}
                  selectedProduct={selectedProduct}
                  transactionType={transactionType}
                  onSuccess={refetch}
                  onOptimisticDelete={removeProductFromList}
                  onCreateSuccess={handleCreateSuccess}
                  onUpdateSuccess={handleUpdateSuccess}
                  onDeleteSuccess={handleDeleteSuccess}
                  onTransactionSuccess={handleTransactionSuccess}
                />
              </FeatureGuard>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Inventory;
