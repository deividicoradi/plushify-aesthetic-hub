
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { ProductForm } from "./ProductForm";
import { EditProductForm } from "./EditProductForm";
import { StockTransaction } from "./StockTransaction";
import { DeleteProductDialog } from "./DeleteProductDialog";

type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  min_stock: number;
};

type InventoryDialogsProps = {
  isNewProductOpen: boolean;
  setIsNewProductOpen: (value: boolean) => void;
  isEditProductOpen: boolean;
  setIsEditProductOpen: (value: boolean) => void;
  isTransactionOpen: boolean;
  setIsTransactionOpen: (value: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (value: boolean) => void;
  isCategoriesOpen: boolean;
  setIsCategoriesOpen: (value: boolean) => void;
  isReportsOpen: boolean;
  setIsReportsOpen: (value: boolean) => void;
  selectedProduct: Product | null;
  transactionType: 'entrada' | 'saida';
  onSuccess: () => void;
  onOptimisticDelete?: (productId: string) => void;
  onCreateSuccess?: () => void;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onTransactionSuccess?: () => void;
};

export const InventoryDialogs = ({
  isNewProductOpen,
  setIsNewProductOpen,
  isEditProductOpen,
  setIsEditProductOpen,
  isTransactionOpen,
  setIsTransactionOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  selectedProduct,
  transactionType,
  onSuccess,
  onOptimisticDelete,
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
  onTransactionSuccess
}: InventoryDialogsProps) => {
  return (
    <>
      <Sheet open={isNewProductOpen} onOpenChange={setIsNewProductOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Novo Produto</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ProductForm onSuccess={onCreateSuccess || (() => {
              setIsNewProductOpen(false);
              onSuccess();
            })} />
          </div>
        </SheetContent>
      </Sheet>
      
      <Sheet open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Editar Produto</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {selectedProduct && (
              <EditProductForm
                product={selectedProduct}
                onSuccess={onUpdateSuccess || (() => {
                  setIsEditProductOpen(false);
                  onSuccess();
                })}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isTransactionOpen} onOpenChange={setIsTransactionOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {transactionType === 'entrada' ? 'Entrada' : 'Saída'} de Estoque
            </SheetTitle>
            {selectedProduct && (
              <p className="text-sm text-muted-foreground">
                {selectedProduct.name}
              </p>
            )}
          </SheetHeader>
          <div className="mt-6">
            {selectedProduct && (
              <StockTransaction
                productId={selectedProduct.id}
                type={transactionType}
                onSuccess={onTransactionSuccess || (() => {
                  setIsTransactionOpen(false);
                  onSuccess();
                })}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <DeleteProductDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        product={selectedProduct}
        onSuccess={onDeleteSuccess || onSuccess}
        onOptimisticDelete={onOptimisticDelete}
      />
    </>
  );
};
