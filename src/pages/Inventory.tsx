
import React, { useState } from 'react';
import { Package, Plus, Search } from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProductsData, Product } from '@/hooks/inventory/useProductsData';
import { LimitAlert } from '@/components/LimitAlert';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { StatsCards } from '@/components/inventory/StatsCards';
import { ProductsTable } from '@/components/inventory/ProductsTable';
import { ProductForm } from '@/components/inventory/ProductForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const {
    products,
    isLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    isCreating,
    isUpdating,
    isDeleting,
  } = useProductsData();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (editingProduct) {
      updateProduct({ id: editingProduct.id, data });
    } else {
      createProduct(data);
    }
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    setProductToDelete(id);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete);
      setProductToDelete(null);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center gap-4 border-b bg-background px-4 py-3">
          <div className="flex items-center justify-between flex-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 ring-1 ring-primary/10">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Controle de Produtos</h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie seu estoque e produtos
                </p>
              </div>
            </div>
            <Button onClick={handleCreateProduct} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>
          </div>
        </header>

        <main className="flex-1 bg-background p-6">
          <div className="space-y-6">
            {/* Limit Alert */}
            <LimitAlert type="products" currentCount={products.length} action="adicionar" />
            
            {/* Search */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <StatsCards products={products} />
            
            <ProductsTable
              products={filteredProducts}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            onSubmit={handleFormSubmit}
            initialData={editingProduct || undefined}
            isLoading={isCreating || isUpdating}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Inventory;
