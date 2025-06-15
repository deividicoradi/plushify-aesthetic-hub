
import React from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { FeatureGuard } from '@/components/FeatureGuard';
import { InventoryContainer } from '@/components/inventory/InventoryContainer';
import { useInventory } from '@/hooks/useInventory';
import { useProductsData } from '@/hooks/inventory/useProductsData';

const Inventory = () => {
  const {
    products,
    searchTerm,
    setSearchTerm,
    stats,
    selectedProducts,
    toggleSelect,
    selectAll,
    handleStockTransaction,
    handleEditProduct
  } = useInventory();

  const { refetch } = useProductsData();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen w-full">
            {/* Header */}
            <header className="flex items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 sticky top-0 z-50">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-xl font-semibold">Estoque</h1>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 bg-background overflow-hidden">
              <FeatureGuard 
                planFeature="hasInventoryAdvanced"
                requiredPlan="professional"
                showUpgradePrompt={true}
              >
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
              </FeatureGuard>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Inventory;
